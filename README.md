# 🏥 MediConnect — Smart Hospital Management System

> A full-stack hospital management system built with React + Spring Boot + MySQL

![Status](https://img.shields.io/badge/Status-In%20Development-cyan)
![Backend](https://img.shields.io/badge/Backend-Spring%20Boot-green)
![Frontend](https://img.shields.io/badge/Frontend-React-blue)
![Database](https://img.shields.io/badge/Database-MySQL-orange)

## 🚧 Development Progress
- [x] Week 1 — Foundation & Backend API ← **Current**
- [ ] Week 2 — Frontend (React + Tailwind)
- [ ] Week 3 — Advanced Features
- [ ] Week 4 — Polish & Deploy

## ✨ Features
- 👤 Patient registration and management
- 👨‍⚕️ Doctor profiles and scheduling
- 📅 Appointment booking with conflict detection
- 🔐 Role-based auth (Admin / Doctor / Patient)
- 📋 Medical records management
- 🔔 Real-time notifications
- 📊 Admin analytics dashboard

## 🛠️ Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React, Tailwind CSS |
| Backend | Spring Boot, Java 17 |
| Database | MySQL |
| Auth | Firebase + JWT |
| Deploy | Vercel + Railway |

## 🚀 Getting Started

### Backend
```bash
# 1. Clone the repo
git clone https://github.com/mesanda456/mediconnect.git

# 2. Set up database
mysql -u root -p < database/schema.sql

# 3. Configure application.properties
# Set your MySQL password

# 4. Run
mvn spring-boot:run
```

Backend runs at: `http://localhost:8080`

## 📡 API Endpoints

GET    /api/patients          → All patients
POST   /api/patients          → Create patient
GET    /api/doctors/available → Available doctors
POST   /api/appointments      → Book appointment

## 👤 Author
**Mesanda Sethumika** — Full Stack Developer
- GitHub: [@mesanda456](https://github.com/mesanda456)

---
*Part of my 30-day GitHub streak challenge 🔥*
