# 📑 NeuralCredit Project Documentation: Comprehensive Technical Spec

## 1. Project Overview
NeuralCredit is a next-generation credit risk assessment platform that replaces traditional rule-based banking logic with an AI-driven predictive engine. The platform is designed for institutional use, offering a seamless workflow from user input to legally compliant documentation.

## 2. Theoretical Framework
The project is built on the principle of **Financial Meritocracy**. By using a Random Forest Classifier trained on 4,270 historical credit records, the system identifies non-linear risk patterns that traditional CIBIL-only assessments often miss.

### Key ML Parameters:
- **Income-to-Debt Ratio (IDR)**: Evaluated through annual income vs. requested loan amount.
- **Asset Coverage Index (ACI)**: A combined evaluation of Residential, Commercial, Luxury, and Bank assets.
- **Credit Velocity**: Derived from the CIBIL score trends and term requested.

## 3. The Aura Engine Architecture
The "Aura Engine" is the project's primary technical innovation. It utilizes a **Persistent Subprocess Handshake (PSH)**:
1.  **Process Persistence**: The Node.js server spawns a Python child process on boot and keeps it alive.
2.  **Zero-IO Latency**: Data is passed via `stdin/stdout` buffers, avoiding the slow overhead of REST/HTTP calls between the backend and the ML model.
3.  **Self-Healing**: If the engine process exits due to system load, the server automatically reboots it within 2000ms.

## 4. Design Philosophy: "Surgical Industrialism"
The UI/UX is built to communicate **Trust and Authority**. 
- **Typography**: Inter and Mono-spaced fonts represent clarity and precision.
- **Visual Feedback**: Micro-animations (laser scans, neural pulses) give the user confirmation that deep-level computation is occurring.
- **XAI Radar**: Visualizes "Random Forest Feature Importance" to provide human-readable justification for AI decisions.

## 5. Security & Governance
- **Data Sanitization**: Strict Zod schemas ensure no malformed data enters the inference pipeline.
- **Role-Based Access**: 
    - **User**: Can run simulations and view history.
    - **Admin**: Can override decisions, modulate thresholds, and retrain the model.
- **Persistence**: SQLite with Write-Ahead Logging (WAL) ensures atomic transactions and audit-trail integrity.

## 6. Business Lifecycle Implementation
NeuralCredit goes beyond "Prediction" to "Execution":
- **Dynamic Yield**: Calculates interest rates based on real-time risk probability.
- **PDF Sanctioning**: Generates a professional institutional report (Sanction Letter) for approved loans.
- **Audit Logs**: Every prediction is indexed and searchable for regulatory review.

---

## 7. Project Attribution
**Engineered By:**
- **ZARVIN**
- **MANIT**
- **POOJAN**
- **VANSH**
- **KARTIK**
- **ABHISHEK**

---

**NEURAL_CREDIT // TECHNICAL_SPEC_V2.1**
**AUTHORITATIVE. PRECISE. SCALABLE.**
