# FinTech Compliance Backend

This repository contains the backend for a FinTech compliance solution, designed to evaluate user queries against bank policies using AI-driven workflows.

## 🏗 Architecture Overview

The backend is built with **Node.js** and **Express**, utilizing **Inngest** for reliable background job processing and **Supabase** as the database layer.

### Core Components

- **API Server**: Handles incoming HTTP requests and triggers background workflows.
- **Inngest Worker**: Manages complex, multi-step background tasks like document extraction and AI analysis.
- **Supabase**: Stores policies, evaluation results, and user data.
- **LLM Integration**: Uses an AI model to analyze policy text and make compliance decisions.

---

## 🛣 API Endpoints

### 1. Compliance Evaluation

- **Endpoint**: `POST /api/compliance/evaluate`
- **Auth Required**: Yes
- **Logic**:
  - Validates the user's request (`type`, `query`).
  - Fetches the latest active policy for the specified `type` from the database.
  - Triggers the background **Inngest Workflow** (`policy/evaluate`) to handle the heavy lifting.
  - Returns immediately to the user while the evaluation proceeds in the background.

### 2. Retrieve Latest Evaluation

- **Endpoint**: `GET /api/compliance/latest-evaluation`
- **Auth Required**: Yes
- **Logic**:
  - Queries the `evaluations` table for the authenticated user.
  - Sorts by `created_at` to retrieve the most recent assessment.
  - Returns the full result object, including status (APPROVED/REJECTED), reasoning, and confidence score.

---

## ⚙️ Background Logic (Inngest Workflow)

The most critical logic resides in the `policy/evaluate` workflow, which ensures high-performance document analysis without blocking the main thread.

### Workflow Steps:

1.  **Fetch PDF**: Downloads the relevant policy document from the URL stored in the database.
2.  **Extract Text**: Converts the PDF buffer into raw text for analysis.
3.  **Find Relevant Sections**: Uses LLM to scan the policy and isolate sections relevant to the user's specific query (contextual filtering).
4.  **Final Reasoning**: A specialized LLM prompt acts as a "Bank Compliance Expert" to:
    - Analyze the isolated sections.
    - Determine a status: `APPROVED`, `REJECTED`, or `ACTION_REQUIRED`.
    - Provide a detailed explanation and recommendation.
5.  **Store Result**: Persists the final decision, reasoning, and metadata back into Supabase for user retrieval.

---

## 🛠 Tech Stack Details

| Component           | Responsibility           | Relevant Files                                                                                                                                     |
| :------------------ | :----------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PDF Extraction**  | Parsing policy documents | [pdfExtraction.js](file:///c:/movin/programing/3_projects/hackathons-projects/Fintech-solutions/back-end/src/utils/pdfExtraction.js)               |
| **LLM Client**      | AI communication         | [llmClient.js](file:///c:/movin/programing/3_projects/hackathons-projects/Fintech-solutions/back-end/src/utils/llmClient.js)                       |
| **Workflow Engine** | Reliability & Retries    | [policyEvaluate.js](file:///c:/movin/programing/3_projects/hackathons-projects/Fintech-solutions/back-end/src/inngest/functions/policyEvaluate.js) |
| **Database**        | Data persistence         | [supabase.js](file:///c:/movin/programing/3_projects/hackathons-projects/Fintech-solutions/back-end/src/utils/supabase.js)                         |
