# PetShop Pro – Design Dokumentáció

**Alap:** Figma Make által generált design template (`frontend/design_template/Pet Shop Webshop/`)  
**UI könyvtár:** shadcn/ui (Radix UI + Tailwind CSS)  
**Animáció:** Framer Motion

---

## 1. Brand & Stílusirányzat

- **Név:** PetShop Pro
- **Téma:** Modern, letisztult kisállat webshop – közönséges és egzotikus háziállatok számára
- **Hangulat:** Megbízható, barátságos, természetközeli (zöld szín)

---

## 2. Színpaletta

### Fő színek
| Szerep | Tailwind osztály | Hex | Használat |
|--------|-----------------|-----|-----------|
| **Brand / CTA** | `emerald-600` | `#059669` | Gombok, árak, aktív elemek |
| Brand hover | `emerald-700` | `#047857` | Gombok hover állapota |
| Brand háttér | `emerald-50` | `#ecfdf5` | Kiválasztott kategória háttér |

### Semleges színek
| Szerep | Tailwind osztály | Hex | Használat |
|--------|-----------------|-----|-----------|
| Oldalháttér | `gray-50` | `#f9fafb` | `<body>` háttér |
| Kártyaháttér | `white` | `#ffffff` | Termék kártyák, felületek |
| Finom háttér | `gray-100` | `#f3f4f6` | Subtle háttérszínek |
| Keret | `gray-200` | `#e5e7eb` | Elválasztók, border |
| Másodlagos szöveg | `gray-500` | `#6b7280` | Leírások, metaadatok |
| Törzsszöveg | `gray-600` | `#4b5563` | Normál szöveg |
| Fontos szöveg | `gray-700` | `#374151` | Fejlécek, kiemelések |
| Elsődleges szöveg | `gray-900` | `#111827` | Fő fejlécek, ármegjelenítés |

### Akcent színek
| Szerep | Tailwind osztály | Használat |
|--------|-----------------|-----------|
| Csillag értékelés | `yellow-500` | Termék rating |
| Készlethiány / törlés | `red-500`, `red-600` | "Out of stock" badge, eltávolítás |

---

## 3. Tipográfia

Rendszer betűkészlet (Tailwind alapértelmezett), **nem egyedi font**.

| Elem | Tailwind osztályok | Példa |
|------|-------------------|-------|
| Logo / fő fejléc | `font-semibold text-xl` | "PetShop Pro" |
| Szekció cím | `font-semibold text-2xl text-gray-900` | "All Products" |
| Kártya cím | `font-semibold text-gray-700` | Terméknév |
| Ár (nagy) | `font-semibold text-2xl text-emerald-600` | "45.99 €" |
| Ár (normál) | `font-semibold text-lg text-emerald-600` | Kosárban |
| Leírás | `text-sm text-gray-600` | Termék leírás |
| Label / felirat | `font-medium` | Form labelek |

---

## 4. Térközök és méretezés

| Kategória | Érték | Tailwind |
|-----------|-------|---------|
| Komponensek közötti rés | 1rem / 1.5rem / 2rem | `gap-4`, `gap-6`, `gap-8` |
| Kártyák padding | 1rem / 1.5rem | `p-4`, `p-6` |
| Függőleges margók | 0.5–1.5rem | `mb-2` → `mb-6` |
| Grid rés (terméklista) | 1.5rem | `gap-6` |

---

## 5. Lekerekítés és árnyékok

| Elem | Border radius | Árnyék |
|------|--------------|--------|
| Gombok, input, badge | `rounded-lg` (0.5rem) | – |
| Termék kártyák, kosár | `rounded-xl` (0.75rem) | `shadow-sm` (alap), `shadow-md` (hover) |
| Kosár badge (szám) | `rounded-full` | – |
| Kosár drawer / modal | `rounded-xl` | `shadow-2xl` |

---

## 6. Komponensek

### Meglévő (Figma Make generálta)
| Komponens | Fájl | Leírás |
|-----------|------|--------|
| `Header` | `Header.tsx` | Navigáció, keresőmező, kosár ikon badge-dzsel |
| `ProductCard` | `ProductCard.tsx` | Termék kártya: emoji, név, leírás, ár, "Add to Cart" gomb |
| `CategoryFilter` | `CategoryFilter.tsx` | Oldalsáv szűrő: All / Main Food / Exotic Food / Equipment / Live Food |
| `Cart` | `Cart.tsx` | Oldalsó drawer: tételek, mennyiség módosítás, összeg, checkout gomb |

### shadcn/ui alap komponensek (mind elérhető `components/ui/`-ban)
`Button` · `Card` · `Badge` · `Input` · `Dialog` · `Sheet` · `Select` · `Table` · `Tabs` · `Avatar` · `Skeleton` · `Sonner` (toast) · `Form` · ... (teljes lista: `src/app/components/ui/`)

---

## 7. Termék típusok (adatmodell a designban)

```typescript
interface Product {
  id: string
  name: string
  description: string
  price: number
  category: 'main-food' | 'exotic-food' | 'equipment' | 'live-food'
  emoji: string       // vizuális helyőrző, éles verzióban image_url váltja
  rating: number      // 0–5
  unit: string        // pl. "15kg bag", "12-pack"
  inStock?: boolean
}
```

> **Megjegyzés:** Az `emoji` mező a designban placeholder – az éles projektben `image_url` váltja (lásd technikai dokumentáció `Products` tábla).

---

## 8. Termékkategóriák

| Kategória ID | Magyar neve | Példa termékek |
|-------------|-------------|----------------|
| `main-food` | Hagyományos állatok eledele | Kutyaeledel, macskatáp, nyúlpellet |
| `exotic-food` | Egzotikus állatok eledele | Hüllő táp, rovar, akváriumi hal eleség |
| `equipment` | Felszerelések | Ketrec, akváriumszűrő, nyakörv |
| `live-food` | Élő takarmány | Crickett, tücsök, lárva |

---

## 9. Reszponzív layout

A template grid-alapú, Tailwind breakpointokkal:

```
Mobil (< lg):   1 oszlop – CategoryFilter + termékek egymás alatt
Desktop (≥ lg): 4 oszlop grid – 1 oszlop szűrő + 3 oszlop terméklista
```

```tsx
<div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
  <aside className="lg:col-span-1">  {/* CategoryFilter */}
  <div className="lg:col-span-3">    {/* ProductCard grid */}
```

Terméklista belső grid:
```
Mobil:   1 oszlop
Tablet:  2 oszlop (sm:grid-cols-2)
Desktop: 3 oszlop (xl:grid-cols-3)
```

---

## 10. A design template és az éles projekt kapcsolata

| Design template | Éles projektben |
|----------------|----------------|
| `products.ts` (hardcoded adatok) | Backend API (`GET /api/products`) |
| `emoji` mező | `image_url` DB mezőre cserélve |
| Nincs routing | React Router v6 oldalak |
| Nincs auth | Clerk bejelentkezés |
| Lokális kosár state | Backend Cart tábla + API |
| Nincs admin felület | `/admin/*` oldalak hozzáadva |

---

## 11. A template futtatása (fejlesztés alatt referenciaként)

```bash
cd "frontend/design_template/Pet Shop Webshop"
pnpm install
pnpm dev
```

> Csak referenciaként használjuk – a tényleges fejlesztés a `frontend/src/` mappában történik.
