import sys
print("Python path:", sys.path)

try:
    from backend.schemas.auth import UserResponse
    print("Successfully imported UserResponse")
except ImportError as e:
    print("Import failed:", str(e))
    
    # Try to list the contents of the module
    import backend.schemas.auth as auth
    print("Contents of auth module:", dir(auth)) 