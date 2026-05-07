# 📌 TaskFlow — Team Task Manager

A full-stack-style web app where users can create projects, assign tasks, and track progress with **role-based access control (Admin/Member)**.

> Built with React, React Router, and localStorage for persistence. Ready to deploy on Railway, Vercel, or Netlify.

---

## 🚀 Live Demo

> [Add your live URL here after deployment]

---

## 🎯 Features

### Authentication
- Signup / Login with email & password
- Role selection: **Admin** or **Member**
- Session persisted via localStorage

### Role-Based Access Control
| Feature | Admin | Member |
|--------|-------|--------|
| View all projects | ✅ | ❌ (own only) |
| Create/delete projects | ✅ | ❌ |
| Create/edit tasks | ✅ | ✅ |
| View Team page | ✅ | ❌ |
| Manage members | ✅ | ❌ |

### Project Management
- Create, view, delete projects
- Add/remove team members per project
- Progress tracking per project

### Task Management
- Create, edit, delete tasks
- Assign to team members
- Set priority (High / Medium / Low)
- Set due dates
- **Kanban board** view (To Do → In Progress → Done)
- **List** view with sorting/filtering
- Overdue detection and highlighting

### Dashboard
- Stats overview (total, in-progress, done, overdue)
- Recent tasks table
- Overdue alerts
- Project progress bars

### Team Management (Admin only)
- View all team members
- Per-member task statistics
- Completion rates

---

## 🛠 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 |
| Routing | React Router v6 |
| State | React Context API |
| Storage | localStorage (simulates DB) |
| Styling | CSS Modules |
| Deployment | Railway / Vercel / Netlify |

---

## 📦 Local Setup

```bash
# 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/team-task-manager.git
cd team-task-manager

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# App runs at http://localhost:3000
```

### Demo Accounts
| Email | Password | Role |
|-------|----------|------|
| admin@demo.com | admin123 | Admin |
| bob@demo.com | bob123 | Member |
| carol@demo.com | carol123 | Member |

---

## 🌐 Deployment

### Deploy to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize and deploy
railway init
railway up
```

### Deploy to Vercel (Easiest)
```bash
npm install -g vercel
npm run build
vercel --prod
```

### Deploy to Netlify
```bash
npm run build
# Drag & drop the 'build' folder to netlify.com/drop
```

---

## 📁 Project Structure

```
src/
├── context/
│   └── AuthContext.js      # Global state, CRUD operations
├── pages/
│   ├── AuthPage.js         # Login / Signup
│   ├── Dashboard.js        # Overview + stats
│   ├── ProjectsPage.js     # Project list
│   ├── ProjectDetail.js    # Kanban board + members
│   ├── TasksPage.js        # My tasks with filters
│   └── TeamPage.js         # Admin: team stats
├── components/
│   ├── Layout.js           # Sidebar + topbar wrapper
│   └── Modal.js            # Reusable modal
└── App.js                  # Routing
```

---

## 📸 Screenshots

> Add screenshots here after deployment

---

## 👨‍💻 Author

Your Name — [GitHub](https://github.com/YOUR_USERNAME)

---

## 📄 License

MIT
