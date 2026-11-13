# QuizCloud — Serverless Online Quiz System

A modern, serverless online quiz platform where **students** take quizzes and **admins** create and manage them. The frontend is built with React + TypeScript, and the backend runs entirely on AWS (API Gateway + Lambda + DynamoDB) — no servers to manage.

---

## Table of Contents

- [Quick Start](#quick-start)
- [What This Project Does](#what-this-project-does)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Demo Login Accounts](#demo-login-accounts)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Backend & API](#backend--api)
- [Troubleshooting](#troubleshooting)

---

## Quick Start

Get it running in 4 steps:

```bash
# 1. Install dependencies
npm install

# 2. Create your environment file
#    (Windows PowerShell)
Copy-Item .env.example .env.local
#    (macOS / Linux)
# cp .env.example .env.local

# 3. Open .env.local and paste your API Gateway URL into VITE_API_BASE_URL

# 4. Start the app
npm run dev
```

Then open the URL shown in the terminal (usually **http://localhost:5173**).

---

## What This Project Does

QuizCloud has two types of users:

| Role        | What they can do                                                                 |
| ----------- | -------------------------------------------------------------------------------- |
| **Student** | Browse published quizzes, take a quiz with a timer, and view their past results  |
| **Admin**   | Create / edit / delete quizzes, publish them, and review all students' results   |

Quizzes and results are stored in **Amazon DynamoDB**, and all scoring is calculated securely on the **AWS Lambda** backend (the browser never sees the correct answers).

---

## Features

**For Students**
- Clean dashboard with stats (available, completed, average score)
- Take quizzes with a live countdown timer
- Instant results with a detailed answer breakdown
- Personal result history

**For Admins**
- Dashboard with quiz and attempt statistics
- Create and edit quizzes with multiple-choice questions
- Publish / unpublish quizzes
- View all student attempts and scores

**Under the Hood**
- 100% serverless — scales automatically, pay only for what you use
- Correct answers are stripped from API responses and graded on the server
- Consistent, reusable UI component library (buttons, cards, modals, tables, etc.)

---

## Tech Stack

| Layer          | Technology                                          |
| -------------- | --------------------------------------------------- |
| Frontend       | React 18, TypeScript, Vite 5                        |
| Routing        | React Router v6                                     |
| Styling        | Tailwind CSS 3                                      |
| Icons          | lucide-react                                        |
| Backend        | AWS Lambda (Node.js, ESM)                           |
| API            | Amazon API Gateway (HTTP API)                       |
| Database       | Amazon DynamoDB                                     |

---

## Demo Login Accounts

The login is currently mocked for demonstration. Use either account below:

| Role    | Email                     | Password       |
| ------- | ------------------------- | -------------- |
| Student | `student@university.edu`  | `password123`  |
| Admin   | `admin@university.edu`    | `password123`  |

> These credentials are hard-coded in the frontend for demo purposes only.

---

## Environment Variables

Create a `.env.local` file in the project root (copy it from `.env.example`). It needs **one** variable:

| Variable            | Description                                                                 | Example                                                     |
| ------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------- |
| `VITE_API_BASE_URL` | The invoke URL of your Amazon API Gateway, **without** a trailing slash.     | `https://xxxxxxxxxx.execute-api.eu-north-1.amazonaws.com`   |

Find this value in the AWS Console under **API Gateway → your API → Invoke URL**.

> `.env.local` is git-ignored and will never be committed — keep your real values there.

---

## Available Scripts

Run these from the project root:

| Command           | What it does                                              |
| ----------------- | --------------------------------------------------------- |
| `npm run dev`     | Starts the development server with hot reload             |
| `npm run build`   | Type-checks and builds the production files into `dist/`  |
| `npm run preview` | Serves the production build locally for a final check     |

---

## Project Structure

```text
Serverless Online Quiz System/
├── lambda/
│   └── index.mjs            # AWS Lambda backend (quizzes + results, DynamoDB)
├── src/
│   ├── components/          # Reusable UI building blocks
│   ├── context/             # AuthContext (login state)
│   ├── data/                # Sample/mock data
│   ├── pages/
│   │   ├── admin/           # Admin screens (dashboard, quizzes, results, profile)
│   │   ├── student/         # Student screens (dashboard, quizzes, results, profile)
│   │   ├── LoginPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── services/
│   │   └── api.ts           # All communication with the AWS backend
│   ├── types/               # Shared TypeScript types
│   ├── utils/               # Helper functions
│   ├── App.tsx              # Routes
│   └── main.tsx             # App entry point
├── .env.example             # Template for environment variables
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Backend & API

The backend is a single Lambda function: [`lambda/index.mjs`](lambda/index.mjs). It talks to two DynamoDB tables:

| Table                 | Purpose                     |
| --------------------- | --------------------------- |
| `QuizApp_Quizzes-Cloud` | Stores quizzes and questions |
| `QuizApp_Results`       | Stores student results       |

**API endpoints**

| Method   | Path             | Description                        |
| -------- | ---------------- | ---------------------------------- |
| `GET`    | `/quizzes`       | List all quizzes (answers hidden)  |
| `POST`   | `/quizzes`       | Create or update a quiz            |
| `DELETE` | `/quizzes/{id}`  | Delete a quiz                      |
| `GET`    | `/results`       | List all student results           |
| `POST`   | `/results`       | Submit a quiz attempt (graded here)|

**Security notes**
- `GET /quizzes` never returns `correctAnswer` / `correctOption`.
- `POST /results` re-grades the attempt on the server using the official answers, so scores can't be tampered with.
- Deleting a quiz removes only the quiz — historical results are preserved.

---

## Troubleshooting

**"Failed to fetch quizzes" / nothing loads**
- Make sure `.env.local` exists and `VITE_API_BASE_URL` points to your API Gateway URL (no trailing slash).
- Restart the dev server after changing `.env.local` — Vite only reads it on startup.

**CORS errors in the browser**
- The Lambda already returns CORS headers. Confirm your API Gateway is set up to forward `GET`, `POST`, `DELETE`, and `OPTIONS`.

**Port 5173 already in use**
- Vite will automatically pick the next free port — check the terminal output for the actual URL.

**Type errors during `npm run build`**
- Run `npm install` first to ensure all dependencies are present.

---

## License

This project was built for educational purposes.
