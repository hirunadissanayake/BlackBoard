# 🎓 Blackboard
> **A minimalist, high-contrast Class Management System for the modern educator.**

![License](https://img.shields.io/badge/license-MIT-black)
![React](https://img.shields.io/badge/React-18-black?logo=react)
![Vite](https://img.shields.io/badge/Vite-Fast-black?logo=vite)
![Supabase](https://img.shields.io/badge/Supabase-Database-black?logo=supabase)

---

## ✨ Overview

**Blackboard** strips away the clutter of traditional educational software. Built with a strict **Black & White** aesthetic, it focuses purely on content and usability. Manage your classes, track student attendance, and oversee assignments without the visual noise.

> *"Simplicity is the ultimate sophistication."*

## 🚀 Features

### 📊 **Dashboard**
Real-time insights into your teaching universe. view total student counts, active classes, and a live feed of recent activities.

### 🏫 **Class Management**
- **Create & Organize**: Spin up new classes in seconds.
- **Visual Cards**: Each class is represented by a sleek, cover-image card.
- **Schedule Tracking**: Keep track of when and where you teach.

### 👥 **Student Directory**
- **Roster Management**: Add, search, and filter students.
- **Profiles**: View student details with generated avatars.
- **Attendance**: Log daily attendance (Present, Absent, Late) and track trends.

### 📝 **Assignments**
- **Task Tracking**: Create assignments linked to specific classes.
- **Submission Status**: Monitor how many students have submitted.
- **Dates**: Never miss a due date.

### 🔐 **Secure & Private**
- **Authentication**: Powered by Supabase Auth (Email/Password).
- **Row Level Security**: Your data is yours. You only see classes and students you created.

---

## 🛠️ Tech Stack

- **Frontend**: React.js + Vite
- **Styling**: Custom CSS Variables (Design System), Lucide React (Icons)
- **Backend**: Supabase (PostgreSQL + Auth)
- **State Management**: React Context API

---

## 🏁 Getting Started

### 1. Clone the Repo
```bash
git clone https://github.com/yourusername/blackboard.git
cd blackboard
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_postgres_connection_string
```

### 4. Initialize Database
Run the initialization script to create tables and policies:
```bash
node init_db.js
```

### 5. Run it!
```bash
npm run dev
```
Visit `http://localhost:5173` and start managing.

---

## 🎨 Design Philosophy

- **Typography**: Clean sans-serif fonts (Inter/System) for maximum readability.
- **Palette**: #000000 (Black), #FFFFFF (White), and shades of Gray. No distractions.
- **Interaction**: Subtle hover states and smooth transitions.

---

Made with 🖤 by Hiruna
