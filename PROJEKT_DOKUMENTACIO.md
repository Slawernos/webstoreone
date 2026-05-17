# Webshop Projekt – Dokumentáció

**Technológiai stack:** Node.js + Express · React + **TypeScript** · SQLite + Sequelize ORM · Clerk (auth) · **shadcn/ui** + Tailwind CSS · Jest + Cypress · **Docker**

---

## 1. Technológiai döntések

### Backend
| Komponens | Technológia | Indoklás |
|-----------|-------------|----------|
| Szerver | Node.js + Express | Könnyű, rugalmas REST API |
| Konténerizáció | **Docker** + docker-compose | Hordozható, környezetfüggetlen futtatás |
| Adatbázis | SQLite | Fájlalapú, telepítés nélküli, fejlesztéshez ideális |
| ORM | **Sequelize** | Jól dokumentált, támogatja a migrációkat, könnyen átmigrálható PostgreSQL/MySQL-re élesbe |
| Hitelesítés | **Clerk** | Teljes auth szolgáltatás (login, regisztráció, social login, session kezelés) |
| Validáció | express-validator | Request validáció middleware szinten |

### Frontend
| Komponens | Technológia | Indoklás |
|-----------|-------------|----------|
| UI keretrendszer | React + **TypeScript** (Vite) | Komponens alapú, gyors fejlesztés, type safety |
| UI komponensek | **shadcn/ui** (Radix UI + Tailwind) | Design template alapja, teljes mértékben testreszabható |
| Animáció | **Framer Motion** | Figma Make template használja |
| Routing | React Router v6 | SPA navigáció |
| HTTP kliens | Axios | Promise alapú, interceptorokat támogat |
| Auth | **Clerk React SDK** | `useUser`, `useAuth` hookok, `<SignIn>`, `<SignUp>` komponensek |
| Állapotkezelés | React Context + useReducer | Kosár állapot (az auth-ot Clerk kezeli) |
| Stílus | CSS Modules / Tailwind CSS | Reszponzív dizájn |

### Tesztelés
| Szint | Eszköz | Mit tesztel |
|-------|--------|-------------|
| Unit (backend) | **Jest** + Supertest | API végpontok, Sequelize modellek |
| Komponens (frontend) | Jest + React Testing Library | Izolált React komponensek |
| E2E | **Cypress** | Teljes felhasználói folyamatok (login, kosár, checkout) |

---

## 2. Adatbázis modell (ER diagram szövegesen)

```
Users (felhasználók – csak saját adatok, auth a Clerk-ben van)
├── id (PK, autoincrement)
├── clerk_user_id (unique) – Clerk által adott azonosító
├── name
├── email
├── role  ['customer' | 'admin']  – Clerk metadata-ból szinkronizálva
├── created_at
└── updated_at

Products (termékek)
├── id (PK)
├── name
├── description
├── price
├── stock (készlet)
├── image_url
├── category_id (FK → Categories)
├── created_at
└── updated_at

Categories (kategóriák)
├── id (PK)
├── name
└── slug

Orders (rendelések)
├── id (PK)
├── user_id (FK → Users)
├── status  ['pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled']
├── total_price
├── shipping_address
├── created_at
└── updated_at

OrderItems (rendelési tételek)
├── id (PK)
├── order_id (FK → Orders)
├── product_id (FK → Products)
├── quantity
└── unit_price (snapshot az aktuális árból)

Cart (kosár – session alapú, opcionálisan DB-ben)
├── id (PK)
├── user_id (FK → Users, nullable – vendég kosár)
├── product_id (FK → Products)
├── quantity
└── created_at
```

---

## 3. API végpontok (REST)

### Hitelesítés (Clerk kezeli – nincs saját `/api/auth` végpont)
> A regisztráció, login, logout és session kezelés teljes egészében a Clerk SDK-n keresztül történik.
> A backend végpontok a Clerk által kiadott session tokent ellenőrzik a `@clerk/express` middleware segítségével.

```
GET    /api/users/me          – Saját profil lekérése (Clerk token alapján)
POST   /api/webhooks/clerk    – Clerk webhook: user létrehozás/törlés szinkronizálása DB-be
```

### Termékek (`/api/products`)
```
GET    /api/products          – Termékek listája (szűrés, lapozás)
GET    /api/products/:id      – Egy termék részletei
POST   /api/products          – Termék létrehozása [ADMIN]
PUT    /api/products/:id      – Termék szerkesztése [ADMIN]
DELETE /api/products/:id      – Termék törlése [ADMIN]
```

