// src/App.jsx
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";

// pages (we’ll create them next)
import About from "./pages/About.jsx";
import Booking from "./pages/Booking.jsx";
import Datenschutz from "./pages/Datenschutz.jsx";
import Home from "./pages/Home.jsx";
import HouseRules from "./pages/HouseRules.jsx";
import Impressum from "./pages/Impressum.jsx";
import Terms from "./pages/Terms.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/about" element={<About />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/house-rules" element={<HouseRules />} />
      </Routes>
    </Layout>
  );
}
