# authentication-System
# 🔐 JWT Authentication API

A Node.js REST API with secure JWT-based authentication using access tokens, refresh tokens, and session management.

---

## 🚀 Features

- User Registration & Login
- JWT Access Token (15 min expiry)
- Refresh Token with SHA-256 hashing (7 day expiry)
- Refresh Token Rotation
- Session Management with MongoDB
- Logout (single device)
- Logout All Devices
- HTTP-only cookies for security

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcrypt
- **Token Hashing:** crypto (SHA-256)

---

## 📁 Project Structure

```
├── config/
│   └── config.js          # Environment variables
├── model/
│   ├── user.model.js       # User schema
│   └── session.model.js    # Session schema
├── controller/
│   └── auth.controller.js  # All auth logic
├── routes/
│   └── auth.routes.js      # API routes
└── index.js                # Entry point
```

---

## ⚙️ Setup & Installation

### 1. Clone the repository
```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create `.env` file
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/yourdbname
JWT_SECRET=your_super_secret_key
```

### 4. Start the server
```bash
npm start
# or for development
npm run dev
```

---

## 📡 API Endpoints

### Auth Routes — `/api/auth`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | ❌ |
| POST | `/login` | Login user | ❌ |
| GET | `/user` | Get logged in user details | ✅ Access Token |
| POST | `/refresh` | Generate new access token | ✅ Refresh Token |
| POST | `/logout` | Logout from current device | ✅ Refresh Token |
| POST | `/logout-all` | Logout from all devices | ✅ Refresh Token |

---

## 📝 API Usage

### Register
```http
POST /register
Content-Type: application/json

{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Created Successfully",
  "accessToken": "<jwt_access_token>"
}
```

---

### Login
```http
POST /login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Logged in successfully",
  "accessToken": "<jwt_access_token>"
}
```

---

### Get User
```http
GET /get-me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "message": "User found",
  "user": {
    "name": "john",
    "email": "john@example.com"
  }
}
```

---

### Refresh Access Token
```http
POST /refresh
Cookie: refreshToken=<refresh_token>
```

**Response:**
```json
{
  "message": "Access token generated",
  "accessToken": "<new_jwt_access_token>"
}
```

---

### Logout
```http
POST /logout
Cookie: refreshToken=<refresh_token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

---

### Logout All Devices
```http
POST /logout-all
Cookie: refreshToken=<refresh_token>
```

**Response:**
```json
{
  "message": "Logged out from all devices successfully"
}
```

---

## 🔒 Security

- Passwords are hashed using **bcrypt** (salt rounds: 10)
- Refresh tokens are hashed using **SHA-256** before storing in DB
- Refresh tokens are rotated on every use
- Refresh tokens are stored in **HTTP-only cookies** to prevent XSS
- Sessions are revoked on logout

---

## 🧪 Testing with Postman

1. **Register** → `POST /register`
2. **Login** → `POST /login` → copy `accessToken` from response
3. **Get User** → `GET /get-me` → set `Authorization: Bearer <accessToken>` header
4. **Refresh Token** → `POST /refresh` → sends cookie automatically (or pass in body)
5. **Logout** → `POST /logout`
5. **LogoutAll** → `POST /logOutAll`
6. `

> ⚠️ Each `/refresh` call rotates the refresh token. Always use the latest one.

---

## 📄 Session Model

```js
{
  userId: ObjectId,
  refreshTokenHash: String,  // SHA-256 hashed refresh token
  ip: String,
  userAgent: String,
  revoked: Boolean,          // true = logged out
  createdAt: Date
}
```

---

## 📄 License

MIT
