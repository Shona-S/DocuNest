# 📚 Swagger API Documentation Guide

## 🎯 Overview

Swagger (OpenAPI) provides interactive API documentation that allows you to test endpoints directly from your browser. This guide explains how to use Swagger with the DocuNest API.

## 🚀 Setup Instructions

### 1. Install Dependencies

First, make sure you have all required dependencies installed:

```bash
cd backend
npm install sequelize mysql2 swagger-ui-express swagger-jsdoc bcrypt jsonwebtoken multer cors helmet express-rate-limit dotenv
```

### 2. Configure Environment Variables

Create or update your `.env` file with MySQL credentials:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=my_password
MYSQL_DB=docunest
JWT_SECRET=your-secret-key
ENCRYPT_KEY=your-32-byte-hex-encryption-key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 3. Start the Server

```bash
npm run dev
# or
node server.js
```

You should see:
```
✅ Connected to MySQL successfully!
✅ Database models synchronized
🚀 DocuNest Backend Server running in development mode on port 5000
📚 Swagger API Docs: http://localhost:5000/api-docs
```

## 📖 How to Use Swagger UI

### 1. Access Swagger Documentation

Open your browser and navigate to:
```
http://localhost:5000/api-docs
```

You'll see a beautiful, interactive API documentation page with all available endpoints organized by tags (Authentication, Files, etc.).

### 2. Understanding the Interface

- **Tags**: Endpoints are grouped by functionality (Authentication, Files)
- **Endpoints**: Each route shows its HTTP method (GET, POST, DELETE) and path
- **Expand/Collapse**: Click on any endpoint to see details
- **Try it out**: Click the "Try it out" button to test an endpoint
- **Parameters**: Fill in required parameters and request body
- **Execute**: Click "Execute" to send the request

### 3. Testing Public Endpoints (No Authentication)

#### Register a New User

1. Find **POST /api/auth/register** under the Authentication section
2. Click "Try it out"
3. Fill in the request body:
   ```json
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "SecurePass123"
   }
   ```
4. Click "Execute"
5. Copy the `token` from the response - you'll need it for protected routes

#### Login

1. Find **POST /api/auth/login**
2. Click "Try it out"
3. Fill in:
   ```json
   {
     "email": "john@example.com",
     "password": "SecurePass123"
   }
   ```
4. Click "Execute"
5. Copy the `token` from the response

### 4. Testing Protected Endpoints (Requires Authentication)

#### Authorize with JWT Token

1. Click the **"Authorize 🔒"** button at the top right of the Swagger UI
2. In the "Value" field, enter your JWT token (without "Bearer " prefix)
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
3. Click "Authorize"
4. Click "Close"

Now all protected endpoints will automatically include your token in the Authorization header.

#### Upload a File

1. Find **POST /api/files/upload** under the Files section
2. Click "Try it out"
3. Make sure you've authorized with your JWT token (see above)
4. Fill in the form:
   - **file**: Click "Choose File" and select a PDF, PNG, JPG, or DOCX file
   - **category**: Select from dropdown (e.g., "Work")
   - **tags**: Enter comma-separated tags (e.g., "important,contract")
   - **requiresPIN**: true/false
5. Click "Execute"
6. You'll receive the document ID and metadata

#### Get All Files

1. Find **GET /api/files**
2. Click "Try it out"
3. Optionally add query parameters:
   - **category**: Filter by category
   - **tag**: Filter by tag
4. Click "Execute"
5. View the list of your files

#### Download a File

1. Find **GET /api/files/{id}/download**
2. Click "Try it out"
3. Enter the document **id** (from upload response)
4. If the file requires PIN, add `?pin=1234` as a query parameter
5. Click "Execute"
6. The file will be downloaded (decrypted automatically)

#### Delete a File

1. Find **DELETE /api/files/{id}**
2. Click "Try it out"
3. Enter the document **id**
4. Click "Execute"
5. File is deleted from both database and disk

### 5. Viewing Response Examples

Each endpoint shows:
- **Request body schema**: What to send
- **Response schemas**: What you'll receive for different status codes (200, 400, 401, etc.)
- **Example values**: Sample data to help you understand the format

## 🔍 Available Endpoints

### Authentication (`/api/auth`)
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (protected)
- `POST /api/auth/set-pin` - Set PIN for sensitive files (protected)

### Files (`/api/files`)
- `POST /api/files/upload` - Upload and encrypt file (protected)
- `GET /api/files` - Get all user's files (protected)
- `GET /api/files/{id}` - Get file metadata (protected)
- `GET /api/files/{id}/download` - Download file (protected)
- `DELETE /api/files/{id}` - Delete file (protected)

### Search (`/api/search`)
- `GET /api/search` - Search files by query (protected)
- `GET /api/search/categories` - Get all categories (protected)
- `GET /api/search/tags` - Get all tags (protected)

## 🛡️ Security Features in Swagger

1. **JWT Authentication**: Use the "Authorize" button to add your token
2. **Rate Limiting**: Login endpoint is rate-limited (5 attempts per 15 minutes)
3. **File Type Validation**: Only specific file types are accepted
4. **File Size Limits**: Maximum 50MB per file
5. **Ownership Checks**: Users can only access their own files

## 💡 Tips & Best Practices

1. **Always Authorize First**: Before testing protected endpoints, click "Authorize" and enter your token
2. **Check Response Codes**: Swagger shows different response schemas for success (200) and errors (400, 401, 404)
3. **Use Example Values**: Swagger provides example values - use them as a starting point
4. **Test Error Cases**: Try invalid inputs to see error responses
5. **Copy Tokens**: Save your JWT token after login - it's valid for 7 days

## 🐛 Troubleshooting

### Swagger UI Not Loading
- Check that the server is running on port 5000
- Verify the URL: `http://localhost:5000/api-docs`
- Check browser console for errors

### "Unauthorized" Errors
- Make sure you clicked "Authorize" and entered your JWT token
- Verify the token is still valid (not expired)
- Try logging in again to get a new token

### Database Connection Errors
- Ensure MySQL is running
- Verify `.env` file has correct credentials
- Check that the `docunest` database exists

### File Upload Errors
- Verify file type is allowed (PDF, PNG, JPG, JPEG, DOCX)
- Check file size is under 50MB
- Ensure you're authorized with a valid token

## 📝 Notes

- Swagger automatically generates documentation from JSDoc comments in route files
- The documentation is always up-to-date with your code
- You can export the OpenAPI spec as JSON from Swagger UI
- In production, consider restricting Swagger UI access or removing it entirely

---

**Happy Testing! 🚀**

For more information, visit: https://swagger.io/docs/

