# 🏥 MediConnect — Smart Hospital Management System

> A full-stack hospital management system built with React + Spring Boot + MySQL, featuring AI-powered symptom analysis and a live patient queue.

![Status](https://img.shields.io/badge/Status-Live-brightgreen)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-green)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-MySQL-orange)
![AI](https://img.shields.io/badge/AI-Gemini-purple)

🌐 **Live Demo:** [mediconnect-mesanda456.vercel.app](https://mediconnect-mesanda456.vercel.app)

> **Demo Credentials:**
> - Email: `admin@mediconnect.com`
> - Password: `admin123`

---

## ✨ Features

### 🏠 Dashboard
- Real-time stats — patients, doctors, appointments, medical records
- Monthly appointment chart (last 6 months)
- Appointment status breakdown (pie chart)
- Today's schedule + recent activity feed

### 👤 Patient Management
- Full CRUD — add, edit, delete patients
- Search & filter by gender / blood group
- PDF export

### 👨‍⚕️ Doctor Management
- Full CRUD — add, edit, delete doctors
- Filter by specialty & availability
- PDF export

### 📅 Appointments
- Book appointments with patient + doctor selection
- Visual calendar view with color-coded status dots
- Confirm / Complete / Cancel actions
- Filter by status (Pending, Confirmed, Completed, Cancelled)

### 📋 Medical Records
- Full CRUD for medical records
- File attachments — PDF and image uploads
- Search & filter by patient

### 🤖 AI Symptom Analyzer *(Unique Feature)*
- Powered by Google Gemini AI
- Enter patient symptoms → get instant AI medical analysis
- Returns possible diagnoses with probability levels
- Severity assessment, recommended tests, immediate actions
- Save analysis directly to medical records

### 🎫 Live Token Queue System *(Unique Feature)*
- Real-time patient queue generated from today's appointments
- Admin control panel — call next, mark done, skip, reset
- Dedicated live display screen for waiting room TVs/monitors
- Auto-refreshes every 5 seconds, no page reload needed
- Per-doctor queues with token numbers

### 🔔 Smart Notifications
- Bell icon with live count badge
- Shows today's and tomorrow's upcoming appointments
- Auto-refreshes every minute

### ⚙️ Profile & Settings
- Update admin name, email, and profile photo
- Change password with strength indicator
- Dark mode toggle
- Secure sign out

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS v4 |
| UI Components | lucide-react, recharts |
| Backend | Spring Boot 3, Java 17 |
| Database | MySQL 8 |
| AI | Google Gemini 2.0 Flash |
| Auth | JWT (demo) |
| Deployment | Vercel (frontend) + Railway (backend) |

---

## 🚀 Getting Started

### Prerequisites
- Java 17+
- Node.js 18+
- MySQL 8+

### Backend Setup

```bash
# 1. Clone the repo
git clone https://github.com/mesanda456/mediconnect.git
cd mediconnect

# 2. Set up database
mysql -u root -p < database/schema.sql

# 3. Configure application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/mediconnect_db
spring.datasource.username=root
spring.datasource.password=YOUR_PASSWORD
gemini.api.key=YOUR_GEMINI_API_KEY

# 4. Run with IntelliJ IDEA or:
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## 📡 API Endpoints

### Auth
```
POST   /api/auth/login           → Login
PUT    /api/auth/profile         → Update profile
PUT    /api/auth/change-password → Change password
```

### Patients
```
GET    /api/patients             → All patients
POST   /api/patients             → Create patient
PUT    /api/patients/{id}        → Update patient
DELETE /api/patients/{id}        → Delete patient
```

### Doctors
```
GET    /api/doctors              → All doctors
POST   /api/doctors              → Create doctor
PUT    /api/doctors/{id}         → Update doctor
DELETE /api/doctors/{id}         → Delete doctor
```

### Appointments
```
GET    /api/appointments         → All appointments
POST   /api/appointments         → Book appointment
PATCH  /api/appointments/{id}/status  → Update status
PATCH  /api/appointments/{id}/cancel  → Cancel
```

### Medical Records
```
GET    /api/medical-records      → All records
POST   /api/medical-records      → Create record (multipart)
DELETE /api/medical-records/{id} → Delete record
```

### AI
```
POST   /api/ai/analyze           → Analyze symptoms with Gemini AI
```

### Queue
```
GET    /api/queue/today                  → Today's full queue
GET    /api/queue/today/doctor/{id}      → Today's queue for a doctor
POST   /api/queue/generate               → Generate queue from today's appointments
POST   /api/queue/next                   → Call next patient
POST   /api/queue/{id}/complete          → Mark patient as done
POST   /api/queue/{id}/skip              → Skip patient
DELETE /api/queue/reset                  → Reset doctor's queue
```

---

## 📁 Project Structure

```
mediconnect/
├── frontend/                  ← React app (Vite + Tailwind)
│   └── src/
│       ├── pages/             ← Dashboard, Patients, Doctors, Appointments,
│       │                         MedicalRecords, Settings, AISymptomAnalyzer,
│       │                         QueueManager, QueueDisplay
│       ├── components/        ← Navbar, ProtectedRoute
│       ├── context/           ← AuthContext
│       └── api/               ← axios config
├── src/                       ← Spring Boot backend
│   └── main/java/com/mediconnect/
│       ├── controller/        ← REST controllers
│       ├── model/             ← JPA entities
│       ├── repository/        ← Spring Data repositories
│       └── config/            ← Security + CORS config
└── database/
    └── schema.sql
```

---

## 🔥 GitHub Streak

This project is built as part of a daily GitHub streak challenge — committing every single day with meaningful features and improvements.

---

## 👤 Author

**Mesanda Sethumika** — Full Stack Developer
- GitHub: [@mesanda456](https://github.com/mesanda456)
- Project: [mediconnect-mesanda456.vercel.app](https://mediconnect-mesanda456.vercel.app)

---

*Built with ❤️ as a daily GitHub streak project 🔥*