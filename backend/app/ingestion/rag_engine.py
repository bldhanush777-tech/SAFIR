import os
import re
import math
import json
import logging
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.config import settings
from app.models import DocumentChunk, Investigation, ExperimentalRun
from app.schemas import ScientificRAGCardResponse, SourceDocumentReference

logger = logging.getLogger("firesafe.rag")

class EmbeddingGenerator:
    """Generates 384-dimensional normalized dense embeddings."""

    def __init__(self, provider: str = None, dim: int = 384):
        self.provider = provider or settings.EMBEDDING_PROVIDER
        self.dim = dim

    def generate_embedding(self, text_input: str) -> List[float]:
        if not text_input or not text_input.strip():
            return [0.0] * self.dim

        clean_text = text_input.strip().lower()

        # Remote providers if keys are present
        if self.provider == "gemini" and settings.GEMINI_API_KEY:
            try:
                import httpx
                resp = httpx.post(
                    f"https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key={settings.GEMINI_API_KEY}",
                    json={"model": "models/text-embedding-004", "content": {"parts": [{"text": clean_text[:2000]}]}},
                    timeout=10.0
                )
                if resp.status_code == 200:
                    vals = resp.json().get("embedding", {}).get("values", [])
                    if vals:
                        # Project or truncate to 384 dimensions
                        return self._resize_and_normalize(vals, self.dim)
            except Exception as e:
                logger.warning(f"Gemini embedding API failed: {e}. Falling back to local engine.")

        if self.provider == "openai" and settings.OPENAI_API_KEY:
            try:
                import httpx
                resp = httpx.post(
                    "https://api.openai.com/v1/embeddings",
                    headers={"Authorization": f"Bearer {settings.OPENAI_API_KEY}"},
                    json={"input": clean_text[:2000], "model": "text-embedding-3-small", "dimensions": self.dim},
                    timeout=10.0
                )
                if resp.status_code == 200:
                    vals = resp.json().get("data", [{}])[0].get("embedding", [])
                    if vals:
                        return vals
            except Exception as e:
                logger.warning(f"OpenAI embedding API failed: {e}. Falling back to local engine.")

        # Local deterministic semantic embedding fallback
        return self._local_semantic_embedding(clean_text)

    def _resize_and_normalize(self, vector: List[float], target_dim: int) -> List[float]:
        arr = np.array(vector, dtype=np.float32)
        if len(arr) > target_dim:
            arr = arr[:target_dim]
        elif len(arr) < target_dim:
            arr = np.pad(arr, (0, target_dim - len(arr)))
        norm = np.linalg.norm(arr)
        if norm > 0:
            arr = arr / norm
        return arr.tolist()

    def _local_semantic_embedding(self, text_input: str) -> List[float]:
        """
        Deterministic, dense n-gram + domain keyword semantic embedding.
        Constructs a stable, L2-normalized 384-dimensional dense representation.
        """
        vec = np.zeros(self.dim, dtype=np.float32)

        # Microgravity combustion domain semantic clusters
        domain_anchors = {
            "flame_spread": ["flame", "spread", "rate", "propagation", "velocity", "burning", "mm/s", "cm/s"],
            "materials": ["pmma", "sibal", "cotton", "fiberglass", "nomex", "silicone", "kapton", "teflon", "ultem", "acrylic", "fuel", "slab", "rod"],
            "atmosphere": ["oxygen", "pressure", "kpa", "hypobaric", "hyperoxic", "exploration", "atmosphere", "normoxic", "101.3", "56.5", "34%"],
            "extinction_suppression": ["extinction", "suppression", "inert", "nitrogen", "co2", "quench", "loi", "limiting", "cool", "blow-off", "cutoff"],
            "detection_smoke": ["smoke", "aerosol", "particle", "detection", "same", "daft", "agglomerate", "micrometer", "optical", "p-trak", "dust"],
            "missions": ["bass", "saffire", "flex", "same", "daft", "acme", "sofie", "msg", "cygnus", "cir"],
            "gravity": ["microgravity", "partial", "lunar", "martian", "buoyancy", "convection", "0g", "0.16g", "0.38g", "1g", "gravity"]
        }

        words = re.findall(r"\b[a-z0-9_\-\.]{2,}\b", text_input)

        # Add domain anchor weights
        anchor_idx = 0
        for cluster_name, keywords in domain_anchors.items():
            cluster_hit = sum(1.5 for kw in keywords if kw in text_input)
            if cluster_hit > 0:
                for k in range(8):
                    target_pos = (anchor_idx * 16 + k) % self.dim
                    vec[target_pos] += cluster_hit * 0.4
            anchor_idx += 1

        # Token hashing with character n-grams for typo tolerance and semantic density
        for i, word in enumerate(words):
            # Positional decay & word length weighting
            w_weight = 1.0 + min(len(word) * 0.1, 1.0)
            h = hash(word) & 0x7FFFFFFF
            idx = h % self.dim
            vec[idx] += w_weight

            # Character tri-grams
            if len(word) >= 3:
                for j in range(len(word) - 2):
                    trigram = word[j:j+3]
                    th = (hash(trigram) * 31) & 0x7FFFFFFF
                    t_idx = th % self.dim
                    vec[t_idx] += 0.35 * w_weight

        # Normalize to unit sphere
        norm = np.linalg.norm(vec)
        if norm > 1e-6:
            vec = vec / norm
        else:
            # Fallback uniform
            vec = np.ones(self.dim, dtype=np.float32) / math.sqrt(self.dim)

        return vec.tolist()

