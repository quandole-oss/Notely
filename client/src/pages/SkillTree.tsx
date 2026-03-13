/*
 * NOTELY — SKILL TREE PAGE
 * Design: Sunny Studio — Bauhaus playful modernism
 * Visual constellation/path map on dark starfield background
 * Unlocked vs locked nodes, current position highlighted, preview of next steps
 * Inspired by Duolingo path but with a cosmic music journey feel
 */

import { useState } from "react";
import { useLocation } from "wouter";

interface SkillNode {
  id: string;
  title: string;
  emoji: string;
  color: string;
  status: "completed" | "current" | "available" | "locked";
  xp: number;
  description: string;
  lessons: number;
  stars?: number;
  x: number; // percentage position
  y: number; // percentage position
}

const SKILL_NODES: SkillNode[] = [
  // Row 1 — Foundation
  { id: "hello_music", title: "Hello Music!", emoji: "🎵", color: "#FFB800", status: "completed", xp: 50, description: "Discover what music is and why it's amazing!", lessons: 3, stars: 3, x: 50, y: 88 },
  // Row 2
  { id: "meet_piano", title: "Meet the Piano", emoji: "🎹", color: "#FFB800", status: "completed", xp: 75, description: "Learn the piano keys and their names", lessons: 4, stars: 3, x: 30, y: 75 },
  { id: "clap_rhythm", title: "Clap & Rhythm", emoji: "🥁", color: "#FF5C35", status: "completed", xp: 75, description: "Feel the beat and clap along!", lessons: 3, stars: 2, x: 70, y: 75 },
  // Row 3
  { id: "do_re_mi", title: "Do-Re-Mi", emoji: "🎶", color: "#4AABF5", status: "current", xp: 100, description: "Learn the musical alphabet: Do, Re, Mi, Fa, Sol, La, Si!", lessons: 5, stars: 0, x: 50, y: 60 },
  // Row 4
  { id: "first_song", title: "First Song!", emoji: "⭐", color: "#3ECFA4", status: "available", xp: 150, description: "Play your very first complete song!", lessons: 6, stars: 0, x: 25, y: 45 },
  { id: "ear_training", title: "Ear Training", emoji: "👂", color: "#9C27B0", status: "available", xp: 100, description: "Train your ears to recognize notes", lessons: 4, stars: 0, x: 75, y: 45 },
  // Row 5
  { id: "chords", title: "My First Chord", emoji: "🎸", color: "#FF5C35", status: "locked", xp: 200, description: "Play 3 notes at once — that's a chord!", lessons: 5, stars: 0, x: 50, y: 30 },
  // Row 6
  { id: "melody", title: "Write a Melody", emoji: "✨", color: "#FFB800", status: "locked", xp: 250, description: "Create your own musical phrase!", lessons: 6, stars: 0, x: 30, y: 15 },
  { id: "duet", title: "Play Together", emoji: "🎻", color: "#4AABF5", status: "locked", xp: 200, description: "Play music with a friend or teacher!", lessons: 4, stars: 0, x: 70, y: 15 },
];

// Connections between nodes (from → to)
const CONNECTIONS = [
  ["hello_music", "meet_piano"],
  ["hello_music", "clap_rhythm"],
  ["meet_piano", "do_re_mi"],
  ["clap_rhythm", "do_re_mi"],
  ["do_re_mi", "first_song"],
  ["do_re_mi", "ear_training"],
  ["first_song", "chords"],
  ["ear_training", "chords"],
  ["chords", "melody"],
  ["chords", "duet"],
];

