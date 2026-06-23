// src/App.jsx
import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout.jsx";

// pages (we’ll create them next)
import About from "./pages/About.jsx";
import Admin from "./pages/Admin.jsx";
import Alumni from "./pages/Alumni.jsx";
import Booking from "./pages/Booking.jsx";
import BookingStatus from "./pages/BookingStatus.jsx";
import Datenschutz from "./pages/Datenschutz.jsx";
import Directions from "./pages/Directions.jsx";
import Home from "./pages/Home.jsx";
import HouseRules from "./pages/HouseRules.jsx";
import Impressum from "./pages/Impressum.jsx";
import Mietbedingungen from "./pages/Mietbedingungen.jsx";
import NotFound from "./pages/NotFound.jsx";
import Team from "./pages/Team.jsx";

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/booking/:token" element={<BookingStatus />} />
        <Route path="/about" element={<About />} />
        <Route path="/team" element={<Team />} />
        <Route path="/directions" element={<Directions />} />
        <Route path="/alumni" element={<Alumni />} />
        <Route path="/impressum" element={<Impressum />} />
        <Route path="/datenschutz" element={<Datenschutz />} />
        <Route path="/terms" element={<Mietbedingungen />} />
        <Route path="/house-rules" element={<HouseRules />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}
