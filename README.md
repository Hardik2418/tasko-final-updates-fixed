# Tasko - Team Task Management Application

A collaborative web application for managing team projects and tasks efficiently.

## ✨ Features

- 👥 **Team Collaboration** - Create projects and invite team members
- ✅ **Task Management** - Create, assign, and track tasks with priorities
- 📊 **Dashboard** - Overview of all projects and tasks
- 🔐 **Secure** - Password hashing with bcryptjs
- 👨‍💼 **Role-Based Access** - Admin and Member roles
- 🔔 **Notifications** - Real-time updates for task changes
- 📱 **Responsive Design** - Works on desktop and mobile

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **Frontend:** EJS Templates, CSS
- **Authentication:** Express Session + bcryptjs
- **Deployment:** Render.com

## 📋 Prerequisites

Before you begin, ensure you have installed:
- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **MongoDB** (Local or MongoDB Atlas) - [Sign up](https://www.mongodb.com/cloud/atlas)

## 🚀 Quick Start Guide

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/tasko.git
cd tasko

# Install dependencies
npm install
```

### Step 2: Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# MongoDB Connection String
MONGODB_URI=mongodb://localhost:27017/tasko

# Session Secret (use any random string)
SESSION_SECRET=your-super-secret-key-change-this-123

# Environment (development or production)
NODE_ENV=development

# Port (optional, defaults to 3000)
PORT=3000
```

### Step 3: Start MongoDB

**If using MongoDB locally:**
```bash
# On Windows
mongod

# On Mac/Linux
mongod --dbpath /path/to/your/db
```

**If using MongoDB Atlas (Cloud):**
- Get your connection string from MongoDB Atlas
- Replace the `MONGODB_URI` in `.env` file

### Step 4: Start the Application

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The application will start on `http://localhost:3000`

## 🎯 First Time Usage

1. **Create an Account:**
   - Go to http://localhost:3000/signup
   - Fill in your details
   - Select your role (Admin or Employee)
   - Click "Sign Up"

2. **Login:**
   - Go to http://localhost:3000/login
   - Use your credentials
   - Click "Login"

3. **Navigate:**
   - **Dashboard** - View your projects and tasks overview
   - **Projects** - See all projects you're part of
   - **My Tasks** - View tasks assigned to you
   - **Admin Panel** - (Admins only) Manage employees and tasks

## 📁 Project Structure

```
tasko/
├── models/              # MongoDB schemas (User, Project, Task, etc.)
├── controllers/         # Business logic for routes
├── routes/             # API route definitions
├── middleware/         # Authentication middleware
├── views/              # EJS templates (HTML pages)
├── public/             # Static files
│   ├── css/           # Stylesheets
│   └── js/            # Frontend JavaScript
├── server.js          # Main application file
├── package.json       # Dependencies and scripts
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

## 🔑 Key Routes

### User Pages (Render HTML)
- `GET /` - Home page
- `GET /login` - Login page
- `GET /signup` - Sign up page
- `GET /dashboard` - Dashboard
- `GET /projects` - All projects list
- `GET /projects/:id` - Project details
- `GET /my-tasks` - Your assigned tasks
- `GET /admin-panel` - Admin dashboard (admin only)

### API Routes (Return JSON)
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login user
- `GET /api/auth/logout` - Logout user
- `GET /api/projects` - Get all projects (JSON)
- `POST /api/projects` - Create project
- `GET /api/tasks/my-tasks` - Get assigned tasks (JSON)
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task

## 🔐 User Roles

### Admin
- Create projects
- Assign tasks to team members
- Manage employees
- Approve task completion
- View all statistics

### Employee
- View assigned projects
- View assigned tasks
- Update task status
- Submit task completion requests

## 🌐 Deployment to Render

### Prerequisites
- GitHub account with repo pushed
- MongoDB Atlas account (free tier available)

### Steps

1. **Get MongoDB Atlas String:**
   - Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create a free cluster
   - Get connection string from "Connect" button

2. **Deploy to Render:**
   - Go to [render.com](https://render.com)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name:** tasko
     - **Environment:** Node
     - **Build Command:** `npm install`
     - **Start Command:** `node server.js`
   - Add environment variables in "Environment" tab:
     ```
     MONGODB_URI=your_mongodb_atlas_connection_string
     SESSION_SECRET=your-random-secret-key
     NODE_ENV=production
     ```
   - Click "Create Web Service"

3. **Auto-Deploy:**
   - Your app will deploy automatically when you push to GitHub
   - Render will show your live URL

## 🐛 Troubleshooting

### Port 3000 already in use
```bash
# On Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# On Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### MongoDB connection error
- Verify `MONGODB_URI` in `.env` file
- Check MongoDB service is running
- For Atlas, whitelist your IP address

### Session not persisting
- Make sure `SESSION_SECRET` is set in `.env`
- Clear browser cookies
- Restart the server

## 📝 Available Scripts

```bash
# Start the server
npm start

# Start with auto-reload (development)
npm run dev

# Run tests (if configured)
npm test

# Verify code
npm run verify
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 💡 Tips & Best Practices

- Use strong passwords when creating accounts
- Regularly update task statuses
- Use meaningful project names and descriptions
- Assign tasks to appropriate team members
- Review overdue tasks regularly

## 🎉 You're All Set!

Your Tasko application is ready to use. Happy task managing! 🚀
