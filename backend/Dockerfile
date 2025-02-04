FROM python:3.9-slim

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

# Copy the rest of the backend code
COPY . .

# Expose port 8000 (adjust if needed)
EXPOSE 8000

# Start the Uvicorn server
CMD ["uvicorn", "backend.email_api.server:app", "--host", "0.0.0.0", "--port", "8000"] 