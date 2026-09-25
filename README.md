# 🏫 College Service Request System

<p align="center">
  <img src="docs/images/banner.png" alt="College Service Request System" width="850"/>
</p>

<p align="center">
  A centralized digital platform for managing college service requests efficiently.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React.js-blue" alt="React"/>
  <img src="https://img.shields.io/badge/Backend-FastAPI-green" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Language-Python-yellow" alt="Python"/>
</p>

---

## 📌 About the Project

The **College Service Request System** is a full-stack web application designed to digitize and simplify the process of requesting and managing college services.

Students and faculty can raise service requests through a centralized platform, while service staff and administrators can manage, assign, process, and monitor those requests.

The system reduces dependency on manual processes and provides a structured way to track requests from submission to completion.

---

## 🎯 Objectives

* Digitize college service requests
* Reduce manual paperwork and processing
* Provide transparent request tracking
* Improve communication between requesters and service staff
* Centralize service request management
* Provide role-based access to different users

---

## ✨ Key Features

### 👨‍🎓 Student & Faculty

* Secure registration and login
* Submit service requests
* Select required service
* Add request details
* Track request status
* View request history

### 🧑‍💼 Service Staff

* View assigned requests
* Review request details
* Update request status
* Process service requests
* Track pending and completed requests

### 👨‍💻 Department / Service Lead

* Monitor service requests
* Assign requests to staff
* Reassign requests when required
* Monitor service progress

### ⚙️ Admin

* Manage users
* Manage services
* Manage departments
* Monitor system activity
* Configure system settings

---

## 🔄 Request Workflow

```text
┌─────────────────────┐
│   Student / Faculty │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Create Service      │
│ Request              │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Service Office       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Assign Staff         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Process Request      │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update Status        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Request Completed    │
└─────────────────────┘
```

---

## 🛠️ Technology Stack

| Technology         | Purpose              |
| ------------------ | -------------------- |
| ⚛️ React.js        | Frontend             |
| 🐍 Python          | Backend programming  |
| ⚡ FastAPI          | REST API development |
| 🍃 MongoDB         | Database             |
| 🎨 Bootstrap / CSS | UI styling           |
| 📮 Postman         | API testing          |
| 🔧 Git & GitHub    | Version control      |

---

## 📂 Services Supported

The system can manage different college services such as:

* 📄 Bonafide Certificate
* 🪪 ID Card
* 🏠 Hostel Services
* 🚌 Transport
* 📚 Library
* 💻 IT Support
* 🏢 Other College Services

---

## 🖥️ Application Screenshots

### 🔐 Login

<p align="center">
  <img src="docs/images/login.png" alt="Login Page" width="800"/>
</p>

### 📊 Dashboard

<p align="center">
  <img src="docs/images/dashboard.png" alt="Dashboard" width="800"/>
</p>

### 📝 Service Request

<p align="center">
  <img src="docs/images/service-request.png" alt="Service Request Page" width="800"/>
</p>

### 👨‍💼 Staff Dashboard

<p align="center">
  <img src="docs/images/staff-dashboard.png" alt="Staff Dashboard" width="800"/>
</p>

> Add your actual screenshots inside `docs/images/` using these filenames.

---

## 📁 Project Structure

```text
college-service-request-system/
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── ...
│
├── docs/
│   └── images/
│       ├── banner.png
│       ├── login.png
│       ├── dashboard.png
│       ├── service-request.png
│       └── staff-dashboard.png
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone YOUR_REPOSITORY_URL
cd college-service-request-system
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup

Open another terminal:

```bash
cd backend
```

Create a virtual environment:

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

Run the backend:

```powershell
uvicorn main:app --reload
```

---

## 🔗 API Documentation

Once the FastAPI server is running:

```text
http://127.0.0.1:8000/docs
```

FastAPI's interactive Swagger documentation can be used to test the available APIs.

---

## 🔐 Role-Based Access

The application provides different access levels based on the user's role:

```text
Student / Faculty
        │
        ▼
Submit & Track Requests
        │
        ▼
Service Staff
        │
        ▼
Process & Update Requests
        │
        ▼
Service Lead / Admin
        │
        ▼
Monitor & Manage System
```

---

## 📈 Future Enhancements

* 🔔 Real-time notifications
* 📧 Email notifications
* 📎 Document upload support
* 📊 Advanced service analytics
* ⭐ Service feedback and ratings
* 📑 Automated reports
* 📱 Improved mobile responsiveness

---

## 🎓 Academic Project

**College Service Request System**

Developed as a full-stack academic project to demonstrate the practical implementation of:

* Frontend development
* Backend API development
* Database management
* Authentication
* CRUD operations
* Role-based access control
* Full-stack application architecture

---

<p align="center">
  <b>College Service Request System</b><br>
  Simplifying College Services Through Digital Management
</p>
