# SEI Chatbot - Saini Engineering Industries

AI-powered conversational chatbot for Saini Engineering Industries. Handles customer inquiries, factory visit scheduling, appointments, product information, and quotation requests.

## Features

✅ **AI Conversations** - Powered by OpenAI GPT-4o-mini
✅ **Factory Visits** - Schedule factory tours with date/time selection
✅ **Appointments** - Book consultations and meetings  
✅ **Product Catalog** - Browse 35+ engineering products
✅ **Quotations** - Request custom quotes for machinery
✅ **Email Notifications** - Auto-send form submissions to owner
✅ **Session Management** - Maintains conversation history
✅ **Beautiful UI** - Modern, responsive chatbot interface

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Copy `.env.example` to `.env` and fill in your details:
```bash
cp .env.example .env
```

Edit `.env` with:
- Your OpenAI API key (get from https://platform.openai.com/api/keys)
- Gmail credentials (for sending email notifications)
- Dad's email address

### 3. Gmail Setup (For Email Notifications)
1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the generated 16-character password in `.env` as `EMAIL_PASSWORD`

### 4. Run Locally
```bash
npm start
```
Then visit `http://localhost:3000`

### 5. Deploy to Vercel

1. Push to GitHub:
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. Go to https://vercel.com and import your GitHub repo

3. Add environment variables in Vercel dashboard:
   - `OPENAI_API_KEY`
   - `EMAIL_USER`
   - `EMAIL_PASSWORD`
   - `DAD_EMAIL`

4. Deploy!

## Embed on Website

Add this code snippet to your website:

```html
<div id="sei-chatbot-container"></div>
<script src="https://your-vercel-url.com/chatbot.js"></script>
```

Or embed directly:

```html
<iframe src="https://your-vercel-url.com" width="420" height="650" style="border: none; border-radius: 16px;"></iframe>
```

## Files

- `server.js` - Express backend with OpenAI integration
- `index.html` - Chatbot UI and frontend logic
- `package.json` - Dependencies
- `.env` - Environment variables (not tracked in git)

## Architecture

- **Frontend**: Vanilla JavaScript, HTML, CSS
- **Backend**: Express.js with OpenAI API
- **Email**: Nodemailer with Gmail SMTP
- **Deployment**: Vercel for serverless hosting

## Support

For issues or questions, contact the team.
