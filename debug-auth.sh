#!/bin/bash

echo "========================================="
echo "CEO Authorization Debugging Script"
echo "========================================="
echo ""

# Check if database exists
if [ ! -f "prisma/dev.db" ]; then
    echo "⚠️  Database not found at prisma/dev.db"
    echo "Please run: npx prisma db push"
    exit 1
fi

echo "✅ Database found"
echo ""

# Use npm to run a quick test
echo "Testing CEO authorization..."
echo ""

# Check the CEO user in the database
npm exec -- prisma db execute << 'EOF'
SELECT 
  id, 
  email, 
  role, 
  isActivated,
  firstName,
  lastName
FROM "User" 
WHERE role = 'ceo' OR email = 'admin@edumanage.cm'
LIMIT 5;
EOF

echo ""
echo "========================================="
echo "Recommendations:"
echo "========================================="
echo ""
echo "1. Open your browser DevTools (F12)"
echo "2. Go to the Network tab"
echo "3. Try to add staff or record a payment"
echo "4. Look for the API request (POST /api/teachers or /api/students/[id]/pay-fees)"
echo "5. Check the Response tab to see the exact error message"
echo ""
echo "Then share the error message from the API response:"
echo "  - If it says 'role is X', your session has wrong role"
echo "  - If it says 'No session found', cookies might be cleared"
echo ""
