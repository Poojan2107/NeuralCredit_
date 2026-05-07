import pandas as pd
import numpy as np
import pickle
import os
import json
import time
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report

def train_model():
    # Ensure versions directory exists
    os.makedirs('versions', exist_ok=True)
    
    # 1. Load Dataset
    csv_path = 'loan_approval_dataset.csv'
    if not os.path.exists(csv_path):
        print(json.dumps({"status": "error", "message": f"Dataset {csv_path} not found"}))
        return

    df = pd.read_csv(csv_path)
    
    # 2. Preprocessing
    df.columns = df.columns.str.strip()
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].str.strip()

    # 3. Encoding
    df['education'] = df['education'].map({'Graduate': 1, 'Not Graduate': 0})
    df['self_employed'] = df['self_employed'].map({'Yes': 1, 'No': 0})
    df['loan_status'] = df['loan_status'].map({'Approved': 1, 'Rejected': 0})

    # 4. Feature Selection
    features = [
        'no_of_dependents', 'education', 'self_employed', 'income_annum', 
        'loan_amount', 'loan_term', 'cibil_score', 'residential_assets_value', 
        'commercial_assets_value', 'luxury_assets_value', 'bank_asset_value'
    ]
    
    X = df[features]
    y = df['loan_status']

    # 5. Split & Train
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # 6. Evaluate
    y_pred = model.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    
    # 7. Save Model with Versioning
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    version_filename = f"versions/model_{timestamp}.pkl"
    
    with open(version_filename, 'wb') as f:
        pickle.dump(model, f)
        
    # Also update the active model
    with open('random_forest_model.pkl', 'wb') as f:
        pickle.dump(model, f)

    # Output JSON for Node.js to consume
    result = {
        "status": "success",
        "timestamp": timestamp,
        "accuracy": round(accuracy * 100, 2),
        "version": version_filename,
        "features": features,
        "samples": len(df)
    }
    print(json.dumps(result))

if __name__ == "__main__":
    train_model()
