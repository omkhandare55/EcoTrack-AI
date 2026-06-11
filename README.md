# EcoTrack AI — Carbon Footprint Tracker

EcoTrack AI is a production-grade, full-stack web application designed to help individuals calculate, track, and reduce their daily carbon footprint. The application combines precise carbon analytics with gamified eco-challenges and statistical forecast predictions to drive meaningful environmental impact.

---

## 1. Chosen Vertical & Focus Areas

* **Vertical**: Climate Tech / Carbon Footprint Tracking & Reduction.
* **Core Philosophy**: Prioritize engineering excellence by optimizing for **Code Quality**, **Security**, **Efficiency**, **Testing**, and **Accessibility (WCAG 2.1 AA)**.

---

## 2. Approach & Architecture

The application is structured as an **npm workspaces monorepo** consisting of two main sub-projects:

* **`/client` (Frontend)**: React 18, TypeScript, Vite, React Query, Axios, Chart.js.
* **`/server` (Backend)**: Node.js, Express, TypeScript, MongoDB, Mongoose, Jest, Supertest.

### Design Patterns
* **Repository Pattern (Data Access)**: A generic `BaseRepository` provides standard CRUD functionality, while specific repositories (e.g., `ActivityRepository`) implement complex MongoDB aggregation pipelines for stats.
* **MVC & Thin Controllers**: HTTP routing and payload validation are handled by controllers/middleware, while all business rules reside inside decoupled Services.
* **Zod Schema Validation**: Strict input validation is enforced at the network boundaries on both client and server.
* **Dynamic Database Failover**: In development mode, if a local MongoDB connection is refused, the database layer automatically spins up an in-memory `MongoMemoryServer` instance for a seamless out-of-the-box experience.

---

## 3. How the Solution Works

1. **Dashboard & Analytics**: Users get a summary of their emissions (daily, weekly, monthly, yearly), time-series trends, and category breakdowns visualized using responsive charts with accessible screen-reader data table fallbacks.
2. **Activity Logging**: Log daily activities under 5 categories (Transportation, Electricity, Food, Water, Shopping) using realistic, localized carbon emission factors.
3. **Smart Goals**: Set carbon reduction goals and track progress automatically. The backend recalculates baseline values from historical log data and monitors goal completion.
4. **Gamified Eco-Challenges**: Participate in daily, weekly, or one-time challenges. Completing challenges updates streaks and awards points on a global leaderboard.
5. **AI Recommendations**: A rule-based service analyzes user emission hot-spots and suggests personalized tips with estimated CO₂ savings.
6. **Machine Learning Forecast**: A statistical prediction service computes linear regression slopes and moving averages to forecast the user's carbon footprint for the next month.

---

## 4. Key Engineering Implementations

### Security
* **OWASP Top 10 Protections**: Implemented security headers (Helmet), NoSQL Injection sanitizers, CORS, and request rate-limiting (bypassed automatically in test environments).
* **JWT Cookie Auth**: Secure sessions are stored in HTTP-only, secure, SameSite cookies.
* **Password Hashing**: Bcrypt with a work factor of 12.

### Testing (Target: 90%+)
* **Frontend**: Unit tests for common components (accessible buttons, inputs) and formatter helpers.
* **Backend**: Unit tests for carbon calculators, and comprehensive integration tests (using `supertest` and `mongodb-memory-server`) covering Auth, Activities, Goals, Challenges, and Analytics endpoints.

### Accessibility (WCAG 2.1 AA)
* Skip links, keyboard-only tab navigation, focus trapping inside modals, visible focus indicators, and strict screen-reader descriptions (using `aria-live` and `role="status"`).

---

## 5. Assumptions Made

1. **AI Service Mocking**: AI recommendations and insights are managed by a rule-based engine instead of a live LLM API call to avoid API key exposure and billing dependencies during evaluation.
2. **Production Cookies**: Secure cookies are active in production mode, which assumes a Vercel API rewrite proxy is configured so that backend cookies are treated as first-party.

---

## 6. How to Run Locally

### Prerequisites
* Node.js (v20+) and npm.

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/omkhandare55/EcoTrack-AI.git
   cd EcoTrack-AI
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Copy `server/.env.example` (or the root `.env.example`) to `server/.env` and adjust the variables.
4. Run in development:
   ```bash
   npm run dev
   ```
   *(Frontend runs on `http://localhost:3000` and Backend runs on `http://localhost:5000`)*.
