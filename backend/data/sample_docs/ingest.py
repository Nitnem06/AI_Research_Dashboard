"""
Knowledge Base Ingestion Pipeline
Chunks documents → embeds with sentence-transformers → stores in FAISS.
Run this once at startup if index doesn't exist.
"""
import os
import json
import logging
import numpy as np
from pathlib import Path

logger = logging.getLogger(__name__)

# ── Sample SEC Filing / Earnings Transcript data ──────────────────────────────

SAMPLE_DOCUMENTS = [
    {
        "id": "nvda_q3_2024",
        "company": "NVIDIA",
        "ticker": "NVDA",
        "type": "Earnings Transcript",
        "title": "NVIDIA Q3 FY2025 Earnings Call Transcript",
        "content": """
NVIDIA Q3 FY2025 Earnings Call – CEO Jensen Huang Commentary

Revenue reached $35.1 billion for Q3 FY2025, up 94% year over year, driven primarily by Data Center revenue 
of $30.8 billion. NVIDIA's Hopper GPU architecture continues to dominate AI training and inference workloads 
globally. Gross margins expanded to 74.6%, reflecting strong pricing power in the AI chip market.

Data Center Highlights: The H100 and H200 GPU clusters remain fully sold out with multi-quarter backlogs.
Key customers include Microsoft Azure, Google Cloud, Amazon AWS, and Meta AI. These hyperscalers collectively 
account for over 50% of Data Center revenue. Enterprise AI adoption is accelerating, with thousands of new 
companies deploying NVIDIA-powered AI solutions.

Blackwell Architecture: The next-generation Blackwell GPU platform is ramping production in Q4. Blackwell 
offers 4x the training performance and 30x the inference throughput compared to Hopper. Customer 
demand for Blackwell is described as "insane" by CEO Jensen Huang, with supply expected to remain 
constrained through 2025.

Gaming Segment: Gaming GPU revenue of $3.3 billion was up 15% QoQ, with RTX 40 series maintaining 
strong retail sell-through. DLSS 4 adoption is accelerating among game developers.

Automotive: Automotive revenue hit $449 million, up 72% YoY, with major wins at BYD and Mercedes-Benz 
for DRIVE Thor platform deployments.

Guidance: Q4 FY2025 revenue guidance of $37.5 billion ± 2%, reflecting continued Blackwell ramp.
        """,
    },
    {
        "id": "aapl_q4_2024",
        "company": "Apple",
        "ticker": "AAPL",
        "type": "10-K Filing",
        "title": "Apple Inc. FY2024 Annual Report (10-K) Summary",
        "content": """
Apple Inc. FY2024 Annual Report – Financial Highlights

Total net sales for fiscal year 2024 were $391.0 billion, a 2% increase year-over-year. iPhone revenue 
of $201.1 billion represented 51% of total revenue. Services segment reached $96.2 billion, growing 13% 
YoY and achieving record margins of 74%. The Services segment includes App Store, Apple Music, iCloud, 
Apple TV+, and Apple Pay.

Mac and iPad: Mac revenue declined 3% to $29.9 billion amid PC market softness. iPad revenue grew 8% 
to $26.7 billion following new M4 iPad Pro launch. Wearables, Home, and Accessories declined 7% to 
$37.0 billion.

Geographic Revenue: Americas contributed $167.0 billion (43%). Europe: $101.3 billion (26%). 
Greater China: $66.9 billion (17%), reflecting competitive pressure from local brands. Japan and 
Rest of Asia Pacific: $55.8 billion combined.

Apple Intelligence: Apple launched its on-device AI suite in iOS 18.1, integrating with Siri, 
Mail, Photos, and Messages. Initial rollout limited to US English on iPhone 15 Pro and iPhone 16 models. 
European launch delayed due to Digital Markets Act regulatory uncertainty.

Capital Returns: Apple returned $94.9 billion to shareholders via buybacks ($77B) and dividends ($15B). 
Total cash and securities: $153.0 billion. Long-term debt: $91.3 billion.

Risk Factors: Concentration risk in iPhone; regulatory pressure in EU and China; supply chain 
dependency on Taiwan and China; increasing competition in services from Google, Spotify, and Netflix.
        """,
    },
    {
        "id": "tsla_q3_2024",
        "company": "Tesla",
        "ticker": "TSLA",
        "type": "Earnings Transcript",
        "title": "Tesla Q3 2024 Earnings Call – Key Points",
        "content": """
Tesla Q3 2024 Earnings Call Summary

Tesla reported Q3 2024 revenue of $25.2 billion, up 8% year-over-year. Vehicle deliveries reached 
462,890 units, a new quarterly record. Automotive gross margin improved to 17.1% (ex-credits), 
recovering from the trough of 14.6% in Q1 2024 as price cuts began to stabilize.

Energy Generation and Storage: This segment posted record revenue of $2.38 billion and an 
impressive gross margin of 30.5%. Megapack deployments hit a new high of 6.9 GWh. This segment 
is now meaningfully profitable and growing faster than the automotive business.

Full Self-Driving (FSD): Cumulative miles driven on FSD exceeded 2 billion. CEO Elon Musk 
reiterated that Tesla will achieve full autonomy (no human supervision) in 2025. FSD Version 13 
showed significant improvements in urban driving. Revenue from FSD subscriptions: ~$326 million.

Cybertruck: Production ramped to approximately 16,000 units in Q3 with deliveries beginning 
in earnest. Early customer reviews have been mixed, with concerns about range in real-world conditions.

Robotaxi: Tesla unveiled the Cybercab robotaxi concept, targeting a sub-$30,000 price point 
with no steering wheel or pedals. Production expected in 2026. Musk cited this as Tesla's largest 
market opportunity.

Optimus Robot: Tesla showed Optimus Gen 2 performing factory tasks autonomously. Target: 
1,000 Optimus units deployed internally in 2025, with commercial sales in 2026 for $20,000-$30,000.

Guidance: Tesla guided for "slight growth" in vehicle deliveries for FY2024. Management declined 
to give specific 2025 delivery targets, citing macroeconomic uncertainty and interest rate headwinds.
        """,
    },
    {
        "id": "amd_competitive_analysis",
        "company": "AMD",
        "ticker": "AMD",
        "type": "Analyst Report",
        "title": "AMD Competitive Analysis – AI Chip Market",
        "content": """
AMD Competitive Position in AI Semiconductor Market – Analyst Research Note

AMD's Instinct MI300X GPU has emerged as a credible alternative to NVIDIA's H100 in inference workloads.
The MI300X offers 192GB of HBM3 memory versus NVIDIA H100's 80GB, a significant advantage for 
serving large language models (LLMs) with long context windows. Microsoft Azure became AMD's first 
major hyperscaler customer for MI300X deployments.

Data Center AI Revenue: AMD's Data Center segment reported Q3 2024 revenue of $3.5 billion, 
with MI300X GPU shipments exceeding $1 billion for the first time. AMD raised its full-year 2024 
AI accelerator revenue guidance to $5 billion (previously $4.5 billion).

MI350 and MI400 Roadmap: AMD committed to annual GPU architecture cadence. MI350 (CDNA 4) 
expected H1 2025 with 2x inference performance vs MI300X. MI400 (CDNA 5) targeting 2026.

CPU Business: EPYC Turin (Zen 5) server CPUs launched with strong performance benchmarks, 
capturing an estimated 23% x86 server market share from Intel. Client CPU business with Ryzen AI 
300 series targeting Copilot+ PC segment.

Software Ecosystem: ROCm software stack remains AMD's key challenge. While significantly improved, 
ROCm trails NVIDIA's CUDA ecosystem in library support, developer tooling, and community size. 
AMD is investing heavily in ROCm to close this gap.

Valuation: AMD trades at 35x forward earnings vs NVIDIA's 45x, reflecting both AMD's growth 
potential and NVIDIA's dominant market position. Bull case: AMD captures 15-20% of AI accelerator 
market by 2026. Bear case: CUDA moat proves insurmountable.
        """,
    },
    {
        "id": "msft_ai_report",
        "company": "Microsoft",
        "ticker": "MSFT",
        "type": "Earnings Transcript",
        "title": "Microsoft FY2024 Q4 Earnings – AI Momentum",
        "content": """
Microsoft Q4 FY2024 Earnings – AI and Cloud Business Highlights

Microsoft reported Q4 FY2024 revenue of $64.7 billion, up 15% YoY. Cloud revenue (Intelligent Cloud) 
reached $28.5 billion, growing 19% YoY. Azure grew 29% in constant currency, with Azure AI services 
contributing approximately 8 percentage points of that growth.

Copilot Monetization: Microsoft 365 Copilot has 77,000 enterprise customers, up from 400 at launch. 
Average Copilot seat price: $30/month/user. Management indicated Copilot is now "material" to revenue. 
GitHub Copilot surpassed 1.8 million paid subscribers.

OpenAI Partnership: Microsoft's $13B+ investment in OpenAI provides exclusive Azure hosting of 
OpenAI models. This arrangement requires OpenAI to use Azure for training and inference, cementing 
Azure's position as the premier AI cloud platform.

Gaming: Xbox content and services grew 61% following Activision Blizzard acquisition close. 
Xbox Game Pass reached 34 million subscribers.

Capital Expenditure: Microsoft guided FY2025 capex of approximately $60-65 billion, primarily 
for AI infrastructure buildout including data centers and Nvidia GPU clusters. This represented 
a significant acceleration from FY2024's $45 billion.

Risks: Heavy capex cycle creating margin pressure. OpenAI relationship complexity — Microsoft's 
equity stake creates both dependency and conflict of interest. Competition from Google Gemini 
and emerging models from Anthropic, Mistral, and Meta's Llama.
        """,
    },
]


