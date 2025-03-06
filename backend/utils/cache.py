import json
from typing import Any, Optional
from functools import wraps
from redis import Redis
from backend.config import settings

# Global Redis client instance
redis_client: Optional[Redis] = None

def init_cache() -> Redis:
    """Initialize Redis client"""
    global redis_client
    if redis_client is None:
        redis_client = Redis(
            host=settings.REDIS_HOST,
            port=6379,
            db=0,
            decode_responses=True
        )
    return redis_client

def get_cache() -> Redis:
    """Get Redis client instance"""
    if redis_client is None:
        return init_cache()
    return redis_client

def cache_key(namespace: str, key: str) -> str:
    """Generate a cache key with namespace"""
    return f"{namespace}:{key}"

def set_cache(namespace: str, key: str, value: Any, expire: int = 3600) -> bool:
    """Set a value in cache with expiration"""
    try:
        cache = get_cache()
        full_key = cache_key(namespace, key)
        cache.set(full_key, json.dumps(value), ex=expire)
        return True
    except Exception:
        return False

def get_cached(namespace: str, key: str) -> Optional[Any]:
    """Get a value from cache"""
    try:
        cache = get_cache()
        full_key = cache_key(namespace, key)
        value = cache.get(full_key)
        return json.loads(value) if value else None
    except Exception:
        return None

def delete_cache(namespace: str, key: str) -> bool:
    """Delete a value from cache"""
    try:
        cache = get_cache()
        full_key = cache_key(namespace, key)
        cache.delete(full_key)
        return True
    except Exception:
        return False

def clear_namespace(namespace: str) -> bool:
    """Clear all keys in a namespace"""
    try:
        cache = get_cache()
        pattern = f"{namespace}:*"
        keys = cache.keys(pattern)
        if keys:
            cache.delete(*keys)
        return True
    except Exception:
        return False

def cache_decorator(namespace: str, key_prefix: str, expire: int = 3600):
    """Decorator for caching function results"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Generate cache key from function arguments
            key_parts = [key_prefix]
            key_parts.extend(str(arg) for arg in args)
            key_parts.extend(f"{k}:{v}" for k, v in sorted(kwargs.items()))
            key = ":".join(key_parts)

            # Try to get from cache
            cached_value = get_cached(namespace, key)
            if cached_value is not None:
                return cached_value

            # Execute function and cache result
            result = await func(*args, **kwargs)
            set_cache(namespace, key, result, expire)
            return result
        return wrapper
    return decorator 