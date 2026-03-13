/*
 * NOTELY — BOTTOM NAVIGATION
 * Design: Sunny Studio — large tap targets, emoji icons, color-coded tabs
 * Child-friendly: big icons, clear labels, active state with color fill
 */

import { useLocation } from "wouter";

const NAV_ITEMS = [
  { path: "/dashboard", emoji: "🏠", label: "Home" },
  { path: "/lesson/3", emoji: "📚", label: "Lessons" },
  { path: "/practice", emoji: "🎹", label: "Practice" },
  { path: "/progress", emoji: "⭐", label: "Progress" },
  { path: "/skill-tree", emoji: "🌟", label: "Journey" },
];

export default function BottomNav() {
  const [location, navigate] = useLocation();

  const isActive = (path: string) => {
    if (path === "/dashboard") return location === "/dashboard";
    if (path.startsWith("/lesson")) return location.startsWith("/lesson");
    return location === path;
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 flex items-center justify-around px-2 py-2 border-t"
      style={{
        background: "white",
        borderColor: "#E5DDD0",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
        zIndex: 50,
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.path);
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all duration-200"
            style={{
              background: active ? "#FFF8E1" : "transparent",
              transform: active ? "scale(1.1)" : "scale(1)",
              minWidth: "3.5rem",
            }}
          >
            <span className="text-2xl leading-none">{item.emoji}</span>
            <span
              className="text-xs font-display font-700 leading-none"
              style={{
                color: active ? "#FFB800" : "#999",
                fontFamily: "'Baloo 2', cursive",
              }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
