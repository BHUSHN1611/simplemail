# Manual Test Checklist for Gmail App Password Integration

## Prerequisites

1. **Gmail Account Setup**
   - Have a Gmail account with 2-factor authentication enabled
   - Generate an app password for the application
   - Note: App passwords are only available for accounts with 2FA enabled

2. **Environment Setup**
   - Copy `backend/env.example` to `backend/.env`
   - Fill in all required environment variables
   - Ensure MongoDB is running (local or cloud instance)
   - Install dependencies: `npm install` in both backend and frontend directories

## Test Scenarios

### 1. Environment Configuration Test

**Objective**: Verify that environment variables are properly loaded

**Steps**:
1. Start the backend server: `cd backend && npm start`
2. Check console output for any missing environment variable warnings
3. Verify server starts without errors on the configured PORT

**Expected Result**: 
- Server starts successfully
- No environment variable warnings in console
- Server responds to health check at `/test` endpoint

**Pass/Fail**: ☐ Pass ☐ Fail

---

### 2. Gmail App Password Authentication Test

**Objective**: Verify that users can login using Gmail email + app password

**Steps**:
1. Open the frontend application
2. Click "Login" button
3. Enter valid Gmail email address
4. Enter the generated app password (not regular password)
5. Click "Sign in"

**Expected Result**:
- Login succeeds
- User is redirected to dashboard
- JWT token is stored in localStorage
- No authentication errors in browser console

**Pass/Fail**: ☐ Pass ☐ Fail

---

### 3. Email Sending Test

**Objective**: Verify that emails can be sent using Gmail SMTP with app password

**Steps**:
1. After successful login, navigate to compose email
2. Fill in recipient email address
3. Enter subject line
4. Enter email body
5. Click send

**Expected Result**:
- Email sends successfully
- Success message displayed
- Email appears in recipient's inbox
- No SMTP authentication errors

**Pass/Fail**: ☐ Pass ☐ Fail

---

### 4. Email Fetching Test (IMAP)

**Objective**: Verify that emails can be fetched from Gmail inbox via IMAP

**Steps**:
1. After successful login, navigate to inbox
2. Verify that emails are loaded
3. Check that email content is properly displayed
4. Verify email metadata (sender, subject, date) is correct

**Expected Result**:
- Emails load successfully
- Email content is properly formatted
- All email metadata is displayed correctly
- No IMAP connection errors

**Pass/Fail**: ☐ Pass ☐ Fail

---

### 5. Error Handling Test

**Objective**: Verify that authentication and network errors are handled gracefully

**Steps**:
1. Try logging in with invalid app password
2. Try logging in with invalid email format
3. Disconnect internet and try sending email
4. Try accessing protected routes without authentication

**Expected Results**:
- Invalid credentials show appropriate error message
- Network errors show user-friendly messages
- Unauthenticated requests return 401 status
- Error messages are not exposing sensitive information

**Pass/Fail**: ☐ Pass ☐ Fail

---

### 6. OAuth Fallback Test (Optional)

**Objective**: Verify OAuth authentication still works as fallback

**Steps**:
1. Use Google OAuth login instead of app password
2. Verify OAuth flow completes successfully
3. Test email sending and fetching with OAuth tokens

**Expected Result**:
- OAuth flow completes without redirect URI mismatch errors
- Email operations work with OAuth tokens
- Tokens refresh automatically when expired

**Pass/Fail**: ☐ Pass ☐ Fail

---

### 7. Security Test

**Objective**: Verify that credentials are not exposed in logs or responses

**Steps**:
1. Check backend logs during authentication
2. Check network requests in browser dev tools
3. Verify that app passwords are not logged
4. Check that environment variables are not exposed

**Expected Result**:
- No credentials visible in logs
- App passwords are not transmitted in plain text
- Environment variables are not exposed in responses
- Sensitive data is properly sanitized

**Pass/Fail**: ☐ Pass ☐ Fail

---

### 8. Performance Test

**Objective**: Verify that email operations complete within reasonable time

**Steps**:
1. Measure time to fetch 10 emails from inbox
2. Measure time to send an email
3. Test with larger email volumes (50+ emails)

**Expected Results**:
- Inbox loads within 5 seconds
- Email sending completes within 10 seconds
- No timeouts with reasonable email volumes

**Pass/Fail**: ☐ Pass ☐ Fail

---

## Common Issues and Solutions

### Issue: "Authentication failed" error
**Solution**: 
- Verify 2FA is enabled on Gmail account
- Generate new app password
- Ensure using app password, not regular password

### Issue: "CORS blocked request" error
**Solution**:
- Check ALLOWED_ORIGINS environment variable
- Ensure frontend URL is included in allowed origins
- Verify CORS configuration in backend

### Issue: "No email credentials configured" error
**Solution**:
- Set GMAIL_DEMO_EMAIL and GMAIL_DEMO_APP_PASSWORD in .env
- Or login with app password to use user credentials

### Issue: IMAP connection timeouts
**Solution**:
- Check internet connection
- Verify Gmail IMAP settings are enabled
- Try different IMAP host/port combinations

## Test Results Summary

| Test Scenario | Status | Notes |
|---------------|--------|-------|
| Environment Configuration | ☐ Pass ☐ Fail | |
| App Password Authentication | ☐ Pass ☐ Fail | |
| Email Sending | ☐ Pass ☐ Fail | |
| Email Fetching | ☐ Pass ☐ Fail | |
| Error Handling | ☐ Pass ☐ Fail | |
| OAuth Fallback | ☐ Pass ☐ Fail | |
| Security | ☐ Pass ☐ Fail | |
| Performance | ☐ Pass ☐ Fail | |

**Overall Test Result**: ☐ Pass ☐ Fail

**Tester**: _________________  
**Date**: _________________  
**Environment**: _________________
