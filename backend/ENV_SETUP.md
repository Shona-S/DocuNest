# 🔐 Environment Variables Setup Guide

## ✅ Validation System Working!

Your environment variable validation is working correctly. It detected that your `.env` file is missing or incomplete.

## 📝 Create Your `.env` File

1. **Create a new file** named `.env` in the `backend/` directory

2. **Copy the template below** and fill in your values:

```env
# Neon PostgreSQL Database Configuration
# Get your DATABASE_URL from Neon dashboard: https://console.neon.tech
# Format: postgresql://user:password@host/database?sslmode=require
DATABASE_URL=postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require

# JWT Secret Key (Generated for you)
JWT_SECRET=2b3aa88327b7259c08f3a1a38245a99e8a17e8227b071e6a2aa0c3e2d8899d51a987c5f6fd9c4d6c677d1ef7a69648bd38e50ff03ab5a3b361e05c4d4f5fd600

# Encryption Master Key (Generated for you)
ENCRYPT_KEY=00329472f9d521e9198bc74b601753daa2e7738ae4fc1f0ee4a9f6389aceeb5e

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

## 🔑 Generated Keys

The following secure keys were generated for you:

- **JWT_SECRET**: `2b3aa88327b7259c08f3a1a38245a99e8a17e8227b071e6a2aa0c3e2d8899d51a987c5f6fd9c4d6c677d1ef7a69648bd38e50ff03ab5a3b361e05c4d4f5fd600`
- **ENCRYPT_KEY**: `00329472f9d521e9198bc74b601753daa2e7738ae4fc1f0ee4a9f6389aceeb5e`

⚠️ **Keep these keys secure and never commit them to version control!**

## 🗄️ Neon PostgreSQL Setup

Before starting the server, make sure:

1. **Create a Neon account** at https://neon.tech (if you haven't already)
2. **Create a new project** in the Neon dashboard
3. **Copy your connection string** from the Neon dashboard:
   - Go to your project → Connection Details
   - Copy the connection string (it looks like: `postgresql://user:password@ep-xxx.region.aws.neon.tech/dbname?sslmode=require`)
4. **Add it to your `.env` file** as `DATABASE_URL`

The database tables will be automatically created when you start the server (via Sequelize sync).

## 🚀 Next Steps

1. Create the `.env` file with the template above
2. Add your Neon `DATABASE_URL` to `.env`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the server:
   ```bash
   npm run dev
   ```

You should now see:
```
✅ All environment variables loaded successfully.
✅ Connected to Neon PostgreSQL successfully!
✅ Database models synchronized
🚀 DocuNest Backend Server running...
```

## 🔄 Generate New Keys (Optional)

If you need to generate new keys later:

```bash
node scripts/generate-keys.js
```

Then update the `JWT_SECRET` and `ENCRYPT_KEY` values in your `.env` file.

