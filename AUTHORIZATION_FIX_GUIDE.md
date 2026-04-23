# How to Fix CEO Authorization Issues

## Quick Diagnostic Steps

1. **Check Your Session**
   - Open the browser console (F12)
   - Type: `fetch('/api/debug/session').then(r => r.json()).then(d => console.log(d))`
   - Look at the `role` field - it should be `"ceo"`

2. **Test Add Staff**
   - Go to Dashboard → Staff
   - Click "Add Staff"
   - Fill in the form and submit
   - Check Network tab for the error response

3. **Test Payment**
   - Go to Dashboard → Finance
   - Click payment button on any student
   - Enter amount and submit
   - Check Network tab for the error response

## Understanding Error Responses

### Error Structure
```json
{
  "error": "Human readable message",
  "yourRole": "what you're logged in as",
  "requiredRole": "ceo"
}
```

### Common Errors

1. **"Unauthorized - Please login first"**
   - You're not logged in
   - Solution: Log in again

2. **"Your role is 'student', but 'ceo' is required"**
   - You logged in as a student
   - Solution: Log in with CEO credentials (admin@edumanage.cm)

3. **"Your role is 'teacher', but 'ceo' is required"**
   - You logged in as a teacher
   - Solution: Log in with CEO credentials

4. **"Your role is 'ceo', but 'ceo' is required"** (if still failing)
   - Session issue - your session was lost
   - Solution: Clear cookies and log in again

## How to Clear Cookies & Refresh

1. Open DevTools (F12)
2. Go to Application → Cookies
3. Delete all cookies for this domain
4. Refresh the page (Ctrl+R)
5. Log back in

## Alternative: Reset Session in Database

Run this command:
```bash
rm prisma/dev.db && npx prisma db push && npm run seed
```

Then log in with:
- Email: `admin@edumanage.cm`
- Password: `admin123`

## If Still Not Working

Share the exact error response from the Network tab, and we can debug further.
