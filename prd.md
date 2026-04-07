# Product Requirements Document (PRD) & README
**Project:** MERN Task Management System

## 1. Project Overview
A full-stack web application designed for comprehensive task and project management. The system is built on the MERN stack (MongoDB, Express, React, Node.js) and facilitates productivity through a two-tiered architecture: **Admin** and **Member/User**. 

## 2. Tech Stack Setup
### Frontend
- **Framework:** React 19 + Vite
- **Routing:** React Router DOM v7
- **Styling:** Tailwind CSS v4
- **State Management Contexts:** `AuthProvider`, `PMSProvider`

### Backend (In Progress)
- **Runtime:** Node.js
- **Framework:** Express 5.x
- **Database ORM:** Mongoose 9.x
- **Middleware:** CORS

---

## 3. Architecture & Features

### 3.1 User Roles
1. **Admin:** Full access to manage teams, supervise projects, monitor global progress, and modify system settings.
2. **Member (User):** Focused access to assigned projects, personalized task boards, and task pick-up.

### 3.2 Frontend Route Map
The application routing is heavily reliant on a role-based access control paradigm (Protected via `RequireAuth`, `AdminRoute`, and `MemberRoute` components).

#### Common/Shared Routes (Logged In)
- `/login`: User Authentication Dashboard
- `/`: Home Dashboard (General Overview)
- `/projects`: Projects Gate (List of all active projects for the user)
- `/projects/:projectId`: Detail view for a specific project
- `/board`: Interactive Kanban board for task tracking
- `/calendar`: Calendar view for deadlines and scheduling
- `/profile`: User's personal profile view

#### Member Specific Routes
- `/my-tasks`: Dedicated view showing tasks assigned exclusively to the logged-in member.
- `/pickup`: Interface for members to voluntarily pick up unassigned tasks.

#### Admin Specific Routes
- `/team`: Manage team members, invite new users, set roles.
- `/settings`: Global application settings.

---

## 4. Current Progress

- ✅ **Frontend Environment & UI:** Built out completely using Vite, React, and Tailwind CSS.
- ✅ **Role-based Routing Logic:** Implemented using React Router (`TaskFlow.jsx`).
- ✅ **Component Structure:** Extensive mapping for Dashboard, Kanban, Profiles, and Teams.
- ✅ **Backend Initialization:** Basic Node.js + Express setup created, dependencies installed (`mongoose`, `express`, `cors`).
- ⬜ **Backend Implementation:** No active Express app, REST APIs, or Models coded yet.
- ⬜ **Database:** MongoDB integration yet to be wired.
- ⬜ **Frontend-Backend Integration:** Hooks/Providers still seemingly rely on local UI state rather than fetching live REST API data.

---

## 5. Development Roadmap (Next Steps)

### Phase 1: Database Schema & Models Layout (Backend)
- Setup database structure in `Backend` directory.
- Configure MongoDB connection string in a `.env` file.
- Create Mongoose Schemas for:
  - **User** (Admin/Member roles, name, email, hashed password).
  - **Project** (Title, description, owner, members, timeline).
  - **Task** (Title, status [To Do, In Progress, Done], assignee, project ID, deadline).

### Phase 2: Authentication API (Backend)
- Implement `POST /api/auth/login` and `POST /api/auth/register` controllers.
- Setup JWT (JSON Web Tokens) or session cookies for secure, stateless sessions.
- Coordinate the backend token distribution with the frontend's `AuthProvider`.

### Phase 3: Core CRUD APIs (Backend)
- **Projects API:** Enable Admins to create/delete projects and Members to view their assigned project lists.
- **Tasks API:** Build logic to fetch tasks by project, fetch tasks by user (for `/my-tasks`), and allow status updates (Kanban drag-and-drop backend sync).
- **Users API:** Enable viewing team members (Admin-only view `/team`) and fetching valid assignees.

### Phase 4: Frontend API Integration
- Update `PMSProvider` to fetch data from the newly created backend routes.
- Replace any hardcoded or mocked frontend data with live network data.
- Introduce loading states, success toasts, and error boundaries for smooth user experience.

### Phase 5: Polish & Deployment
- Set up global error handling mechanisms on Express.
- Prepare production build pipeline for React (`npm run build`).
- Deploy frontend (e.g., Vercel, Netlify) and backend (e.g., Render, Railway) matched with MongoDB Atlas.
