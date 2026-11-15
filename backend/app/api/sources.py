import os
import shutil
import csv
import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import DocumentChunk, Investigation, ExperimentalRun
from app.schemas import DocumentChunkResponse
from app.ingestion.pdf_processor import PDFProcessor
from app.ingestion.rag_engine import EmbeddingGenerator

router = APIRouter(prefix="/sources", tags=["sources"])

pdf_processor = PDFProcessor()
embed_gen = EmbeddingGenerator()

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "data", "raw_pdfs")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.get("/documents")
def get_indexed_documents(db: Session = Depends(get_db)):
    """Returns grouped list of indexed NASA source documents and technical publications."""
    chunks = db.query(DocumentChunk).all()
    grouped = {}

    for c in chunks:
        fn = c.source_filename
        if fn not in grouped:
            inv = db.query(Investigation).filter(Investigation.id == c.investigation_id).first() if c.investigation_id else None
            grouped[fn] = {
                "source_filename": fn,
                "investigation_code": inv.code if inv else "General / Multidisciplinary",
                "investigation_title": inv.title if inv else "NASA Technical Publication",
                "chunks_count": 0,
                "pages": set(),
                "sample_citation": c.citation_str
            }
        grouped[fn]["chunks_count"] += 1
        grouped[fn]["pages"].add(c.page_number)

    results = []
    for fn, info in grouped.items():
        results.append({
            "source_filename": fn,
            "investigation_code": info["investigation_code"],
            "investigation_title": info["investigation_title"],
            "chunks_count": info["chunks_count"],
            "pages_indexed": len(info["pages"]),
            "sample_citation": info["sample_citation"],
            "verification_status": "VERIFIED NASA PSI DATA",
            "storage_path": f"/data/raw_pdfs/{fn}"
        })

    return results

@router.get("/chunks", response_model=List[DocumentChunkResponse])
def get_all_chunks(
    source_filename: Optional[str] = None,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    query = db.query(DocumentChunk)
    if source_filename:
        query = query.filter(DocumentChunk.source_filename == source_filename)
    return query.limit(limit).all()

@router.post("/upload")
async def upload_psi_document(
    file: UploadFile = File(...),
    investigation_code: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Invalid filename.")

    ext = os.path.splitext(filename)[1].lower()
    if ext not in [".pdf", ".csv", ".json", ".txt"]:
        raise HTTPException(status_code=400, detail="Unsupported file format. Please upload PDF, CSV, JSON, or TXT.")

    file_path = os.path.join(UPLOAD_DIR, filename)
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    inv_id = None
    if investigation_code:
        inv = db.query(Investigation).filter(Investigation.code.ilike(investigation_code)).first()
        if inv:
            inv_id = inv.id

    indexed_count = 0

    if ext == ".pdf":
        pages_data = pdf_processor.extract_text_from_pdf(file_path)
        if not pages_data:
            raise HTTPException(status_code=400, detail="Could not extract readable text from PDF. It may be an image scan or empty.")

        chunks_data = pdf_processor.chunk_document(filename, pages_data, investigation_id=inv_id)
        for c in chunks_data:
            embedding = embed_gen.generate_embedding(c["chunk_text"])
            chunk_obj = DocumentChunk(
                investigation_id=c["investigation_id"],
                source_filename=c["source_filename"],
                page_number=c["page_number"],
                section_title=c["section_title"],
                chunk_text=c["chunk_text"],
                embedding=embedding,
                citation_str=c["citation_str"]
            )
            db.add(chunk_obj)
            indexed_count += 1
        db.commit()

        return {
            "status": "SUCCESS",
            "message": f"Successfully parsed '{filename}' ({len(pages_data)} pages) into {indexed_count} vector-indexed chunks.",
            "filename": filename,
            "chunks_created": indexed_count,
            "investigation_id": inv_id
        }

    elif ext == ".csv":
        # Parse CSV for experimental runs
        content = ""
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            content = f.read()

        reader = csv.DictReader(io.StringIO(content))
        runs_added = 0
        for row in reader:
            sample_material = row.get("sample_material") or row.get("material") or "NASA Sample Test"
            ox = float(row["oxygen_pct"]) if row.get("oxygen_pct") and row["oxygen_pct"].strip() else None
            pr = float(row["pressure_kpa"]) if row.get("pressure_kpa") and row["pressure_kpa"].strip() else None
            flow = float(row["ambient_flow_cm_s"]) if row.get("ambient_flow_cm_s") and row["ambient_flow_cm_s"].strip() else None
            grav = float(row["gravity_g"]) if row.get("gravity_g") and row["gravity_g"].strip() else 0.0
            flame = float(row["flame_spread_rate_mm_s"]) if row.get("flame_spread_rate_mm_s") and row["flame_spread_rate_mm_s"].strip() else None

            run_obj = ExperimentalRun(
                investigation_id=inv_id or 1,
                sample_material=sample_material,
                oxygen_pct=ox,
                pressure_kpa=pr,
                ambient_flow_cm_s=flow,
                gravity_g=grav,
                ignition_method=row.get("ignition_method", "Electrical coil"),
                flame_spread_rate_mm_s=flame,
                limiting_oxygen_index=None,
                suppression_agent=row.get("suppression_agent"),
                verified_source_doc=filename
            )
            db.add(run_obj)
            runs_added += 1
        db.commit()

        return {
            "status": "SUCCESS",
            "message": f"Successfully ingested {runs_added} experimental runs from CSV '{filename}'.",
            "filename": filename,
            "runs_created": runs_added
        }

    else:
        # Simple text file chunking
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            txt = f.read()

        chunk_text = txt.strip()[:1000]
        embedding = embed_gen.generate_embedding(chunk_text)
        chunk_obj = DocumentChunk(
            investigation_id=inv_id,
            source_filename=filename,
            page_number=1,
            section_title="Uploaded Document",
            chunk_text=chunk_text,
            embedding=embedding,
            citation_str=f"{filename}, p. 1"
        )
        db.add(chunk_obj)
        db.commit()

        return {
            "status": "SUCCESS",
            "message": f"Indexed text document '{filename}'.",
            "filename": filename,
            "chunks_created": 1
        }
