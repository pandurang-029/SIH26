# NTRO GenAI Content Transformation Platform

An enterprise-grade, trustable GenAI-powered content transformation platform developed for the **National Technical Research Organisation (NTRO)**.

The platform ingests source document files (PDF, DOCX, TXT), analyzes them using Google Gemini AI to construct a normalized **Common Content Representation (CCR)** single source of truth, and generates audience-adapted multi-format deliverables with deterministic **Quality Control & Provenance Verification**.

---

## 🏛 Architecture Pipeline

```text
Source Document (PDF / DOCX / TXT)
  └─► Text Extraction (PyMuPDF / python-docx / UTF-8)
        └─► Gemini Content Understanding (google-genai SDK)
              └─► Common Content Representation (CCR Pydantic Schema - Single Source of Truth)
                    ├─► Transformation Engine (Audience, Tone, Language, Objective, Detail Level)
                    │     ├─► Executive Summary Output
                    │     ├─► Actionable Advisory Output
                    │     ├─► Presentation Slide Deck Output
                    │     ├─► Social Media Posts & Threads (LinkedIn / X)
                    │     └─► Infographic Content Specification
                    └─► Quality Control & Provenance Verification Engine (Zero LLM / Deterministic Matching)
                          └─► Export Service (ReportLab PDF / python-pptx PPTX)
```

---

## 🚀 Key Features

1. **Normalized Single Source of Truth (CCR)**:
   All output generators consume the validated CCR. Source document text is analyzed once, eliminating redundant LLM calls and preventing hallucination drift.
2. **Configurable Content Transformation**:
   - **Target Audience**: Senior Officials, Technical Personnel, Field Personnel, General Audience.
   - **Tone Adaptation**: Formal, Technical, Neutral, Simplified.
   - **Multilingual Support**: English, Hindi, Marathi.
   - **Communication Objectives**: Inform, Brief, Advise, Explain, Recommend.
3. **Multi-Output Deliverables**:
   - **Executive Summary**: High-level briefings, statistics, risks, and recommendations.
   - **Actionable Advisory**: Situation briefings, analytical findings, priority levels, and directives.
   - **Presentation Slide Deck**: Multi-slide decks with speaker notes and page citations.
   - **Social Media Posts**: Platform-tailored LinkedIn and X posts with hashtags and interactive copy button.
   - **Infographic Specification**: Visual section layouts with suggested charts (`timeline`, `bar_chart`, `number_highlight`, `process_flow`).
4. **Trustworthy Quality & Provenance Verification**:
   Deterministic matching checks extracted claims against the CCR to flag supported, partially supported, unsupported, or conflicting claims.
5. **Secure PDF & PPTX File Generation**:
   Generates native binary PDF and PPTX files server-side without external dependencies.
6. **Demo & Offline Mock Mode (`USE_MOCK_AI=true`)**:
   Enables 100% deterministic offline testing and demonstration without requiring a live Gemini API key.
7. **Daily Login Rate Limiting & Brute-Force Defense**:
   Strict security capping per account and IP (`MAX_LOGIN_ATTEMPTS_PER_DAY=5`, `LOGIN_LOCKOUT_HOURS=24`). If repeated failed attempts occur, automated 24-hour lockout blocks unauthorized access with HTTP 429 and live security countdowns.

---

## 🛠 Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Backend**: Python 3.11+, FastAPI, Uvicorn, Pydantic v2
- **AI Integration**:
  - **Local Offline Engine (Default)**: Qwen 2.5 3B Instruct via `llama.cpp` (`llama-server`) — 100% private, air-gapped, zero API keys required!
  - **Cloud Engine (Optional)**: Google Gemini API (`google-genai` SDK) with round-robin key rotation and quota failover
  - **Deterministic Mock Engine**: Offline unit test fixtures (`USE_MOCK_AI=true`)
- **Document Processing**: PyMuPDF (`fitz`), python-docx, Plain Text
- **Export Engines**: ReportLab (PDF), python-pptx (PowerPoint)
- **Testing**: pytest, FastAPI TestClient

> 📖 **Deep Dive**: For full architectural diagrams, component contracts, and pipeline specifications, see [ARCHITECTURE.md](ARCHITECTURE.md).

---

## ⚙️ Environment Setup & Quick Start

### 🚀 Instant One-Click Start (Recommended)

Simply double-click `start_all.bat` in the root folder. It starts:
1. **NTRO Local LLM**: `llama-server` running Qwen 2.5 3B on `http://127.0.0.1:8080`
2. **NTRO Backend**: FastAPI on `http://127.0.0.1:8000`
3. **NTRO Frontend**: Next.js on `http://localhost:3000`

---

### 🖥️ Local LLM Setup (Qwen 2.5 3B Instruct via llama.cpp)

1. Install `llama.cpp` via Windows Package Manager:
   ```powershell
   winget install ggml.llamacpp
   ```
2. Start the local model server (or run `run_llm.bat`):
   ```powershell
   llama-server -hf Qwen/Qwen2.5-3B-Instruct-GGUF:Q4_K_M --port 8080 --host 127.0.0.1 -c 8192
   ```
   *The model will automatically download from Hugging Face on first run and be cached locally.*

3. In `backend/.env`, ensure:
   ```env
   LLM_PROVIDER=local
   LOCAL_LLM_URL=http://127.0.0.1:8080/v1
   LOCAL_LLM_MODEL=Qwen/Qwen2.5-3B-Instruct-GGUF:Q4_K_M
   ```
   **No Google Gemini API key is needed!**

---

### 1. Manual Backend Setup

1. Navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Start the backend server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

### 2. Frontend Setup

1. Navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install Node.js dependencies:
   ```bash
   npm install
   ```
3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Automated Testing

The backend includes a comprehensive 115-test suite covering security, API validation, failure handling, consistency, quality control, export safety, demo mode, and regression testing:

```bash
cd backend
.\venv\Scripts\python.exe -m pytest -v
```

---

## 🔒 Security & Privacy Rules

- **Zero API Key Leakage**: API keys exist strictly in `backend/.env` and are never exposed to the client or written to logs.
- **Path Traversal Protection**: Document IDs and file paths are strictly sanitized and checked for directory containment (`is_relative_to`).
- **File Input Guards**: Maximum file upload size is capped at 25MB with strict extension validation (`.pdf`, `.docx`, `.txt`).
- **Single-Pass Text Limits**: Large document processing is guarded at 100,000 characters to prevent silent content truncation.
