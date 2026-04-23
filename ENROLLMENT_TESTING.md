# Enrollment System - Testing & Migration Guide

## Before Running

### 1. Update Database
```bash
cd school-management
npx prisma db push
```

This will:
- Add `matricle`, `approvedAt`, `approvedBy`, `rejectedReason` fields to Enrollment table
- Add `matricle` field to Student table
- Create necessary indexes for unique constraints

### 2. Restart Development Server
```bash
npm run dev
```

## Testing Flow (Step by Step)

### Phase 1: Student Enrollment (No Login Required)

#### Step 1A: Submit Enrollment Application
1. Visit: `http://localhost:3000/enroll`
2. Fill form with:
   - First Name: "John"
   - Last Name: "Doe"
   - Email: "john@example.com"
   - Phone: "1234567890"
   - Program: "bsc-computer-science"
   - (Other fields optional)
3. Click "Submit Application"
4. Should redirect to: `/enroll/success?id=1` (or appropriate ID)
5. ✅ Verify: Download button appears

#### Step 1B: Download Enrollment Form
1. On success page, click "Download Form"
2. Browser opens HTML form in new window
3. Click "Print or Save as PDF" button
4. ✅ Verify: All student data is displayed
5. ✅ Verify: Shows "Status: Pending"
6. ✅ Verify: No Matricle Number yet (will appear after approval)

---

### Phase 2: CEO Approval (Requires CEO Login)

#### Step 2A: Login as CEO
1. Visit: `http://localhost:3000/login`
2. Use credentials:
   - Email: `ceo@example.com` (or your CEO account)
   - Password: (your password)
3. Redirects to: `/dashboard/ceo`

#### Step 2B: View Enrollment Applications
1. Click "Enrollments" in sidebar
2. Should see:
   - Total counts (Pending: 1, Approved: 0, Rejected: 0)
   - Table with the application from Phase 1A
3. Click "Download" button
4. ✅ Verify: Form shows "Pending" status

#### Step 2C: Approve Enrollment
1. In the table, click "Approve" button
2. Wait 2-3 seconds for processing
3. Toast notification should show: "Application approved - Matricle: MAT2024xxxxx"
4. ✅ Verify: Table updates with new matricle number
5. ✅ Verify: Status changes to "Approved"
6. ✅ Verify: "Approve/Reject" buttons disappeared

#### Step 2D: Verify Matricle Generation
1. Download form again (click "Download")
2. ✅ Verify: Form now shows:
   - Status: "Approved"
   - Matricle Number box with unique ID
   - Message: "Use this number to create your account"

---

### Phase 3: Student Registration (Using Matricle)

#### Step 3A: Logout (if still logged in as CEO)
1. Click profile menu → Logout
2. Redirected to login page

#### Step 3B: Visit Registration Page
1. Visit: `http://localhost:3000/register`
2. See blue section: "Verify Your Matricle"

#### Step 3C: Failed Verification (Wrong Matricle)
1. Enter Matricle: "INVALID123"
2. Enter Email: "john@example.com"
3. Click "Verify Matricle"
4. ✅ Verify: Error appears: "Invalid matricle number"
5. ✅ Verify: Form remains editable

#### Step 3D: Failed Verification (Wrong Email)
1. Enter Matricle: "MAT2024xxxxx" (from Step 2C notification)
2. Change Email: "wrong@example.com"
3. Click "Verify Matricle"
4. ✅ Verify: Error: "Email does not match enrollment record"

#### Step 3E: Successful Verification
1. Correct Matricle: "MAT2024xxxxx"
2. Correct Email: "john@example.com"
3. Click "Verify Matricle"
4. ✅ Verify: Button changes to "Verified" (green)
5. ✅ Verify: Name fields auto-populate: "John" + "Doe"
6. ✅ Verify: Email field gets disabled
7. ✅ Verify: Matricle field gets disabled
8. ✅ Verify: Password section appears

#### Step 3F: Complete Registration
1. Enter Password: "Password123"
2. Confirm Password: "Password123"
3. Click "Create Account"
4. ✅ Verify: Redirects to `/dashboard/student`
5. ✅ Verify: Student name shows in top-right
6. ✅ Verify: Can navigate student dashboard

---

### Phase 4: Verify Data Integrity

#### Test 4A: Check Student Profile Created
1. As CEO, go to Students section (if available)
2. ✅ Verify: "John Doe" appears in student list
3. ✅ Verify: StudentID and Matricle are set
4. ✅ Verify: Program is "bsc-computer-science"

#### Test 4B: Try Duplicate Registration (Should Fail)
1. Logout and attempt to register again with same email
2. ✅ Verify: Error at verification step: "Account already exists for this email"

#### Test 4C: Try Registration Before Approval (Should Fail)
1. Submit NEW enrollment application
2. Don't approve it
3. Try to register with that matricle
4. ✅ Verify: Error: "Your enrollment is pending. Please contact admissions."

#### Test 4D: Try Registration with Rejected Application (Should Fail)
1. As CEO, submit another enrollment
2. Reject it
3. Try to register with that matricle
4. ✅ Verify: Error: "Your enrollment is rejected. Please contact admissions."

---

## Troubleshooting

### Issue: "Unknown table" or database errors
**Solution:** Run `npx prisma db push` to sync schema

### Issue: Matricle not generating
**Solution:** 
- Check server logs for errors
- Verify enrollment record exists in database
- Try refreshing page

### Issue: Registration won't verify
**Solution:**
- Check exact spelling of matricle (case-sensitive)
- Verify email matches enrollment email exactly
- Check that enrollment status is "approved" in DB

### Issue: Student can't access dashboard after registration
**Solution:**
- Check browser console for errors
- Verify session is being set properly
- Try clearing cookies and logging in again

## Database Queries for Verification

To manually check in Prisma Studio:
```bash
npx prisma studio
```

Then run:
```javascript
// View all enrollments with matricles
db.enrollment.findMany({
  select: { id: true, firstName: true, email: true, status: true, matricle: true, createdAt: true }
})

// View approved enrollments with matricles
db.enrollment.findMany({
  where: { status: "approved", matricle: { not: null } }
})

// View created students with matricles
db.student.findMany({
  select: { id: true, studentId: true, matricle: true, user: { select: { firstName: true, email: true } } }
})
```

## Success Criteria

All tests passed when:
- ✅ Students can enroll and download form
- ✅ Form shows pre-approval status
- ✅ CEO can approve and matricle generates
- ✅ Form shows post-approval status with matricle
- ✅ Students must verify matricle to register
- ✅ Only approved students can complete registration
- ✅ Student profiles created with matricle
- ✅ System prevents duplicate accounts
- ✅ System prevents unapproved registration
- ✅ All data integrity checks pass
