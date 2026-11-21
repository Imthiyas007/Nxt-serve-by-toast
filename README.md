# NxtServe Job Portal

NxtServe is a job portal with a React 19/Vite frontend and an Express 5 API. The API uses MongoDB through Mongoose and JWT-based authentication. The frontend is in `frontend/job-portal`; the API is in `backend`.

## Environment setup

Create `backend/.env` and `frontend/job-portal/.env` with the settings below. The backend needs a MongoDB connection string and a private JWT signing secret. Create a strong secret with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Keep `.env` files and production secrets private. Never put database credentials or the JWT secret in a `VITE_` variable; Vite exposes those variables in the browser bundle.

## Run locally

1. Create a MongoDB database (for example, in MongoDB Atlas) and set `MONGO_URI` in `backend/.env`.
2. Set `JWT_SECRET` and `FRONTEND_URL=http://localhost:5173` in `backend/.env`. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` there to enable image and resume uploads. Set `GEMINI_API_KEY` there to enable interview practice.
3. In a terminal:

   ```sh
   cd backend
   npm install
   npm run dev
   ```

4. In a second terminal:

   ```sh
   cd frontend/job-portal
   npm install
   npm run dev
   ```

   The frontend uses `VITE_API_BASE_URL=http://localhost:5000` from its `.env` file. Set `GEMINI_API_KEY` in `backend/.env` to enable interview practice. Do not use a `VITE_` variable for this key.

## Deploy

One supported arrangement is to deploy the API to Render and the static frontend to Vercel.

### 1. Prepare MongoDB

Create a production database and database user in MongoDB Atlas. Copy its connection string for the API's `MONGO_URI` setting, replacing the username, password, cluster, and database name. Ensure Atlas network access allows connections from the API host; use the narrowest access policy your hosting setup supports.

### 2. Deploy the API to Render

Create a **Web Service** from this repository and configure:

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`

Add these environment variables in Render's service settings:

- `MONGO_URI`: the production MongoDB connection string
- `JWT_SECRET`: a newly generated, long random secret
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`: credentials for the upload storage account
- `GEMINI_API_KEY`: a Gemini API key for interview preparation and job matching
- `RESEND_API_KEY` and `RESEND_AUDIENCE_ID`: Resend credentials and audience for newsletter subscriptions
- `FRONTEND_URL`: one or more deployed frontend origins, separated by commas and without trailing slashes. The canonical `nxt-serve-by-toast.vercel.app` domain and this project's Vercel preview deployments are also allowed.

Render supplies `PORT` automatically. After deployment, copy the service URL, for example `https://your-api.onrender.com`.

### 3. Deploy the frontend to Vercel

Import the same repository into Vercel and set:

- **Root Directory:** `frontend/job-portal`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Set this environment variable in Vercel for the production environment:

- `VITE_API_BASE_URL`: the Render API origin, for example `https://your-api.onrender.com` (no trailing slash)

The Gemini and Resend keys must be configured only on the API service. The frontend calls the API proxy, which keeps keys out of the browser bundle and applies request limits. Redeploy the API after changing its environment variables.

The privacy and terms pages in this repository are draft text, not legal advice. Have qualified counsel and the service operator review and complete them before publication.

Jobseeker messages and resume profiles are stored in MongoDB. Resume PDF export uses the browser's print dialog. Employers can verify badge requests only for users who applied to one of their jobs.

### 4. Verify

Open the deployed frontend, register or log in, and try loading the job list. If requests fail, check the API service logs, confirm the frontend URL matches `FRONTEND_URL`, and confirm the API URL in Vercel matches the deployed Render service.

## Deployment notes

- Uploaded images and resumes are stored in Cloudinary. Configure its credentials on the API service; never put them in frontend `VITE_` variables.
- The repository also contains Vercel configuration files. The steps above use Render for the API because it runs the Express server as a long-lived Node service; don't deploy the API using a serverless configuration without adapting and testing the server entry point for that platform.
