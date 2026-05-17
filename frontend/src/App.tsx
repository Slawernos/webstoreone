import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/react';
import { ProductListPage } from './pages/ProductListPage';
import { ProductDetailPage } from './pages/ProductDetailPage';

const Home = () => (
  <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
    <h1 className="text-4xl font-bold text-brand">PetShop Pro 🐾</h1>
    <a href="/termekek" className="text-brand hover:underline text-sm">Böngéssz a termékeink között →</a>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/termekek" element={<ProductListPage />} />
        <Route path="/termekek/:id" element={<ProductDetailPage />} />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
      </Routes>
    </BrowserRouter>
  );
}
