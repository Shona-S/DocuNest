# 🔒 DocuNest - Secure Personal Document Vault

A production-grade, privacy-first document management system that allows users to securely upload, categorize, tag, search, and download their personal files with end-to-end encryption.

## 🌟 Features

- **🔐 End-to-End Encryption**: All files are encrypted using AES-256-CBC before storage
- **👤 User Authentication**: Secure JWT-based authentication with bcrypt password hashing
- **📁 File Management**: Upload, download, delete, and organize documents
- **🏷️ Categorization & Tagging**: Organize files by category (Work, Education, ID, etc.) and custom tags
- **🔍 Advanced Search**: Search files by name, tags, or category
- **🔒 PIN Protection**: Optional PIN lock for sensitive file categories
- **📊 Activity Logging**: Track upload/download activities
- **🛡️ Security First**: Rate limiting, input validation, CORS, and Helmet security headers

## 🧱 Tech Stack

### Backend
- **Node.js** + **Express** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **AES-256-CBC** - File encryption (Node.js crypto module)
- **Helmet** + **CORS** - Security middleware
- **express-validator** - Input validation
- **express-rate-limit** - Brute-force protection

### Frontend (Coming Soon)
- **React** + **Vite** - Modern frontend framework
- **Tailwind CSS** - Styling
- **Axios** - API communication
- **React Toastify** - Notifications

## 📁 Project Structure

```
docunest/
├── backend/
│   ├── server.js                 # Main server entry point
│   ├── config/
│   │   ├── db.js                 # MongoDB connection
│   │   └── keys.js               # Encryption key management
│   ├── models/
│   │   ├── userModel.js          # User schema and methods
│   │   └── documentModel.js      # Document metadata schema
│   ├── routes/
│   │   ├── authRoutes.js         # Authentication endpoints
│   │   ├── fileRoutes.js         # File upload/download/delete
│   │   └── searchRoutes.js      # Search and filtering
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT authentication
│   │   └── errorHandler.js       # Error handling
│   ├── utils/
│   │   ├── encryptFile.js        # File encryption utility
│   │   └── decryptFile.js        # File decryption utility
│   ├── uploads/                  # Encrypted file storage (gitignored)
│   ├── package.json
│   └── .env.example
│
├── frontend/                     # (To be implemented)
│   └── ...
│
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **MongoDB** (local installation or MongoDB Atlas account)
- **npm** or **yarn**

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/docunest
   JWT_SECRET=your-super-secret-jwt-key
   ENCRYPT_KEY=your-32-byte-hex-encryption-key
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ```

5. **Generate secure keys** (optional but recommended):
   ```bash
   # Generate JWT Secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   
   # Generate Encryption Key (32 bytes hex)
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

6. **Start MongoDB** (if using local installation)
   ```bash
   # Windows
   mongod
   
   # macOS/Linux
   sudo systemctl start mongod
   ```

7. **Run the server**
   ```bash
   # Development mode (with nodemon)
   npm run dev
   
   # Production mode
   npm start
   ```

8. **Verify server is running**
   - Visit: `http://localhost:5000/api/health`
   - You should see: `{"success":true,"message":"DocuNest API is running"}`

## 📡 API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (protected)
- `POST /api/auth/set-pin` - Set PIN for sensitive files (protected)

### Files

- `POST /api/files/upload` - Upload and encrypt a file (protected)
- `GET /api/files` - Get all user's files (protected)
- `GET /api/files/:id` - Get file metadata (protected)
- `GET /api/files/:id/download` - Download and decrypt a file (protected)
- `DELETE /api/files/:id` - Delete a file (protected)

### Search

- `GET /api/search?q=query` - Search files by query (protected)
- `GET /api/search/categories` - Get all categories with counts (protected)
- `GET /api/search/tags` - Get all tags with counts (protected)

### Example API Usage

**Register a user:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

**Upload a file:**
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/document.pdf" \
  -F "category=Work" \
  -F "tags=important,contract"
```

## 🔒 Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt (cost factor 12)
2. **JWT Authentication**: Secure token-based authentication with 7-day expiration
3. **File Encryption**: Each file is encrypted with a unique AES-256-CBC key
4. **Key Management**: File encryption keys are encrypted with a master key before storage
5. **Rate Limiting**: Login attempts are rate-limited (5 attempts per 15 minutes)
6. **Input Validation**: All inputs are validated and sanitized
7. **CORS Protection**: Configured CORS for frontend communication
8. **Helmet**: Security headers to prevent common attacks
9. **File Type Validation**: Only allows PDF, PNG, JPG, JPEG, DOCX files
10. **File Size Limits**: Maximum 50MB per file

## 🧪 Testing the Backend

1. **Test Registration:**
   ```bash
   POST http://localhost:5000/api/auth/register
   Body: { "username": "testuser", "email": "test@test.com", "password": "Test1234" }
   ```

2. **Test Login:**
   ```bash
   POST http://localhost:5000/api/auth/login
   Body: { "email": "test@test.com", "password": "Test1234" }
   ```

3. **Test File Upload** (use the token from login):
   ```bash
   POST http://localhost:5000/api/files/upload
   Headers: { "Authorization": "Bearer YOUR_TOKEN" }
   Form Data: file, category, tags
   ```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/docunest` |
| `JWT_SECRET` | Secret key for JWT signing | `your-secret-key` |
| `ENCRYPT_KEY` | Master encryption key (32 bytes hex) | `abc123...` |
| `PORT` | Server port | `5000` |
| `NODE_ENV` | Environment mode | `development` or `production` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:5173` |

## 🚧 Next Steps

- [ ] Implement React frontend
- [ ] Add file preview functionality
- [ ] Implement activity log model and endpoints
- [ ] Add file sharing capabilities
- [ ] Set up cloud storage (AWS S3, etc.)
- [ ] Add email notifications
- [ ] Implement file versioning
- [ ] Add automated backups

## 📄 License

ISC

## 👨‍💻 Development

This project is built with security and privacy as top priorities. All files are encrypted before storage, and encryption keys are never stored in plaintext.

For questions or issues, please open an issue on the repository.

---

**⚠️ Important Security Notes:**

1. Never commit `.env` file to version control
2. Use strong, randomly generated keys in production
3. Enable HTTPS in production
4. Regularly rotate encryption keys
5. Keep dependencies up to date
6. Use MongoDB authentication in production
7. Implement proper backup strategies

