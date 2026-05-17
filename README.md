# PetShop Pro

![CI](https://github.com/Slawernos/webstoreone/actions/workflows/ci.yml/badge.svg)

Modern kisállat webshop – Node.js + React + SQLite + Clerk auth.

## Technológiai stack

| Réteg | Technológia |
|-------|-------------|
| Backend | Node.js, Express, Sequelize ORM, SQLite |
| Frontend | React, TypeScript, Vite, shadcn/ui, Tailwind CSS |
| Auth | Clerk |
| Tesztelés | Jest, Supertest, Cypress |
| CI | GitHub Actions |

## Projekt struktúra

```
webstoreone/
├── backend/          # Express REST API
│   ├── src/
│   │   ├── models/   # Sequelize modellek
│   │   ├── controllers/
│   │   ├── routes/
│   │   └── middleware/
│   └── tests/        # Jest unit tesztek
├── frontend/         # React + Vite app
│   └── src/
│       ├── components/
│       ├── pages/
│       └── context/
├── cypress/          # E2E tesztek
└── .github/workflows/ci.yml
```

## Fejlesztői indítás

### Backend
```bash
cd backend
npm install
cp .env.example .env   # töltsd ki a Clerk kulcsokat
npm run dev            # http://localhost:5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

## Tesztelés

### Backend unit tesztek (Jest)
```bash
cd backend
npm test               # egyszer
npm test -- --watch    # watch módban
npm test -- --coverage # lefedettségi riport
```

### Frontend típusellenőrzés
```bash
cd frontend
npx tsc --noEmit
```

### E2E tesztek (Cypress)
```bash
# Backend és frontend legyen futó állapotban, majd:
npx cypress open       # interaktív módban
npx cypress run        # headless (CI-ban)
```

## Környezeti változók

`.env.example` alapján hozd létre a `backend/.env` fájlt:

```
PORT=5000
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
CLERK_WEBHOOK_SECRET=whsec_...
```

## Dokumentáció

- [Technikai dokumentáció](PROJEKT_DOKUMENTACIO.md)
- [Design dokumentáció](DESIGN_DOKUMENTACIO.md)

