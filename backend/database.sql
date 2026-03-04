-- Test Data Generator Database Schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Templates table (user-created test data templates)
CREATE TABLE IF NOT EXISTS templates (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  fields JSONB NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id)
);

-- Pre-built templates (system templates)
CREATE TABLE IF NOT EXISTS builtin_templates (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  fields JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Data generation history
CREATE TABLE IF NOT EXISTS generations (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  record_count INTEGER NOT NULL,
  format VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_template_id (template_id),
  INDEX idx_user_id (user_id)
);

-- Team workspaces
CREATE TABLE IF NOT EXISTS workspaces (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  workspace_id INTEGER NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(workspace_id, user_id)
);

-- Shared templates
CREATE TABLE IF NOT EXISTS template_shares (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  shared_with_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(50) DEFAULT 'view',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(template_id, shared_with_user_id)
);

-- Insert pre-built templates
INSERT INTO builtin_templates (name, description, category, fields) VALUES
(
  'Material Tensile Testing',
  'Standard template for material tensile test data',
  'Materials Testing',
  '[
    {"name": "test_id", "type": "string", "pattern": "uuid"},
    {"name": "material", "type": "enum", "options": ["Aluminum", "Steel", "Copper", "Titanium"]},
    {"name": "temperature", "type": "number", "min": -40, "max": 100, "unit": "celsius"},
    {"name": "applied_force", "type": "number", "min": 0, "max": 10000, "unit": "newton"},
    {"name": "elongation", "type": "number", "min": 0, "max": 50, "distribution": "normal", "unit": "percent"},
    {"name": "test_date", "type": "date"},
    {"name": "operator", "type": "string"}
  ]'
),
(
  'Chemical Purity Testing',
  'Template for chemical purity and composition testing',
  'Chemistry',
  '[
    {"name": "sample_id", "type": "string", "pattern": "uuid"},
    {"name": "chemical_name", "type": "enum", "options": ["Acetone", "Methanol", "Ethanol", "Benzene"]},
    {"name": "purity_percent", "type": "number", "min": 90, "max": 99.9, "distribution": "normal"},
    {"name": "moisture_content", "type": "number", "min": 0, "max": 5, "distribution": "weighted"},
    {"name": "color", "type": "enum", "options": ["Clear", "Slightly Yellow", "Yellow"]},
    {"name": "test_date", "type": "date"},
    {"name": "batch_number", "type": "string"}
  ]'
),
(
  'Pharmaceutical Dissolution',
  'Data template for pharmaceutical dissolution testing',
  'Pharmaceutical',
  '[
    {"name": "tablet_id", "type": "string", "pattern": "uuid"},
    {"name": "drug_name", "type": "enum", "options": ["Ibuprofen", "Aspirin", "Acetaminophen", "Naproxen"]},
    {"name": "time_minutes", "type": "number", "min": 0, "max": 60},
    {"name": "dissolved_percent", "type": "number", "min": 0, "max": 100, "distribution": "weighted"},
    {"name": "temperature_celsius", "type": "number", "min": 35, "max": 37, "distribution": "normal"},
    {"name": "ph_value", "type": "number", "min": 1, "max": 14, "distribution": "normal"},
    {"name": "test_date", "type": "date"}
  ]'
),
(
  'Environmental Water Sampling',
  'Template for environmental water quality testing data',
  'Environmental',
  '[
    {"name": "sample_id", "type": "string", "pattern": "uuid"},
    {"name": "location", "type": "enum", "options": ["River A", "River B", "Lake X", "Groundwater Well"]},
    {"name": "ph", "type": "number", "min": 5, "max": 9, "distribution": "normal"},
    {"name": "dissolved_oxygen_mg_l", "type": "number", "min": 0, "max": 14, "distribution": "weighted"},
    {"name": "turbidity_ntu", "type": "number", "min": 0, "max": 100, "distribution": "weighted"},
    {"name": "temperature_celsius", "type": "number", "min": 0, "max": 30},
    {"name": "sample_date", "type": "date"}
  ]'
),
(
  'Calibration Dataset',
  'Generic calibration data for measurement instruments',
  'Calibration',
  '[
    {"name": "instrument_id", "type": "string"},
    {"name": "reading_value", "type": "number", "min": 0, "max": 1000},
    {"name": "reference_value", "type": "number", "min": 0, "max": 1000},
    {"name": "error_percent", "type": "number", "min": -5, "max": 5, "distribution": "normal"},
    {"name": "temperature_celsius", "type": "number", "min": 20, "max": 25, "distribution": "normal"},
    {"name": "calibration_date", "type": "date"}
  ]'
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_templates_user_id ON templates(user_id);
CREATE INDEX IF NOT EXISTS idx_generations_user_id ON generations(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_workspace_id ON team_members(workspace_id);
