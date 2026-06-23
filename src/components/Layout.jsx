// src/components/Layout.jsx
import Navbar from "./Navbar.jsx";
import Footer from "./Footer.jsx";
import ScrollToTop from "./ScrollToTop.jsx";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-paper text-ink select-none">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 w-full overflow-hidden">{children}</main>
      <Footer />
    </div>
  );
}
