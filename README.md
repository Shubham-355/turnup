# TurnUp

A collaborative event planning app for trips, nightouts, and group activities. Plan together, split expenses, chat in real-time, and let AI help you organize everything.

## Features

- Create and manage plans (trips, nightouts, events)
- Add activities with location, date, and time
- Real-time group chat for each plan
- Track and split expenses among members
- Location tracking and route planning
- Invite friends or join public plans
- AI assistant to help manage your plans

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Shubham-355/turnup.git
cd turnup
```

---

### Backend

```bash
cd backend
npm install
```

Setup database:

```bash
npx prisma generate
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

---

### Web

```bash
cd web
npm install
npm run dev
```

---

### Mobile App (React Native)

```bash
cd frontend
npm install
npm run dev
```
