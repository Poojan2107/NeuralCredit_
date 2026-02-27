import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const db = new Database('backend/database.db');

// Ensure table exists just in case server hasn't been reloaded yet
db.exec(`
  CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    age INTEGER,
    dependents INTEGER,
    education TEXT,
    self_employed TEXT,
    annual_income INTEGER,
    loan_amount INTEGER,
    loan_term INTEGER,
    cibil_score INTEGER,
    residential_assets INTEGER,
    commercial_assets INTEGER,
    luxury_assets INTEGER,
    bank_assets INTEGER,
    approved BOOLEAN,
    probability REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  )
`);

try {
  db.exec(`ALTER TABLE predictions ADD COLUMN age INTEGER DEFAULT 25`);
} catch (e) {
  // Ignore, likely already exists
}

// Clear old historical data (optional, but prevents duplicates if run twice)
// For safety, only clear records without a user_id (which are the dummy ones)
db.exec('DELETE FROM predictions WHERE user_id IS NULL');

console.log('Reading CSV file...');
const csvData = fs.readFileSync('backend/model/loan_approval_dataset.csv', 'utf-8');
const lines = csvData.split('\n');

const stmt = db.prepare(`
  INSERT INTO predictions (
    user_id, age, dependents, education, self_employed, annual_income,
    loan_amount, loan_term, cibil_score, residential_assets,
    commercial_assets, luxury_assets, bank_assets, approved, probability
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let insertedRows = 0;

// Wrap in a transaction for speed
const insertMany = db.transaction(() => {
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',').map((v) => v.trim());

    // CSV Format matching exactly:
    // 0: dependents
    // 1: education
    // 2: self_employed
    // 3: annual_income
    // 4: loan_amount
    // 5: loan_term
    // 6: cibil_score
    // 7: residential_assets
    // 8: commercial_assets
    // 9: luxury_assets
    // 10: bank_assets
    // 11: loan_status

    const dependents = parseInt(values[0]) || 0;
    const education = values[1];
    const self_employed = values[2];
    const annual_income = parseInt(values[3]) || 0;
    const loan_amount = parseInt(values[4]) || 0;
    const loan_term = parseInt(values[5]) || 0;
    const cibil_score = parseInt(values[6]) || 0;
    const residential_assets = parseInt(values[7]) || 0;
    const commercial_assets = parseInt(values[8]) || 0;
    const luxury_assets = parseInt(values[9]) || 0;
    const bank_assets = parseInt(values[10]) || 0;

    const approved = values[11] === 'Approved' ? 1 : 0;
    // We mock a probability for the historical data since we only have raw accepted/rejected values
    const probability = approved ? 95 : 5;

    // The CSV doesn't have age, so we mock a realistic age between 21 and 65
    const age = Math.floor(Math.random() * (65 - 21 + 1)) + 21;

    stmt.run(
      null, // user_id is NULL for historical data 
      age,
      dependents,
      education,
      self_employed,
      annual_income,
      loan_amount,
      loan_term,
      cibil_score,
      residential_assets,
      commercial_assets,
      luxury_assets,
      bank_assets,
      approved,
      probability
    );
    insertedRows++;
  }
});

insertMany();

console.log(`Successfully seeded ${insertedRows} historical records into the 'predictions' table!`);
