# 🏫 Gramin Shiksha — Automated Attendance System

> An AI-powered automated attendance system for rural schools 
> using Facial Recognition and QR Code scanning, built during 
> Smart India Hackathon 2025.


---

## 📌 Problem Statement

Rural schools in India face major challenges with manual attendance:

- ⏰ Time-consuming roll calls waste **15-20 minutes** of daily teaching time
- 📝 Inaccurate records affect government scheme eligibility (Mid-Day Meal)
- 📶 Poor internet connectivity makes cloud-only solutions impractical
- 📊 No real-time visibility for school administrators

**Problem Statement ID:** 25012  
**Organisation:** Government of Punjab  
**Theme:** Smart Schools, Bright Future  

---

## ✅ Our Solution

**Gramin Shiksha** automates the entire attendance process using:

- 👁️ **Facial Recognition** — AI-powered face detection with liveness check
- 📷 **QR Code Scanning** — Fast and reliable backup method
- 📊 **Real-time Dashboard** — Live attendance tracking for admins
- 🌐 **Offline-first Architecture** — Works without internet connectivity

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 👁️ Face Recognition | Detects and matches student faces automatically |
| 🔒 Liveness Detection | Student must blink 2x to prevent photo spoofing |
| 📷 QR Code Scanner | Scans student QR codes to mark attendance |
| ⚠️ Duplicate Prevention | One attendance entry per student per day |
| 📊 Admin Dashboard | Real-time stats — present, absent, percentage |
| 🗄️ Cloud Database | Supabase PostgreSQL for reliable data storage |
| 🔄 Auto Refresh | Dashboard updates with latest attendance data |

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| Frontend | React.js |
| Database | Supabase (PostgreSQL) |
| AI / ML | face-api.js, TensorFlow.js |
| QR Code | html5-qrcode |
| Camera | react-webcam |
| Routing | React Router DOM |


---

## 📸 Screenshots

### 🔐 Login Screen
![Login](screenshots/login.png)

### 📊 Admin Dashboard
![Dashboard](screenshots/dashboard.png)

### 📷 QR Code Scanner
![QR Scanner](screenshots/qr.png)

### 👁️ Face Recognition
![Face Recognition](screenshots/face.png)

---

## ⚙️ Local Setup

### Prerequisites
- Node.js installed
- Supabase account
- Git installed

### Installation


## 🗄️ Database Setup

Run this in your Supabase SQL Editor:

```sql
-- Create Students Table
CREATE TABLE students (
  id          bigint generated always as identity primary key,
  student_id  text unique not null,
  name        text not null,
  class       text not null,
  photo_url   text,
  created_at  timestamp default now()
);

-- Create Attendance Table
CREATE TABLE attendance (
  id          bigint generated always as identity primary key,
  student_id  text not null,
  name        text not null,
  class       text not null,
  date        date not null,
  status      text not null,
  created_at  timestamp default now()
);

-- Disable RLS for development
ALTER TABLE students  DISABLE ROW LEVEL SECURITY;
ALTER TABLE attendance DISABLE ROW LEVEL SECURITY;

-- Grant permissions
GRANT ALL ON students   TO anon;
GRANT ALL ON attendance TO anon;

-- Add sample students
INSERT INTO students (student_id, name, class)
VALUES
('S001', 'Anjali Kumari', '5A'),
('S002', 'Priya Singh',   '5B'),
('S003', 'Amit Sharma',   '6A'),
('S004', 'Sneha Verma',   '6B'),
('S005', 'Rohit Yadav',   '7A');
```

---


