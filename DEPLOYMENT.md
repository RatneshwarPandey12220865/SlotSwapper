# Deployment Guide

This guide explains how to deploy the SlotSwapper application using Render (backend) and Vercel (frontend).

## Backend Deployment (Render)

1. Create a Render account at https://render.com

2. From your Render dashboard:
   - Click "New +" and select "Web Service"
   - Connect your GitHub repository
   - Choose the repository and select the backend directory

3. Configure the web service:
   - Name: `slotswapper-backend` (or your preferred name)
   - Environment: `Node`
   - Region: Choose nearest to your users
   - Branch: `main`
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. Add environment variables in Render dashboard:
   ```
   PORT=5000
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   REDIS_HOST=your_redis_host
   REDIS_PORT=your_redis_port
   REDIS_USER=default
   REDIS_PASSWORD=your_redis_password
   JWT_SECRET=your_secure_jwt_secret
   CORS_ORIGIN=https://your-frontend-domain.vercel.app
   ```

5. Click "Create Web Service"

## Frontend Deployment (Vercel)

1. Create a Vercel account at https://vercel.com

2. From your Vercel dashboard:
   - Click "New Project"
   - Import your GitHub repository
   - Choose the repository and select the frontend directory

3. Configure the project:
   - Framework Preset: Vite
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `dist`

4. Add environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```

5. Click "Deploy"

## Post-Deployment Steps

1. Test the deployed application:
   - Navigate to your Vercel-deployed frontend URL
   - Try signing up and logging in
   - Create and swap events
   - Verify all functionalities work as expected

2. Monitor your applications:
   - Use Render dashboard to monitor backend logs and performance
   - Use Vercel dashboard to monitor frontend deployments and analytics

## Common Issues and Solutions

1. CORS Errors:
   - Ensure CORS_ORIGIN in backend matches your Vercel frontend URL exactly
   - Check for any missing trailing slashes

2. API Connection Issues:
   - Verify VITE_API_URL is correctly set in Vercel
   - Ensure the backend URL includes the '/api' path

3. Database Connection:
   - Verify MongoDB connection string in Render environment variables
   - Check if IP whitelist in MongoDB Atlas includes Render's IPs

4. Redis Connection:
   - Ensure Redis credentials are correctly set in Render
   - Verify Redis instance is accessible from Render's network

## Security Checklist

- [ ] Changed all default passwords and credentials
- [ ] Set strong JWT_SECRET
- [ ] Configured CORS properly
- [ ] Enabled SSL/HTTPS (automatically handled by Render/Vercel)
- [ ] Set up proper MongoDB user permissions
- [ ] Configured Redis password and access controls

## Monitoring and Maintenance

1. Set up monitoring:
   - Enable Render metrics monitoring
   - Set up MongoDB Atlas monitoring
   - Configure Redis monitoring

2. Regular maintenance:
   - Monitor error logs regularly
   - Keep dependencies updated
   - Perform regular security audits

## Support and Troubleshooting

For issues with:
- Render deployment: https://render.com/docs
- Vercel deployment: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com