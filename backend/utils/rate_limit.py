from fastapi import Request, HTTPException
from fastapi.middleware.base import BaseHTTPMiddleware
from collections import defaultdict
import time
from typing import Dict, Tuple


class RateLimitMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests: Dict[str, list] = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        client_ip = request.client.host
        now = time.time()

        # Clean old requests
        self.requests[client_ip] = [
            req_time for req_time in self.requests[client_ip] if now - req_time < 60
        ]

        # Check rate limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            raise HTTPException(
                status_code=429, detail="Too many requests. Please try again later."
            )

        # Add new request
        self.requests[client_ip].append(now)

        response = await call_next(request)
        return response
