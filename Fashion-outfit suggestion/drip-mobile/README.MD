# 👗 Drip — Fashion Outfit Suggestion Platform

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![React Native](https://img.shields.io/badge/React_Native-0.86-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Expo](https://img.shields.io/badge/Expo-57-000020?style=for-the-badge&logo=expo&logoColor=white)
![Express](https://img.shields.io/badge/Express-4.x-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Socket.io](https://img.shields.io/badge/Socket.io-4.x-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=for-the-badge&logo=stripe&logoColor=white)

**A full-stack fashion discovery platform where users browse short outfit reels, shop directly from videos, follow fashion brands, and get AI-powered style recommendations. Available on both Web and Mobile platforms.**

Think Zomato meets TikTok — but for fashion.

</div>

---

## 📌 Project Description

Drip is a comprehensive fashion outfit suggestion platform that combines social media features with e-commerce capabilities. Users can discover fashion trends through short video reels, interact with fashion partners, receive AI-powered personalized recommendations, and shop for outfits directly from the platform. The application serves three main user types: regular users, fashion partners (brands), and administrators.

**Platform Availability:**
- **Web Application**: Full-featured web experience built with React
- **Mobile Application**: Native mobile experience built with React Native and Expo for iOS and Android

---

## ✨ Features

### 👤 User Features
- **Authentication System**: Secure JWT-based authentication with refresh tokens
- **Style Quiz**: Personalized style preferences for better recommendations
- **Fashion Feed**: Vertical scrolling feed of outfit reels with filters
- **Social Interactions**: Like, bookmark, comment, and follow fashion partners
- **AI Recommendations**: Personalized outfit suggestions based on user behavior
- **Search & Discovery**: Full-text search with advanced filters and trending tags
- **Shopping Cart**: Add outfits with price locking and quantity management
- **Checkout Process**: Stripe payment integration and Cash on Delivery support
- **Order Management**: Track orders, view order history, and order details
- **Real-time Chat**: Direct messaging with fashion partners
- **Notifications**: Real-time alerts for likes, comments, follows, and orders
- **Profile Management**: Update personal information and preferences

### 🏢 Partner Features
- **Partner Authentication**: Separate authentication system for fashion brands
- **Dashboard**: Comprehensive dashboard for managing outfit inventory
- **Outfit Upload**: Upload videos and images via ImageKit CDN
- **Inventory Management**: Create, update, delete, and feature outfits
- **Order Management**: View and manage customer orders
- **Analytics**: Track sales performance and engagement metrics
- **Customer Communication**: Real-time chat with customers
- **Profile Management**: Update brand information and settings

### 🛡️ Admin Features
- **Admin Panel**: Complete administrative control panel
- **User Management**: View, ban, and unban users
- **Partner Management**: Approve, reject, and manage fashion partners
- **Content Moderation**: Moderate outfits and comments
- **Order Oversight**: View all platform orders
- **Platform Analytics**: Comprehensive analytics with aggregation pipelines
- **Admin Management**: Create and manage admin accounts with role-based permissions

### 🔒 Security Features
- **Helmet Security Headers**: Protection against common web vulnerabilities
- **CORS Whitelist**: Controlled cross-origin resource sharing
- **Rate Limiting**: Route-specific rate limiting to prevent abuse
- **NoSQL Injection Prevention**: MongoDB query sanitization
- **XSS Protection**: Input escaping and Content Security Policy
- **HTTP Parameter Pollution**: Prevention of duplicate parameter attacks
- **Password Hashing**: Bcrypt with salt rounds for secure password storage
- **Environment Validation**: Startup validation of required environment variables

---

## 🏗️ Tech Stack

### Backend (drip-backend)
- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.x
- **Database**: MongoDB Atlas
- **ODM**: Mongoose 8.x
- **Authentication**: JWT (jsonwebtoken 9.x) + HTTP-only cookies
- **Real-time**: Socket.io 4.x
- **Security**: 
  - Helmet 7.x (security headers)
  - express-rate-limit 7.x
  - express-mongo-sanitize 2.x
  - express-validator 7.x
  - hpp 0.2.x
- **Payments**: Stripe 14.x
- **Media Storage**: ImageKit 5.x
- **File Upload**: Multer 1.x
- **Logging**: Winston 3.x
- **Password Hashing**: bcrypt/bcryptjs

### Frontend (drip-frontend)
- **Framework**: React 18.x
- **Build Tool**: Vite 5.x
- **Styling**: TailwindCSS 3.x
- **Routing**: React Router DOM 6.x
- **State Management**: Zustand 4.x
- **Data Fetching**: TanStack React Query 5.x
- **Form Handling**: React Hook Form 7.x
- **Validation**: Zod 3.x
- **HTTP Client**: Axios 1.x
- **Animations**: Framer Motion 10.x
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Real-time**: Socket.io Client 4.x
- **Payments**: Stripe React SDK

### Mobile (drip-mobile)
- **Framework**: React Native 0.86.x
- **Platform**: Expo SDK 57.x
- **Runtime**: React 19.x
- **Navigation**: React Navigation 7.x
  - Native Stack Navigator
  - Bottom Tabs Navigator
  - Drawer Navigator
- **State Management**: Zustand 5.x
- **Data Fetching**: TanStack React Query 5.x
- **Form Handling**: React Hook Form 7.x
- **Validation**: Zod 4.x
- **HTTP Client**: Axios 1.x
- **Real-time**: Socket.io Client 4.x
- **Payments**: Stripe React Native 0.64.x
- **Storage**: 
  - AsyncStorage 2.x
  - Expo Secure Store 57.x
- **Media Handling**:
  - Expo AV 16.x (video/audio)
  - Expo Image Picker 57.x
  - React Native Video 6.x
- **Notifications**: Expo Notifications 57.x
- **Fonts**: Expo Font 57.x
- **Charts**: React Native Chart Kit 7.x
- **Animations**: React Native Reanimated 4.5.x
- **Gestures**: React Native Gesture Handler 2.32.x
- **Icons**: Expo Vector Icons 15.x
- **Toast**: React Native Toast Message 2.x
- **Utilities**: 
  - date-fns 4.x (date formatting)
  - React Native Worklets 0.10.x

---

## 📁 Project Structure

```
Fashion-outfit suggestion/
├── drip-backend/                    # Backend API Server
│   ├── server.js                    # HTTP server + Socket.io initialization
│   ├── app.js                       # Express app configuration
│   ├── config/                      # Configuration files
│   │   ├── db.js                    # MongoDB connection
│   │   ├── imagekit.js              # ImageKit CDN configuration
│   │   ├── logger.js                # Winston logger setup
│   │   ├── socket.js                # Socket.io configuration
│   │   └── security.js              # Security configurations (CORS, Helmet)
│   ├── controllers/                 # Business logic controllers
│   │   ├── admin.controller.js      # Admin operations
│   │   ├── ai.controller.js         # AI recommendation logic
│   │   ├── auth.controller.js       # User authentication
│   │   ├── cart.controller.js       # Shopping cart operations
│   │   ├── chat.controller.js       # Real-time messaging
│   │   ├── notification.controller.js  # Notification management
│   │   ├── order.controller.js      # Order processing
│   │   ├── outfit.controller.js     # Outfit CRUD operations
│   │   ├── partner.controller.js    # Partner operations
│   │   ├── search.controller.js     # Search functionality
│   │   ├── social.controller.js     # Social features
│   │   └── upload.controller.js     # File upload handling
│   ├── models/                      # Mongoose data models
│   │   ├── Admin.js                 # Admin user model
│   │   ├── Bookmark.js              # Bookmark model
│   │   ├── Cart.js                  # Shopping cart model
│   │   ├── Comment.js               # Comment model
│   │   ├── FashionPartner.js        # Partner model
│   │   ├── Follow.js                # Follow relationship model
│   │   ├── Like.js                  # Like model
│   │   ├── Message.js               # Chat message model
│   │   ├── Notification.js          # Notification model
│   │   ├── Order.js                 # Order model
│   │   ├── OutfitItem.js            # Outfit/product model
│   │   └── User.js                  # User model
│   ├── routes/                      # API route definitions
│   │   ├── admin.routes.js          # Admin endpoints
│   │   ├── ai.routes.js             # AI recommendation endpoints
│   │   ├── auth.routes.js           # Authentication endpoints
│   │   ├── cart.routes.js           # Cart endpoints
│   │   ├── chat.routes.js           # Chat endpoints
│   │   ├── notification.routes.js  # Notification endpoints
│   │   ├── order.routes.js          # Order endpoints
│   │   ├── outfit.routes.js         # Outfit endpoints
│   │   ├── partner.routes.js        # Partner endpoints
│   │   ├── search.routes.js         # Search endpoints
│   │   ├── social.routes.js         # Social feature endpoints
│   │   └── upload.routes.js         # Upload endpoints
│   ├── middleware/                  # Custom middleware
│   │   ├── authUser.middleware.js   # User authentication
│   │   ├── authPartner.middleware.js # Partner authentication
│   │   ├── authAdmin.middleware.js  # Admin authentication
│   │   ├── error.middleware.js      # Global error handler
│   │   ├── rateLimit.middleware.js  # Rate limiting
│   │   ├── upload.middleware.js     # File upload handling
│   │   └── validate.middleware.js   # Input validation
│   ├── services/                    # External service integrations
│   │   ├── ai.service.js            # AI scoring algorithms
│   │   ├── imagekit.service.js      # ImageKit operations
│   │   ├── socket.service.js        # Socket.io helpers
│   │   └── stripe.service.js        # Stripe payment processing
│   ├── utils/                       # Utility functions
│   │   ├── AppError.js              # Custom error class
│   │   ├── catchAsync.js            # Async error wrapper
│   │   ├── constants.js             # Application constants
│   │   ├── pagination.js            # Pagination utilities
│   │   └── sendResponse.js          # Response formatter
│   ├── scripts/                     # Utility scripts
│   │   └── seedAdmin.js             # Admin account seeding
│   ├── .env.example                 # Environment variables template
│   ├── package.json                 # Backend dependencies
│   └── README.md                    # Backend documentation
│
└── drip-frontend/                   # Frontend React Application
    ├── index.html                   # HTML entry point
    ├── vite.config.js               # Vite configuration
    ├── tailwind.config.js           # TailwindCSS configuration
    ├── postcss.config.js            # PostCSS configuration
    ├── .eslintrc.cjs                # ESLint configuration
    ├── package.json                 # Frontend dependencies
    ├── public/                      # Static assets
    │   └── vite.svg
    └── src/                        # Source code
        ├── main.jsx                 # React entry point
        ├── App.jsx                  # Main app component with routing
        ├── index.css                # Global styles
        ├── api/                     # API service layer
        │   ├── auth.js              # Authentication API
        │   ├── cart.js              # Cart API
        │   ├── chat.js              # Chat API
        │   ├── order.js             # Order API
        │   ├── outfit.js            # Outfit API
        │   ├── partner.js           # Partner API
        │   ├── search.js            # Search API
        │   ├── social.js            # Social API
        │   └── upload.js            # Upload API
        ├── components/              # Reusable components
        │   ├── layout/              # Layout components
        │   │   ├── ProtectedRoute.jsx
        │   │   └── AdminProtectedRoute.jsx
        │   ├── ui/                  # UI components
        │   │   ├── Button.jsx
        │   │   ├── Input.jsx
        │   │   ├── Modal.jsx
        │   │   ├── Spinner.jsx
        │   │   └── ...
        │   ├── outfit/              # Outfit-related components
        │   ├── social/              # Social feature components
        │   └── ...
        ├── hooks/                   # Custom React hooks
        │   ├── useAuth.js           # Authentication hook
        │   ├── useCart.js           # Cart hook
        │   ├── useNotification.js   # Notification hook
        │   ├── useSocket.js         # Socket.io hook
        │   └── ...
        ├── layouts/                 # Page layouts
        │   ├── MainLayout.jsx       # Main user layout
        │   ├── AuthLayout.jsx       # Authentication layout
        │   └── PartnerLayout.jsx    # Partner dashboard layout
        ├── pages/                   # Page components
        │   ├── Landing.jsx          # Landing page
        │   ├── Login.jsx            # Login page
        │   ├── Register.jsx         # Registration page
        │   ├── Feed.jsx             # Fashion feed
        │   ├── Explore.jsx          # Explore page
        │   ├── OutfitDetail.jsx     # Outfit details
        │   ├── Cart.jsx             # Shopping cart
        │   ├── Checkout.jsx         # Checkout page
        │   ├── Orders.jsx           # Order history
        │   ├── OrderDetail.jsx      # Order details
        │   ├── Profile.jsx          # User profile
        │   ├── Notifications.jsx    # Notifications
        │   ├── Chat.jsx             # Chat interface
        │   ├── StyleQuiz.jsx        # Style quiz
        │   ├── PartnerPublic.jsx    # Partner public profile
        │   ├── partner/             # Partner pages
        │   │   ├── PartnerLogin.jsx
        │   │   ├── PartnerRegister.jsx
        │   │   ├── Dashboard.jsx
        │   │   ├── UploadOutfit.jsx
        │   │   ├── ManageOutfits.jsx
        │   │   ├── PartnerOrders.jsx
        │   │   └── PartnerProfile.jsx
        │   └── admin/               # Admin pages
        │       ├── AdminLogin.jsx
        │       └── AdminDashboard.jsx
        ├── stores/                  # Zustand state stores
        │   ├── authStore.js         # Authentication state
        │   ├── cartStore.js         # Cart state
        │   ├── notificationStore.js # Notification state
        │   └── ...
        └── utils/                   # Utility functions
            ├── constants.js         # Constants
            ├── formatters.js        # Data formatters
            └── validators.js        # Validation helpers
│
└── drip-mobile/                     # React Native Mobile Application
    ├── App.js                       # Main app entry point
    ├── app.json                     # Expo configuration
    ├── package.json                 # Mobile dependencies
    ├── babel.config.js              # Babel configuration
    ├── .env                         # Environment variables
    ├── assets/                      # Static assets (icons, images)
    ├── android/                     # Android-specific files
    ├── ios/                         # iOS-specific files (generated)
    └── src/                         # Source code
        ├── navigation/              # Navigation configuration
        │   ├── AppNavigator.js      # Root navigator
        │   ├── AuthNavigator.js     # Authentication stack
        │   ├── UserNavigator.js     # User tab navigator
        │   ├── PartnerNavigator.js  # Partner navigator
        │   ├── AdminNavigator.js    # Admin navigator
        │   └── TabNavigator.js      # Bottom tab navigation
        ├── screens/                 # Screen components
        │   ├── auth/                # Authentication screens
        │   │   ├── Login.js
        │   │   ├── Register.js
        │   │   └── StyleQuiz.js
        │   ├── user/                # User screens
        │   │   ├── Feed.js
        │   │   ├── Explore.js
        │   │   ├── OutfitDetail.js
        │   │   ├── Cart.js
        │   │   ├── Checkout.js
        │   │   ├── Orders.js
        │   │   ├── OrderDetail.js
        │   │   ├── Profile.js
        │   │   ├── Notifications.js
        │   │   └── Chat.js
        │   ├── partner/             # Partner screens
        │   │   ├── PartnerLogin.js
        │   │   ├── PartnerRegister.js
        │   │   ├── Dashboard.js
        │   │   ├── UploadOutfit.js
        │   │   ├── ManageOutfits.js
        │   │   ├── PartnerOrders.js
        │   │   └── PartnerProfile.js
        │   └── admin/               # Admin screens
        │       └── AdminDashboard.js
        ├── components/              # Reusable components
        │   ├── common/              # Common UI components
        │   ├── reel/                 # Reel/video components
        │   ├── shop/                # Shopping components
        │   ├── social/              # Social interaction components
        │   ├── chat/                # Chat components
        │   └── notification/        # Notification components
        ├── api/                     # API service layer
        │   ├── axios.js             # Axios configuration
        │   ├── auth.api.js          # Authentication API
        │   ├── outfit.api.js        # Outfit API
        │   ├── cart.api.js          # Cart API
        │   ├── order.api.js         # Order API
        │   ├── chat.api.js          # Chat API
        │   ├── partner.api.js       # Partner API
        │   ├── admin.api.js         # Admin API
        │   ├── search.api.js        # Search API
        │   ├── social.api.js        # Social API
        │   ├── upload.api.js        # Upload API
        │   ├── ai.api.js            # AI API
        │   └── notification.api.js   # Notification API
        ├── stores/                  # Zustand state stores
        │   ├── auth.store.js        # Authentication state
        │   ├── cart.store.js        # Cart state
        │   ├── outfit.store.js      # Outfit state
        │   ├── social.store.js      # Social state
        │   ├── chat.store.js        # Chat state
        │   ├── notification.store.js # Notification state
        │   ├── partner.store.js     # Partner state
        │   └── socket.store.js      # Socket state
        ├── hooks/                   # Custom React hooks
        │   ├── useAuth.js           # Authentication hook
        │   ├── useCart.js           # Cart hook
        │   ├── useOutfit.js         # Outfit hook
        │   ├── useSocial.js         # Social hook
        │   ├── useChat.js           # Chat hook
        │   ├── useNotification.js   # Notification hook
        │   ├── usePartner.js        # Partner hook
        │   ├── useSocket.js         # Socket hook
        │   ├── useDebounce.js       # Debounce hook
        │   └── useImagePicker.js    # Image picker hook
        ├── theme/                   # Theme configuration
        │   ├── colors.js            # Color palette
        │   ├── typography.js        # Typography styles
        │   └── spacing.js           # Spacing constants
        └── utils/                   # Utility functions
            ├── constants.js        # App constants
            ├── formatters.js        # Data formatters
            ├── validators.js        # Validation helpers
            └── helpers.js          # Helper functions
```

---

## 🚀 Prerequisites & Installation

### Prerequisites
- **Node.js** 18 or higher
- **MongoDB Atlas** account (free tier works)
- **ImageKit** account (free tier works)
- **Stripe** account (test mode)
- **Git** for version control

#### For Mobile Development (Optional - only if running mobile app)
- **Node.js** 18 or higher
- **Expo CLI** (installed globally)
- **For iOS Development**:
  - macOS with Xcode 15+ (for iOS simulator)
  - iOS device with developer mode enabled (for physical device)
  - Expo Go app from App Store
- **For Android Development**:
  - Android Studio with Android SDK
  - Android device with USB debugging enabled (for physical device)
  - Expo Go app from Google Play Store
- **For Web Development**:
  - Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation Steps

#### 1. Clone the Repository
```bash
git clone <repository-url>
cd "Fashion-outfit suggestion/Fashion-outfit suggestion/Fashion-outfit suggestion"
```

#### 2. Backend Setup
```bash
cd drip-backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables (see Environment Variables section)
# Edit .env file with your actual values

# Seed admin account (run once)
npm run seed:admin
```

#### 3. Frontend Setup
```bash
cd ../drip-frontend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Configure environment variables (see Environment Variables section)
# Edit .env file with your actual values
```

#### 4. Mobile Setup (Optional - for mobile app development)
```bash
cd ../drip-mobile

# Install dependencies
npm install

# Install Expo CLI globally (if not already installed)
npm install -g expo-cli

# Copy environment file
cp .env .env.local

# Configure environment variables (see Mobile Environment Variables section)
# Edit .env file with your actual values
# Note: For Android emulator, use EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
# For iOS simulator, use EXPO_PUBLIC_API_URL=http://localhost:5000
# For physical devices, use your machine's local IP address
```

#### 5. Start the Applications

**Backend (Terminal 1):**
```bash
cd drip-backend

# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

**Frontend (Terminal 2):**
```bash
cd drip-frontend

# Development mode
npm run dev

# Production build
npm run build
npm run preview
```

**Mobile (Terminal 3 - Optional):**
```bash
cd drip-mobile

# Start Expo development server
npx expo start

# For iOS simulator (macOS only)
npx expo start --ios

# For Android emulator
npx expo start --android

# For web browser
npx expo start --web

# For physical device (scan QR code with Expo Go app)
npx expo start
```

#### 6. Access the Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health
- **Mobile**: 
  - **Expo Dev Tools**: http://localhost:19002 (when running mobile)
  - **iOS Simulator**: Via Xcode (macOS only)
  - **Android Emulator**: Via Android Studio
  - **Physical Device**: Scan QR code with Expo Go app

---

## 🔐 Environment Variables

### Backend Environment Variables (.env)

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database_name

# JWT Authentication
JWT_SECRET=your_jwt_secret_minimum_32_characters
JWT_REFRESH_SECRET=your_refresh_secret_minimum_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ImageKit CDN
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Stripe Payments
STRIPE_SECRET_KEY=sk_test_your_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Admin Seed
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password
```

### Frontend Environment Variables (.env)

```env
# API Configuration
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000

# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
```

### Mobile Environment Variables (.env)

```env
# API Configuration
# For Android Emulator: use http://10.0.2.2:5000
# For iOS Simulator: use http://localhost:5000
# For Physical Device: use your machine's local IP address (e.g., http://192.168.1.5:5000)
EXPO_PUBLIC_API_URL=http://10.0.2.2:5000
EXPO_PUBLIC_SOCKET_URL=http://10.0.2.2:5000

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
```

---

## 📖 Usage

### Quick Start Guide

#### 1. User Registration & Login
- **Web**: Navigate to http://localhost:5173
- **Mobile**: Open Expo Go app and scan QR code, or run on emulator/simulator
- Click "Register" to create a new user account
- Fill in your details and complete the style quiz for personalized recommendations
- Login with your credentials

#### 2. Browse Fashion Feed
- Access the feed at `/feed` after login
- Scroll through outfit reels vertically
- Use filters to narrow down by category, price, or partner
- Like, bookmark, or comment on outfits

#### 3. Shopping Experience
- Click "Add to Cart" on any outfit
- Review your cart at `/cart`
- Proceed to checkout at `/checkout`
- Complete payment via Stripe or choose Cash on Delivery
- Track your orders at `/orders`

#### 4. Partner Registration
- Fashion brands can register at `/partner/register`
- After admin approval, partners get access to the dashboard
- Upload outfits via the dashboard at `/dashboard/upload`
- Manage inventory and view orders at `/dashboard`

#### 5. Admin Access
- Login at `/admin/login` with admin credentials
- Access the admin dashboard at `/admin`
- Manage users, partners, content, and view analytics

### API Testing

#### Health Check
```bash
curl http://localhost:5000/api/health
```

#### User Registration
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

#### Get Feed
```bash
curl http://localhost:5000/api/outfit/feed?page=1&limit=10
```

#### Search Outfits
```bash
curl "http://localhost:5000/api/search?q=summer+dress&category=dresses&minPrice=50&maxPrice=200"
```

### Development Commands

**Backend:**
```bash
# Start development server
npm run dev

# Start production server
npm start

# Seed admin account
npm run seed:admin
```

**Frontend:**
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

**Mobile:**
```bash
# Start Expo development server
npx expo start

# Start with iOS simulator (macOS only)
npx expo start --ios

# Start with Android emulator
npx expo start --android

# Start with web browser
npx expo start --web

# Clear cache and restart
npx expo start -c

# Build for production (requires EAS Build)
npx eas build --platform ios
npx eas build --platform android

# Generate production bundle
npx expo export
```

---

## 📊 Key Features Deep Dive

### AI Recommendation System
The platform uses a sophisticated 6-factor scoring algorithm:
- **Category Match (40 points)**: Based on user interaction history
- **Followed Partner (20 points)**: Bonus for followed brands
- **Tag Overlap (15 points)**: Style preferences vs outfit tags
- **Direct Category Preference (10 points)**: Explicit category preferences
- **Trending Score (10 points)**: Engagement-weighted popularity
- **Freshness (5 points)**: Recent content bonus

### Real-time Features
- **Socket.io Integration**: Real-time notifications and messaging
- **Live Typing Indicators**: See when partners are typing
- **Read Receipts**: Track message read status
- **Instant Notifications**: Real-time alerts for all interactions

### Payment Processing
- **Stripe Integration**: Secure credit card processing
- **Webhook Handling**: Automated order status updates
- **COD Support**: Cash on Delivery option for specific regions
- **Price Locking**: Cart prices locked at add time

---

## 🛠️ Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Verify MONGO_URI is correct in .env
- Check MongoDB Atlas whitelist includes your IP
- Ensure database user has proper permissions

**Socket.io Connection Failed**
- Verify VITE_SOCKET_URL matches backend URL
- Check backend server is running
- Ensure CORS is configured correctly

**Stripe Payment Error**
- Verify STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET
- Ensure webhook endpoint is accessible
- Check Stripe dashboard for webhook delivery status

**Image Upload Failed**
- Verify ImageKit credentials are correct
- Check file size limits (max 50MB)
- Ensure ImageKit URL endpoint is valid

### Mobile-Specific Issues

**Mobile App Cannot Connect to Backend**
- Verify EXPO_PUBLIC_API_URL is correct for your environment:
  - Android Emulator: Use `http://10.0.2.2:5000`
  - iOS Simulator: Use `http://localhost:5000`
  - Physical Device: Use your machine's local IP address
- Ensure backend server is running and accessible
- Check that your device/emulator is on the same network as your development machine
- Verify firewall settings allow connections on port 5000

**Expo Build Fails**
- Clear Expo cache: `npx expo start -c`
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`
- Ensure Node.js version is 18 or higher
- Check that all dependencies are compatible with Expo SDK 57

**iOS Build Issues**
- Ensure Xcode command line tools are installed: `xcode-select --install`
- Check that CocoaPods is installed: `sudo gem install cocoapods`
- Run `pod install` in the ios directory if needed
- Verify iOS deployment target in Xcode settings

**Android Build Issues**
- Ensure Android SDK is properly installed
- Check that JAVA_HOME is set correctly
- Verify ANDROID_HOME environment variable points to Android SDK
- Try cleaning Gradle cache: `cd android && ./gradlew clean`

**Stripe React Native Payment Issues**
- Verify EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY is set correctly
- Ensure Stripe plugin is configured in app.json
- For iOS, verify merchant identifier matches your Stripe account
- For Android, ensure Google Play services are up to date

**Video Playback Issues**
- Ensure expo-av is properly installed
- Check video URLs are accessible and valid
- Verify video format is supported (MP4 recommended)
- For iOS, check that video permissions are granted

**Push Notifications Not Working**
- Verify expo-notifications is properly configured
- Ensure you have requested notification permissions
- Check that APNs (iOS) and FCM (Android) credentials are set up
- Verify device token is registered correctly

**Navigation Issues**
- Ensure all screen components are properly exported
- Check that navigation structure matches your route configuration
- Verify screen names are consistent across navigators
- Clear Metro bundler cache if navigation screens don't update

---

## 📝 License

This project is licensed under the ISC License.

---

## 👨‍💻 Author

**Hassan Shehzad**

Built with ❤️ as a portfolio project demonstrating production-grade MERN stack development with modern best practices.

---

## 🙏 Acknowledgments

- Built with modern MERN stack technologies
- Inspired by popular fashion and social media platforms
- Uses industry-standard security practices
- Implements real-time features with Socket.io
- Integrates with leading payment and media processing services
