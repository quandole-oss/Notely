/*
 * NOTELY — BEST MOMENTS WALL
 * Humanism — celebrates student's proudest achievements
 * Reads from notely_best_moments in localStorage
 */

import { useState, useEffect } from "react";

interface BestMoment {
  id: string;
  label: string;
  emoji: string;
  savedAt: string;
}

const COLORS = ["#FFB800", "#FF5C35", "#4AABF5", "#3ECFA4"];

export default function BestMomentsWall() {
  const [moments, setMoments] = useState<BestMoment[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem("notely_best_moments");
    if (stored) setMoments(JSON.parse(stored));
  }, []);

  return (
    <div className="mt-6">
      <h3
        className="font-display font-700 text-lg mb-1"
        style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}
      >
        My Best Moments ⭐
      </h3>
      <p
        className="text-sm text-gray-500 mb-4"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        Tap the star after finishing a song to save it here.
      </p>

      {moments.length === 0 ? (
        <div
          className="card-notely p-6 text-center"
          style={{ border: "2px dashed #E5DDD0", background: "transparent" }}
        >
          <p className="text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Your best moments will appear here — finish a lesson or song to add one! 🌟
          </p>
        </div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollSnapType: "x mandatory" }}>
          {moments.map((moment, idx) => (
            <div
              key={moment.id}
              className="flex-shrink-0 flex flex-col items-center justify-center text-center text-white"
              style={{
                width: "8rem",
                height: "8rem",
                borderRadius: "1.5rem",
                background: COLORS[idx % COLORS.length],
                scrollSnapAlign: "start",
              }}
            >
              <span className="text-3xl mb-1">{moment.emoji}</span>
              <span
                className="font-display font-700 px-2 leading-tight"
                style={{ fontFamily: "'Baloo 2', cursive", fontSize: "0.75rem" }}
              >
                {moment.label}
              </span>
              <span
                className="opacity-70 mt-0.5"
                style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.65rem" }}
              >
                {new Date(moment.savedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