### Kategóriák (`/api/categories`)
```
GET    /api/categories        – Kategóriák listája
POST   /api/categories        – Létrehozás [ADMIN]
PUT    /api/categories/:id    – Szerkesztés [ADMIN]
DELETE /api/categories/:id    – Törlés [ADMIN]
```

### Kosár (`/api/cart`)
```
GET    /api/cart              – Kosár tartalma
POST   /api/cart              – Termék hozzáadása
PUT    /api/cart/:itemId      – Mennyiség módosítása
DELETE /api/cart/:itemId      – Tétel törlése
DELETE /api/cart              – Kosár ürítése
```

### Rendelések (`/api/orders`)
```
GET    /api/orders            – Saját rendelések listája
GET    /api/orders/:id        – Egy rendelés részletei
POST   /api/orders            – Rendelés leadása (kosárból)
PUT    /api/orders/:id/status – Státusz módosítása [ADMIN]
GET    /api/admin/orders      – Összes rendelés [ADMIN]
```

### Admin (`/api/admin`)
```
GET    /api/admin/users       – Felhasználók listája [ADMIN]
PUT    /api/admin/users/:id   – Felhasználó szerkesztése [ADMIN]
DELETE /api/admin/users/:id   – Felhasználó törlése [ADMIN]
GET    /api/admin/stats       – Statisztikák (eladások, stb.) [ADMIN]
```

---

## 4. Frontend oldalak / komponensek

### Publikus oldalak
- `/` – Főoldal (kiemelt termékek, kategóriák)
- `/products` – Terméklista (szűrés, keresés, lapozás)
- `/products/:id` – Termék részletei
- `/cart` – Kosár
- `/checkout` – Pénztár (szállítási adatok)
- `/sign-in` – Bejelentkezés (Clerk `<SignIn>` komponens)
- `/sign-up` – Regisztráció (Clerk `<SignUp>` komponens)
- `/orders/:id` – Rendelés visszaigazolás

### Bejelentkezett felhasználó
- `/profile` – Profil szerkesztése
- `/orders` – Rendelések előzménye

### Admin panel (`/admin/*`)
- `/admin` – Vezérlőpult (statisztikák)
- `/admin/products` – Termékek kezelése (CRUD)
- `/admin/categories` – Kategóriák kezelése
- `/admin/orders` – Rendelések kezelése, státusz változtatás
- `/admin/users` – Felhasználók kezelése

---

## 5. Mappastruktúra

```
webshop/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js        # Sequelize kapcsolat
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Product.js
│   │   │   ├── Category.js
│   │   │   ├── Order.js
│   │   │   ├── OrderItem.js
│   │   │   └── Cart.js
│   │   ├── controllers/
│   │   │   ├── webhookController.js  # Clerk webhook feldolgozás
│   │   │   ├── productController.js
│   │   │   ├── cartController.js
│   │   │   ├── orderController.js
│   │   │   └── adminController.js
│   │   ├── routes/
│   │   │   ├── webhook.js
│   │   │   ├── products.js
│   │   │   ├── cart.js
│   │   │   ├── orders.js
│   │   │   └── admin.js
│   │   ├── middleware/
│   │   │   ├── auth.js            # Clerk session token ellenőrzés (@clerk/express)
│   │   │   ├── adminOnly.js       # Admin role ellenőrzés (Clerk metadata alapján)
│   │   │   └── errorHandler.js
│   │   ├── migrations/            # Sequelize migrációk
│   │   ├── seeders/               # Tesztadatok
│   │   └── app.js
│   ├── tests/
│   │   ├── products.test.js
│   │   └── orders.test.js
│
└── cypress/                        # E2E tesztek (gyökérben)
    ├── e2e/
    │   ├── auth.cy.js              # Regisztráció, login
    │   ├── shop.cy.js              # Termékböngészés, kosár
    │   └── checkout.cy.js          # Rendelési folyamat
    └── support/│   ├── database.sqlite
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── api/                   # Axios hívások
    │   ├── components/
    │   │   ├── common/            # Button, Input, Modal stb.
    │   │   ├── layout/            # Header, Footer, Navbar
    │   │   ├── products/
    │   │   ├── cart/
    │   │   └── admin/
    │   ├── context/
    │   │   ├── AuthContext.jsx
    │   │   └── CartContext.jsx
    │   ├── pages/
    │   │   ├── Home.jsx
    │   │   ├── Products.jsx
    │   │   ├── ProductDetail.jsx
    │   │   ├── Cart.jsx
    │   │   ├── Checkout.jsx
    │   │   ├── Login.jsx
    │   │   ├── Register.jsx
    │   │   ├── Profile.jsx
    │   │   ├── OrderHistory.jsx
    │   │   └── admin/
    │   │       ├── Dashboard.jsx
    │   │       ├── ProductsAdmin.jsx
    │   │       ├── OrdersAdmin.jsx
    │   │       └── UsersAdmin.jsx
    │   ├── hooks/                 # Custom hookok (useAuth, useCart)
    │   ├── utils/
    │   ├── App.jsx
    │   └── main.jsx
    ├── public/
    ├── package.json
    └── vite.config.ts
```

