import pytest
from backend.utils.cache import cache_service, cached
from backend.config import settings
import json

@pytest.fixture
async def setup_cache():
    """Setup test cache"""
    await cache_service.init()
    yield
    # Clear cache after each test
    await cache_service.redis.flushdb()

@pytest.mark.asyncio
async def test_cache_set_get(setup_cache):
    """Test basic cache set and get operations"""
    key = "test_key"
    value = {"test": "data"}
    
    # Set value in cache
    success = await cache_service.set(key, value)
    assert success is True
    
    # Get value from cache
    cached_value = await cache_service.get(key)
    assert cached_value == value

@pytest.mark.asyncio
async def test_cache_delete(setup_cache):
    """Test cache deletion"""
    key = "test_key"
    value = {"test": "data"}
    
    # Set and verify value
    await cache_service.set(key, value)
    assert await cache_service.get(key) == value
    
    # Delete value
    success = await cache_service.delete(key)
    assert success is True
    assert await cache_service.get(key) is None

@pytest.mark.asyncio
async def test_cache_namespace(setup_cache):
    """Test namespace operations"""
    namespace = "test_namespace"
    keys = [f"{namespace}:key{i}" for i in range(3)]
    value = {"test": "data"}
    
    # Set multiple values in namespace
    for key in keys:
        await cache_service.set(key, value)
    
    # Clear namespace
    deleted = await cache_service.clear_namespace(namespace)
    assert deleted == len(keys)
    
    # Verify all keys are deleted
    for key in keys:
        assert await cache_service.get(key) is None

@pytest.mark.asyncio
async def test_cache_decorator(setup_cache):
    """Test cache decorator"""
    call_count = 0
    
    @cached(expire=60, namespace="test")
    async def test_function(arg1, arg2):
        nonlocal call_count
        call_count += 1
        return {"arg1": arg1, "arg2": arg2}
    
    # First call should execute function
    result1 = await test_function("a", "b")
    assert call_count == 1
    assert result1 == {"arg1": "a", "arg2": "b"}
    
    # Second call should return cached result
    result2 = await test_function("a", "b")
    assert call_count == 1  # Function not called again
    assert result2 == result1

@pytest.mark.asyncio
async def test_cache_expiration(setup_cache):
    """Test cache expiration"""
    key = "test_key"
    value = {"test": "data"}
    
    # Set value with 1 second expiration
    await cache_service.set(key, value, expire=1)
    
    # Value should exist initially
    assert await cache_service.get(key) == value
    
    # Wait for expiration
    import asyncio
    await asyncio.sleep(1.1)
    
    # Value should be gone
    assert await cache_service.get(key) is None

@pytest.mark.asyncio
async def test_cache_invalid_json(setup_cache):
    """Test handling of invalid JSON data"""
    key = "test_key"
    value = {"test": lambda: None}  # Function is not JSON serializable
    
    with pytest.raises(TypeError):
        await cache_service.set(key, value)

@pytest.mark.asyncio
async def test_cache_connection_error():
    """Test handling of Redis connection errors"""
    # Initialize cache with invalid host
    settings.REDIS_HOST = "invalid_host"
    
    with pytest.raises(Exception):
        await cache_service.init()

@pytest.mark.asyncio
async def test_cache_large_data(setup_cache):
    """Test handling of large data"""
    key = "test_key"
    large_value = {"data": "x" * 1024 * 1024}  # 1MB of data
    
    # Should handle large data without issues
    success = await cache_service.set(key, large_value)
    assert success is True
    
    cached_value = await cache_service.get(key)
    assert cached_value == large_value 