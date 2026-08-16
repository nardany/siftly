# Siftly — AI-Powered HR Candidate Screening Platform 🚀

**Siftly** is a modern, open-source HR screening platform that automates candidate evaluation using **Google Gemini AI**. It supports both native custom screening forms and 1-click **Google Forms integration** with real-time candidate scoring, anti-cheating detection, GitHub portfolio verification, 1-click Gmail outreach, and detailed analytical dashboards.

---

## ✨ Key Features

- 🤖 **Multimodal Gemini AI Evaluation**: Automatically grades candidates from 0 to 100 with detailed, 4-6 sentence HR summary reports tailored to job descriptions.
- 📄 **Native PDF CV / Resume Parsing**: Upload PDF resumes — Gemini AI reads and evaluates them natively alongside candidate answers.
- 🐙 **GitHub Portfolio Verification**: AI automatically fetches candidate's public GitHub repositories, languages, and star counts to verify real coding experience.
- 🔗 **Google Forms 1-Click Sync**: Import any Google Form with responses, auto-sync new applicants in real time, and match Q&A with 100% precision.
- ✉️ **1-Click Smart Gmail Outreach**: Pre-fills personalized candidate invitation & rejection emails directly in Gmail with 1 click.
- 🖐️ **Drag & Drop Form Builder**: Reorder screening questions easily with mouse or touch drag-and-drop.
- 📥 **CSV / Excel Export**: Export all applicant data, scores, and AI summaries into a downloadable `.csv` file.
- 📊 **HR Analytics Dashboard**: Interactive charts (Recharts) displaying candidate pass rates, average scores, and top candidate leaderboards.
- 🛡️ **Anti-Cheating & Trust Score**: Tracks time spent, tab switching, and cheat logs for native candidate screening forms.
- 🔒 **Single-Admin Security**: Option to disable public registrations (`DISABLE_REGISTRATION=true`) for self-hosted HR deployments.
- 🎨 **Custom Branding**: Upload company logo, description, and custom theme colors for screening forms.
- ⚡ **Strict / Lenient AI Modes**: Evaluate candidates based on seniority levels (Junior, Mid, Senior).

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Database**: PostgreSQL (via [Prisma ORM](https://www.prisma.io/))
- **AI Engine**: Google Gemini AI (`@google/generative-ai`)
- **Integrations**: Google Forms API & Google Drive API (`googleapis`), GitHub REST API
- **Styling**: Modern Vanilla CSS Modules (Glassmorphism & Dark/Light Accents)
- **Charts**: [Recharts](https://recharts.org/)

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js `v18+` or `v20+`
- PostgreSQL database (or [Neon Postgres](https://neon.tech/))

### 2. Clone the Repository
```bash
git clone https://github.com/nardany/siftly.git
cd siftly
npm install
```

### 3. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Fill in your credentials:

| Variable | Description | Required |
|---|---|---|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `JWT_SECRET` | Any random secret string for session cookies | ✅ |
| `GEMINI_API_KEY` | Google Gemini AI API key ([Get it here](https://aistudio.google.com/)) | ✅ |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000` (or your production URL) | ✅ |
| `DISABLE_REGISTRATION` | Set to `true` to disable new signups on self-hosted instances | ⚙️ Optional |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID (only for Google Forms integration) | ⚙️ Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret (only for Google Forms integration) | ⚙️ Optional |

> **Note:** `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are only needed if you want to use the **Google Forms Import** feature. The rest of Siftly works fully without them.

### 4. Setup Database
```bash
npx prisma db push
```

### 5. Run the Application
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Setting Up Google Forms Integration (Optional)

This section is **only needed** if you want to import Google Forms responses into Siftly.

### Step 1 — Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top → **"New Project"**
3. Give it a name (e.g. `Siftly`) and click **"Create"**

### Step 2 — Enable Required APIs

1. In your new project, go to **"APIs & Services" → "Enable APIs and Services"**
2. Search for and enable **Google Forms API** → Click **"Enable"**
3. Go back, search for and enable **Google Drive API** → Click **"Enable"**

### Step 3 — Create OAuth 2.0 Credentials

1. Go to **"APIs & Services" → "Credentials"**
2. Click **"+ Create Credentials" → "OAuth client ID"**
3. If prompted, click **"Configure Consent Screen"** first:
   - Choose **"External"** → Click **"Create"**
   - Fill in **App name** (e.g. `Siftly`), **User support email**, and **Developer contact email**
   - Click **"Save and Continue"** through all steps → **"Back to Dashboard"**
4. Now go back to **"Credentials" → "+ Create Credentials" → "OAuth client ID"**
5. Choose **"Web application"** as the application type
6. Under **"Authorized JavaScript origins"**, add:
   ```
   http://localhost:3000
   ```
7. Under **"Authorized redirect URIs"**, add:
   ```
   http://localhost:3000/api/auth/google/callback
   ```
   *(For production, also add your live domain, e.g. `https://yourdomain.com/api/auth/google/callback`)*
8. Click **"Create"**

### Step 4 — Copy Your Credentials

After creating, Google will show a popup with:
- **Client ID** → Copy this to `GOOGLE_CLIENT_ID` in your `.env`
- **Client Secret** → Copy this to `GOOGLE_CLIENT_SECRET` in your `.env`

```env
GOOGLE_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="GOCSPX-your-client-secret"
```

### Step 5 — Add Test Users (if app is in testing mode)

If your OAuth consent screen is in **"Testing"** mode (not published), only added test users can connect:

1. Go to **"APIs & Services" → "OAuth consent screen"**
2. Scroll down to **"Test users"** → Click **"+ Add Users"**
3. Add the Google account email(s) that will use Siftly

> ✅ That's it! Now go to Siftly → **Dashboard → Import** → Click **"Connect with Google"** and you're ready to import Google Forms responses.

---

## 👨‍💻 Author

Created with ❤️ by [Narek Danielyan](https://www.linkedin.com/in/nar-danielyan)

---

## 📜 License

MIT License. Open source and free to use for teams and developers worldwide.