---

## 6. Biztonsági szempontok

- Jelszavak, session kezelés: **Clerk** kezeli teljes egészében
- Admin role: Clerk `publicMetadata.role = 'admin'` – csak backend webhook állíthatja
- SQL injection védelem: Sequelize ORM paraméteres lekérdezések
- CORS: csak engedélyezett originek
- Rate limiting: `express-rate-limit` az API végpontokra
- Input validáció: `express-validator` minden POST/PUT végponton
- Helmet.js: HTTP fejlécek biztonsági beállítása
- Clerk webhook: `svix` library-vel ellenőrzött signature (ne lehessen hamisítani)
- Admin végpontok: `clerkMiddleware` + role check

---

## 7. Reszponzivitás / Elérhetőség kívülről

A "reszponzív" egy frontend fogalom (mobilon is jól néz ki), ehhez Tailwind CSS vagy CSS media query-k kellenek.

**Kívülről való eléréshez** (éles deploy):
| Opció | Leírás |
|-------|--------|
| **Render.com / Railway** | Ingyenes tier, egyszerű Git push deploy |
| **VPS (pl. Hetzner)** | Teljes kontroll, Nginx reverse proxy + PM2 |
| **Vercel (frontend) + Render (backend)** | Elterjedt combo |
> Fejlesztés alatt: `localhost:3000` (frontend) + `localhost:5000` (backend)

---

## 8. Fejlesztési ütemterv (javasolt)

| Fázis | Feladatok |
|-------|-----------|
| **1. Alap** | Projekt init, Clerk beállítás, DB modellek, webhook szinkron |
| **2. Termékek** | CRUD végpontok, terméklista + detail frontend |
| **3. Kosár & Rendelés** | Kosár logika, checkout folyamat |
| **4. Admin panel** | Admin oldal, jogosultságkezelés |
| **5. Tesztek** | Jest unit + Cypress E2E tesztek |
| **6. Docker** | Dockerfile-ok, docker-compose, nginx konfig |
| **7. Csiszolás** | Reszponzív dizájn, hibaüzenetek, loading state-ek |
| **8. Deploy** | Éles környezet beállítása |

---

## 9. Függőségek összefoglalója

### Backend (`package.json`)
```json
{
  "dependencies": {
    "express": "^4.x",
    "@clerk/express": "^1.x",
    "svix": "^1.x",
    "sequelize": "^6.x",
    "sqlite3": "^5.x",
    "express-validator": "^7.x",
    "helmet": "^7.x",
    "cors": "^2.x",
    "express-rate-limit": "^7.x",
    "dotenv": "^16.x"
  },
  "devDependencies": {
    "jest": "^29.x",
    "supertest": "^6.x",
    "sequelize-cli": "^6.x"
  }
}
```

### Frontend (`package.json`)
```json
{
  "dependencies": {
    "react": "^18.x",
    "react-dom": "^18.x",
    "react-router-dom": "^6.x",
    "@clerk/react": "^5.x",
    "axios": "^1.x",
    "framer-motion": "^11.x",
    "tailwindcss": "^4.x",
    "class-variance-authority": "^0.7.x",
    "clsx": "^2.x",
    "lucide-react": "^0.x"
  },
  "devDependencies": {
    "vite": "^5.x",
    "@vitejs/plugin-react": "^4.x",
    "typescript": "^5.x",
    "jest": "^29.x",
    "@testing-library/react": "^14.x",
    "@testing-library/jest-dom": "^6.x",
    "cypress": "^13.x"
  }
}
```
