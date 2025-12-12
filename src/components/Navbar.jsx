// src/components/Navbar.jsx
import { Link, NavLink } from "react-router-dom";

const navLinkBase =
  "text-sm md:text-base px-3 py-2 rounded-full transition-colors";
const navLinkActive = "bg-zinc-800 text-zinc-50";
const navLinkInactive = "text-zinc-300 hover:bg-zinc-800/60";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 bg-black/70 backdrop-blur-md border-b border-zinc-800">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link to="/" className="flex flex-col leading-tight">
          <span className="uppercase tracking-[0.22em] text-xs text-zinc-400">
            Studentenwohnheim
          </span>
          <span className="text-sm md:text-lg font-semibold">
            RoKo-Bar · Robert-Koch-Str. 38
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/booking"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            Buchen
          </NavLink>
          <NavLink
            to="/faq"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            FAQ
          </NavLink>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              `${navLinkBase} ${isActive ? navLinkActive : navLinkInactive}`
            }
          >
            Über die Bar
          </NavLink>

          {/* Language toggle placeholder – default DE */}
          <button
            type="button"
            className="ml-3 text-xs border border-zinc-700 rounded-full px-3 py-1 text-zinc-300 hover:bg-zinc-800/70"
          >
            DE | EN
          </button>
        </div>
      </nav>
    </header>
  );
}
