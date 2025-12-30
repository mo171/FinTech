# ComplianceAI - SaaS Landing Page

A modern Next.js 14+ SaaS landing page for an AI-powered banking compliance assistant.

## 🚀 Features

### Pages
- ✅ **Landing Page** (`/`) - Hero section, features, how it works, CTA, and footer
- ✅ **Login Page** (`/login`) - Supabase email/password authentication
- ✅ **Register Page** (`/register`) - User registration with validation
- ✅ **Dashboard** (`/dashboard`) - Protected route with quick stats and activity
- ✅ **Compliance Chat** (`/compliance-chat`) - Real-time AI chat interface

### Authentication
- ✅ Supabase authentication (email/password)
- ✅ Protected routes with middleware
- ✅ Context API for global user state management
- ✅ Dynamic navbar based on auth state
- ✅ Session persistence across page refreshes

### UI/UX
- ✅ Modern fintech design with glass morphism
- ✅ Fully responsive (mobile-first)
- ✅ shadcn/ui components
- ✅ Tailwind CSS styling
- ✅ Toast notifications (Sonner)
- ✅ Loading states and error handling
- ✅ Smooth animations and transitions

### Chat Interface
- ✅ WhatsApp-like chat UI
- ✅ User messages (right) and AI responses (left)
- ✅ Auto-scroll to latest message
- ✅ Loading indicator
- ✅ Conversation ID management
- ✅ Axios API integration

## 📦 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui
- **Authentication**: Supabase
- **HTTP Client**: Axios
- **State Management**: React Context API
- **Notifications**: Sonner
- **Icons**: Lucide React

## 🔧 Setup Instructions

### 1. Install Dependencies
```bash
yarn install
```

### 2. Configure Environment Variables
Update the `.env.local` file with your actual credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend API URL
NEXT_PUBLIC_API_URL=your_backend_api_url
```

#### Getting Supabase Credentials:
1. Go to [https://supabase.com](https://supabase.com)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the "Project URL" → Use as `NEXT_PUBLIC_SUPABASE_URL`
5. Copy the "anon public" key → Use as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### Backend API Configuration:
The chat feature expects a POST endpoint at `${NEXT_PUBLIC_API_URL}/api/chat` with:

**Request:**
```json
{
  "userId": "user_id_from_supabase",
  "message": "user_message_text",
  "conversationId": "unique_conversation_id"
}
```

**Response:**
```json
{
  "reply": "ai_response_text",
  "conversationId": "same_or_new_conversation_id",
  "status": "success"
}
```

### 3. Start Development Server
```bash
yarn dev
```

The application will be available at `http://localhost:3000`

## 📁 Project Structure

```
/app
├── app/
│   ├── api/[[...path]]/route.js   # API routes (currently unused)
│   ├── page.js                     # Landing page
│   ├── layout.js                   # Root layout with UserProvider
│   ├── globals.css                 # Global styles
│   ├── login/page.js               # Login page
│   ├── register/page.js            # Register page
│   ├── dashboard/page.js           # Dashboard (protected)
│   └── compliance-chat/page.js     # Chat interface (protected)
├── components/
│   ├── ui/                         # shadcn/ui components
│   ├── Navbar.jsx                  # Dynamic navbar
│   ├── Footer.jsx                  # Footer component
│   ├── ProtectedRoute.jsx          # Route protection wrapper
│   ├── ChatMessage.jsx             # Chat message component
│   └── ChatInput.jsx               # Chat input component
├── context/
│   └── UserContext.jsx             # User authentication context
├── lib/
│   ├── supabase.js                 # Supabase client
│   ├── axios.js                    # Axios configuration
│   └── utils.js                    # Utility functions
├── types/
│   └── index.js                    # TypeScript type definitions
├── .env.local                      # Environment variables
├── package.json                    # Dependencies
└── tailwind.config.js              # Tailwind configuration
```

## 🔐 Authentication Flow

1. **Registration**: User registers with email and password → Supabase sends verification email
2. **Login**: User logs in with credentials → Session stored in Supabase
3. **Protected Routes**: `ProtectedRoute` component checks auth state
4. **Session Management**: `UserContext` manages global user state
5. **Logout**: Clears session and redirects to home page

## 💬 Chat Integration

The compliance chat page integrates with your backend API:

1. User sends a message
2. Message is displayed in the chat UI
3. POST request sent to `/api/chat` with user message
4. AI response received and displayed
5. Conversation ID maintained for context

## 🎨 Customization

### Colors
Update the color scheme in `/app/app/globals.css` under the `@layer base` section.

### Components
All UI components are from shadcn/ui and can be customized in `/components/ui/`.

### Content
Update page content directly in the respective page files.

## 🚨 Important Notes

### Current Limitations
- ⚠️ **Supabase credentials are placeholders** - You MUST update `.env.local` with real credentials
- ⚠️ **Backend API is not implemented** - The chat endpoint needs to be connected to your backend
- ⚠️ "Apply to Scheme" feature is listed but not implemented (placeholder)

### Before Production
1. ✅ Update all environment variables with production values
2. ✅ Configure Supabase authentication settings (email templates, redirects)
3. ✅ Implement backend API endpoint for chat functionality
4. ✅ Add proper error boundaries
5. ✅ Implement rate limiting
6. ✅ Add analytics tracking
7. ✅ Enable email verification in Supabase
8. ✅ Set up proper CORS configuration

## 📝 Available Routes

### Public Routes
- `/` - Landing page
- `/login` - Login page
- `/register` - Registration page

### Protected Routes (Require Authentication)
- `/dashboard` - User dashboard
- `/compliance-chat` - AI chat interface

## 🛠️ Development Commands

```bash
# Start development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Verify environment variables are set correctly
3. Ensure Supabase project is configured properly
4. Check network requests in DevTools for API errors

## 🎯 Next Steps

1. **Update Environment Variables**: Replace placeholder values with real credentials
2. **Test Authentication**: Try registering and logging in
3. **Implement Backend**: Connect the chat API endpoint
4. **Customize Branding**: Update colors, logos, and content
5. **Add Features**: Implement "Apply to Scheme" and other features
6. **Deploy**: Deploy to Vercel, Netlify, or your preferred platform

---

Built with ❤️ using Next.js, Supabase, and shadcn/ui
