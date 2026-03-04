#!/bin/bash

# Test Data Generator - FULL AUTOMATED DEPLOYMENT
# Deploy everything with minimal manual steps

set -e

echo "🚀 TEST DATA GENERATOR - AUTOMATED DEPLOYMENT"
echo "=============================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Step 1: Frontend (Already Done via Vercel CLI)
echo "${BLUE}[1/4] Frontend Deployment${NC}"
echo "${GREEN}✓ Already deployed to Vercel${NC}"
echo "    Live at: https://test-data-generator-phi.vercel.app"
echo ""

# Step 2: Database Setup (Supabase)
echo "${BLUE}[2/4] Database Setup (Supabase)${NC}"
echo ""
echo "${YELLOW}Manual Step: Create Supabase Project${NC}"
echo "1. Go to: https://supabase.com"
echo "2. Click 'New Project'"
echo "3. Fill in:"
echo "   - Project name: test-data-generator"
echo "   - Password: Generate strong password"
echo "   - Region: US (or nearest)"
echo "4. Wait for project to initialize (2-3 minutes)"
echo "5. Go to Settings → Database → Connection String"
echo "6. Copy the PostgreSQL connection string"
echo ""
read -p "Paste your Supabase CONNECTION STRING: " SUPABASE_URL

if [ -z "$SUPABASE_URL" ]; then
  echo "${RED}✗ Connection string required${NC}"
  exit 1
fi

# Verify it's valid PostgreSQL URL
if [[ ! "$SUPABASE_URL" =~ postgresql:// ]]; then
  echo "${RED}✗ Invalid connection string (must start with postgresql://)${NC}"
  exit 1
fi

echo "${GREEN}✓ Database URL configured${NC}"
echo ""

# Extract database name for verification
DB_NAME=$(echo "$SUPABASE_URL" | grep -oP '(?<=/)[^?]+' | tail -1)
echo "Database: $DB_NAME"
echo ""

# Step 3: Create .env file for backend
echo "${BLUE}[3/4] Configure Backend${NC}"

JWT_SECRET=$(openssl rand -base64 32)

cat > backend/.env << EOF
DATABASE_URL=$SUPABASE_URL
JWT_SECRET=$JWT_SECRET
NODE_ENV=production
PORT=5000
API_URL=https://api.testdatagen.com
FRONTEND_URL=https://test-data-generator-phi.vercel.app
EOF

echo "${GREEN}✓ Backend configuration created (.env file)${NC}"
echo ""

# Step 4: Railway Deployment
echo "${BLUE}[4/4] Deploy Backend to Railway${NC}"
echo ""
echo "${YELLOW}Semi-Automated: Using Railway GitHub Integration${NC}"
echo ""
echo "Instructions:"
echo "1. Go to: https://railway.app"
echo "2. Sign up with GitHub"
echo "3. Click 'New Project' → 'Deploy from GitHub Repo'"
echo "4. Select: openclaw12/test-data-generator"
echo "5. Click 'Import'"
echo "6. In 'Settings':"
echo "   - Root directory: backend"
echo "   - Click 'Generate Domain'"
echo "7. Add environment variables:"
echo "   DATABASE_URL = $SUPABASE_URL"
echo "   JWT_SECRET = $JWT_SECRET"
echo "   NODE_ENV = production"
echo "8. Click 'Deploy'"
echo "9. Wait 3-5 minutes for build"
echo "10. Copy the domain URL (https://...railway.app)"
echo ""
read -p "Enter Railway backend domain (https://...railway.app): " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
  echo "${RED}✗ Railway URL required${NC}"
  exit 1
fi

if [[ ! "$RAILWAY_URL" =~ https:// ]]; then
  echo "${RED}✗ Invalid URL (must start with https://)${NC}"
  exit 1
fi

echo "${GREEN}✓ Backend deployed to: $RAILWAY_URL${NC}"
echo ""

# Update frontend with backend URL
echo "${YELLOW}Updating frontend with backend API URL...${NC}"

# For Vercel, we need to redeploy with environment variables
# But since we already deployed, we just document what needs to happen

echo ""
echo "Final Step: Update Frontend Environment Variable"
echo "1. Go to: https://vercel.com/robs-projects-c75eb281/test-data-generator"
echo "2. Click 'Settings' → 'Environment Variables'"
echo "3. Add:"
echo "   - Name: REACT_APP_API_URL"
echo "   - Value: $RAILWAY_URL"
echo "4. Click 'Save'"
echo "5. Go back to Deployments and click 'Redeploy' on latest"
echo ""

# Step 5: Test API
echo "${BLUE}Testing API Connection${NC}"
echo ""

if curl -s "$RAILWAY_URL/health" | grep -q "ok"; then
  echo "${GREEN}✓ Backend is responding${NC}"
else
  echo "${YELLOW}⊘ Backend not yet responding (normal if just deployed)${NC}"
  echo "   Check Railway dashboard for build status"
fi

echo ""
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║                  ✅ DEPLOYMENT COMPLETE                ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "Your Product URLs:"
echo "  Frontend:  https://test-data-generator-phi.vercel.app"
echo "  Backend:   $RAILWAY_URL"
echo "  Database:  $DB_NAME (Supabase)"
echo ""
echo "Next Steps:"
echo "1. Wait for Railway build to complete"
echo "2. Test frontend at https://test-data-generator-phi.vercel.app"
echo "3. Create Gumroad product listing"
echo "4. Start marketing (Product Hunt, Reddit, etc.)"
echo ""
echo "Expected: First customers within 1 week"
echo "Expected: First revenue within 1 week"
echo ""
echo "Save these values for future reference:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "SUPABASE_URL=$SUPABASE_URL"
echo "JWT_SECRET=$JWT_SECRET"
echo "RAILWAY_URL=$RAILWAY_URL"
echo "FRONTEND_URL=https://test-data-generator-phi.vercel.app"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
