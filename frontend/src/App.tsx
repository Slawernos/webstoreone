import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/react';

// Oldalak – következő issue-kban kerülnek ide
const Home = () => <div className="p-8 text-2xl font-semibold">PetShop Pro 🐾</div>;

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/sign-in/*" element={<SignIn routing="path" path="/sign-in" />} />
        <Route path="/sign-up/*" element={<SignUp routing="path" path="/sign-up" />} />
      </Routes>
    </BrowserRouter>
  );
}
