# MongoDB to MySQL Migration Notes

## ✅ Migration Complete

The DocuNest backend has been successfully migrated from MongoDB (Mongoose) to MySQL (Sequelize).

## 🔄 Key Changes

### 1. Database Connection (`config/db.js`)
- **Before**: Mongoose connection using `mongoose.connect()`
- **After**: Sequelize connection using `new Sequelize()` with MySQL dialect
- Uses environment variables: `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DB`

### 2. User Model (`models/userModel.js`)
- **Before**: Mongoose schema with `username` field
- **After**: Sequelize model with `name` field (as requested)
- Uses Sequelize hooks (`beforeCreate`, `beforeUpdate`) instead of Mongoose pre-save middleware
- Instance methods (`comparePassword`, `comparePIN`) remain the same

### 3. Document Model (`models/documentModel.js`)
- **Before**: Mongoose schema with array for tags
- **After**: Sequelize model with TEXT field for tags (stored as comma-separated string)
- Uses getters/setters to convert between array and string
- Relationships defined: `User.hasMany(Document)` and `Document.belongsTo(User)`

### 4. Routes Updates

#### Auth Routes (`routes/authRoutes.js`)
- Changed `username` to `name` in registration
- Replaced `User.findOne({ $or: [...] })` with `User.findOne({ where: { [Op.or]: [...] } })`
- Replaced `User.findById()` with `User.findByPk()`
- Replaced `user._id` with `user.id`

#### File Routes (`routes/fileRoutes.js`)
- Replaced `Document.find()` with `Document.findAll()`
- Replaced `Document.findOne({ _id, userId })` with `Document.findOne({ where: { id, userId } })`
- Replaced `.select()` with `attributes: { exclude: [...] }`
- Replaced `.sort()` with `order: [['field', 'DESC']]`
- Replaced `document.deleteOne()` with `document.destroy()`
- Replaced `document._id` with `document.id`

#### Search Routes (`routes/searchRoutes.js`)
- Replaced MongoDB `$regex` with Sequelize `Op.like`
- Replaced `Document.aggregate()` with `Document.findAll()` with `attributes` and `group`
- Tags aggregation now uses JavaScript instead of MongoDB aggregation pipeline

### 5. Middleware (`middleware/authMiddleware.js`)
- Replaced `User.findById().select()` with `User.findByPk({ attributes: { exclude: [...] } })`

### 6. Server Initialization (`server.js`)
- Database connection and model sync wrapped in async IIFE
- Uses `sequelize.sync({ alter: true })` to create/alter tables

## 📦 Dependencies

### Removed
- `mongoose`

### Added
- `sequelize` (^6.35.2)
- `mysql2` (^3.6.5)

## 🔧 Environment Variables

Update your `.env` file with MySQL configuration:

```env
MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DB=docunest
JWT_SECRET=your_secret
ENCRYPT_KEY=random_32byte_key
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## 🚀 Setup Instructions

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Create MySQL database:**
   ```sql
   CREATE DATABASE docunest;
   ```

3. **Update `.env` file** with your MySQL credentials

4. **Run the server:**
   ```bash
   npm run dev
   ```

   The server will automatically:
   - Connect to MySQL
   - Create/alter tables based on models
   - Start the Express server

## ⚠️ Important Notes

1. **Tags Storage**: Tags are now stored as comma-separated strings in MySQL. The model uses getters/setters to convert between arrays and strings automatically.

2. **Table Names**: Sequelize uses snake_case for table names (`users`, `documents`) and column names (`user_id`, `created_at`, etc.) by default.

3. **Model Sync**: The server uses `sequelize.sync({ alter: true })` which is safe for development but should be replaced with migrations in production.

4. **ID Fields**: All `_id` references have been changed to `id` (Sequelize uses integer auto-increment IDs by default).

5. **Query Syntax**: 
   - Mongoose: `Model.find({ field: value })`
   - Sequelize: `Model.findAll({ where: { field: value } })`

## 🔒 Security

All security features remain intact:
- ✅ JWT authentication
- ✅ bcrypt password hashing
- ✅ AES-256 file encryption
- ✅ Input validation
- ✅ Rate limiting
- ✅ CORS and Helmet

## 📝 Next Steps

1. Test all API endpoints
2. Verify file upload/download with encryption
3. Test search functionality
4. Consider implementing Sequelize migrations for production
5. Update frontend if it references `username` (now `name`)

