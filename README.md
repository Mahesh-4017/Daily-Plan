# 📋 Daily Plan — Daily Planner & Productivity Analytics

> A sleek, minimalist daily planner and real-time productivity analytics dashboard built with **Next.js 16 (Turbopack)**, **TypeScript**, **Firebase Firestore**, and **Chart.js**.

![License](https://img.shields.io/badge/license-MIT-indigo)
![Next.js](https://img.shields.io/badge/Next.js-16.4.3-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)
![Firebase](https://img.shields.io/badge/Firebase-Firestore-amber?logo=firebase)
![Chart.js](https://img.shields.io/badge/Chart.js-React_Chartjs_2-indigo)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8?logo=tailwindcss)

---

## ✨ Features

### 📅 Daily Planner View
- **Day-by-Day Scheduling**: Effortlessly navigate through previous and future days with quick date shifting or the calendar picker.
- **Real-Time Firebase Sync**: Add, edit, check off, and delete tasks with instant cloud sync via Firebase Firestore `onSnapshot` listeners.
- **Task Organization**: Categorize plans by Work, Personal, Study, Health, Finance, or General with scheduled times.
- **Progress Tracking**: Real-time completion counter and percentage indicator on daily tasks.

### 📊 Real-Time Analytics Dashboard
- **Dynamic Time-Range Filtering**: Switch effortlessly between:
  - **7d (Week)** — 7 continuous calendar days with day-of-week labels (`Mon`, `Tue`, `Wed`...).
  - **14d** — 14-day workload comparison.
  - **30d (Month)** — 30-day comprehensive trend view.
  - **Year (12m)** — Month-by-month aggregation (Jan through Dec).
  - **Custom Days** — Enter any custom number of days to inspect.
- **Workload Bar Chart**: Completed vs. pending task distribution over the selected timeline.
- **Completion Rate Trend**: Smooth spline curve visualizing daily performance percentage.
- **Category Breakdown**: Interactive Doughnut chart with clean breakdown of tasks by category.
- **Weekly Activity Rhythm**: Monday through Sunday activity consistency bars highlighting your peak productive day.
- **Time of Day Schedule**: Visual breakdown of tasks scheduled during Morning (06–12), Afternoon (12–17), Evening (17–21), and Night (21–06).

### 👤 Profile & Authentication
- **Anonymous Authentication**: Sign in with **Name**, **Username**, and **Password** using Firebase Auth.
- **Persistent Sessions**: Sessions automatically persist via `localStorage` across page reloads.
- **Custom Header Profile**: Displays personalized greeting (`Hi, <Name>`), `@<username>`, and quick logout control.

### 🎨 Design System
- **Curated 3-Color Palette**: Crafted strictly in **Black**, **White**, and **Indigo-600** (`#4f46e5`).
- **Balanced 3-Zone Header**: Dead-center floating navigation pills, left-side user greeting & date, and right-side live clock with primary CTA.
- **Ultra-Responsive**: Seamless experience from mobile phones to high-resolution desktop monitors.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Backend / Database**: [Firebase Firestore](https://firebase.google.com/) (Real-time DB)
- **Authentication**: Firebase Auth (Anonymous & Display Profile)
- **Charts**: [Chart.js](https://www.chartjs.org/) & [react-chartjs-2](https://react-chartjs-2.js.org/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Mahesh-4017/Daily-Plan.git
cd Daily-Plan/my-next-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Firebase
Create a `.env.local` file in the project root (optional if using defaults):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### 4. Run the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to launch the application.

---

## 📁 Project Structure

```text
my-next-app/
├── app/
│   ├── layout.tsx         # Global layout with SEO metadata & dark mode
│   ├── page.tsx           # Main application view orchestrator
│   └── globals.css        # Tailwind styles & theme variables
├── components/
│   ├── Header.tsx         # Balanced 3-zone header with user profile & clock
│   ├── DateSelector.tsx   # Date navigation with day shift and today reset
│   ├── TodoList.tsx       # Interactive task list with filters (All, Pending, Done)
│   ├── TodoFormModal.tsx  # Modal form to add/edit daily plans
│   ├── AnalyticsDashboard.tsx # Comprehensive Chart.js visualizations & habit rhythms
│   └── AuthModal.tsx      # Anonymous sign-in with Name, Username & Password
├── lib/
│   ├── firebase.ts        # Firebase app, auth, and firestore initialization
│   └── firestore-todos.ts # Firestore real-time subscriptions and CRUD operations
├── types/
│   └── todo.ts            # TypeScript interfaces and data models
└── package.json           # Dependencies and scripts
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
