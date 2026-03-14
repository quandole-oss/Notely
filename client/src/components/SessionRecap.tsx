/*
 * NOTELY — SESSION RECAP BANNER
 * Experiential/Kolb — closes the learning cycle by recapping the last session
 * Appears at top of Dashboard when a previous session summary exists
 */

import { motion } from "framer-motion";

interface SessionSummary {
  lessonName: string;
  notesPlayed: number;
  dismissed: boolean;
}

interface SessionRecapProps {
  summary: SessionSummary;
  onDismiss: () => void;
}

export default function SessionRecap({ summary, onDismiss }: SessionRecapProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="flex items-center gap-3 mb-4"
      style={{
        background: "#E8F5E9",
        borderLeft: "4px solid #3ECFA4",
        borderRadius: "1rem",
        padding: "1rem 1.25rem",
      }}
    >
      <span className="text-3xl flex-shrink-0">🎵</span>
      <div className="flex-1 min-w-0">
        <p
          className="font-display font-700 text-sm"
          style={{ fontFamily: "'Baloo 2', cursive", color: "#1A1A2E" }}
        >
          Last time you played: {summary.lessonName}
        </p>
        <p
          className="text-sm text-gray-600"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          You played {summary.notesPlayed} notes and discovered {Math.max(1, Math.floor(summary.notesPlayed / 3))} new sounds!
        </p>
      </div>
      <button
        onClick={onDismiss}
        className="text-gray-400 hover:text-gray-600 transition-colors text-lg flex-shrink-0"
      >
        ✕
      </button>
    </motion.div>
  );
}
