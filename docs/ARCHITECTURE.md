# 🏗️ System Architecture

NeuralCredit_ is designed as a fully integrated, containerized web application containing an interactive React frontend, a unified Node.js/Express backend API, an SQLite database edge node, and an isolated Python machine learning engine. 

## The Data Pipeline
When a user evaluates their loan profile, data moves rapidly through the full-stack architecture.

1.  **Frontend (React/Vite) Input:** The user submits their 11 financial metrics through a secure, client-side validated form (`Zod`).
2.  **API Gateway (Node/Express):** The JSON data hits the `/api/predict` route alongside session cookies. The route verifies authentication, IP rate limits, and safely serializes the user input.
3.  **Process Spawning:** Node.js utilizes the `child_process.spawn()` method to trigger isolated Python execution on the host machine.
4.  **Python ML Engine:** The `predict.py` script receives the JSON payload, loads a heavy `scikit-learn` `.pkl` file into memory, processes the user parameters, and pipes a `Pass/Fail` probability back mapped to stdout.
5.  **Database Persistence:** Before routing the final score back to the frontend, Node.js injects the transaction records into the persistent SQLite `predictions` table, mapped linearly to the user's `id`.
6.  **Frontend Render:** The React component updates the visual Dashboard displaying the approval/rejection animation, updating local state variables.

---

## 🗄️ Database Schema

The backend uses a localized `database.db` via `better-sqlite3`. Given the lightweight approach required for edge ML computing, we utilize write-ahead logging (WAL mode) combined with rapid transactions.

### Table: `users`
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `username` | TEXT | UNIQUE, NOT NULL |
| `password` | TEXT | HASHED (bcrypt), NOT NULL |

### Table: `predictions`
| Column | Type | Attributes |
| :--- | :--- | :--- |
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT |
| `user_id` | INTEGER | FOREIGN KEY REFERENCES ​users(id), NULLABLE |
| `dependents` | INTEGER | |
| `education` | TEXT | 'Graduate' OR 'Not Graduate' |
| `self_employed` | TEXT | 'Yes' OR 'No' |
| `annual_income` | INTEGER | |
| `loan_amount` | INTEGER | |
| `loan_term` | INTEGER | |
| `cibil_score` | INTEGER | |
| `residential_assets` | INTEGER | |
| `commercial_assets`| INTEGER | |
| `luxury_assets` | INTEGER | |
| `bank_assets` | INTEGER | |
| `approved` | BOOLEAN | SQLite handles as 1 / 0 |
| `probability` | REAL | Float representing ML confidence score % |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP |

> **Note:** Historical training records seeded into this table via CSV are uniquely identified by a `user_id` value of `NULL`, separating system records from active user sessions.

---

## 📡 Core API Routes

A brief reference for the internal endpoints handling traffic on Port `3000`.

*   `POST /api/register`
    *   **Description:** Creates a new session user, uniquely hashed via bcrypt.
    *   **Rate Limits:** 5 attempts / 15 mins.
    *   **Payload Expects:** `username`, `password`
*   `POST /api/login`
    *   **Description:** Authenticates the user session.
    *   **Rate Limits:** 10 attempts / 15 mins.
    *   **Payload Expects:** `username`, `password`
*   `POST /api/predict`
    *   **Description:** Forwards input criteria to the Python layer; records output to SQLite.
    *   **Rate Limits:** 30 attempts / 1 min.
    *   **Payload Expects:** A fully marshaled Loan parameter JSON object validation via Zod.
*   `GET /api/predictions/history`
    *   **Description:** Fetches up to 100 historical records associated with a `user_id` including global generic training data for visual table rendering.
