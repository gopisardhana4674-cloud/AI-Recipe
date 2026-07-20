# Kitchen AI - Production-Grade Full-Stack AI Recipe Generator

Kitchen AI is a modern, responsive, and glassmorphic AI-powered recipe generator application built with a premium dark-theme look. It enables home chefs to list ingredients in stock, scan paper grocery receipts using OCR, request AI recipe generation with difficulty and serving controls, track step-by-step instructions with checkable lists, and compile shopping grocery checklists.

## Features
- **Pantry Manager**: Quick-add staple items or type ingredients manually.
- **Microphone Voice Input**: Speak ingredients aloud to insert them as pantry tag badges.
- **OCR Receipt Scanning**: Scan receipt images to import food items instantly using Gemini.
- **AI Recipe Generator**: Establishes strict JSON schemas with Gemini for cook times, difficulty levels, and nutrition metrics. Includes fallback healing.
- **Interactive Checklists**: Cross off cooking steps as you cook.
- **Grocery aggregates**: Compile missing items automatically into an exportable shopping checklist.
- **Weekly Meal Planner**: Schedule recipes on a weekly calendar slots layout.
- **AI Cooking Assistant Chat**: Access a side-drawer assistant to discuss ingredient substitutions or scaling.
- **Download PDF**: Convert and save cooking guides directly as a PDF layout.

---

## Tech Stack
### Frontend
- **React 19** & **TypeScript** & **Vite**
- **Tailwind CSS (v4)** (Utility classes)
- **Zustand** (Unified Auth & Recipe global states)
- **React Router** (Protected paths navigation)
- **Framer Motion** (Spring animations)
- **Lucide React** (Modern iconography)
- **jsPDF** & **html2canvas** (PDF exports)

### Backend
- **Node.js** & **Express** & **TypeScript**
- **Prisma ORM** (v5)
- **Supabase PostgreSQL**
- **Google Gemini API** (Recipe synthesis, receipt OCR, cooking chatbot)
- **Helmet** & **Express Rate Limiting** (Security middleware)

---

## Architecture & Graceful Fallbacks

To ensure instant usability without complex environment configurations out-of-the-box, the application has built-in fallbacks:
1. **Mock Authentication**: If Clerk API keys are missing, the frontend automatically spins up a local session manager (Zustand) with login/sign-up simulation.
2. **JSON Database Fallback**: If `DATABASE_URL` is missing or unreachable, the server automatically reads/writes to `server/data/fallback_db.json` rather than throwing errors.
3. **Thematic Food Placeholders**: If Cloudinary upload keys are missing, the app uses keyword matching to fetch high-res food graphics from Unsplash.

---

## Getting Started

### 1. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
cp .env.example .env
```
Supply your API credentials. *Minimal requirement is `GEMINI_API_KEY` for recipe generations.*

### 2. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 3. Generate Prisma Client
```bash
npx prisma generate --schema=server/prisma/schema.prisma
```
*(If a database is connected, run `npx prisma db push` to push the tables to Supabase).*

### 4. Run Application
Run both frontend Vite server and backend Express server concurrently:
- Start Frontend (Vite on `http://localhost:5173`):
  ```bash
  npm run dev
  ```
- Start Backend (Express on `http://localhost:3001`):
  ```bash
  npm run server
  ```

---

## API Documentation
Please see [API_DOCUMENTATION.md](file:///d:/Agent/API_DOCUMENTATION.md) for endpoints details.
