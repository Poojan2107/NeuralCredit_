import sys
import json
import pickle
import os
import numpy as np
import random

# Load the model
model_path = 'random_forest_model.pkl'

def load_engine():
    if not os.path.exists(model_path):
        return None
    with open(model_path, 'rb') as f:
        return pickle.load(f)

def process_request(model, line):
    try:
        data = json.loads(line)
        
        education_map = {'Graduate': 1, 'Not Graduate': 0}
        self_employed_map = {'Yes': 1, 'No': 0}

        features = [
            int(data.get('dependents', 0)),
            education_map.get(data.get('education'), 0),
            self_employed_map.get(data.get('selfEmployed'), 0),
            int(data.get('annualIncome', 0)),
            int(data.get('loanAmount', 0)),
            int(data.get('loanTerm', 0)),
            int(data.get('cibilScore', 0)),
            int(data.get('residentialAssets', 0)),
            int(data.get('commercialAssets', 0)),
            int(data.get('luxuryAssets', 0)),
            int(data.get('bankAssets', 0))
        ]

        features_array = np.array([features])
        
        # Predict
        prediction = model.predict(features_array)
        
        probability = 0
        if hasattr(model, 'predict_proba'):
            probs = model.predict_proba(features_array)
            probability = probs[0][1] * 100 
        else:
            probability = 100 if prediction[0] == 1 else 0

        is_approved = bool(prediction[0] == 1)

        # --- Financial Optimization Engine v2.5 ---
        cibil = int(data.get('cibilScore', 750))
        cibil_factor = (max(min(cibil, 900), 300) - 300) / 600
        rate = 18.0 - (cibil_factor * 11.0)

        income = int(data.get('annualIncome', 0))
        loan = int(data.get('loanAmount', 0))
        term = int(data.get('loanTerm', 12))
        
        if income > 0 and loan > 0:
            dti = loan / income
            if dti < 0.2: rate -= 0.5
            elif dti > 1.0: rate += 1.0
        
        if term > 48: rate += (term - 48) * 0.01
        if data.get('selfEmployed') == 'No': rate -= 0.25

        # Jitter
        # Use a combination of inputs to ensure deterministic but unique jitter for same input
        random.seed(hash(f"{income}{loan}{cibil}{term}") % 1000)
        rate += random.uniform(-0.1, 0.1)
        rate = max(6.49, min(23.99, rate))

        p = loan
        r = (rate / 100) / 12
        n = term if term > 0 else 1
        emi = (p * r * ((1 + r) ** n)) / (((1 + r) ** n) - 1) if r > 0 else p / n

        # XAI
        feature_names = ["Dependents", "Education", "Self Employed", "Annual Income", "Loan Amount", "Loan Term", "CIBIL Score", "Residential Assets", "Commercial Assets", "Luxury Assets", "Bank Assets"]
        feature_importance = []
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            for name, imp in zip(feature_names, importances):
                # Deterministic jitter based on index
                random.seed(feature_names.index(name) + int(cibil))
                adjusted_imp = float(imp) * random.uniform(0.95, 1.05)
                feature_importance.append({"feature": name, "importance": round(adjusted_imp * 100, 2)})
            
            total = sum(item['importance'] for item in feature_importance)
            for item in feature_importance:
                item['importance'] = round((item['importance'] / total) * 100, 2)
            feature_importance = sorted(feature_importance, key=lambda x: x['importance'], reverse=True)

        return {
            "approved": is_approved,
            "probability": round(probability, 2),
            "interestRate": round(rate, 2),
            "emi": round(emi, 2),
            "feature_importance": feature_importance
        }
    except Exception as e:
        return {"error": str(e)}

if __name__ == "__main__":
    # Pre-warm the model once
    model = load_engine()
    
    # Ready Signal for Node.js
    if model is not None:
        # sys.stderr.write is better for status messages so they don't pollute stdout
        sys.stderr.write("AURA_ENGINE_READY\n")
        sys.stderr.flush()
    else:
        sys.stderr.write("AURA_ENGINE_FAILED\n")
        sys.stderr.flush()
        sys.exit(1)

    # Listen Loop
    while True:
        line = sys.stdin.readline()
        if not line:
            break
        result = process_request(model, line)
        print(json.dumps(result))
        sys.stdout.flush() # CRITICAL for near-instant response
