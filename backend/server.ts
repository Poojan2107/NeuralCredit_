import express from 'express';
import session from 'express-session';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';
import { z } from 'zod';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
const PORT = 3000;

// Database Setup
const db = new Database('backend/database.db');
db.pragma('journal_mode = WAL');

// Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL
  )
`);

try {
  db.exec(`ALTER TABLE predictions ADD COLUMN age INTEGER DEFAULT 25`);
} catch (e) {
  // Column likely already exists, ignore error
}

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

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'loan-prediction-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  })
);

// Types for Session
declare module 'express-session' {
  interface SessionData {
    userId: number;
    username: string;
  }
}

// --- Simple In-Memory Rate Limiter ---

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, maxAttempts: number = 10, windowMs: number = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up expired entries every 30 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 30 * 60 * 1000);

// --- Validation Schemas ---

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username is too long'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128, 'Password is too long'),
});

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const predictSchema = z.object({
  age: z.number().min(18, 'Applicant must be at least 18 years old').max(65, 'Applicant age exceeds average loan criteria (max 65)'),
  dependents: z.number().min(0, 'Dependents cannot be negative').max(10, 'Max 10 dependents'),
  education: z.enum(['Graduate', 'Not Graduate']),
  selfEmployed: z.enum(['Yes', 'No']),
  annualIncome: z.number().min(1, 'Annual income must be positive'),
  loanAmount: z.number().min(1, 'Loan amount must be positive'),
  loanTerm: z.number().min(1, 'Loan term must be at least 1 month').max(360, 'Max 360 months'),
  cibilScore: z.number().min(300, 'Min CIBIL score is 300').max(900, 'Max CIBIL score is 900'),
  residentialAssets: z.number().min(0, 'Value cannot be negative'),
  commercialAssets: z.number().min(0, 'Value cannot be negative'),
  luxuryAssets: z.number().min(0, 'Value cannot be negative'),
  bankAssets: z.number().min(0, 'Value cannot be negative'),
});

// --- Auth Routes ---

app.post('/api/register', async (req, res) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many registration attempts. Please try again later.' });
  }

  try {
    const validation = registerSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }

    const { username, password } = validation.data;
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
      const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
      const info = stmt.run(username, hashedPassword);

      req.session.userId = Number(info.lastInsertRowid);
      req.session.username = username;

      res.json({ success: true, message: 'Registration successful' });
    } catch (err: any) {
      if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(400).json({ error: 'Username already exists' });
      }
      throw err;
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(`login:${ip}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: 'Too many login attempts. Please try again later.' });
  }

  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.issues[0].message });
    }

    const { username, password } = validation.data;
    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username) as any;

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    req.session.userId = user.id;
    req.session.username = user.username;

    res.json({ success: true, message: 'Login successful', user: { username: user.username } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ success: true, message: 'Logged out successfully' });
  });
});

app.get('/api/me', (req, res) => {
  if (req.session.userId) {
    res.json({ loggedIn: true, username: req.session.username });
  } else {
    res.json({ loggedIn: false });
  }
});

// --- System Health API ---
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Prediction Route ---

