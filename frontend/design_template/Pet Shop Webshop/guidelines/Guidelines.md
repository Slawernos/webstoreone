# PetShop Pro - Project Guidelines

## Overview

PetShop Pro is a modern e-commerce web application focused on selling pet food, equipment, live food, and animals for both common and exotic pets. Built with React, TypeScript, Tailwind CSS, and Motion (Framer Motion).

## Design System

### Color Palette

**Primary Colors:**
- Emerald Green: `emerald-600` (#059669) - Primary brand color for CTAs and accents
- Emerald Light: `emerald-50` (#ecfdf5) - Backgrounds for selected states
- Emerald Dark: `emerald-700` (#047857) - Hover states

**Neutral Colors:**
- White: `white` (#ffffff) - Card backgrounds, surfaces
- Gray 50: `gray-50` (#f9fafb) - Page background
- Gray 100: `gray-100` (#f3f4f6) - Subtle backgrounds
- Gray 200: `gray-200` (#e5e7eb) - Borders
- Gray 400: `gray-400` (#9ca3af) - Placeholder text, icons
- Gray 500: `gray-500` (#6b7280) - Secondary text
- Gray 600: `gray-600` (#4b5563) - Body text
- Gray 700: `gray-700` (#374151) - Headers, important text
- Gray 900: `gray-900` (#111827) - Primary text

**Accent Colors:**
- Yellow 500: `yellow-500` - Star ratings
- Red 500/600: `red-500`, `red-600` - Out of stock, remove actions

### Typography

Uses default system font stack with Tailwind CSS utility classes:

- **Headings (H1):** `font-semibold text-xl` (Logo, Main Headers)
- **Headings (H2):** `font-semibold text-2xl` (Section Titles)
- **Headings (H3):** `font-semibold` (Card Titles, Cart Header)
- **Body Text:** `text-sm` or base size with `text-gray-600` or `text-gray-700`
- **Labels:** `font-medium`
- **Price (Large):** `font-semibold text-2xl text-emerald-600`
- **Price (Regular):** `font-semibold text-lg text-emerald-600`

### Spacing

- **Component Gap:** `gap-4` (1rem), `gap-6` (1.5rem), `gap-8` (2rem)
- **Padding (Cards):** `p-4` (1rem), `p-6` (1.5rem)
- **Margin:** `mb-2`, `mb-3`, `mb-4`, `mb-6` for vertical spacing
- **Grid Gaps:** `gap-6` for product grids

### Border Radius

- **Small Elements:** `rounded-lg` (0.5rem) - Buttons, inputs, badges
- **Cards:** `rounded-xl` (0.75rem) - Product cards, cart, category filter
- **Pills:** `rounded-full` - Cart count badge

### Shadows

- **Default:** `shadow-sm` - Cards, header
- **Hover:** `shadow-md` - Product cards on hover
- **Modal:** `shadow-2xl` - Cart drawer

## Component Architecture

### Core Components

#### Header (`components/Header.tsx`)
- Sticky header with logo, navigation, search, and cart
- Responsive hamburger menu for mobile
- Props: `cartCount`, `onCartClick`, `onSearchChange`

#### CategoryFilter (`components/CategoryFilter.tsx`)
- Sidebar category navigation with animated selection indicator
- Uses Motion's `layoutId` for smooth transitions
- Props: `selectedCategory`, `onCategoryChange`

#### ProductCard (`components/ProductCard.tsx`)
- Displays product with emoji, name, description, rating, price
- Add to cart button with disabled state for out-of-stock
- Hover animation with `whileHover={{ y: -4 }}`
- Props: `product`, `onAddToCart`

#### Cart (`components/Cart.tsx`)
- Slide-in drawer from the right side
- Quantity controls, remove items, total calculation
- Empty state with icon and message
- Props: `isOpen`, `onClose`, `items`, `onUpdateQuantity`, `onRemoveItem`

### Data Models

#### Product Type
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  category: Category;
  emoji: string;
  rating: number;
  unit: string;
  inStock?: boolean;
}
```

#### CartItem Type
```typescript
{
  product: Product;
  quantity: number;
}
```

#### Category Type
```typescript
'all' | 'main-food' | 'exotic-food' | 'equipment' | 'live-food' | 'live-animals'
```

## Animations

### Motion Library Usage

- **Layout Animations:** `layout` prop for automatic position transitions
- **Enter/Exit:** `initial`, `animate`, `exit` for component mount/unmount
- **Hover Effects:** `whileHover` for interactive feedback
- **Transitions:** Spring physics with `type: 'spring', damping: 30, stiffness: 300`

### Animation Patterns

1. **Product Cards:** Scale and opacity fade-in, lift on hover
2. **Cart Drawer:** Slide from right with backdrop fade
3. **Category Selection:** Layout-animated highlight background
4. **Cart Items:** Slide in from right on add, slide left on remove

## Responsive Breakpoints

- **Mobile:** < 640px (sm) - Single column, stacked layout
- **Tablet:** 640px - 1024px (sm to lg) - 2-column product grid
- **Desktop:** > 1024px (lg+) - Sidebar + 3-column product grid

### Responsive Classes

- Container: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- Grid: `grid-cols-1 sm:grid-cols-2 xl:grid-cols-3`
- Sidebar: `lg:col-span-1` (category filter)
- Content: `lg:col-span-3` (product area)

## User Interactions

### Shopping Flow

1. **Browse Products:** Filter by category or search
2. **Add to Cart:** Click "Add" button on product card
3. **Manage Cart:** Adjust quantities with +/- buttons
4. **Checkout:** Click "Proceed to Checkout" button

### State Management

- **Local State:** `useState` for UI state (cart open/closed, search query)
- **Derived State:** `useMemo` for filtered products
- **Cart State:** Array of CartItem objects with immutable updates

## Product Categories

### Main Pet Food (Focus Category)
Dog food, cat food, rabbit pellets, bird seed, hamster food - most common pets

### Exotic Pet Food (Secondary Focus)
Bearded dragon food, turtle food, snake food, hedgehog food - less common pets

### Equipment
Beds, cages, aquariums, heat lamps, scratching posts, automatic feeders

### Live Food
Crickets, mealworms, dubia roaches, waxworms - for reptiles/amphibians

### Live Animals (Limited)
Fish, hamsters, birds, geckos, guinea pigs - basic starter pets

## Best Practices

### Code Style
- Use TypeScript with explicit types
- Functional components with hooks
- Props interfaces defined inline or imported from types
- Descriptive variable names

### Accessibility
- Semantic HTML elements
- Button elements for interactive actions
- Alt text for images (use aria-label where needed)
- Keyboard navigation support

### Performance
- `useMemo` for expensive filtering operations
- Key props on list items
- Lazy loading images with emoji placeholders
- Avoid unnecessary re-renders

### File Organization
```
src/app/
├── App.tsx              # Main application component
├── types.ts             # TypeScript type definitions
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── CategoryFilter.tsx
│   ├── ProductCard.tsx
│   └── Cart.tsx
└── data/
    └── products.ts      # Mock product data
```

## Future Enhancements

- Product detail pages with full descriptions
- User authentication and profiles
- Order history and tracking
- Backend integration (Supabase)
- Payment processing
- Product reviews and ratings
- Wishlists and favorites
- Advanced filtering (price range, rating, availability)
- Related products recommendations
- Image galleries for products
