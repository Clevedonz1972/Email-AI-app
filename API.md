# API Documentation

## Authentication Endpoints

### Register User
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword",
    "full_name": "John Doe"
  }
  ```
- **Response**: User object

### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "strongpassword"
  }
  ```
- **Response**: Access token and refresh token

### Refresh Token
- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Cookies Required**: `refresh_token`
- **Response**: New access token

### Get Current User
- **URL**: `/auth/me`
- **Method**: `GET`
- **Headers Required**: `Authorization: Bearer <token>`
- **Response**: User object

### Forgot Password
- **URL**: `/auth/forgot-password`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: Success message

### Reset Password
- **URL**: `/auth/reset-password/{token}`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "new_password": "newstrongpassword"
  }
  ```
- **Response**: Success message

### Change Password
- **URL**: `/auth/change-password`
- **Method**: `POST`
- **Headers Required**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "current_password": "oldpassword",
    "new_password": "newpassword"
  }
  ```
- **Response**: Success message

## Password Reset Flow

### Request Password Reset
- **URL**: `/auth/forgot-password`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**: 
  ```json
  {
    "message": "Password reset email sent"
  }
  ```
- **Notes**: 
  - Always returns 200 status to prevent email enumeration
  - Sends reset link via email if account exists
  - Reset tokens expire in 1 hour

### Reset Password
- **URL**: `/auth/reset-password/{token}`
- **Method**: `POST`
- **Parameters**: 
  - token (string): Reset token from email
- **Body**:
  ```json
  {
    "new_password": "newSecurePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```
- **Error Responses**:
  - `400`: Invalid or expired token
  - `400`: Invalid password format
  - `400`: User not found

### Change Password (Authenticated)
- **URL**: `/auth/change-password`
- **Method**: `POST`
- **Headers Required**: `Authorization: Bearer <token>`
- **Body**:
  ```json
  {
    "current_password": "oldPassword123",
    "new_password": "newSecurePassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Password updated successfully"
  }
  ```
- **Error Responses**:
  - `400`: Incorrect current password
  - `401`: Unauthorized 