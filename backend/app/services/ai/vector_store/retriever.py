"""
Knowledge Base Retriever
Singleton that holds the FAISS index in memory.
Exposes search_knowledge_base() as an AI tool.
"""
import logging
import numpy as np
from app.core.config import settings

logger = logging.getLogger(__name__)

# Singleton state
_index = None
_model = None
_metadata = None
_kb_available = False


def init_knowledge_base():
    global _index, _model, _metadata, _kb_available
    from app.data.sample_docs.ingest import load_or_build_index
    _index, _model, _metadata = load_or_build_index(settings.VECTOR_STORE_PATH)
    _kb_available = all([_index, _model, _metadata])
    if not _kb_available:
        logger.warning("Knowledge base unavailable — FAISS/sentence-transformers not installed.")


async def search_knowledge_base(query: str, company: str | None = None, top_k: int = 4) -> dict:
    """
    Semantic search over the internal knowledge base.
    Returns relevant excerpts from SEC filings, earnings transcripts, and analyst reports.
    """
    if not _kb_available:
        return {
            "query": query,
            "company": company,
            "results": [],
            "source": "Knowledge Base (unavailable — install faiss-cpu and sentence-transformers)",
        }

    try:
        import faiss
        # Embed the query
        q_embedding = _model.encode([query], show_progress_bar=False)
        if _model is None or _index is None:
            return {"error": "KB not initialized"}
        q_embedding = np.array(q_embedding, dtype="float32")
        faiss.normalize_L2(q_embedding)

        # Search
        distances, indices = _index.search(q_embedding, top_k * 3)  # over-fetch for filtering

        results = []
        seen_docs = set()

        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue
            meta = _metadata[idx]

            # Filter by company if specified
            if company:
                company_norm = company.upper().strip()
                if (meta["ticker"] != company_norm and
                        company_norm.lower() not in meta["company"].lower()):
                    continue

            # Deduplicate by doc (max 2 chunks per doc)
            doc_chunks_count = sum(1 for r in results if r["doc_id"] == meta["doc_id"])
            if doc_chunks_count >= 2:
                continue

            results.append({
                "doc_id": meta["doc_id"],
                "company": meta["company"],
                "ticker": meta["ticker"],
                "doc_type": meta["doc_type"],
                "title": meta["title"],
                "excerpt": meta["text"],
                "relevance_score": round(float(dist), 3),
                "source": f"Internal KB — {meta['title']}",
            })

            if len(results) >= top_k:
                break

        return {
            "query": query,
            "company": company,
            "results": results,
            "total_found": len(results),
            "source": "Internal Knowledge Base (FAISS)",
        }

    except Exception as e:
        logger.error(f"Knowledge base search failed: {e}")
        return {
            "query": query,
            "company": company,
            "results": [],
            "error": str(e),
            "source": "Internal Knowledge Base (error)",
        }