app.post('/api/predict', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  const ip = req.ip || 'unknown';
  if (!checkRateLimit(`predict:${ip}`, 30, 60 * 1000)) {
    return res.status(429).json({ error: 'Too many prediction requests. Please slow down.' });
  }

  const validation = predictSchema.safeParse(req.body);
  if (!validation.success) {
    return res.status(400).json({
      error: 'Invalid input data: ' + validation.error.issues.map(i => i.message).join(', '),
    });
  }

  const pythonCmd = process.env.PYTHON || (process.platform === 'win32' ? 'py' : 'python3');
  const pythonScript = path.join(__dirname, 'model', 'predict.py');
  const pythonProcess = spawn(pythonCmd, [pythonScript], { cwd: path.join(__dirname, 'model') });

  // CRITICAL: We must write the request body to the Python process stdin
  pythonProcess.stdin.write(JSON.stringify(req.body));
  pythonProcess.stdin.end();

  pythonProcess.on('error', (err) => {
    console.error('Failed to start Python process:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to start prediction engine. Please verify Python is installed.' });
    }
  });

  let dataString = '';
  let errorString = '';

  pythonProcess.stdout.on('data', (data) => {
    dataString += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorString += data.toString();
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on('close', (code) => {
    if (code !== 0) {
      console.error('Python process exited with code:', code);
      return res.status(500).json({
        error: 'Prediction process failed',
        details: errorString || 'Unknown error occurred in Python script',
      });
    }

    try {
      const result = JSON.parse(dataString);
      if (result.error) {
        return res.status(400).json({ error: result.error });
      }

      // -----------------------------------------------------
      // STEP 2 & 3: Save Prediction into SQLite Database
      // -----------------------------------------------------
      try {
        const stmt = db.prepare(`
          INSERT INTO predictions (
            user_id, age, dependents, education, self_employed, annual_income,
            loan_amount, loan_term, cibil_score, residential_assets,
            commercial_assets, luxury_assets, bank_assets, approved, probability
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        stmt.run(
          req.session.userId, // user_id (who asked)
          validation.data.age,
          validation.data.dependents,
          validation.data.education,
          validation.data.selfEmployed,
          validation.data.annualIncome,
          validation.data.loanAmount,
          validation.data.loanTerm,
          validation.data.cibilScore,
          validation.data.residentialAssets,
          validation.data.commercialAssets,
          validation.data.luxuryAssets,
          validation.data.bankAssets,
          result.approved ? 1 : 0, // Store as boolean int
          result.probability
        );
      } catch (dbError) {
        console.error('Failed to log prediction to database:', dbError);
        // We still return the prediction to the user even if DB log fails
      }

      res.json(result);
    } catch (e) {
      console.error('Failed to parse python output:', dataString);
      res.status(500).json({ error: 'Failed to parse prediction results' });
    }
  });

  pythonProcess.stdin.write(JSON.stringify(validation.data));
  pythonProcess.stdin.end();
});

// --- History API ---
app.get('/api/predictions/history', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  try {
    // Fetch the 50 most recent predictions.
    // We include BOTH the user's personal predictions (user_id = ?) 
    // AND the historical mock dataset we seeded (user_id IS NULL) so there is always data to show.
    const stmt = db.prepare(`
      SELECT 
        id, loan_amount, annual_income, cibil_score, approved, probability, created_at,
        CASE WHEN user_id IS NULL THEN 'Historical Data' ELSE 'You' END as source
      FROM predictions 
      WHERE user_id = ? OR user_id IS NULL
      ORDER BY id DESC 
      LIMIT 100
    `);
    const history = stmt.all(req.session.userId);
    res.json(history);
  } catch (error) {
    console.error('Failed to fetch history:', error);
    res.status(500).json({ error: 'Failed to retrieve prediction history' });
  }
});

// --- Analytics Data API ---
app.get('/api/analytics', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Unauthorized. Please log in.' });
  }

  try {
    // Basic overall stats
    const totalApplications = db.prepare('SELECT COUNT(*) as count FROM predictions').get() as any;
    const approvedApplications = db.prepare('SELECT COUNT(*) as count FROM predictions WHERE approved = 1').get() as any;
    const approvalRate = (approvedApplications.count / totalApplications.count) * 100;

    // Approvals by CIBIL bucket
    const cibilStats = db.prepare(`
      SELECT 
        CASE 
          WHEN cibil_score >= 800 THEN '800+'
          WHEN cibil_score >= 700 THEN '700-799'
          WHEN cibil_score >= 600 THEN '600-699'
          ELSE '<600'
        END as tier,
        COUNT(*) as total,
        SUM(CASE WHEN approved = 1 THEN 1 ELSE 0 END) as approved
      FROM predictions
      GROUP BY tier
      ORDER BY tier DESC
    `).all();

    // Average loan size by Employment Type
    const employmentStats = db.prepare(`
      SELECT 
        self_employed as type,
        AVG(loan_amount) as avg_loan
      FROM predictions
      GROUP BY self_employed
    `).all();

    // Map DB formatting for frontend consumption
    const cibilData = cibilStats.map((row: any) => ({
      name: row.tier,
      Approved: row.approved,
      Rejected: row.total - row.approved
    }));

    const employmentData = employmentStats.map((row: any) => ({
      name: row.type === 'Yes' ? 'Self Employed' : 'Salaried',
      value: row.avg_loan
    }));

    res.json({
      overview: {
        total: totalApplications.count,
        approvalRate: approvalRate.toFixed(1)
      },
      cibilChartData: cibilData,
      employmentPieData: employmentData
    });

  } catch (error) {
    console.error('Analytics aggregation failed:', error);
    res.status(500).json({ error: 'Failed to aggregate analytics data' });
  }
});

// --- Vite Integration ---

if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, '../dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
