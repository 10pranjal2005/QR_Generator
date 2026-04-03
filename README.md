# QR Message Generator Web Application

A **serverless QR-based personalized message delivery platform** built using Firebase services that allows authenticated users to generate dynamic greeting messages and distribute them instantly through scannable QR codes.

Recipients can access messages **without authentication**, making the system suitable for digital greeting cards, event invitations, announcements, and lightweight secure sharing workflows.

Live Application
https://qr-message-app.web.app

---

# Project Description

The QR Message Generator is a **cloud-hosted web application** that enables users to create personalized messages and distribute them via dynamically generated QR codes.

Each QR code embeds a unique Firestore document identifier that maps directly to stored message content, ensuring:

* message isolation
* zero collision risk
* scalable architecture
* stateless retrieval
* global accessibility

The system uses **Firebase Authentication + Firestore + Hosting**, eliminating the need for traditional backend infrastructure.

---

# Core Functional Capabilities

## Authentication System

Implemented using Firebase Authentication

Supports:

* email/password signup
* secure login sessions
* authenticated dashboard access
* logout functionality
* session persistence across refresh

Access Control Model:

| User Type | Permission        |
| --------- | ----------------- |
| User1     | create messages   |
| User1     | generate QR codes |
| User1     | download QR       |
| User1     | print QR          |
| User2     | view message only |
| User2     | no login required |

---

# Dynamic QR Message Generation Engine

Each generated message follows the structure:

Opening Greeting
Main Message Content
Closing Signature

Example:

Hi Rahul
Hope you're doing great!
From Pranjal

When QR is generated:

```
message.html?id=<FirestoreDocumentID>
```

is embedded inside the QR payload.

Example:

```
message.html?id=7sjK92LmQaX
```

This ensures message uniqueness and retrieval accuracy.

---

# Firestore Database Design

Collection:

```
messages
```

Document Structure:

```
messages/
    documentID
        opening
        message
        closing
```

Example Entry:

```
opening: Hi Rahul
message: Hope you're doing great!
closing: From Pranjal
```

Firestore automatically generates:

```
unique document ID
```

which acts as the routing key.

---

# System Architecture

Architecture Type:

Serverless Web Application

```
User Login
    ↓
Dashboard Access
    ↓
Message Creation
    ↓
Firestore Storage
    ↓
Unique Document ID Generated
    ↓
QR Code Created
    ↓
Recipient Scans QR
    ↓
message.html loads
    ↓
Firestore fetch executes
    ↓
Message displayed instantly
```

---

# Hosting Infrastructure

Deployed using Firebase Hosting

Production URL:

https://qr-message-app.web.app

Hosting Features:

* HTTPS enabled
* global CDN delivery
* low latency access
* instant deployment updates
* static asset optimization

---

# QR Code Generation Mechanism

Library Used:

QRCode.js (CDN version)

Workflow:

```
Generate message
↓
Store in Firestore
↓
Retrieve document ID
↓
Construct dynamic URL
↓
Embed URL into QR image
```

QR Payload Example:

```
https://qr-message-app.web.app/message.html?id=abc123
```

Scanning QR triggers real-time Firestore fetch.

---

# Deployment Pipeline

Deployment Tool:

Firebase CLI

Command Used:

```
firebase deploy --only hosting
```

Deployment Steps:

```
Modify local project files
↓
Save changes
↓
Run deploy command
↓
Firebase CDN updates site globally
```

---

# Folder Structure

```
QR_Generator/
│
├── index.html
├── signup.html
├── dashboard.html
├── message.html
├── script.js
├── firebase.js
│
├── css/
│   └── style.css
│
├── firebase.json
├── .firebaserc
└── README.md
```

---

# Technology Stack

Frontend Layer

HTML5
CSS3
JavaScript (ES Modules)

Backend Layer (Serverless)

Firebase Authentication
Cloud Firestore Database
Firebase Hosting

Libraries

QRCode.js

---

# Authentication Flow

```
Signup
↓
Account stored in Firebase Auth
↓
Login
↓
Session established
↓
Dashboard access granted
```

Non-authenticated users cannot access dashboard routes.

---

# Message Retrieval Flow

```
QR scanned
↓
message.html?id=DOCUMENT_ID loads
↓
Firestore query executes
↓
Matching document retrieved
↓
Greeting card rendered
```

---

# Security Model

Security handled through Firebase architecture:

Authentication protects:

```
dashboard.html
message generation
QR creation
```

Public message viewing allowed intentionally for sharing workflow.

Firestore Document Isolation ensures:

```
unique message mapping
zero overlap between users
stateless retrieval
```

---

# Mobile Compatibility

Application supports:

Android browsers
iOS Safari
Chrome mobile
QR camera scanners

Responsive UI implemented using:

```
max-width containers
centered layout
adaptive font scaling
```

---

# Performance Optimization Strategy

Serverless architecture provides:

* zero backend latency management
* automatic scaling
* CDN asset caching
* asynchronous Firestore reads
* lightweight frontend execution

---

# Current Limitations

Current version supports:

Text-based greeting messages only

Does not yet include:

image upload
video embedding
QR analytics tracking
message expiration timers

---

# Planned Enhancements

Upcoming feature roadmap:

Image attachment support
Video message embedding
Theme-based greeting templates
Download greeting card as PDF
Message history dashboard
Dark mode interface
Custom QR styling
Usage analytics integration

---

# Development Workflow

Local Testing:

```
VS Code Live Server
```

Production Deployment:

```
firebase deploy
```

Version Control:

Git + GitHub

---

# Live Application Access

Production URL

https://qr-message-app.web.app

---

# Author

Pranjal Kundu

GitHub

https://github.com/10pranjal2005

---

# Repository Link

https://github.com/10pranjal2005/QR_Generator

---

# License

This project is developed for educational, experimental, and portfolio demonstration purposes.
