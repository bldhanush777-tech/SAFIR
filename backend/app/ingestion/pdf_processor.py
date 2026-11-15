import os
import re
from typing import List, Dict, Any
import logging

logger = logging.getLogger("firesafe.pdf")

try:
    import fitz  # PyMuPDF
    PYMUPDF_AVAILABLE = True
except ImportError:
    PYMUPDF_AVAILABLE = False
    logger.warning("PyMuPDF (fitz) not available. Text extraction will fallback to pypdf.")

try:
    import pypdf
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

class PDFProcessor:
    """Scientific PDF parsing and chunking for NASA combustion literature."""

    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 80):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap

    def extract_text_from_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """Extracts text by page from PDF using PyMuPDF or pypdf."""
        pages_content = []
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"PDF file not found: {file_path}")

        if PYMUPDF_AVAILABLE:
            try:
                doc = fitz.open(file_path)
                for page_idx in range(len(doc)):
                    page = doc[page_idx]
                    text = page.get_text("text")
                    if text and text.strip():
                        pages_content.append({
                            "page_number": page_idx + 1,
                            "text": text.strip()
                        })
                doc.close()
                return pages_content
            except Exception as e:
                logger.error(f"PyMuPDF failed on {file_path}: {e}. Trying fallback.")

        if PYPDF_AVAILABLE:
            try:
                reader = pypdf.PdfReader(file_path)
                for idx, page in enumerate(reader.pages):
                    text = page.extract_text()
                    if text and text.strip():
                        pages_content.append({
                            "page_number": idx + 1,
                            "text": text.strip()
                        })
                return pages_content
            except Exception as e:
                logger.error(f"pypdf failed on {file_path}: {e}")

        return pages_content

    def chunk_document(self, filename: str, pages_data: List[Dict[str, Any]], investigation_id: int = None) -> List[Dict[str, Any]]:
        """Splits page text into semantically coherent scientific chunks."""
        chunks = []
        for page_data in pages_data:
            page_num = page_data["page_number"]
            text = page_data["text"]

            # Detect section headers
            lines = text.split("\n")
            section_title = f"Document Section (Page {page_num})"
            for line in lines[:5]:
                clean_line = line.strip()
                if clean_line and len(clean_line) < 80 and not clean_line.isdigit():
                    if any(term in clean_line.upper() for term in ["ABSTRACT", "INTRODUCTION", "EXPERIMENTAL", "RESULTS", "DISCUSSION", "FLAMMABILITY", "CONCLUSION", "METHOD"]):
                        section_title = clean_line
                        break

            # Word based chunking with overlap
            words = text.split()
            if not words:
                continue

            step = self.chunk_size - self.chunk_overlap
            if step <= 0:
                step = self.chunk_size

            for i in range(0, len(words), step):
                chunk_words = words[i:i + self.chunk_size]
                chunk_text = " ".join(chunk_words)
                if len(chunk_text.strip()) > 40:
                    chunks.append({
                        "source_filename": os.path.basename(filename),
                        "page_number": page_num,
                        "section_title": section_title,
                        "chunk_text": chunk_text,
                        "citation_str": f"{os.path.basename(filename)}, p. {page_num}",
                        "investigation_id": investigation_id
                    })

        return chunks
