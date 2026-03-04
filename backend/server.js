// Test Data Generator - Backend API
// Production-ready Node.js/Express server

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/test_data_generator'
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// ===== AUTHENTICATION =====

// Register user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Check if user exists
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name]
    );
    
    const token = jwt.sign({ id: result.rows[0].id, email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      user: result.rows[0],
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login user
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    
    res.json({ 
      user: { id: user.id, email: user.email, name: user.name },
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// ===== TEMPLATES =====

// Get all templates for user
app.get('/api/templates', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM templates WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single template
app.get('/api/templates/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM templates WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create template
app.post('/api/templates', authenticateToken, async (req, res) => {
  try {
    const { name, description, fields } = req.body;
    
    const result = await pool.query(
      'INSERT INTO templates (user_id, name, description, fields) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.user.id, name, description, JSON.stringify(fields)]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update template
app.put('/api/templates/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, fields } = req.body;
    
    const result = await pool.query(
      'UPDATE templates SET name = $1, description = $2, fields = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [name, description, JSON.stringify(fields), req.params.id, req.user.id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete template
app.delete('/api/templates/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM templates WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DATA GENERATION =====

// Generate test data
app.post('/api/generate', authenticateToken, async (req, res) => {
  try {
    const { templateId, count = 100, format = 'json' } = req.body;
    
    // Get template
    const templateResult = await pool.query(
      'SELECT * FROM templates WHERE id = $1 AND user_id = $2',
      [templateId, req.user.id]
    );
    
    if (templateResult.rows.length === 0) {
      return res.status(404).json({ error: 'Template not found' });
    }
    
    const template = templateResult.rows[0];
    const fields = JSON.parse(template.fields);
    
    // Generate data
    const data = generateTestData(fields, count);
    
    // Save generation record
    await pool.query(
      'INSERT INTO generations (template_id, user_id, record_count, format) VALUES ($1, $2, $3, $4)',
      [templateId, req.user.id, count, format]
    );
    
    // Format output
    let output;
    if (format === 'csv') {
      output = convertToCSV(data, fields);
    } else if (format === 'excel') {
      output = data; // Client will handle Excel export
    } else {
      output = data; // JSON
    }
    
    res.json({ 
      data,
      count: data.length,
      format
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ===== DATA GENERATION LOGIC =====

function generateTestData(fields, count) {
  const data = [];
  
  for (let i = 0; i < count; i++) {
    const row = {};
    
    fields.forEach(field => {
      row[field.name] = generateValue(field);
    });
    
    data.push(row);
  }
  
  return data;
}

function generateValue(field) {
  const { type, min, max, distribution = 'uniform', unit } = field;
  
  switch (type) {
    case 'number':
      return generateNumber(min, max, distribution);
    
    case 'string':
      return generateString(field.pattern || 'random');
    
    case 'date':
      return generateDate(min, max);
    
    case 'boolean':
      return Math.random() > 0.5;
    
    case 'enum':
      return field.options[Math.floor(Math.random() * field.options.length)];
    
    case 'correlated':
      return generateCorrelated(field);
    
    default:
      return null;
  }
}

function generateNumber(min, max, distribution) {
  min = min || 0;
  max = max || 100;
  
  if (distribution === 'normal') {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const mean = (min + max) / 2;
    const stdDev = (max - min) / 6;
    return Math.max(min, Math.min(max, mean + z * stdDev));
  } else if (distribution === 'weighted') {
    // Weighted towards mean
    const r = Math.random() + Math.random();
    return min + (r / 2) * (max - min);
  } else {
    // Uniform distribution
    return min + Math.random() * (max - min);
  }
}

function generateString(pattern) {
  if (pattern === 'uuid') {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 10; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function generateDate(min, max) {
  const minDate = new Date(min || '2020-01-01');
  const maxDate = new Date(max || new Date());
  const time = minDate.getTime() + Math.random() * (maxDate.getTime() - minDate.getTime());
  return new Date(time).toISOString().split('T')[0];
}

function generateCorrelated(field) {
  // For correlated fields, generate based on parent field
  // This is simplified - in production, would track parent values
  return generateNumber(field.min, field.max);
}

function convertToCSV(data, fields) {
  const headers = fields.map(f => f.name).join(',');
  const rows = data.map(row => 
    fields.map(f => {
      const val = row[f.name];
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`;
      }
      return val;
    }).join(',')
  );
  
  return [headers, ...rows].join('\n');
}

// ===== HEALTH CHECK =====

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Test Data Generator API running on port ${PORT}`);
});

module.exports = app;
