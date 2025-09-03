import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav className="w-full p-4 bg-gray-800 flex items-center justify-between relative">
      <Link to="/" className="font-bold text-2xl text-yellow-300">
        Logout
      </Link>

      {/* Top-right Floating Logout */}
      {user && (
        <div
          className="fixed top-2 right-6 z-50"
          style={{
            background: "rgba(31, 41, 55, 0.95)",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.16)"
          }}
        >
          <span className="text-yellow-300 font-semibold">
            Hello, {user.name}
          </span>
          <Link
            to="/"
            onClick={logout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 font-semibold"
          >
            Logout
          </Link>
        </div>
      )}
    </nav>
  );
}