def chunk_text(text: str, chunk_size: int = 300, overlap: int = 50) -> list[str]:
    """Simple word-based chunking with overlap."""
    words = text.split()
    chunks = []
    start = 0
    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end])
        if chunk.strip():
            chunks.append(chunk.strip())
        start += chunk_size - overlap
    return chunks


def build_index(store_path: str, docs_override: list | None = None):
    """
    Build FAISS index from SAMPLE_DOCUMENTS.
    Called once at startup if index doesn't exist.
    """
    try:
        import faiss
        from sentence_transformers import SentenceTransformer
    except ImportError:
        logger.warning("FAISS / sentence-transformers not installed. Knowledge base disabled.")
        return None, None, None

    model = SentenceTransformer("all-MiniLM-L6-v2")
    docs = docs_override or SAMPLE_DOCUMENTS

    all_chunks = []
    chunk_metadata = []

    for doc in docs:
        chunks = chunk_text(doc["content"])
        for i, chunk in enumerate(chunks):
            enriched = f"[{doc['company']} | {doc['type']}] {chunk}"
            all_chunks.append(enriched)
            chunk_metadata.append({
                "doc_id": doc["id"],
                "company": doc["company"],
                "ticker": doc["ticker"],
                "doc_type": doc["type"],
                "title": doc["title"],
                "chunk_index": i,
                "text": chunk,
            })

    logger.info(f"Embedding {len(all_chunks)} chunks...")
    embeddings = model.encode(all_chunks, show_progress_bar=False, batch_size=32)
    embeddings = np.array(embeddings, dtype="float32")
    faiss.normalize_L2(embeddings)

    dim = embeddings.shape[1]
    index = faiss.IndexFlatIP(dim)  # Inner product after normalization = cosine similarity
    index.add(embeddings)

    # Persist
    os.makedirs(store_path, exist_ok=True)
    faiss.write_index(index, os.path.join(store_path, "index.faiss"))
    with open(os.path.join(store_path, "metadata.json"), "w") as f:
        json.dump(chunk_metadata, f)

    logger.info(f"Knowledge base built: {len(all_chunks)} chunks indexed at {store_path}")
    return index, model, chunk_metadata


def load_or_build_index(store_path: str):
    """Load existing index or build fresh."""
    index_file = os.path.join(store_path, "index.faiss")
    meta_file = os.path.join(store_path, "metadata.json")

    try:
        import faiss
        from sentence_transformers import SentenceTransformer
    except ImportError:
        return None, None, None

    if os.path.exists(index_file) and os.path.exists(meta_file):
        index = faiss.read_index(index_file)
        with open(meta_file) as f:
            metadata = json.load(f)
        model = SentenceTransformer("all-MiniLM-L6-v2")
        logger.info(f"Knowledge base loaded: {index.ntotal} vectors")
        return index, model, metadata
    else:
        return build_index(store_path)