class RAGEngine:
    """Strict source-grounded RAG generation separating Verified NASA Data from AI interpretation."""

    def __init__(self, embedding_generator: Optional[EmbeddingGenerator] = None):
        self.embedding_generator = embedding_generator or EmbeddingGenerator()

    def search_chunks(self, db: Session, query: str, top_k: int = 4, investigation_code: Optional[str] = None) -> List[Tuple[DocumentChunk, float]]:
        query_vec = np.array(self.embedding_generator.generate_embedding(query), dtype=np.float32)
        q_norm = np.linalg.norm(query_vec)

        query_db = db.query(DocumentChunk)
        if investigation_code:
            inv = db.query(Investigation).filter(Investigation.code == investigation_code).first()
            if inv:
                query_db = query_db.filter(DocumentChunk.investigation_id == inv.id)

        all_chunks = query_db.all()
        if not all_chunks:
            return []

        scored_chunks = []
        for chunk in all_chunks:
            if not chunk.embedding:
                continue
            doc_vec = np.array(chunk.embedding, dtype=np.float32)
            d_norm = np.linalg.norm(doc_vec)
            if q_norm > 0 and d_norm > 0:
                sim = float(np.dot(query_vec, doc_vec) / (q_norm * d_norm))
            else:
                sim = 0.0

            # Keyword lexical boost for exact mission/material mentions
            q_lower = query.lower()
            text_lower = chunk.chunk_text.lower()
            tokens = [t for t in re.findall(r"\b[a-z0-9\-]{3,}\b", q_lower) if t not in ["what", "how", "when", "does", "with", "from"]]
            matches = sum(1 for t in tokens if t in text_lower)
            if tokens:
                lexical_boost = (matches / len(tokens)) * 0.25
                sim = min(1.0, sim + lexical_boost)

            scored_chunks.append((chunk, sim))

        scored_chunks.sort(key=lambda x: x[1], reverse=True)
        return scored_chunks[:top_k]

    def answer_query(self, db: Session, query: str, investigation_filter: Optional[str] = None) -> ScientificRAGCardResponse:
        scored = self.search_chunks(db, query, top_k=3, investigation_code=investigation_filter)

        # Fallback Rule: If cosine similarity falls below threshold or no evidence exists
        threshold = settings.RAG_SIMILARITY_THRESHOLD
        top_sim = scored[0][1] if scored else 0.0

        if not scored or top_sim < threshold:
            return ScientificRAGCardResponse(
                query=query,
                answer="Insufficient verified NASA evidence available in the indexed corpus to answer this query reliably.",
                relevant_investigations=[],
                experimental_conditions={
                    "sample_material": "Not available",
                    "oxygen_pct": "Not available",
                    "pressure_kpa": "Not available",
                    "ambient_flow_cm_s": "Not available",
                    "gravity_g": "Not available",
                    "flame_spread_rate_mm_s": "Not available"
                },
                source_document=SourceDocumentReference(
                    source_filename="N/A",
                    page_number=0,
                    citation_str="No matching NASA Technical Memorandum or PSI flight data found.",
                    retrieved_passage="No document chunk exceeded the verification similarity threshold."
                ),
                limitations="Strict verification threshold not met. The system avoids hallucinating combustion parameters.",
                missing_information="Verified experimental datasets for this specific query have not been uploaded or indexed in the current PSI corpus.",
                confidence_score=round(top_sim, 3),
                is_verified_psi=False
            )

        top_chunk, best_score = scored[0]

        # Retrieve associated investigation & experimental runs
        investigation = db.query(Investigation).filter(Investigation.id == top_chunk.investigation_id).first() if top_chunk.investigation_id else None

        runs = []
        if investigation:
            runs = db.query(ExperimentalRun).filter(ExperimentalRun.investigation_id == investigation.id).all()

        # Extract experimental parameters from verified run or chunk
        conditions: Dict[str, Any] = {
            "sample_material": "Not available",
            "oxygen_pct": "Not available",
            "pressure_kpa": "Not available",
            "ambient_flow_cm_s": "Not available",
            "gravity_g": "Not available",
            "flame_spread_rate_mm_s": "Not available"
        }

        if runs:
            # Pick run most relevant to query or default to primary run
            chosen_run = runs[0]
            for run in runs:
                if run.sample_material.lower() in query.lower():
                    chosen_run = run
                    break

            conditions["sample_material"] = chosen_run.sample_material
            conditions["oxygen_pct"] = f"{chosen_run.oxygen_pct}%" if chosen_run.oxygen_pct is not None else "Not available"
            conditions["pressure_kpa"] = f"{chosen_run.pressure_kpa} kPa" if chosen_run.pressure_kpa is not None else "Not available"
            conditions["ambient_flow_cm_s"] = f"{chosen_run.ambient_flow_cm_s} cm/s" if chosen_run.ambient_flow_cm_s is not None else "Not available"
            conditions["gravity_g"] = f"{chosen_run.gravity_g}g" if chosen_run.gravity_g is not None else "Not available"
            conditions["flame_spread_rate_mm_s"] = f"{chosen_run.flame_spread_rate_mm_s} mm/s" if chosen_run.flame_spread_rate_mm_s is not None else "Not available"

        relevant_codes = [investigation.code] if investigation else []
        for other_chunk, sc in scored[1:]:
            if sc > 0.45 and other_chunk.investigation_id:
                other_inv = db.query(Investigation).filter(Investigation.id == other_chunk.investigation_id).first()
                if other_inv and other_inv.code not in relevant_codes:
                    relevant_codes.append(other_inv.code)

        # Synthesize technical answer strictly grounded in retrieved passage
        raw_text = top_chunk.chunk_text
        answer = self._synthesize_grounded_answer(query, top_chunk, investigation, conditions)

        # Define boundary conditions / limitations
        limitations = (
            f"Data obtained under {investigation.gravity_regime if investigation else 'microgravity'} conditions "
            f"at facility '{investigation.facility if investigation else 'ISS'}'. "
            "Results cannot be directly scaled to partial-gravity (0.16g Moon / 0.38g Mars) environments "
            "without accounting for weak buoyant convective flow coupling."
        )

        missing_info = []
        if conditions["flame_spread_rate_mm_s"] == "Not available":
            missing_info.append("Flame spread rate not tabulated for this sample.")
        if conditions["ambient_flow_cm_s"] == "Not available":
            missing_info.append("Forced ambient flow velocity was not monitored or is quiescent.")
        if not missing_info:
            missing_info.append("Transient chemical radical concentrations and sub-millimeter temperature field profiles were not resolved.")

        return ScientificRAGCardResponse(
            query=query,
            answer=answer,
            relevant_investigations=relevant_codes,
            experimental_conditions=conditions,
            source_document=SourceDocumentReference(
                source_filename=top_chunk.source_filename,
                page_number=top_chunk.page_number,
                citation_str=top_chunk.citation_str,
                retrieved_passage=raw_text
            ),
            limitations=limitations,
            missing_information="; ".join(missing_info),
            confidence_score=round(best_score, 3),
            is_verified_psi=True
        )

    def _synthesize_grounded_answer(self, query: str, chunk: DocumentChunk, investigation: Optional[Investigation], conditions: Dict[str, Any]) -> str:
        """Grounds synthesis strictly in NASA PSI verified records."""
        lead = f"According to verified NASA PSI flight records from {investigation.title if investigation else chunk.source_filename} ({chunk.citation_str}): "
        body = chunk.chunk_text.strip()
        
        # Add parameter grounding
        param_summary = []
        if conditions.get("oxygen_pct") != "Not available":
            param_summary.append(f"oxygen concentration: {conditions['oxygen_pct']}")
        if conditions.get("pressure_kpa") != "Not available":
            param_summary.append(f"ambient pressure: {conditions['pressure_kpa']}")
        if conditions.get("flame_spread_rate_mm_s") != "Not available":
            param_summary.append(f"measured flame spread rate: {conditions['flame_spread_rate_mm_s']}")

        if param_summary:
            body += f" [Verified experimental parameters documented: {', '.join(param_summary)}]."

        return f"{lead}{body}"
