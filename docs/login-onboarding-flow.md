# ASTI App: Login and Onboarding Flow

## Overview

The ASTI application features a comprehensive authentication system and onboarding experience designed to guide new users through the platform's features while ensuring secure access. This document outlines the login process, registration flow, and onboarding experience.

## Authentication Flow

### Login Process

1. **Access:** Users access the login page at `/login`
2. **Credentials:** Users enter their email and password
3. **Validation:** Client-side validation ensures proper email format
4. **Authentication:** Credentials are sent to the backend API (`/api/auth/login`)
5. **Response:** Upon successful authentication, an access token is stored in localStorage
6. **Redirect:** User is redirected to the dashboard (`/dashboard`)

### Registration Process

1. **Access:** New users access the registration page at `/register`
2. **Information:** Users provide email, password, and confirm password
3. **Validation:** Client-side validation ensures password match and proper format
4. **Registration:** Information is sent to the backend API (`/api/auth/register`)
5. **Authentication:** Upon successful registration, an access token is stored in localStorage
6. **Redirect:** User is redirected to the dashboard with onboarding flow triggered

### Password Recovery

1. **Forgot Password:** Users can request password reset from the login page
2. **Email Input:** Users provide their email address
3. **Reset Link:** A password reset link is sent to the provided email
4. **Reset Page:** Users access the reset page via the emailed link
5. **New Password:** Users set a new password
6. **Confirmation:** Users are redirected to login with the new credentials

## Onboarding Experience

### Automatic Triggering

The onboarding flow is automatically triggered for new users upon their first login. This is managed through the following mechanism:

1. The Dashboard component checks if `localStorage.getItem('onboardingComplete') !== 'true'`
2. If the user is new (onboarding not completed), the onboarding tutorial is displayed
3. Upon completion, `localStorage.setItem('onboardingComplete', 'true')` is set

### Onboarding Components

The application includes two primary onboarding components:

1. **OnboardingTutorial (`/components/Onboarding/OnboardingTutorial.tsx`):**
   - Modal dialog-based onboarding
   - Step-by-step walkthrough of key features
   - Configures accessibility and preference settings
   
2. **OnboardingFlow (`/components/Onboarding/OnboardingFlow.tsx`):**
   - Full-page onboarding experience
   - More detailed introduction to the application
   - Used for comprehensive onboarding

### Welcome Message

A welcome message appears at the top of the dashboard for users who haven't dismissed it:

1. The message includes a brief introduction to the application
2. Users can start a guided tour via the "Take Tour" button
3. Users can dismiss the message, which sets `localStorage.setItem('showWelcomeMessage', 'false')`

## Testing & Administration

An admin panel has been implemented to facilitate testing and management of the onboarding flow:

### Admin Onboarding Controls

Located at `/admin/onboarding`, this page allows administrators to:

1. **View Current Status:** Check if onboarding is completed for the current user
2. **Reset Onboarding:** Clear the onboarding completion state to trigger it again
3. **Toggle Welcome Message:** Enable/disable the welcome message on the dashboard
4. **Test Onboarding:** Launch any onboarding experience (Tutorial or Flow) without affecting user state
5. **Create Test Users:** Simulate creating new users for testing purposes

## Implementation Notes

### Storage Mechanism

The application uses localStorage to manage onboarding and welcome message states:

- `onboardingComplete`: Stores whether the user has completed onboarding
- `showWelcomeMessage`: Controls visibility of the welcome message

### Security Considerations

- Admin routes should be protected with proper authorization checks
- The current implementation assumes the user's role would be verified server-side
- For production deployment, additional security measures should be implemented

## Future Enhancements

1. **Server-side User State:** Move onboarding status to server-side user profile
2. **Personalized Onboarding:** Tailor the onboarding experience based on user role or preferences
3. **Progress Tracking:** Allow users to save progress in multi-step onboarding flows
4. **Contextual Help:** Add in-app tooltips and guided tours for specific features
5. **User Feedback:** Collect feedback after onboarding to improve the experience 