# EcoTrack AI — Deployment Guide

This guide details the step-by-step process for deploying the EcoTrack AI full-stack application, with the **React Frontend on Vercel** and the **Node.js/Express Backend on Google Cloud Run (GCloud)**.

---

## 1. MongoDB Setup (Atlas)

Since serverless backends like Google Cloud Run scale down to zero and are stateless, they cannot run local database engines. You must provision a hosted MongoDB cluster:

1. Sign up for a free tier account at [MongoDB Atlas](https://www.mongodb.com/products/platform/atlas-database).
2. Create a new shared cluster (e.g., `ecotrack-cluster`).
3. In **Network Access**, allow access from anywhere (`0.0.0.0/0`) since Cloud Run uses dynamic IP ranges.
4. In **Database Access**, create a user (e.g., `ecotrack-user`) with read/write permissions.
5. Retrieve your connection string (e.g., `mongodb+srv://ecotrack-user:<password>@cluster0.abcde.mongodb.net/ecotrack?retryWrites=true&w=majority`).

---

## 2. Backend Deployment (Google Cloud Run)

Google Cloud Run is a fully managed serverless platform that automatically scales your containerized backend.

### Prerequisites
1. Download and install the [Google Cloud SDK](https://cloud.google.com/sdk/docs/install).
2. Authenticate the CLI:
   ```bash
   gcloud auth login
   ```
3. Create a Google Cloud Project (or select an existing one):
   ```bash
   gcloud projects create ecotrack-ai-project
   gcloud config set project ecotrack-ai-project
   ```
4. Enable required APIs (Cloud Build & Cloud Run):
   ```bash
   gcloud services enable billingbudgets.googleapis.com
   gcloud services enable run.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

### Deploying the Backend
Run the following commands from the **root directory** of the repository:

1. **Submit to Cloud Build**:
   Build your container image in the cloud using the server Dockerfile:
   ```bash
   gcloud builds submit --tag gcr.io/PROJECT_ID/ecotrack-backend -f server/Dockerfile .
   ```
   *(Replace `PROJECT_ID` with your actual GCP project ID).*

2. **Deploy to Cloud Run**:
   Launch the container into a serverless service:
   ```bash
   gcloud run deploy ecotrack-backend \
     --image gcr.io/PROJECT_ID/ecotrack-backend \
     --platform managed \
     --allow-unauthenticated \
     --region us-central1 \
     --set-env-vars="NODE_ENV=production,MONGODB_URI=YOUR_MONGODB_ATLAS_CONNECTION_STRING,JWT_SECRET=YOUR_SECURE_JWT_SECRET,COOKIE_SECRET=YOUR_SECURE_COOKIE_SECRET,CORS_ORIGIN=https://YOUR_VERCEL_FRONTEND_URL.vercel.app"
   ```
   *(Ensure to replace the database URI, secure secrets, and project ID placeholder. Note: You will replace `CORS_ORIGIN` with your actual Vercel URL once the frontend is deployed).*

3. **Get the Backend URL**:
   The output of the deploy command will print the service URL, for example:
   `https://ecotrack-backend-xxxxxx-uc.a.run.app`

---

## 3. Frontend Deployment (Vercel)

Vercel provides instant hosting for Vite + React static single-page applications.

### Configuration (`vercel.json`)
The client project includes a pre-configured `client/vercel.json` file. Update the `destination` URL in `client/vercel.json` to point to your deployed Google Cloud Run backend URL:

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ecotrack-backend-xxxxxx-uc.a.run.app/api/:path*"
    },
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deploying via Vercel Dashboard
1. Go to the [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** > **Project**.
2. Import your GitHub repository (`omkhandare55/EcoTrack-AI`).
3. Set the following Project Settings:
   - **Framework Preset**: `Vite` (automatically detected).
   - **Root Directory**: `client` *(Important: set this to the frontend subdirectory)*.
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Click **Deploy**. Vercel will build and host your frontend.
5. Copy your new Vercel deployment URL (e.g., `https://ecotrack-ai.vercel.app`).

### Post-Deployment Step
Once your Vercel URL is live, update your backend's `CORS_ORIGIN` environment variable on GCloud so requests are authorized:
```bash
gcloud run services update ecotrack-backend \
  --region us-central1 \
  --update-env-vars="CORS_ORIGIN=https://YOUR_VERCEL_FRONTEND_URL.vercel.app"
```

---

## 4. Local Verification & Debugging

If you face CORS or session authentication issues in production:
- Make sure that **withCredentials** is set to `true` in Axios (`client/src/services/apiClient.ts`).
- Make sure the backend cookie options include `secure: true` and `sameSite: 'none'` (or same-site rules if domains match) to allow cross-site cookie transfers between the Vercel domain and the Cloud Run domain.
