# AI Helper Feature Documentation

## Overview

The **AI Helper** is an intelligent chatbot assistant available to all users (Students, Teachers, and CEO) in the EduManage system. It provides instant support and guidance on various topics.

## Features

### 1. **Programming Assistance**
The AI can help with:
- JavaScript/TypeScript
- Python
- Java
- React and web frameworks
- Functions, loops, arrays, objects
- Code concepts and best practices

**Example Questions:**
- "How do I write a function in JavaScript?"
- "What's the difference between let and const?"
- "How do I create an array in Python?"

### 2. **HTML & Web Development**
- HTML structure and tags
- Common HTML elements (buttons, forms, tables, divs)
- Web development basics
- Markup best practices

**Example Questions:**
- "How do I create a form in HTML?"
- "What's the difference between div and section?"
- "Show me a button example"

### 3. **Microsoft Office Tools Guidance**
The AI provides tutorials and quick-start guides for:

#### Word
- Document creation and formatting
- Font and style management
- Saving and printing documents

#### Excel
- Data entry and formulas
- Creating charts
- Sorting and filtering data
- Common functions (SUM, AVERAGE, COUNT, etc.)

#### PowerPoint
- Creating presentations
- Adding slides and content
- Applying themes and animations
- Presenting slideshows

**Example Questions:**
- "How do I use Excel formulas?"
- "Teach me how to make a PowerPoint presentation"
- "How do I format text in Word?"

### 4. **System Information**
The AI knows about:
- Dashboard features and navigation
- Enrollment process
- Attendance tracking
- Grade system
- Fee management
- Course information

**Example Questions:**
- "How do I enroll in a program?"
- "How are grades calculated?"
- "How do I view my attendance?"

## User Interface

### Chatbot Window

The AI Helper appears as a floating chat button in the bottom-right corner of every dashboard page.

**Features:**
- Click the blue message icon to open the chat
- Type your question or message
- The AI responds instantly with relevant information
- Conversation history is maintained during your session
- Click the X button to close the chat

### Visual Design
- Clean, modern chat interface
- Blue gradient header with AI name
- User messages appear on the right (blue)
- AI responses appear on the left (white with border)
- Smooth animations and responsive design
- Works on desktop and mobile devices

## Customizing the AI Name

### For CEO Users

1. **Navigate to Settings**
   - Go to Dashboard → Settings (bottom of sidebar)

2. **Find AI Assistant Configuration Section**
   - Look for the section titled "AI Assistant Configuration"
   - Shows current AI name and preview

3. **Change the AI Name**
   - Edit the "AI Assistant Name" field
   - Enter your desired name (e.g., "SmartTutor", "EduBot", "Alex")
   - Click "Save AI Assistant Name"

4. **Verification**
   - The new name will immediately appear in the chat interface
   - All users will see the new name in their AI Helper

### Example Names
- EduAssistant (default)
- SmartTutor
- EduBot
- Alex (or any personal name)
- SchoolHelper
- Professor AI

## Available to All Users

The AI Helper is accessible to:
- ✅ **Students** - In student dashboard
- ✅ **Teachers** - In teacher dashboard  
- ✅ **CEO/Administrators** - In admin dashboard
- ✅ **All dashboard pages** - Available on every dashboard section

## How to Use

### Step 1: Open the Chat
Click the floating blue message icon in the bottom-right corner of any dashboard page.

### Step 2: Type Your Question
- Ask any question about programming, HTML, Office tools, or the system
- Be specific for better answers
- Use natural language - ask as you would a person

### Step 3: Get Your Answer
- The AI responds instantly
- Answers include code examples when relevant
- Click Send again to continue the conversation

### Example Conversations

**Example 1: Programming Help**
```
User: "How do I create a loop in JavaScript?"
AI: "Here's how to create a loop in JavaScript:

For loop: for (let i = 0; i < 5; i++) { }
While loop: while (condition) { }

Loops repeat code. Use them to iterate over arrays or repeat actions."
```

**Example 2: Office Tools**
```
User: "How do I create a formula in Excel?"
AI: "Common Excel formulas:

=SUM(A1:A10) - Add range
=AVERAGE(A1:A10) - Calculate average
=COUNT(A1:A10) - Count numbers
=IF(A1>10,"Yes","No") - Conditional

Select a cell, type the formula, and press Enter!"
```

**Example 3: System Information**
```
User: "How do I view my grades?"
AI: "Grade System:

• Based on CA (Continuous Assessment) and Exams
• Formula: Total = CA + Exam Score
• Letter grades: A, B, C, D, F
• View your transcript in dashboard

Work hard to improve grades!"
```

## Technical Details

### Knowledge Base
The AI uses a structured knowledge base covering:
- **Programming**: Keywords matching programming questions
- **HTML**: Keywords matching web development questions
- **Office Tools**: Keywords matching Word, Excel, PowerPoint questions
- **System**: Keywords matching system feature questions

### Response Engine
- Pattern matching based on user input
- Regex-based keyword detection
- Fallback responses for unknown questions
- Encourages users to ask about known topics

### API Endpoints

**Get AI Name:**
```
GET /api/settings/ai-name
Response: { aiName: "EduAssistant" }
```

**Chat with AI:**
```
POST /api/ai/chat
Body: { message: "Your question here" }
Response: { response: "AI answer here" }
```

**Update AI Name (CEO only):**
```
POST /api/settings/ai-name-update
Headers: Authorization required (CEO role)
Body: { aiName: "New AI Name" }
Response: { success: true, aiName: "New AI Name" }
```

## Privacy & Data

- **No Data Persistence**: Conversations are not saved after logout
- **No User Tracking**: The AI doesn't store user information
- **Local Processing**: All responses are generated server-side
- **Secure**: Only authenticated users can access the AI

## Future Enhancements

Possible improvements:
- Multiple AI personas for different subjects
- Integration with actual course materials
- Machine learning based on common questions
- Multilingual support
- Advanced topic coverage expansion
- Integration with external documentation

## Troubleshooting

### AI Not Appearing?
- Refresh the page (Ctrl+R or Cmd+R)
- Clear browser cookies
- Check if you're logged in to the dashboard

### AI Not Responding?
- Check your internet connection
- Try refreshing the page
- The API might be temporarily unavailable

### Want Different AI Name?
- You must be logged in as CEO
- Go to Dashboard → Settings
- Find "AI Assistant Configuration" section
- Update and save the name

## Support

For issues or questions about the AI Helper:
1. Contact your system administrator
2. Check this documentation
3. Report bugs to the development team

---

**Version:** 1.0  
**Last Updated:** April 2026  
**Feature Status:** Active and Available to All Users
