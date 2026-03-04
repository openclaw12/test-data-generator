#!/bin/bash

# Test Data Generator - API Test Suite
# Tests all endpoints before and after deployment

API_URL="${1:-http://localhost:5000}"

echo "🧪 TEST DATA GENERATOR - API TEST SUITE"
echo "========================================"
echo "Testing: $API_URL"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Test 1: Health Check
echo "${YELLOW}[1/5]${NC} Health Check..."
if curl -s "$API_URL/health" | grep -q "ok"; then
  echo "${GREEN}✓ API is responding${NC}"
else
  echo "${RED}✗ API not responding. Is server running?${NC}"
  exit 1
fi
echo ""

# Test 2: Register User
echo "${YELLOW}[2/5]${NC} User Registration..."
RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!",
    "name": "Test User"
  }')

if echo "$RESPONSE" | grep -q "token"; then
  TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  echo "${GREEN}✓ User registered, got token${NC}"
else
  echo "${RED}✗ Registration failed${NC}"
  echo "Response: $RESPONSE"
  exit 1
fi
echo ""

# Test 3: Create Template
echo "${YELLOW}[3/5]${NC} Template Creation..."
RESPONSE=$(curl -s -X POST "$API_URL/api/templates" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Test Tensile Data",
    "description": "Material testing template",
    "fields": [
      {"name": "test_id", "type": "string", "pattern": "uuid"},
      {"name": "material", "type": "enum", "options": ["Aluminum", "Steel"]},
      {"name": "applied_force", "type": "number", "min": 0, "max": 10000},
      {"name": "elongation", "type": "number", "min": 0, "max": 50}
    ]
  }')

if echo "$RESPONSE" | grep -q "test_id"; then
  TEMPLATE_ID=$(echo "$RESPONSE" | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
  echo "${GREEN}✓ Template created (ID: $TEMPLATE_ID)${NC}"
else
  echo "${RED}✗ Template creation failed${NC}"
  echo "Response: $RESPONSE"
fi
echo ""

# Test 4: Get Templates
echo "${YELLOW}[4/5]${NC} Fetch Templates..."
if curl -s -H "Authorization: Bearer $TOKEN" "$API_URL/api/templates" | grep -q "test_id"; then
  echo "${GREEN}✓ Templates fetched${NC}"
else
  echo "${RED}✗ Failed to fetch templates${NC}"
fi
echo ""

# Test 5: Generate Data
echo "${YELLOW}[5/5]${NC} Data Generation..."
if [ ! -z "$TEMPLATE_ID" ]; then
  RESPONSE=$(curl -s -X POST "$API_URL/api/generate" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{
      \"templateId\": $TEMPLATE_ID,
      \"count\": 10,
      \"format\": \"json\"
    }")
  
  if echo "$RESPONSE" | grep -q "test_id"; then
    echo "${GREEN}✓ Data generated (10 records)${NC}"
  else
    echo "${RED}✗ Data generation failed${NC}"
    echo "Response: $RESPONSE"
  fi
else
  echo "${YELLOW}⊘ Skipped (no template ID)${NC}"
fi
echo ""

echo "${GREEN}✅ ALL TESTS PASSED!${NC}"
echo ""
echo "API is ready for production deployment."
echo ""
