# Engineering Handbook: NeuralCredit_ Architecture
**Document Classification:** Internal / Engineering Team Transfer
**Subject:** End-to-End System Architecture, Design Philosophy, and Scalability
**Target Audience:** Incoming Principal Engineers, Backend/Frontend Developers, Data Scientists

---

## 1. Executive Overview

### System Purpose
NeuralCredit_ bridges the critical gap between conceptual Data Science and production-ready Software Engineering. It solves the "Jupyter Notebook Problem" by taking a predictive Random Forest machine learning model and encasing it in a highly secure, scalable, and interactive Edge-Compute web application. It evaluates 11 multidimensional financial metrics to instantly predict loan default probabilities.

### Core Capabilities
*   **Active Inference Engine:** Real-time ML execution via isolated child processes.
*   **Cryptographic Identity Management:** Secure session-based user authentication.
*   **Immutable Telemetry:** High-throughput logging of both historic ML training data and live user inference results.
*   **High-Fidelity Client:** A React-driven SPA (Single Page Application) fortified with strict client-side parameter validation.

### Architectural Philosophy
The system is built on a **Monolithic Orchestrator** pattern. Rather than managing sprawling, complex microservices for a specialized MVP, we engineered a unified Node.js/Express monolith that serves the frontend, handles database persistence via an embedded SQLite Edge node, and intelligently orchestrates Python sub-processes. This minimizes network latency, removes cross-origin resource sharing (CORS) complexity, and natively pairs the data layer with the compute layer. 

---

## 2. High-Level System Architecture

### Interaction Model & Lifecycle
NeuralCredit_ utilizes an N-Tier architecture designed for synchronous request-response lifecycles, structured as follows:

1.  **Presentation Tier (React/Vite):** Captures user input, enforces mathematical boundaries, and serializes payloads to JSON.
2.  **API Gateway / Orchestrator (Node.js/Express):** Intercepts HTTP traffic, resolves session cookies to cryptographic identities, and applies algorithmic rate-limiting.
3.  **Persistence Tier (SQLite):** Acts as absolute ground truth. It validates user lookups and safely stores active session audit logs via Write-Ahead Logging (WAL).
4.  **Compute Tier (Python/Scikit-Learn):** A completely isolated physical process that deserializes JSON inputs, loads the pre-trained `.pkl` Random Forest model into system RAM, executes the classification, and returns standard output directly to the Node orchestrator.

This strict layer isolation ensures that the Node.js event loop is never blocked by heavy floating-point matrix multiplication native to the Machine Learning classification.

---

## 3. Frontend Architecture Deep Dive

### Folder Structure & Component Hierarchy
The frontend (`src/`) is inherently decoupled from the internal routing of the backend, communicating purely via RESTful JSON.
*   `src/pages/`: Contains macro-level Route views (`Dashboard.tsx`, `History.tsx`). These are stateful containers.
*   `src/components/`: Contains modular, highly reusable dumb/presentation components (`FieldInput`, `Navbar`). 
*   `src/auth/`: Encapsulates the React Context Provider for global authentication state dissemination.

### State Management & Validation Strategy
We rejected Redux in favor of **React Context API** coupled with localized `useState` hooks. Given the linear nature of data flow in this application, a global flux store would introduce unnecessary technical debt. 

**Form Handling (Zod):** Zod serves as our frontline firewall. By structurally enforcing schema boundaries mathematically (e.g., `cibilScore.max(900)`), we prevent malicious or technically invalid data from ever triggering expensive Python compute cycles or database queries.

### Styling & Reusability
Tailwind CSS v4 handles UI logic. By using utility-first CSS, we prevent cascading specificity wars and keep the CSS Object Model (CSSOM) extremely slim. Framer Motion is utilized for layout state transitions because it hooks directly into hardware-accelerated CSS properties (like `transform` and `opacity`), preventing Main-Thread layout thrashing.

---

## 4. Backend Architecture Deep Dive

### Orchestration Structure (`server.ts`)
The Node.js server acts as a unified controller. It handles:
*   **Middleware Pipeline:** Global interceptions for `express.json()` body parsing, URL-encoded interpretation, and session hydration.
*   **Custom Rate Limiting:** An algorithmic `Map()` structure calculates incoming IP traffic against a temporal window. This protects `/api/login` from brute-force dictionary attacks and `/api/predict` from Compute-Denial-of-Service (spinning up too many heavy Python threads).

### The Compute Bridge (Process Spawning)
The Node engine employs `child_process.spawn()`. 
**Why not use an HTTP request to a Flask API?**
For this deployment scale, network I/O overhead to localhost via HTTP is less efficient than directly piping `stdin/stdout` through standard OS streams. The Node server serializes the validated Zod object, streams it directly into the memory space of the booted Python runtime, securely awaits the `close` event, and intercepts `stdout` via an event listener. This guarantees maximum compute density on a single virtual machine.

### Error Propagation
Errors in Python (stderr) are aggressively caught, serialized, and safely piped back through the Node Express response. Information bleeding is minimized by standardizing edge-case fallbacks inside the route try-catch block.

---

## 5. Database Design & Schema Engineering

### Philosophical Approach: Embedded Edge Database
We implemented **`better-sqlite3`**, a synchronous, embedded database. 
Unlike MySQL, which requires a heavy daemon running TCP sockets, SQLite operates directly on the disk file (`database.db`). We specifically configured SQLite to operate in **WAL (Write-Ahead Logging)** mode. This allows the database to process concurrent high-speed reads (like viewing the `/history` page) while simultaneously processing active writes (saving a new prediction log), completely eliminating `SQLITE_BUSY` database lock errors.

