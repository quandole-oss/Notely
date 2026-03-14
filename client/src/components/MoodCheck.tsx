/*
 * NOTELY — MOOD CHECK MODAL
 * Humanism-based session opener — asks child how they're feeling today
 * Stores mood + date in notely_session localStorage
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface MoodCheckProps {
  onComplete: (mood: "energetic" | "calm" | "tired") => void;
}

const MOODS = [
  { emoji: "😊", label: "Happy & Energetic", value: "energetic" as const },
  { emoji: "😌", label: "Calm & Focused", value: "calm" as const },
  { emoji: "😴", label: "A Little Tired", value: "tired" as const },
];

export default function MoodCheck({ onComplete }: MoodCheckProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [exiting, setExiting] = useState(false);

  const handleSelect = (value: "energetic" | "calm" | "tired") => {
    setSelected(value);
    const session = JSON.parse(localStorage.getItem("notely_session") || "{}");
    session.mood = value;
    session.lastMoodDate = new Date().toISOString().split("T")[0];
    localStorage.setItem("notely_session", JSON.stringify(session));
    setExiting(true);
    setTimeout(() => onComplete(value), 400);
  };

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.4)" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white p-8 flex flex-col items-center gap-6"
            style={{ borderRadius: "2rem", maxWidth: "24rem", width: "90%" }}
          >
            <h2
              className="font-display font-800 text-center"
              style={{ fontFamily: "'Baloo 2', cursive", fontSize: "2rem", color: "#1A1A2E" }}
            >
              How are you feeling today?
            </h2>
            <div className="flex gap-4">
              {MOODS.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => handleSelect(mood.value)}
                  className="flex flex-col items-center gap-2 transition-all duration-200"
                >
                  <div
                    className="flex items-center justify-center rounded-full transition-all duration-200"
                    style={{
                      width: "5rem",
                      height: "5rem",
                      fontSize: "2.5rem",
                      border: selected === mood.value ? "3px solid #FFB800" : "3px solid #E5DDD0",
                      background: selected === mood.value ? "#FFF8E1" : "white",
                    }}
                  >
                    {mood.emoji}
                  </div>
                  <span
                    className="text-sm font-medium text-center"
                    style={{ fontFamily: "'DM Sans', sans-serif", color: "#1A1A2E", maxWidth: "5rem" }}
                  >
                    {mood.label}
                  </span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
