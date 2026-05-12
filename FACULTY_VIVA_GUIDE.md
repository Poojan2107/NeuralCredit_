# 🎯 NeuralCredit: Faculty Viva & Presentation Guide

This document contains potential questions your faculty might ask during the final presentation, along with professionally structured answers based on the actual technical implementation of the project.

---

## 🧠 Category 1: AI & Machine Learning (The Neural Engine)

**Q1: Why did you choose Random Forest instead of a Deep Learning (Neural Network) model?**
*   **Answer**: "For tabular financial data, Random Forests are often superior to Deep Learning. They handle non-linear relationships without requiring massive datasets, they are less prone to overfitting, and most importantly, they provide **Feature Importance** (XAI). In FinTech, explainability is a regulatory requirement; we need to know *why* a loan was rejected, which Random Forest provides out of the box."

**Q2: What is the 'Aura Engine' listed in your technical stack?**
*   **Answer**: "Aura is our custom **Inference Orchestrator**. Typically, calling a Python script from Node.js is slow because the model has to load into RAM every time. Aura keeps the Python process alive in the background (Persistent IPC). This reduced our prediction latency from ~10 seconds to under 50 milliseconds."

**Q3: How do you handle 'Explainable AI' (XAI)?**
*   **Answer**: "We utilize the `feature_importances_` attribute of our trained model. When a prediction is made, we extract the contribution of each parameter (like CIBIL, Income, etc.) and visualize it using a Radar Chart in the UI. This allows the user to see exactly which financial metrics influenced their credit score."

---

## 📊 Category 2: Data & Parameters

**Q4: Your form collects 'Age', but your model doesn't seem to use it. Why?**
*   **Answer**: "Age is handled by our **Policy & Identity Layer**. We use it for eligibility filtering (18-65 years) and KYC verification. However, we intentionally excluded it from the **Neural Risk Model** to ensure our AI is 'Age-Agnostic,' focusing purely on financial meritocracy (Assets, Income, Credit History) to avoid demographic bias."

**Q5: How does your system handle 'Joint/Dual' applications?**
*   **Answer**: "We use a **Financial Aggregation Strategy**. Instead of running two separate models, we merge the candidates into a single 'Household Profile.' We pool their total income and assets while calculating a mean CIBIL score. This accurately reflects how banks evaluate combined repayment capacity."

**Q6: What is the size and source of your training data?**
*   **Answer**: "The model is trained on a curated financial dataset of **4,270 records**. It includes a balanced mix of approvals and rejections across various CIBIL tiers, ensuring the model doesn't just approve everyone but makes a calculated risk assessment."

---

## 💻 Category 3: Technical Implementation

**Q7: How does the Frontend (React) communicate with the AI (Python)?**
*   **Answer**: "We use a three-tier architecture:
    1.  **React 19** sends a JSON payload to our **Node.js/Express** backend.
    2.  The Backend pipes that data into the `stdin` of our persistent Python process. The admin panel also includes a real-time 'Training Monitor' that displays the terminal logs:
        ```
        » INITIALIZING_TRAINING_PIPELINE...
        » LOADING_4270_RECORDS...
        » GENERATING_100_TREES...
        » COMPUTING_GINI_IMPURITY...
        ```
    3.  Python processes the data and returns the result via `stdout` which is then sent back to the UI."

**Q8: What is 'Anomaly Detection' doing in your result screen?**
*   **Answer**: "We implemented a **Heuristic-Neural Hybrid** for anomaly detection. It flags applications where the requested loan is disproportionately high compared to income (e.g., >10x income) or where high-risk parameters (low CIBIL + low assets) appear suspicious. It serves as a first-line defense against 'Predatory Lending' or 'Identity Fraud'."

**Q9: Why are you using SQLite for this project?**
*   **Answer**: "We use SQLite in **WAL (Write-Ahead Logging) Mode**. It provides enterprise-level persistence for our Audit Logs and User History without the overhead of a separate database server. It’s perfect for edge-computing scenarios and high-performance demonstrations."

---

## 🎨 Category 4: UI/UX & Design

**Q10: What is the inspiration behind the 'Surgical Industrialism' aesthetic?**
*   **Answer**: "Modern FinTech is often 'too soft' and 'too simple.' We wanted an aesthetic that projects **Technical Authority** and **Precision**. Using high-contrast dark modes, grain textures, and terminal-style telemetry (framer-motion animations), we create an interface that feels like a high-end financial command center."

---

## 🛡️ Category 5: Security & Ethics

**Q11: How is the data secured during transmission?**
*   **Answer**: "The system uses **Zod Validation** on both the Frontend and Backend to prevent injection attacks. Data is transmitted via secure JSON payloads, and the backend utilizes rate-limiting to prevent brute-force 'scraping' of our AI model."

**Q12: If the AI rejects a loan that should be approved, what happens?**
*   **Answer**: "We have an **Admin Review Override** feature. Administrators can view the 'Neural Logic' in the Audit logs and manually override a decision if the AI has flagged it as an anomaly, ensuring there is always a 'Human-in-the-Loop'."

**Q13: Why did you include PDF generation in a web-based AI app?**
*   **Answer**: "To complete the **Service Lifecycle**. In a real FinTech environment, the 'Sanction Letter' is the official contract. By integrating `jsPDF`, we generate an unalterable, computer-stamped report that includes the AI's confidence score and XAI breakdown, bridging the gap between digital prediction and physical documentation."
