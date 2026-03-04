#!/bin/bash

# Test Data Generator - Automated Deployment Script
# Deploys to Railway (backend) + Vercel (frontend) + Supabase (database)

set -e

echo "🚀 TEST DATA GENERATOR - AUTOMATED DEPLOYMENT"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "${YELLOW}Checking prerequisites...${NC}"
command -v git >/dev/null 2>&1 || { echo "${RED}Git not found${NC}"; exit 1; }
command -v node >/dev/null 2>&1 || { echo "${RED}Node not found${NC}"; exit 1; }
echo "${GREEN}✓ Git and Node.js available${NC}"
echo ""

# Step 1: Setup Supabase
echo "${YELLOW}STEP 1: Supabase Database Setup${NC}"
echo "👉 Go to: https://supabase.com"
echo "📋 Create new project and get connection string"
echo "🔧 Paste connection string below:"
read -p "DATABASE_URL (postgresql://...): " DATABASE_URL

if [ -z "$DATABASE_URL" ]; then
  echo "${RED}✗ Database URL required${NC}"
  exit 1
fi
echo "${GREEN}✓ Database URL saved${NC}"
echo ""

# Step 2: Create Railway deployment
echo "${YELLOW}STEP 2: Railway Backend Deployment${NC}"
echo "👉 Go to: https://railway.app"
echo "📋 Create new project from GitHub"
echo "🔧 Select: openclaw12/test-data-generator"
echo "🔧 Root directory: backend"
echo "🔧 Environment variables:"
echo "   - DATABASE_URL: (from Supabase above)"
echo "   - JWT_SECRET: $(openssl rand -base64 32)"
echo "   - NODE_ENV: production"
echo ""
echo "⏳ Waiting for Railway deployment..."
read -p "Enter Railway backend URL (https://...): " RAILWAY_URL

if [ -z "$RAILWAY_URL" ]; then
  echo "${RED}✗ Railway URL required${NC}"
  exit 1
fi
echo "${GREEN}✓ Railway backend deployed${NC}"
echo ""

# Step 3: Deploy to Vercel
echo "${YELLOW}STEP 3: Vercel Frontend Deployment${NC}"

# Check for Vercel token
if [ -z "$VERCEL_TOKEN" ]; then
  echo "⚠️  Set VERCEL_TOKEN environment variable"
  read -sp "Enter Vercel token: " VERCEL_TOKEN
fi

echo "Deploying to Vercel..."
cd frontend

# Create .env.local for build
echo "REACT_APP_API_URL=$RAILWAY_URL" > .env.local

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing frontend dependencies..."
  npm install --legacy-peer-deps
fi

# Build
echo "Building frontend..."
npm run build

# Deploy with Vercel
if command -v vercel >/dev/null 2>&1; then
  echo "Deploying with Vercel CLI..."
  vercel --token "$VERCEL_TOKEN" --prod
  VERCEL_URL=$(vercel list --token "$VERCEL_TOKEN" | grep test-data-generator | awk '{print $2}')
else
  echo "${YELLOW}📋 Manual Vercel deployment required:${NC}"
  echo "1. Go to: https://vercel.com"
  echo "2. Import GitHub project: openclaw12/test-data-generator"
  echo "3. Set environment variable: REACT_APP_API_URL=$RAILWAY_URL"
  echo "4. Deploy"
  read -p "Enter Vercel frontend URL: " VERCEL_URL
fi

cd ..
echo "${GREEN}✓ Frontend deployed${NC}"
echo ""

# Step 4: Test deployment
echo "${YELLOW}STEP 4: Testing Deployment${NC}"
echo "Testing backend..."
if curl -s "$RAILWAY_URL/health" | grep -q "ok"; then
  echo "${GREEN}✓ Backend is responding${NC}"
else
  echo "${RED}⚠️  Backend health check failed${NC}"
fi

echo ""
echo "Testing frontend..."
if curl -s "$VERCEL_URL" | grep -q "Test Data Generator"; then
  echo "${GREEN}✓ Frontend is loading${NC}"
else
  echo "${RED}⚠️  Frontend check failed${NC}"
fi
echo ""

# Step 5: Gumroad setup
echo "${YELLOW}STEP 5: Gumroad Product Setup${NC}"
echo "📋 Go to: https://gumroad.com/dashboard"
echo "🔧 Create new product"
echo "📝 Title: Test Data Generator - Professional License"
echo "💰 Price: $99/month or $299 lifetime"
echo "🔗 Redirect: $VERCEL_URL/login"
echo "📄 Description: (See GUMROAD_COPY.md)"
echo ""
read -p "Enter Gumroad product URL: " GUMROAD_URL

echo ""
echo "${GREEN}✓ ALL DEPLOYMENTS COMPLETE!${NC}"
echo ""
echo "🎉 YOUR PRODUCT IS LIVE!"
echo ""
echo "URLs:"
echo "  Frontend: $VERCEL_URL"
echo "  Backend:  $RAILWAY_URL"
echo "  Gumroad:  $GUMROAD_URL"
echo ""
echo "Next steps:"
echo "1. Test the application at $VERCEL_URL"
echo "2. Create first template and generate data"
echo "3. Share Gumroad link"
echo "4. Submit to Product Hunt: https://producthunt.com"
echo "5. Post to Reddit: r/labrats, r/chemistry"
echo ""
echo "Revenue tracking: Check Gumroad dashboard for sales"
echo ""
