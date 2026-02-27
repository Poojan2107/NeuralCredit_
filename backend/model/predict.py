import sys
import json
import pickle
import os
import numpy as np

# Load the model
model_path = 'random_forest_model.pkl'

def predict():
    try:
        # Read data from stdin
        input_json = sys.stdin.read()
        if not input_json:
            print(json.dumps({"error": "No input data provided"}))
            return

        data = json.loads(input_json)

        # Preprocessing & Encoding
        # NOTE: These mappings assume standard Label Encoding (Alphabetical) or Manual Mapping.
        # Adjust these if your specific model used different encodings.
        
        # Education: 'Graduate' vs 'Not Graduate'
        # Common convention: Graduate=1, Not Graduate=0
        education_map = {'Graduate': 1, 'Not Graduate': 0}
        
        # Self_Employed: 'Yes' vs 'No'
        # Common convention: Yes=1, No=0
        self_employed_map = {'Yes': 1, 'No': 0}

        # Feature Vector Construction
        # Order MUST match the training dataset columns:
        # 0: no_of_dependents
        # 1: education
        # 2: self_employed
        # 3: income_annum
        # 4: loan_amount
        # 5: loan_term
        # 6: cibil_score
        # 7: residential_assets_value
        # 8: commercial_assets_value
        # 9: luxury_assets_value
        # 10: bank_asset_value

        features = [
            int(data.get('dependents', 0)),
            education_map.get(data.get('education'), 0), # Default to 0 if missing
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

        # Reshape for model input (1 sample, n features)
        features_array = np.array([features])

        # Check if model file exists
        if not os.path.exists(model_path):
             # Fallback for demonstration if file is missing
             # We return a mock response so the UI still works for the user to see
             # In a real scenario, this should be an error.
             print(json.dumps({
                 "error": "Model file 'random_forest_model.pkl' not found.",
                 "approved": False,
                 "probability": 0
             }))
             return

        with open(model_path, 'rb') as f:
            model = pickle.load(f)

        # Predict
        prediction = model.predict(features_array)
        
        # Get probability if available
        probability = 0
        if hasattr(model, 'predict_proba'):
            # Assuming binary classification where index 1 is 'Approved' (or the positive class)
            # Check classes_ attribute if possible, but usually 1 is positive.
            probs = model.predict_proba(features_array)
            probability = probs[0][1] * 100 
        else:
            probability = 100 if prediction[0] == 1 else 0

        # Map prediction to boolean
        # Assuming target 'loan_status' was encoded as 1=Approved, 0=Rejected
        is_approved = bool(prediction[0] == 1)

        # Extract Feature Importances (XAI)
        feature_names = [
            "Dependents", "Education", "Self Employed", "Annual Income", "Loan Amount",
            "Loan Term", "CIBIL Score", "Residential Assets", "Commercial Assets",
            "Luxury Assets", "Bank Assets"
        ]
        
        feature_importance = []
        if hasattr(model, 'feature_importances_'):
            importances = model.feature_importances_
            for name, imp in zip(feature_names, importances):
                feature_importance.append({
                    "feature": name,
                    "importance": round(float(imp) * 100, 2)
                })
            
            # Sort by highest importance
            feature_importance = sorted(feature_importance, key=lambda x: x['importance'], reverse=True)

        result = {
            "approved": is_approved,
            "probability": round(probability, 2),
            "feature_importance": feature_importance
        }

        print(json.dumps(result))

    except Exception as e:
        # Print error as JSON so Node.js can parse it
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    predict()
