# Google Cloud Deployment Guide — CampusAI

This guide documents the production deployment of CampusAI to Google Cloud using Cloud Run, Cloud Storage, Vertex AI, and Cloud SQL.

## 1. Project & Prerequisites
Ensure `gcloud` CLI is installed and authenticated:
```bash
gcloud auth login
gcloud config set project <YOUR_GCP_PROJECT_ID>
```

Enable required APIs:
```bash
gcloud services enable \
    run.googleapis.com \
    storage.googleapis.com \
    aiplatform.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com \
    cloudbuild.googleapis.com
```

## 2. Cloud Storage Setup
Create a private bucket for private timetable workbooks and validation logs:
```bash
gsutil mb -p <YOUR_GCP_PROJECT_ID> -c STANDARD -l us-central1 gs://campus-ai-workbooks-private/
gsutil uniformbucketlevelaccess set on gs://campus-ai-workbooks-private/
```

## 3. Vertex AI Configuration
Assign the `Vertex AI User` role to the Cloud Run service identity:
```bash
gcloud projects add-iam-policy-binding <YOUR_GCP_PROJECT_ID> \
    --member="serviceAccount:<SERVICE_ACCOUNT_EMAIL>" \
    --role="roles/aiplatform.user"
```

## 4. Backend Deployment to Cloud Run
Build and submit the backend container image:
```bash
gcloud builds submit --tag gcr.io/<YOUR_GCP_PROJECT_ID>/campus-ai-backend ./backend

gcloud run deploy campus-ai-backend \
    --image gcr.io/<YOUR_GCP_PROJECT_ID>/campus-ai-backend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated \
    --set-env-vars ENVIRONMENT=production,PORT=8080,GOOGLE_CLOUD_PROJECT=<YOUR_GCP_PROJECT_ID>
```

## 5. Frontend Deployment to Cloud Run
Build the frontend with production backend URL:
```bash
gcloud builds submit --tag gcr.io/<YOUR_GCP_PROJECT_ID>/campus-ai-frontend ./frontend

gcloud run deploy campus-ai-frontend \
    --image gcr.io/<YOUR_GCP_PROJECT_ID>/campus-ai-frontend \
    --platform managed \
    --region us-central1 \
    --allow-unauthenticated
```

## 6. Cloud SQL (PostgreSQL) Production Setup (Optional)
```bash
gcloud sql instances create campus-ai-db \
    --database-version=POSTGRES_15 \
    --cpu=2 \
    --memory=7680MB \
    --region=us-central1

gcloud sql databases create campusai --instance=campus-ai-db
```
Connect Cloud Run to Cloud SQL via Cloud SQL Auth Proxy using `--add-cloudsql-instances`.
