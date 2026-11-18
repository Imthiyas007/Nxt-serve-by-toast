# NxtServe Job Portal

NxtServe is a job portal with a React 19/Vite frontend and an Express 5 API. The API uses MongoDB through Mongoose and JWT-based authentication. The frontend is in `frontend/job-portal`; the API is in `backend`.

## Environment setup

Copy each example file to `.env` in the same directory and replace the sample values:

- `backend/.env.example` → `backend/.env`
- `frontend/job-portal/.env.example` → `frontend/job-portal/.env`

The backend needs a MongoDB connection string and a private JWT signing secret. Create a strong secret with:

```sh
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Keep `.env` files and production secrets private. Never put database credentials or the JWT secret in a `VITE_` variable; Vite exposes those variables in the browser bundle.

## Run locally

1. Create a MongoDB database (for example, in MongoDB Atlas) and set `MONGO_URI` in `backend/.env`.
2. Set `JWT_SECRET` in `backend/.env`. Keep `FRONTEND_URL=http://localhost:5173`.
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

   The frontend uses `VITE_API_BASE_URL=http://localhost:5000` from its `.env` file.

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
- `FRONTEND_URL`: the exact deployed frontend origin, such as `https://your-site.vercel.app` (no trailing slash)

Render supplies `PORT` automatically. After deployment, copy the service URL, for example `https://your-api.onrender.com`.

### 3. Deploy the frontend to Vercel

Import the same repository into Vercel and set:

- **Root Directory:** `frontend/job-portal`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`

Set this environment variable in Vercel for the production environment:

- `VITE_API_BASE_URL`: the Render API origin, for example `https://your-api.onrender.com` (no trailing slash)

Deploy or redeploy the frontend after changing environment variables. Vite embeds them at build time.

### 4. Verify

Open the deployed frontend, register or log in, and try loading the job list. If requests fail, check the API service logs, confirm the frontend URL matches `FRONTEND_URL`, and confirm the API URL in Vercel matches the deployed Render service.

## Deployment notes

- The API stores uploaded images and resumes in its local `backend/uploads` directory. This is not durable storage on typical hosted instances and can be lost when an instance restarts or is redeployed. Use persistent storage or an object-storage service before relying on uploads in production.
- The repository also contains Vercel configuration files. The steps above use Render for the API because it runs the Express server as a long-lived Node service; don't deploy the API using a serverless configuration without adapting and testing the server entry point for that platform.
