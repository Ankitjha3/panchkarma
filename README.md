# 🌿 Panchakarma Management Software

> Modernizing Panchakarma Care Through Intelligent Therapy Management

A comprehensive, production-ready web application for Ayurveda clinics to manage Panchakarma therapies, automate scheduling, track patient progress, and streamline practitioner workflows.

---

## 🖥️ Tech Stack

- **Frontend:** HTML, CSS (Vanilla), JavaScript
- **Backend:** Firebase Authentication & Firestore (integration-ready)
- **Deployment:** Vercel / Netlify compatible (static files)

## 🚀 Quick Start

```bash
# Serve locally
npx serve .

# Or use any static file server
python -m http.server 3000
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔐 Demo Accounts

| Role         | Email                    | Password     |
|--------------|--------------------------|--------------|
| Patient      | patient@demo.com         | password123  |
| Practitioner | practitioner@demo.com    | password123  |
| Admin        | admin@demo.com           | password123  |

> Any email with 6+ character password also works in demo mode.

## 📁 Project Structure

```
├── index.html                    # Landing page
├── login.html                    # Login page
├── signup.html                   # Signup with role selection
├── patient-dashboard.html        # Patient dashboard
├── practitioner-dashboard.html   # Practitioner dashboard
├── admin-dashboard.html          # Admin dashboard
├── css/
│   ├── design-system.css         # Design tokens & utilities
│   ├── landing.css               # Landing page styles
│   ├── auth.css                  # Auth page styles
│   └── dashboard.css             # Dashboard styles
├── js/
│   ├── firebase-config.js        # Firebase config + demo mode
│   ├── auth.js                   # Authentication logic
│   ├── landing.js                # Landing page interactions
│   └── components.js             # Shared UI components
└── assets/images/                # Static images
```

## 🎨 Design System

**Color Palette:**
- Cream: `#F8F5F0`
- Herbal Green: `#4F7C59`
- Light Sage: `#DDE8D5`
- Warm Brown: `#8B6B4A`
- Text Dark: `#2B2B2B`

**Typography:** Manrope (primary), Inter (secondary)

## ✨ Features

### Landing Page
- Hero with stats & floating cards
- Features, Benefits, Process sections
- Testimonials & FAQ accordion
- Responsive mobile navigation

### Patient Dashboard
- Session tracking & calendar
- Recovery progress bars
- Therapy timeline
- Feedback submission (mood, symptoms, improvements)
- Wellness score chart

### Practitioner Dashboard
- Daily schedule with status badges
- Patient management table
- Real-time feedback review
- Quick actions (schedule, add patient, modify plan)
- Session analytics

### Admin Dashboard
- Clinic-wide analytics
- Practitioner performance table
- Therapy type distribution
- User registration monitoring
- System notifications

## 🔥 Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password + Google)
3. Enable **Cloud Firestore**
4. Update `js/firebase-config.js` with your credentials
5. Add Firebase SDK scripts to HTML pages

### Suggested Firestore Collections

```
users/           → { uid, name, email, role, createdAt }
therapies/       → { name, type, duration, description }
appointments/    → { patientId, practitionerId, therapyId, date, status }
schedules/       → { therapyId, sessions[], startDate, endDate }
feedback/        → { appointmentId, patientId, mood, symptoms, improvements }
notifications/   → { userId, message, type, read, createdAt }
```

## 📱 Responsive

Fully responsive across all device sizes (desktop, tablet, mobile) with collapsible sidebar and mobile navigation overlay.

## 📄 License

MIT — Free for personal and commercial use.
