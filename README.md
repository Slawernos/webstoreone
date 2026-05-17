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
| CI/CD | GitHub Actions |
| Konténerizáció | Docker, docker-compose |

## Projekt struktúra

```
webstoreone/
├── backend/
│   ├── data/                        # SQLite adatbázis (runtime)
│   ├── scripts/
│   │   └── seed.js                  # DB feltöltő script (55 termék, SVG képek)
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # Sequelize kapcsolat
│   │   ├── middleware/
│   │   │   └── auth.js              # Clerk auth middleware
│   │   ├── models/
│   │   │   ├── index.js             # Sequelize asszociációk
│   │   │   ├── Cart.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   ├── Product.js
│   │   │   └── User.js
│   │   ├── routes/
│   │   │   ├── admin.js
│   │   │   ├── cart.js
│   │   │   ├── categories.js
│   │   │   ├── orders.js
│   │   │   ├── products.js
│   │   │   └── webhook.js           # Clerk webhook (user sync)
│   │   └── app.js                   # Express belépési pont
│   ├── tests/
│   │   ├── admin.test.js
│   │   ├── cart.test.js
│   │   ├── health.test.js
│   │   ├── integration.test.js
│   │   ├── models.test.js
│   │   ├── orders.test.js
│   │   ├── products.test.js
│   │   ├── seed.test.js
│   │   ├── setup.js
│   │   └── webhook.test.js
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── cypress/
│   │   ├── e2e/
│   │   │   ├── health.cy.ts
│   │   │   ├── navigation.cy.ts
│   │   │   └── products.cy.ts
│   │   └── support/
│   │       └── e2e.ts
│   ├── public/
│   │   └── images/products/         # 55 SVG termékép (seed generálja)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Cart.tsx             # Kosár oldalpanel
│   │   │   ├── CategoryFilter.tsx   # Kategória szűrő
│   │   │   ├── Header.tsx           # Navigáció, keresés, kosár ikon
│   │   │   └── ProductCard.tsx      # Termék kártya
│   │   ├── hooks/
│   │   │   ├── useCart.ts           # Kosár logika (guest + auth)
│   │   │   └── useProducts.ts       # Termék lekérdezések
│   │   ├── lib/
│   │   │   └── apiBase.ts           # API URL konfiguráció
│   │   ├── pages/
│   │   │   ├── AdminPage.tsx        # Admin panel
│   │   │   ├── CheckoutPage.tsx     # Rendelés leadás
│   │   │   ├── OrdersPage.tsx       # Rendelés előzmények
│   │   │   ├── ProductDetailPage.tsx
│   │   │   └── ProductListPage.tsx
│   │   ├── styles/
│   │   │   └── globals.css
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── .env.example
│   ├── cypress.config.ts
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml               # Éles környezet
├── docker-compose.dev.yml           # Fejlesztői hot reload
├── PROJEKT_DOKUMENTACIO.md
├── DESIGN_DOKUMENTACIO.md
└── README.md
```

## Első indítás – lépésről lépésre

### 1. Clerk fiók létrehozása

1. Menj a [clerk.com](https://clerk.com) oldalra és regisztrálj
2. Hozz létre egy új **Application**-t (pl. "PetShop Pro")
3. Engedélyezett sign-in módok: **Email + Password** (opcionálisan Google/GitHub)
4. Az **API Keys** oldalon másold ki:
	- **Publishable key** → `pk_test_...` (frontend és backend is használja)
	- **Secret key** → `sk_test_...` (csak backend)
5. Webhook beállítása (felhasználó szinkronizáláshoz):
	- Clerk Dashboard → **Webhooks** → **Add Endpoint**
	- URL: `https://<domain>/api/webhook/clerk`
	- Figyelendő események: `user.created`, `user.updated`, `user.deleted`
	- A generált **Signing Secret** → `whsec_...` (backend)

> **Helyi fejlesztésnél a webhook opcionális** – a backend automatikusan létrehozza a felhasználót az első bejelentkezéskor is.

### 2. Backend konfigurálása

```bash
cd backend
cp .env.example .env
```

Töltsd ki a `backend/.env` fájlt:

```env
PORT=5000
NODE_ENV=development
CLERK_PUBLISHABLE_KEY=pk_test_...   # Clerk Dashboard → API Keys
CLERK_SECRET_KEY=sk_test_...        # Clerk Dashboard → API Keys
CLERK_WEBHOOK_SECRET=whsec_...      # Clerk Dashboard → Webhooks (opcionális)
```

```bash
npm install
npm run dev          # http://localhost:5000
```

### 3. Adatbázis feltöltése

```bash
cd backend
node scripts/seed.js   # 8 kategória + 55 termék + SVG képek generálása
```

### 4. Frontend konfigurálása

```bash
cd frontend
cp .env.example .env
```

Töltsd ki a `frontend/.env` fájlt:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...   # ugyanaz mint a backendben
VITE_API_URL=                            # üresen hagyva = Vite proxy (localhost + LAN)
```

```bash
npm install
npm run dev          # http://localhost:5173
```

> Az alkalmazás **Clerk nélkül is elindul** – vendégként lehet böngészni és kosárba rakni, csak a rendelés leadásához szükséges bejelentkezés.

---

## Docker indítás

### Éles indítás
```bash
cp backend/.env.example backend/.env  # töltsd ki
docker compose up -d
# frontend: http://localhost
# backend:  http://localhost:5000
```

### Fejlesztői mód (hot reload)
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
# frontend: http://localhost:5173
# backend:  http://localhost:5000
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
cd frontend
npx cypress open       # interaktív módban
npx cypress run        # headless (CI-ban)
```

### CI viselkedés (GitHub Actions)

A CI pipeline-ban a backend **Clerk nélkül** indul (`CLERK_SECRET_KEY` nincs beállítva → `hasClerkKeys = false`). Ez szándékos:
- A Cypress tesztek **publikus végpontokat** tesztelnek (`/api/health`, `/api/products`, `/api/categories`) – ezekhez nem kell auth
- CI-ban nem állnak rendelkezésre valódi Clerk titkok
- Hamis kulcsokkal (`sk_test_placeholder`) a Clerk SDK hibát dobna induláskor

Lokálisan és éles környezetben a Clerk teljes mértékben aktív – a kosár szinkronizálás és rendelés leadás auth-ot igényel.

## Főbb funkciók

- Termékek böngészése kategória szerint, keresés (Enter-re)
- Termék detail oldal (leírás, ár, értékelés)
- Kosár – vendégként is használható (localStorage), bejelentkezve szinkronizált
- Rendelés leadása – bejelentkezés szükséges (Clerk)
- Admin panel – termékek és rendelések kezelése (admin szerepkör)
- Saját SVG termékképek (seed script generálja)

## Dokumentáció

- [Technikai dokumentáció](PROJEKT_DOKUMENTACIO.md)
- [Design dokumentáció](DESIGN_DOKUMENTACIO.md)

