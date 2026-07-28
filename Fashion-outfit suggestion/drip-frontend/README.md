# Drip - Fashion Reels Platform

Pakistan's first Fashion Reels platform - where TikTok meets Daraz for fashion.

## Features

- **Fashion Reels**: Discover outfits through immersive short videos
- **AI Personalization**: Get outfit recommendations tailored to your style
- **Direct Shopping**: Buy outfits instantly from trending videos
- **Real-time Chat**: Connect directly with fashion brands
- **Partner Dashboard**: Brands can upload outfits, manage orders, and track analytics
- **Admin Dashboard**: Manage users, partners, and platform content

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion
- **Real-time**: Socket.io

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Environment Variables

Create a `.env` file:

```
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
VITE_STRIPE_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
```

## Project Structure

```
drip-frontend/
├── src/
│   ├── api/           # API endpoints
│   ├── components/    # React components
│   ├── hooks/         # Custom hooks
│   ├── layouts/       # Page layouts
│   ├── pages/         # Page components
│   ├── stores/        # Zustand stores
│   └── utils/         # Utilities
├── public/            # Static assets
└── package.json
```

## User Types

1. **Users**: Browse reels, shop outfits, save favorites
2. **Partners (Brands)**: Upload outfits, manage inventory, process orders
3. **Admins**: Manage platform, approve partners, monitor activity

## API Integration

The frontend expects a backend API running at `VITE_API_URL` with the following format:

```javascript
// Success Response
{
  success: true,
  message: "Description",
  data: { ... },
  pagination: { ... }
}

// Error Response
{
  success: false,
  message: "Error description"
}
```

## License

MIT