export default function SkillTree() {
  const [, navigate] = useLocation();
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  const getNodeById = (id: string) => SKILL_NODES.find((n) => n.id === id);

  return (
    <div className="min-h-screen" style={{ background: "#1A1A2E" }}>
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)" }}
      >
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Home
        </button>
        <h1 className="text-xl font-display font-700 text-white" style={{ fontFamily: "'Baloo 2', cursive" }}>
          🌟 Skill Journey
        </h1>
        <div className="w-16" />
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 px-4 py-3">
        {[
          { color: "#3ECFA4", label: "Done", emoji: "✓" },
          { color: "#FFB800", label: "Now", emoji: "▶" },
          { color: "rgba(255,255,255,0.3)", label: "Next", emoji: "○" },
          { color: "rgba(255,255,255,0.1)", label: "Locked", emoji: "🔒" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center text-xs"
              style={{ background: item.color, color: "white" }}
            />
            <span className="text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Skill tree map */}
      <div className="relative mx-auto" style={{ maxWidth: "500px", height: "520px" }}>
        {/* Background image */}
        <div
          className="absolute inset-0 opacity-40 rounded-2xl overflow-hidden mx-4"
          style={{
            backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663422386160/FwxdRn7gyJEfzV8667mpvP/skill-tree-bg-fSiA7XU4SNMpWRdmvikDvo.webp)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />

        {/* SVG connections */}
        <svg className="absolute inset-0 w-full h-full" style={{ padding: "0 1rem" }}>
          {CONNECTIONS.map(([fromId, toId]) => {
            const from = getNodeById(fromId);
            const to = getNodeById(toId);
            if (!from || !to) return null;
            const isActive = from.status === "completed" || from.status === "current";
            return (
              <line
                key={`${fromId}-${toId}`}
                x1={`${from.x}%`}
                y1={`${from.y}%`}
                x2={`${to.x}%`}
                y2={`${to.y}%`}
                stroke={isActive ? "#FFB800" : "rgba(255,255,255,0.15)"}
                strokeWidth={isActive ? "3" : "2"}
                strokeDasharray={isActive ? "none" : "6,4"}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {SKILL_NODES.map((node) => (
          <button
            key={node.id}
            onClick={() => setSelectedNode(node)}
            className="skill-node absolute flex flex-col items-center"
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            {/* Node circle */}
            <div
              className="flex items-center justify-center rounded-full text-2xl shadow-lg transition-all duration-300"
              style={{
                width: node.status === "current" ? "4rem" : "3.2rem",
                height: node.status === "current" ? "4rem" : "3.2rem",
                background:
                  node.status === "completed" ? "#3ECFA4" :
                  node.status === "current" ? node.color :
                  node.status === "available" ? "rgba(255,255,255,0.15)" :
                  "rgba(255,255,255,0.06)",
                border:
                  node.status === "completed" ? "3px solid #3ECFA4" :
                  node.status === "current" ? `4px solid ${node.color}` :
                  node.status === "available" ? "2px solid rgba(255,255,255,0.3)" :
                  "2px solid rgba(255,255,255,0.1)",
                boxShadow:
                  node.status === "current" ? `0 0 20px ${node.color}66` :
                  node.status === "completed" ? "0 0 12px rgba(62,207,164,0.4)" : "none",
                filter: node.status === "locked" ? "grayscale(0.8) opacity(0.5)" : "none",
              }}
            >
              {node.status === "completed" ? "✓" : node.status === "locked" ? "🔒" : node.emoji}
            </div>

            {/* Stars for completed */}
            {node.status === "completed" && node.stars !== undefined && (
              <div className="flex gap-0.5 mt-1">
                {[1, 2, 3].map((s) => (
                  <span key={s} className="text-xs" style={{ opacity: s <= (node.stars ?? 0) ? 1 : 0.3 }}>
                    ⭐
                  </span>
                ))}
              </div>
            )}

            {/* Current pulse ring */}
            {node.status === "current" && (
              <div
                className="absolute rounded-full animate-ping"
                style={{
                  width: "4.5rem",
                  height: "4.5rem",
                  border: `2px solid ${node.color}`,
                  opacity: 0.4,
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
            )}

            {/* Label */}
            <span
              className="text-xs font-display font-700 mt-1 text-center"
              style={{
                color: node.status === "locked" ? "rgba(255,255,255,0.3)" : "white",
                fontFamily: "'Baloo 2', cursive",
                maxWidth: "4.5rem",
                lineHeight: "1.2",
                textShadow: "0 1px 3px rgba(0,0,0,0.5)",
              }}
            >
              {node.title}
            </span>
          </button>
        ))}
      </div>

      {/* Node detail panel */}
      {selectedNode && (
        <div
          className="fixed inset-x-0 bottom-0 rounded-t-3xl p-6 animate-slide-up"
          style={{ background: "#FEFAF3", maxHeight: "50vh" }}
        >
          <div className="flex items-start gap-4 mb-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0"
              style={{
                background: `${selectedNode.color}22`,
                border: `2px solid ${selectedNode.color}`,
              }}
            >
              {selectedNode.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-xl font-display font-700" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                  {selectedNode.title}
                </h3>
                <span
                  className="badge-notely text-xs"
                  style={{
                    background:
                      selectedNode.status === "completed" ? "#3ECFA4" :
                      selectedNode.status === "current" ? selectedNode.color :
                      selectedNode.status === "available" ? "#4AABF5" : "#E5DDD0",
                    color:
                      selectedNode.status === "locked" ? "#999" :
                      selectedNode.color === "#FFB800" && selectedNode.status === "current" ? "#1A1A2E" : "white",
                  }}
                >
                  {selectedNode.status === "completed" ? "✓ Done" :
                   selectedNode.status === "current" ? "▶ Now" :
                   selectedNode.status === "available" ? "Unlocked" : "🔒 Locked"}
                </span>
              </div>
              <p className="text-sm text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {selectedNode.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mb-4 text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            <span>📚 {selectedNode.lessons} lessons</span>
            <span>⭐ {selectedNode.xp} XP</span>
            {selectedNode.stars !== undefined && selectedNode.status === "completed" && (
              <span>{"⭐".repeat(selectedNode.stars)} earned</span>
            )}
          </div>

          <div className="flex gap-3">
            {(selectedNode.status === "current" || selectedNode.status === "available") && (
              <button
                onClick={() => { navigate("/lesson/1"); setSelectedNode(null); }}
                className="btn-notely flex-1 py-3 text-base"
                style={{ background: selectedNode.color, color: selectedNode.color === "#FFB800" ? "#1A1A2E" : "white", fontFamily: "'Baloo 2', cursive" }}
              >
                {selectedNode.status === "current" ? "Continue →" : "Start →"}
              </button>
            )}
            {selectedNode.status === "completed" && (
              <button
                onClick={() => { navigate("/lesson/1"); setSelectedNode(null); }}
                className="btn-notely flex-1 py-3 text-base"
                style={{ background: "#3ECFA4", color: "white", fontFamily: "'Baloo 2', cursive" }}
              >
                Review Again →
              </button>
            )}
            <button
              onClick={() => setSelectedNode(null)}
              className="btn-notely px-5 py-3 text-base"
              style={{ background: "#E5DDD0", color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Tap hint */}
      {!selectedNode && (
        <p className="text-center text-gray-500 text-sm mt-2 pb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Tap any node to see details ✨
        </p>
      )}
    </div>
  );
}
