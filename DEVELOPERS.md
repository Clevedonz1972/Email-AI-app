## Backend Deployment

The backend is now consolidated into FastAPI and deployed on Render using Docker.

### Local Development

1. Install backend dependencies:
   ```
   pip install -r backend/requirements.txt
   ```

2. Run the FastAPI server with Uvicorn:
   ```
   uvicorn backend.email_api.server:app --reload
   ```

### Docker Deployment

1. Build the Docker image:
   ```
   docker build -t your-backend-image:latest ./backend
   ```

2. Test the image locally:
   ```
   docker run -p 8000:8000 your-backend-image:latest
   ```

3. Push the image to your container registry and deploy it on Render.

**Note:**  
Ensure that environment variables (including `JWT_SECRET_KEY` and `OPENAI_API_KEY`) are set in your Render service settings. 