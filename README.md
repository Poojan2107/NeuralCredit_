# NeuralCredit_ | AI-Powered FinTech Architecture

![NeuralCredit AI Pipeline Overview](https://img.shields.io/badge/Status-Production_Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_%7C_Node.js_%7C_Python-indigo?style=for-the-badge)

**NeuralCredit_** is an advanced, full-stack Fintech web application that bridges the gap between interactive React frontends and predictive Machine Learning backends. By dynamically spawning Python child processes from Node.js, it evaluates real-time personal loan applications against a pre-trained Random Forest Classifier.

Beyond simple predictions, NeuralCredit_ implements **Explainable AI (XAI)**, enterprise-grade UX (such as Open Banking simulators and 3D UI rendering), and automated SQL analytics dashboards. 

This project demonstrates strong Architectural Engineering, bridging Data Science and Web Development into a cohesive Software-as-a-Service (SaaS) product.

---

## ⚡ Core Enterprise Features

### 1. MLOps & Explainable AI (XAI)
The `Node.js` backend receives JSON input from the React client, spawns a `predict.py` child process, and pipes the data into a Scikit-Learn `Random Forest` model trained on historical lending data. 
*   **The "Aura Optimizer":** Uses the ML output probabilities to calculate dynamic risk-based interest rates and EMI schedules.
*   **XAI Feature Importances:** The Python model intercepts `.feature_importances_`, allowing the frontend to render a live Recharts Radar Chart explaining visually exactly which financial metric (e.g., CIBIL vs Income) caused the approval/rejection.

### 2. Hyper-Premium UI & 3D Tilt Rendering
The frontend UI pushes the limits of modern web aesthetic. Utilizing **Tailwind CSS v4** and **Framer Motion**, the application features:
*   Physical 3D matrix-tilt effects driven by real-time mouse coordinate tracking (`useMotionValue`).
*   Bespoke, custom-animated glassmorphism dropdown selects built from scratch.

### 3. Open Banking Mock Integration 
A frictionless UX feature simulating Plaid or Account Aggregator behavior. A modal handles simulated AES-256 secure connections, generates random realistic financial profiles, and auto-fills complex form state in milliseconds to reduce applicant drop-off rates.

### 4. Admin Dashboard & "God Mode" Seeder
Logs all AI predictions to an `SQLite` relational database. 
*  **Data Seeder Endpoint:** An interactive "System Seed" endpoint triggers a Python script to instantly inject 50 realistic historically modeled loan arrays into the database for live demonstration.
*  **Recharts Integration:** Translates raw SQL queries into beautiful Bar Charts (CIBIL distribution) and Donut Charts (Employment Loan Averages) that instantly update upon backend sync.

### 5. Automated Document Pipelines (PDF & CSV)
*   **Sanction PDF Engine:** If approved, a bespoke engine generates a stylized, watermarked Sanction Letter (utilizing `jsPDF`) populated with the user's generated interest metrics and verification signatures. 
*   **Audit Logging:** Admin users can trigger an instant CSV export of all historical database logs.

### 6. True Network Resilience (Offline Hook)
Instead of relying on fragile state, the React architecture leverages a custom `useNetworkStatus()` hook attached directly to the DOM. If internet drops, it seamlessly triggers an overarching "System Offline" framer-motion interruption without dropping form state.

---

## 🛠️ The Tech Stack

**Frontend Architecture:**
*   **React 18** (Vite + TypeScript)
*   **Tailwind CSS V4** (Aesthetic glass-morphism UI)
*   **Framer Motion** (3D Mouse Tracking and micro-animations)
*   **Recharts** (Complex SVG data visualization)

**Backend Architecture:**
*   **Node.js / Express.js** (API routing)
*   **SQLite3** (Lightweight relational database via `better-sqlite3`)
*   *Child_Process modules* for deep IPC (Inter-Process Communication)

**Machine Learning Engine:**
*   **Python 3.10+**
*   **Scikit-Learn** (Random Forest Modeling)
*   **Pickle** (Binary memory execution)

---

## 🚀 How to Run Locally

### Prerequisites
You must have both **Node.js** (v18+) and **Python** (v3.9+) installed.
Ensure Python libraries are installed: `pip install numpy scikit-learn pandas`

### 1. Install Node Dependencies
```bash
npm install
```

### 2. Start the Full-Stack Network
This spins up both the Vite frontend bundler and the Express array backend.
```bash
npm run dev
```

---

*Architected as a capstone demonstration of full-stack AI systems engineering.*
