# TurnUp Backend API

A comprehensive backend for the TurnUp event planning platform, built with Node.js, Express, Prisma, and PostgreSQL.

## Features

- 🔐 **Authentication**: JWT-based authentication with secure password hashing
- 📅 **Plans**: Create and manage plans (nightouts, trips) with public/private settings
- 🎯 **Activities**: Add activities to plans with location, date, and time
- 💬 **Real-time Chat**: Socket.IO powered group chat for each plan
- 📸 **Media**: Upload photos/videos via Cloudinary
- 💰 **Expense Splitting**: Track and split expenses equally or custom
- 🗺️ **Location Tracking**: Real-time member locations and route planning
- 📩 **Invitations**: Invite friends or request to join public plans
- 🔔 **Notifications**: In-app notifications for all events

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO
- **Authentication**: JWT + bcrypt
- **File Upload**: Cloudinary
- **Validation**: express-validator

## Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Cloudinary account (for media uploads)
- Map API key (Google Maps or Mapbox)

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Setup database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Run migrations
   npm run db:migrate
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## Environment Variables

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/turnup?schema=public"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"

# Server
PORT=3000
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"

# Map API
MAP_API_KEY="your-map-api-key"

# CORS
FRONTEND_URL="http://localhost:8081"
```

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |
| PUT | `/api/auth/profile` | Update profile |
| PUT | `/api/auth/password` | Change password |
| GET | `/api/auth/search` | Search users |

### Plans
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plans` | Create plan |
| GET | `/api/plans` | Get user's plans |
| GET | `/api/plans/discover` | Get public plans |
| GET | `/api/plans/:planId` | Get plan details |
| PUT | `/api/plans/:planId` | Update plan |
| DELETE | `/api/plans/:planId` | Delete plan |
| POST | `/api/plans/join` | Join via invite code |
| GET | `/api/plans/invite/:code` | Get plan by invite code |
| POST | `/api/plans/:planId/leave` | Leave plan |
| GET | `/api/plans/:planId/members` | Get members |
| PUT | `/api/plans/:planId/members/:id/role` | Update member role |
| DELETE | `/api/plans/:planId/members/:id` | Remove member |

### Activities
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plans/:planId/activities` | Create activity |
| GET | `/api/plans/:planId/activities` | Get plan activities |
| GET | `/api/activities/:activityId` | Get activity details |
| PUT | `/api/activities/:activityId` | Update activity |
| DELETE | `/api/activities/:activityId` | Delete activity |
| PUT | `/api/plans/:planId/activities/reorder` | Reorder activities |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plans/:planId/messages` | Send message |
| GET | `/api/plans/:planId/messages` | Get messages |
| DELETE | `/api/messages/:messageId` | Delete message |

### Media
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plans/:planId/media` | Upload single file |
| POST | `/api/plans/:planId/media/multiple` | Upload multiple files |
| GET | `/api/plans/:planId/media` | Get plan media |
| GET | `/api/activities/:activityId/media` | Get activity media |
| DELETE | `/api/media/:mediaId` | Delete media |
| PUT | `/api/media/:mediaId/caption` | Update caption |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plans/:planId/expenses` | Create expense |
| GET | `/api/plans/:planId/expenses` | Get expenses |
| GET | `/api/plans/:planId/expenses/summary` | Get expense summary |
| GET | `/api/plans/:planId/expenses/debts` | Get user debts |
| GET | `/api/expenses/:expenseId` | Get expense details |
| PUT | `/api/expenses/:expenseId` | Update expense |
| DELETE | `/api/expenses/:expenseId` | Delete expense |
| POST | `/api/expenses/:expenseId/settle/:userId` | Settle share |

### Location
| Method | Endpoint | Description |
|--------|----------|-------------|
| PUT | `/api/plans/:planId/location` | Update user location |
| GET | `/api/plans/:planId/locations` | Get member locations |
| GET | `/api/plans/:planId/route` | Get activity route |
| DELETE | `/api/plans/:planId/location` | Remove location |
| GET | `/api/maps/search` | Search places |
| GET | `/api/maps/place/:placeId` | Get place details |
| GET | `/api/maps/directions` | Get directions |

### Invitations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plans/:planId/invitations` | Send invitation |
| GET | `/api/plans/:planId/invitations` | Get sent invitations |
| GET | `/api/invitations` | Get received invitations |
| POST | `/api/invitations/:id/respond` | Accept/decline invitation |
| DELETE | `/api/invitations/:id` | Cancel invitation |

### Join Requests (Public Plans)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/plans/:planId/join-request` | Request to join |
| GET | `/api/plans/:planId/join-requests` | Get join requests |
| POST | `/api/join-requests/:id/respond` | Approve/reject request |

### Notifications
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/notifications` | Get notifications |
| GET | `/api/notifications/unread-count` | Get unread count |
| PUT | `/api/notifications/read-all` | Mark all as read |
| PUT | `/api/notifications/:id/read` | Mark as read |
| DELETE | `/api/notifications/:id` | Delete notification |

## Socket.IO Events

### Client → Server
| Event | Payload | Description |
|-------|---------|-------------|
| `join_plan` | `planId` | Join plan room |
| `leave_plan` | `planId` | Leave plan room |
| `send_message` | `{ planId, content, type }` | Send message |
| `typing_start` | `planId` | User started typing |
| `typing_stop` | `planId` | User stopped typing |
| `update_location` | `{ planId, lat, lng }` | Update location |

### Server → Client
| Event | Payload | Description |
|-------|---------|-------------|
| `new_message` | `Message` | New message received |
| `message_deleted` | `{ messageId }` | Message was deleted |
| `user_joined` | `{ user, planId }` | User joined room |
| `user_left` | `{ user, planId }` | User left room |
| `user_typing` | `{ user, planId }` | User is typing |
| `user_stopped_typing` | `{ user, planId }` | User stopped typing |
| `location_updated` | `{ user, lat, lng }` | User location updated |
| `location_removed` | `{ userId }` | User location removed |

## Project Structure

```
backend/
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── config/
│   │   ├── index.js           # App configuration
│   │   ├── database.js        # Prisma client
│   │   └── cloudinary.js      # Cloudinary config
│   ├── controllers/           # Route handlers
│   ├── middlewares/           # Express middlewares
│   ├── routes/                # API routes
│   ├── services/              # Business logic
│   ├── socket/                # Socket.IO handlers
│   ├── utils/                 # Utility functions
│   ├── validators/            # Request validators
│   └── server.js              # Entry point
├── .env.example               # Environment template
├── package.json
└── README.md
```

## Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with hot reload
npm run db:generate # Generate Prisma client
npm run db:migrate  # Run database migrations
npm run db:push     # Push schema changes to database
npm run db:studio   # Open Prisma Studio
```

## License

MIT
