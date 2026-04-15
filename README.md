# 🧠 Second Brain – Backend

Second Brain is a Node.js + Express backend that powers a personal knowledge management system. It handles authentication, content storage, tagging, and sharing functionality.

---

## 🚀 Features

- 🔐 JWT Authentication (Signup / Login)
- 🔒 Secure password hashing using bcrypt
- 📦 Create, Read, and Delete Content
- 🏷️ Tag Management System
- 🔗 Share Brain Feature (public link)
- 🧠 User-specific content storage

---

## 🛠️ Tech Stack

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT (jsonwebtoken)
- bcrypt
- Zod (validation)

---

## 📂 Project Structure
src/ ├── db.ts ├── middleware.ts ├── types.ts ├── index.ts

---

## ⚙️ Setup Instructions

### 1. Clone the repository
git clone https://github.com/anjeetsingh7155/secondBrain.git⁠� cd secondBrain

### 2. Install dependencies
npm install

### 3. Create `.env` file
databaseURL=your_mongodb_connection_string userJWTpass=your_secret_key

### 4. Run the server
npm run dev

---

## 🔐 Authentication

- User logs in and receives a JWT token
- Token must be sent in headers for protected routes:
Authorization: 

---

## 📡 API Endpoints

### Auth
- POST `/api/v1/signup`
- POST `/api/v1/login`

### Content
- POST `/api/v1/content` → Add content
- GET `/api/v1/content` → Get all user content
- DELETE `/api/v1/content` → Delete content

### Share Brain
- POST `/api/v1/brain/share` → Generate share link
- GET `/api/v1/brain/:shareLink` → Access shared content

---

## 🧠 Data Models

### User
- email
- userName
- password

### Content
- title
- link
- type (youtube / twitter)
- tags
- userId

### Tag
- title

---

## 🚀 Future Improvements

- 🔍 Search API
- 🏷️ Tag filtering
- ✏️ Update content API
- 🤖 AI integration (auto tags, summaries)
- 📊 Analytics

---

## 👨‍💻 Author

Anjeet Singh

---

⭐ If you like this project, give it a star!
