import sqlite3
import pandas as pd
import pickle
import os
import random
import json

# Force absolute pathing to find the database
DB_PATH = os.path.join(os.getcwd(), 'backend', 'database.db')
MODEL_PATH = os.path.join(os.getcwd(), 'backend', 'model', 'random_forest_model.pkl')
CSV_PATH = os.path.join(os.getcwd(), 'backend', 'model', 'loan_approval_dataset.csv')

def seed_accurate_data():
    print("🧠 Starting Accurate AI Seeding Engine...")
    
    # 1. Connect to Database
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 2. Load Model & Data
    if not os.path.exists(MODEL_PATH):
        print(f"❌ Error: Model {MODEL_PATH} not found. Please train it first.")
        return

    with open(MODEL_PATH, 'rb') as f:
        model = pickle.load(f)

    df = pd.read_csv(CSV_PATH)
    df.columns = df.columns.str.strip()
    for col in df.select_dtypes(include=['object']).columns:
        df[col] = df[col].str.strip()

    # Education mapping
    edu_map = {'Graduate': 1, 'Not Graduate': 0}
    emp_map = {'Yes': 1, 'No': 0}

    # 3. Clean existing system data (user_id IS NULL)
    cursor.execute("DELETE FROM predictions WHERE user_id IS NULL")

    # 4. Predict and Seed a high-quality sample (250 rows for good distribution)
    sample_df = df.sample(n=min(250, len(df)), random_state=42)
    
    count = 0
    for idx, row in sample_df.iterrows():
        # Preprocess features Exactly like the train.py script
        features = [
            row['no_of_dependents'],
            edu_map.get(row['education'], 0),
            emp_map.get(row['self_employed'], 0),
            row['income_annum'],
            row['loan_amount'],
            row['loan_term'],
            row['cibil_score'],
            row['residential_assets_value'],
            row['commercial_assets_value'],
            row['luxury_assets_value'],
            row['bank_asset_value']
        ]
        
        # Get AI Prediction & Probability
        pred = model.predict([features])[0]
        prob = int(model.predict_proba([features])[0][1] * 100)
        
        # Adjust data slightly if required for realism
        age = random.randint(22, 60)
        
        cursor.execute("""
            INSERT INTO predictions (
                user_id, age, dependents, education, self_employed, annual_income,
                loan_amount, loan_term, cibil_score, residential_assets,
                commercial_assets, luxury_assets, bank_assets, approved, probability
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            None, age, row['no_of_dependents'], row['education'], row['self_employed'],
            row['income_annum'], row['loan_amount'], row['loan_term'], row['cibil_score'],
            row['residential_assets_value'], row['commercial_assets_value'],
            row['luxury_assets_value'], row['bank_asset_value'],
            int(pred), prob
        ))
        count += 1
    
    # 5. Add "Deep Insight" Synthetic Data (50 extra rows to show clear AI decisions)
    # This ensures the charts show clear trends for high/low CIBIL tiers
    print("🔬 Generating Synthetic Logic Markers...")
    for _ in range(50):
        is_high_value = random.random() > 0.5
        
        if is_high_value:
            # The "Prime" Customer
            row = {
                'dependents': random.randint(0, 2),
                'education': 'Graduate',
                'self_employed': 'No',
                'income_annum': random.randint(8000000, 10000000),
                'loan_amount': random.randint(1000000, 3000000),
                'loan_term': random.randint(12, 60),
                'cibil_score': random.randint(800, 900),
                'res_ass': random.randint(5000000, 10000000),
                'com_ass': random.randint(1000000, 5000000),
                'lux_ass': random.randint(1000000, 3000000),
                'bnk_ass': random.randint(2000000, 5000000)
            }
        else:
            # The "Subprime" Customer
            row = {
                'dependents': random.randint(3, 5),
                'education': 'Not Graduate',
                'self_employed': 'Yes',
                'income_annum': random.randint(100000, 500000),
                'loan_amount': random.randint(2000000, 5000000), # Asking for too much
                'loan_term': random.randint(120, 360),
                'cibil_score': random.randint(300, 500),
                'res_ass': random.randint(0, 100000),
                'com_ass': 0,
                'lux_ass': 0,
                'bnk_ass': random.randint(0, 100000)
            }

        features = [
            row['dependents'], 1 if row['education'] == 'Graduate' else 0,
            1 if row['self_employed'] == 'Yes' else 0, row['income_annum'],
            row['loan_amount'], row['loan_term'], row['cibil_score'],
            row['res_ass'], row['com_ass'], row['lux_ass'], row['bnk_ass']
        ]
        
        pred = model.predict([features])[0]
        prob = int(model.predict_proba([features])[0][1] * 100)
        
        cursor.execute("""
            INSERT INTO predictions (
                user_id, age, dependents, education, self_employed, annual_income,
                loan_amount, loan_term, cibil_score, residential_assets,
                commercial_assets, luxury_assets, bank_assets, approved, probability
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            None, random.randint(22, 60), row['dependents'], row['education'], row['self_employed'],
            row['income_annum'], row['loan_amount'], row['loan_term'], row['cibil_score'],
            row['res_ass'], row['com_ass'], row['lux_ass'], row['bnk_ass'],
            int(pred), prob
        ))
        count += 1
    
    conn.commit()
    conn.close()
    print(f"✅ Successfully seeded {count} rows with 100% AI Consistency.")

if __name__ == "__main__":
    seed_accurate_data()
