<<<<<<< HEAD
=======

>>>>>>> 2e8cb3c51fc3f19231e5d9a137207c69febde997
# Asistent Empatic (Mental Wellness Platform)

A comprehensive mental health management system built with Node.js API and React frontend, designed to help users track their emotions, access resources, and improve their well-being through gamification.

## 🎯 Project Overview

This system provides a unified interface for personal mental wellness management. It combines journaling, mood tracking, and resource discovery into a secure environment. The platform uses a MySQL database to store user history, preferences, and progress, offering a personalized experience for every user.

## 🏗️ Architecture

* **Backend:** Node.js + Express with REST API architecture
* **Frontend:** React + Tailwind CSS application
* **Database:** MySQL with relational structure
* **Authentication:** Custom JWT/Session implementation with bcrypt encryption
* **External APIs:** Google Books API integration for resource discovery

## 🧩 Application Modules

| Module Name | Description | Key Features |
| :--- | :--- | :--- |
| **Dashboard** | `HomePage.jsx` | Daily quotes, Dynamic resource carousel, Welcome screen |
| **Journal** | `JournalPage.jsx` | 5-scale mood tracking, Gratitude log, Tagging system |
| **Discover** | `DiscoverPage.jsx` | Book search (Google API), Psychologist finder, Media resources |
| **Profile** | `ProfilePage.jsx` | Gamification (XP/Levels), Statistics charts, Avatar upload |
| **Auth** | `LandingPage.jsx` | Secure Login/Register, Session persistence |

## 🚀 Quick Start

### Prerequisites

* Node.js 18+
* MySQL Server (XAMPP/WAMP or Standalone)
* npm or yarn

### Database Setup

1.  Open your MySQL client (e.g., phpMyAdmin).
2.  Create a new database named `asistent_empatic`.
3.  The application will automatically create the required tables (`users`, `moods`) on the first run.

### Backend Setup (Node.js API)

```bash
cd server
npm install
# Configure your DB credentials in index.js if not using default root/empty
node index.js

```

The API will be available at `http://localhost:3000`

### Frontend Setup (React)

```bash
# In the root directory (or frontend folder)
npm install
npm run dev

```

The frontend will be available at `http://localhost:5173`

## 📚 Key Features

* **Mood Tracking:** Log daily emotions with detailed notes and activity tags.
* **Gamification System:** Earn XP, level up, and unlock badges (e.g., "Zen Master") by maintaining journaling streaks.
* **Smart Resources:** Dynamic recommendations for books, music, and videos based on daily themes.
* **Data Visualization:** Interactive charts displaying emotional history and progress.
* **Persistent Profile:** Avatar upload with Base64 storage and persistent login state.
* **Secure & Private:** Password hashing and secure database storage.
* **Responsive Design:** Fully optimized for desktop and mobile devices.

## 🔗 External Integrations

* **Google Books API:** Real-time book search and details.
* **Google Maps:** Contextual search for local psychologists.
* **Lucide React:** Modern and consistent iconography.

## 🛠️ Development Commands

### Backend

```bash
# Install dependencies
npm install

# Run server (Standard)
node index.js

# Run server (Watch mode - optional if nodemon installed)
npx nodemon index.js

```

### Frontend

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Linting
npm run lint

```

## 🔧 Environment Configuration

The project is pre-configured for local development using:

* **API Port:** 3000
* **Frontend Port:** 5173
* **DB Host:** localhost
* **DB User:** root

To change these, modify `server/index.js` and the fetch calls in `src/`.

## 📝 License

This project is licensed for educational purposes.

## 🏫 About Project

**Asistent Empatic** is a project developed to demonstrate Full Stack capabilities using the SERN stack (SQL, Express, React, Node). It focuses on creating a user-centric application with real-world utility in mental health awareness.
<<<<<<< HEAD
=======
>>>>>>> 38bc4a6b81e38c7af10e71142bdaf7e829c727eb
>>>>>>> 2e8cb3c51fc3f19231e5d9a137207c69febde997
