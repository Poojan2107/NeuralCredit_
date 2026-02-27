# 🤖 Machine Learning Model

NeuralCredit_ utilizes a powerful Python-based backend that processes live financial data through pre-trained machine learning algorithms. The core engine is built on `scikit-learn` and relies on an external Random Forest classifier to analyze user risk assessment securely.

## The Model: Random Forest Classifier
Instead of simpler deterministic logic or standard Logistic Regression, NeuralCredit_ implements a **Random Forest Classifier**. This model is highly effective for varied financial data due to its ability to handle non-linear relationships and resistance to overfitting, making it uniquely qualified to determine a user's probability of defaulting.

The `.pkl` file currently stored in the backend is loaded dynamically using `joblib` every time a user requests an evaluation.

## 📊 Feature Selection
Our model predicts an "Approved" or "Rejected" loan status by parsing a multi-dimensional array mapping to 11 critical user metrics:

1.  **Dependents:** Number of individuals reliant on the applicant's finances.
2.  **Education:** Categorical parameter denoting university graduation status.
3.  **Self-Employed:** Entrepreneurial vs. corporate employment stability.
4.  **Annual Income:** Base salary tracking.
5.  **Loan Amount:** Requested financial dispersal size.
6.  **Loan Term:** Length of requested repayment structure via months.
7.  **CIBIL Score:** Core credit confidence metric (ranging uniquely mapped from 300 to 900).
8.  **Residential Assets:** Monentary value mapping for primary real estate ownership.
9.  **Commercial Assets:** Liquid real estate/business equity.
10. **Luxury Assets:** Vehicles, jewelry, etc.
11. **Bank Assets:** Liquid capital stores.

---

## 💾 The Training Dataset
To ensure accurate probability predictions, the Random Forest model was trained on a robust, peer-reviewed financial dataset of over **4,200 historical loan records** sourced from Kaggle. 

This historic dataset has been seeded directly into our SQLite edge database in order to provide an audit trail of "System Data" acting as the foundational baseline against which new incoming "Active Session" evaluation requests are compared. 

## Python Integration
All active requests are securely passed from the Node.js API to the `predict.py` script as encoded JSON. The Python layer dynamically extracts the 11 feature parameters, maps categorical strings (like "Yes"/"No") into integers, and queries the loaded model for a secondary `probability` array, outputting a precise percentage confidence score.
