// src/components/Layout.jsx
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-neutral-950 via-black to-neutral-900 text-zinc-50">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-10">
        {children}
      </main>
      <Footer />
    </div>
  );
}
