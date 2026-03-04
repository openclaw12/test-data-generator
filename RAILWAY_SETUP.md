# Railway Backend Deployment - Simple Setup

**You have:**
- Supabase Project ID: xzchoqhcheupsnnjjhvx
- Railway API Key: 9481b86c-b17a-4f15-9328-994cfa79b7f3

---

## Step 1: Go to Railway Dashboard

https://railway.app/dashboard

---

## Step 2: Create a New Project

1. Click **"New Project"**
2. Click **"Deploy from GitHub Repo"**
3. Search: **openclaw12/test-data-generator**
4. Click it to select
5. Click **"Deploy Now"**

---

## Step 3: Configure the Deployment

Once it starts deploying:

1. In the left sidebar, find your project
2. Click on the **"backend"** service (you'll see it listed)
3. Click the **"Variables"** tab (or **"Environment"** tab)
4. Click **"Add Variable"**

---

## Step 4: Add Environment Variables

Add these ONE AT A TIME:

### Variable 1:
- **Name:** `DATABASE_URL`
- **Value:** (You'll get this from Supabase - leave as placeholder for now)
- Click **Save**

### Variable 2:
- **Name:** `JWT_SECRET`
- **Value:** `your-secret-key-min-32-chars-long`
- Click **Save**

### Variable 3:
- **Name:** `NODE_ENV`
- **Value:** `production`
- Click **Save**

---

## Step 5: Deploy

1. Railway should auto-deploy when you save the variables
2. Wait 3-5 minutes for build to complete
3. Once done, you'll see a green checkmark

---

## Finding Your Backend URL

Once deployed:

1. In Railway, find your **backend** service
2. Click on it
3. Look for **"Domains"** section
4. Copy the auto-generated URL (looks like: `https://test-data-generator-xyz.railway.app`)
5. This is your RAILWAY_URL

---

## Getting the Database Connection String

Once you have your Railway URL working, go back to Supabase:

1. https://app.supabase.com
2. Find your project
3. Settings → Database → Connection string
4. Copy the URI (postgresql://...)
5. Go back to Railway
6. Update the DATABASE_URL variable with this string

---

## Testing

Once everything is connected:

1. Go to: `https://test-data-generator-phi.vercel.app`
2. Try to sign up
3. Should work now!

---

**That's it!**

The backend will be deployed within 5 minutes. You just need to add those 3 environment variables in Railway's web dashboard.
