# NeuralCredit_ | AI-Powered Underwriting Engine

![NeuralCredit AI Pipeline Overview](https://img.shields.io/badge/Status-Production_Ready-emerald?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_%7C_Node.js_%7C_Python-indigo?style=for-the-badge)

NeuralCredit_ is an advanced, full-stack Fintech web application that bridges the gap between interactive React frontends and predictive Machine Learning backends. By dynamically spanning Python child processes from Node.js, it evaluates real-time personal loan applications against a pre-trained Random Forest Classifier.

Beyond simple predictions, NeuralCredit_ implements **Explainable AI (XAI)**, enterprise-grade UX (such as Open Banking simulators and PDF generation), and automated SQL analytics dashboards. 

This project demonstrates strong Architectural Engineering, bridging Data Science and Web Development into a cohesive Software-as-a-Service (SaaS) product.

---

## ⚡ Core Enterprise Features

### MLOps & Explainable AI (XAI)
The `Node.js` backend receives JSON input from the React client, spawns a `predict.py` child process, and pipes the data into a Scikit-Learn `Random Forest` model trained on historical lending data. 
*   **The "Aura Optimizer":** Uses the ML output probabilities to calculate dynamic risk-based interest rates and EMI schedules.
*   **XAI Feature Importances:** The Python model intercepts `.feature_importances_`, allowing the frontend to render a live Recharts Radar Chart explaining visually exactly which financial metric (e.g., CIBIL vs Income) caused the approval/rejection.

### Open Banking Mock Integration 
A frictionless UX feature simulating Plaid or Account Aggregator behavior. A modal handles simulated AES-256 secure connections, generates random realistic financial profiles, and auto-fills complex form state in milliseconds to reduce applicant drop-off rates.

### Audit Dashboard & Analytics Data Engineering
Logs all AI predictions (user ID, demographic inputs, and ML probabilities) to an `SQLite` relational database. 
*   **The Aggregation Engine:** The backend runs compound `GROUP BY` and `AVG` SQL statements to feed real-time Key Performance Indicators (KPIs) to the frontend.
*   **Recharts Integration:** Translates raw SQL queries into beautiful Bar Charts (CIBIL distribution) and Donut Charts (Employment Loan Averages) with hovering tooltips.

### Automated Document Pipelines (PDF & CSV)
Enterprise software requires portability.
*   **Sanction PDF:** If a loan is approved, the client utilizes `jsPDF` to dynamically render and download an official watermarked "Sanction Letter" populated with the user's specific math variables. 
*   **Audit Logging:** Admin users can trigger an instant CSV export of all historical database logs through a programmatic data Blob generator.

### Front-End Resilience (Offline Mode)
The application routinely polls `/api/health`. If the server drops, the frontend intercepts user actions, rendering a beautiful "Connection Lost" modal instead of throwing a raw `.catch()` JavaScript error or dropping form state.

---

## 🛠️ The Tech Stack

**Frontend Architecture:**
*   **React 18** (Vite + TypeScript)
*   **Tailwind CSS V4** (Aesthetic glass-morphism UI)
*   **Framer Motion** (Micro-animations and layout transitions)
*   **Recharts** (Complex SVG data visualization)
*   **Lucide React** (Vector iconography)

**Backend Architecture:**
*   **Node.js / Express.js** (API routing and static serving)
*   **SQLite3** (Lightweight relational database)
*   **Bcrypt** & **Express-Session** (Secure Admin authentication)
*   *Child_Process modules* for IPC (Inter-Process Communication)

**Machine Learning Engine:**
*   **Python 3.10+**
*   **Scikit-Learn** (Random Forest Modeling)
*   **NumPy & Pandas** (Data wrangling)
*   **Pickle** (Binary object serialization)

---

## 🚀 How to Run Locally

### Prerequisites
You must have both **Node.js** (v18+) and **Python** (v3.9+) installed on your machine.
Ensure Python libraries `numpy` and `scikit-learn` are installed (`pip install numpy scikit-learn`).

### 1. Install Node Dependencies
Ensure you are in the root directory:
```bash
npm install
```

### 2. Start the Full-Stack Developer Server
This single command spins up both the Vite frontend bundler and the Express/Node.js backend on `http://localhost:5173`.
```bash
npm run dev
```

### 3. Build for Production
To minify the assets and test the static production build:
```bash
npm run build
```

---

## 🎨 Dashboard Previews

### The AI Decision Engine (XAI Radar Charts)
*(Interactive form state with real-time feedback and dynamic SVG rendering)*
Placeholder: Insert screenshot here of the dark-mode form and XAI breakdown.

### Institutional Analytics Dashboard 
*(Aggregated SQL queries rendered into Recharts Components)*
Placeholder: Insert screenshot here of the /history graphs and CSV button.

---

*Designed and Architected as a capstone demonstration of full-stack systems engineering.*
