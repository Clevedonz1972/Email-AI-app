# Deployment Guide

## Frontend (Vercel)

1. Environment Setup
   ```bash
   # Required environment variables
   REACT_APP_BACKEND_URL=https://your-heroku-app.herokuapp.com
   REACT_APP_SENTRY_DSN=your-sentry-dsn
   REACT_APP_AI_ENDPOINT=https://your-ai-endpoint.com
   ```

2. Deployment Steps
   - Push to main branch
   - GitHub Actions will automatically deploy
   - Verify deployment in Vercel dashboard

## Backend (Heroku)

1. Environment Setup
   ```bash
   # Required environment variables
   DATABASE_URL=your-database-url
   SECRET_KEY=your-secret-key
   ALLOWED_HOSTS=your-vercel-domain.vercel.app
   CORS_ORIGIN=https://your-vercel-domain.vercel.app
   OPENAI_API_KEY=your-openai-key
   ```

2. Deployment Steps
   - Push to main branch
   - GitHub Actions will deploy to Heroku
   - Monitor logs: `heroku logs --tail`

## Monitoring

1. Sentry Setup
   - Add DSN to environment variables
   - Monitor errors in Sentry dashboard

2. Performance Monitoring
   - Check Vercel Analytics
   - Monitor Heroku metrics 

# Deployment Checklist

## Prerequisites
- [ ] Vercel account configured
- [ ] Heroku account configured
- [ ] GitHub repository secrets set
- [ ] Database provisioned

## Environment Variables
### Frontend (Vercel)
- [ ] REACT_APP_BACKEND_URL
- [ ] REACT_APP_AI_ENDPOINT
- [ ] REACT_APP_SENTRY_DSN
- [ ] REACT_APP_OPENAI_KEY

### Backend (Heroku)
- [ ] DATABASE_URL
- [ ] JWT_SECRET
- [ ] OPENAI_API_KEY
- [ ] CORS_ORIGIN

## Deployment Steps
1. Frontend
   ```bash
   vercel deploy
   ```

2. Backend
   ```bash
   git push heroku main
   ```

## Post-Deployment
- [ ] Verify frontend-backend connection
- [ ] Test authentication flow
- [ ] Verify AI integration
- [ ] Check error tracking 