### Schema Breakdown
*   **Users Table:**
    *   `id` (PK)
    *   `username` (UNIQUE Constraint) - Explicitly indexed by SQLite implicitly via the unique constraint for O(log n) login lookups.
    *   `password` (TEXT) - Houses 60-character bcrypt cryptographic hashes.
*   **Predictions Table (Audit Telemetry):**
    *   `id` (PK)
    *   `user_id` (FOREIGN KEY) - Links to the user. System training records are denoted by `user_id IS NULL`. This allows unified querying of historical and active data while partitioning access via SQL `WHERE` clauses.
    *   *11 Semantic Data Fields* - Stored tightly as `INTEGER` or `TEXT`.
    *   `approved` (BOOLEAN) - Core output.
    *   `probability` (REAL) - High-precision float.

---

## 6. Complete Application Workflow (The Lifecycle)

### Narrative: A Live Prediction Request
1.  **State Init:** A user logs in. `express-session` negotiates a Set-Cookie header containing a cryptographically signed Session ID.
2.  **Request Generation:** The user executes "Evaluate Profile". Zod parses the UI payload. The `fetch` API transmits the JSON payload + Cookie to `/api/predict`.
3.  **Authentication Filter:** Node verifies `req.session.userId`. Unauthenticated requests immediately bounce as `401 Unauthorized`.
4.  **Compute Invocation:** Node securely spawns `backend/model/predict.py`.
5.  **ML Inference:** Python deserializes the payload, mathematically encodes generic strings (e.g., 'Graduate' -> 1), shapes the 11-dimensional Numpy array, and runs it against the `joblib`-loaded Random Forest trees.
6.  **Immutable Logging:** Python passes `{ approved: true, probability: 94.5 }` to `stdout`. Node parses it. Immediately, Node prepares an `INSERT INTO predictions` statement and writes the telemetry block to the SQLite disk mapped to the user ID.
7.  **Final Response:** Node transmits the JSON back to React, resolving the promise and triggering the Framer Motion UI update.

---

## 7. Security Architecture

### Authentication & Authorization
*   We utilize **Session-Based Authentication** (`express-session`) enforced via `httpOnly` flags. This forces the browser to handle the token natively, eliminating local-storage Javascript read-access (preventing Cross-Site Scripting (XSS) payload theft).
*   **Password Cryptography:** Passwords are hashed iteratively using `bcryptjs` with a cost factor (salt rounds) of 10. This mathematically mitigates rainbow-table brute-force rendering compromised databases useless.
*   **SQL Injection Prevention:** All dynamic I/O interacting with SQLite uses parameterized `db.prepare('...').run(params)` queries. The SQLite engine compiles the statement safely prior to value binding, structurally neutralizing malicious SQL injection vectors.

---

## 8. Development Lifecycle & Engineering

### Build Process & Integration
*   The Monorepo is designed around a singular package context. 
*   **Development:** `npm run dev` kicks off Vite Middleware integrated directly inside the Express server via `appType: 'spa'`. This allows Frontend Hot-Module-Replacement (HMR) while synchronously serving the backend API on a single port (`3000`), removing dev-environment CORS issues.
*   **Production Build:** The `tsc` compiler creates optimized static ES structures in the `/dist` folder. Express then transitions to serving static files via `express.static()`.
*   **Data Seeding:** The `backend/seed.ts` script handles automated Extraction, Transformation, and Loading (ETL). It parses 4,200+ CSV training rows into strictly typed SQL relational data for continuous testing baselines.

---

## 9. Engineering Decisions, Trade-offs & Tech Debt

### Choosing Random Forest over Neural Networks
Given financial data is highly tabular, noisy, and non-linear, a Random Forest Classifier mathematically outperforms basic Logistic Regression while being an order of magnitude faster to execute on CPU than a deep-learning Neural Network layout (like TensorFlow).

### Tech Debt: Ephemeral Model Loading
**Current Flow:** For every prediction, Node boots a Python script, which reads the 1.7MB `.pkl` file from the disk into RAM, predicts, and dies. 
**Trade-off:** This is highly memory-efficient and requires zero daemon management. 
**Scale Limitation:** At scale (1,000+ requests/sec), disk I/O loading the model repeatedly becomes a strict bottleneck. 

### Future Scalability Path
When transitioning to Enterprise scale:
1.  Python `predict.py` must be decoupled into a persistent **FastAPI Microservice**. The model will load *once* into RAM on startup, and Node will communicate to it via persistent gRPC or internal HTTP networking.
2.  `database.db` will be natively migrated to a clustered PostgreSQL instance to allow horizontal read-replicas of the Neural Logs telemetry.

---

## 10. Performance & Optimization

*   **Zod Pre-flight:** Network latency is saved by verifying input matrices strictly client-side.
*   **SQLite WAL:** Transactions wait for disk synchronization without blocking concurrent reads inside the `/history` endpoint.
*   **SPA DOM Optimization:** React's Virtual DOM calculates layout diffs natively, ensuring screen updates (from form to prediction screen) are calculated iteratively and painted efficiently without browser-thread repaints.

---

## 11. Conclusion & Maturity Assessment

NeuralCredit_ operates strictly at an enterprise baseline. It does not treat Machine Learning as a novelty script, but as a core compute node inside an immutable, secure, and production-hardened data pipeline. 

The security implementations explicitly mitigate OWASP Top 10 vulnerabilities (Injection, Auth failures, Rate Abuse), while the architecture cleanly partitions logic into standard MVC/N-Tier structural bounds. The system is extremely highly cohesive, loosely coupled, and deeply maintainable for the incoming engineering cohort.
