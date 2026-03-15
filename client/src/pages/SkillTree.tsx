/*
 * NOTELY — SKILL TREE PAGE
 * Design: Sunny Studio — Bauhaus playful modernism
 * Nodes arranged in a musical note (♪) shape on dark starfield background
 * Progressive unlocking synced with notely_progress in localStorage
 */

import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface SkillNode {
  id: string;
  lessonId: string;
  title: string;
  emoji: string;
  color: string;
  description: string;
  x: number; // percentage position
  y: number; // percentage position
}

// 10 nodes forming a musical note (♪) shape
// Notehead (tilted oval) offset LEFT of the stem, stem rises from right edge, flag swoops right then down
const SKILL_NODES: SkillNode[] = [
  // Notehead (tilted oval, offset left of stem)
  { id: "n1",  lessonId: "1",  title: "Meet the Instruments", emoji: "🎶", color: "#9C27B0", description: "Discover instruments and their sounds!", x: 32, y: 88 },
  { id: "n2",  lessonId: "2",  title: "Meet the Piano",       emoji: "🎹", color: "#FFB800", description: "Learn the piano keys and their names", x: 18, y: 80 },
  { id: "n3",  lessonId: "3",  title: "High and Low",         emoji: "📏", color: "#4AABF5", description: "Explore high and low sounds", x: 44, y: 80 },
  { id: "n4",  lessonId: "4",  title: "Your First Notes",     emoji: "🎵", color: "#FF5C35", description: "Play C, D, and E on the keyboard!", x: 44, y: 70 },
  // Stem (rises from right side of notehead)
  { id: "n5",  lessonId: "5",  title: "Rhythm & Beat",        emoji: "🥁", color: "#3ECFA4", description: "Feel the beat and clap along!", x: 44, y: 58 },
  { id: "n6",  lessonId: "6",  title: "Your First Song",      emoji: "⭐", color: "#FFB800", description: "Play your very first complete song!", x: 44, y: 46 },
  { id: "n7",  lessonId: "7",  title: "Loud and Soft",        emoji: "🔊", color: "#9C27B0", description: "Learn about dynamics in music", x: 44, y: 34 },
  { id: "n8",  lessonId: "8",  title: "Fast and Slow",        emoji: "🐇", color: "#FF5C35", description: "Explore tempo — fast and slow!", x: 44, y: 20 },
  // Flag (swoops right from stem top, then curves down)
  { id: "n9",  lessonId: "9",  title: "Patterns in Music",    emoji: "🧩", color: "#9C27B0", description: "Discover musical patterns and form", x: 58, y: 14 },
  { id: "n10", lessonId: "10", title: "My Music",             emoji: "🎉", color: "#FFB800", description: "Create your own musical composition!", x: 54, y: 40 },
];

// Curved connections forming the ♪ outline
// Each has a quadratic bezier control point (cx, cy) to shape the curve
// Notehead: bulges outward to form tilted oval | Stem: straight | Flag: swoop right then down
const CONNECTIONS: { from: string; to: string; cx: number; cy: number }[] = [
  // Notehead oval — curves bulge outward from the tilted oval edges
  { from: "n1", to: "n2", cx: 18, cy: 88 },   // bottom-left arc
  { from: "n1", to: "n3", cx: 44, cy: 88 },   // bottom-right arc
  { from: "n2", to: "n4", cx: 18, cy: 72 },   // top-left arc
  { from: "n3", to: "n4", cx: 48, cy: 75 },   // right side slight curve
  // Stem — straight vertical (control points at midpoints)
  { from: "n4", to: "n5", cx: 44, cy: 64 },
  { from: "n5", to: "n6", cx: 44, cy: 52 },
  { from: "n6", to: "n7", cx: 44, cy: 40 },
  { from: "n7", to: "n8", cx: 44, cy: 27 },
  // Flag — swoops right then curves dramatically down
  { from: "n8", to: "n9", cx: 56, cy: 12 },   // curves right and up
  { from: "n9", to: "n10", cx: 66, cy: 18 },  // wide swoop back down
];

type NodeStatus = "completed" | "current" | "locked";

export default function SkillTree() {
  const [, navigate] = useLocation();
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(null);

  // Real-time sync with notely_progress
  const [progress, setProgress] = useState<Record<string, { completed: boolean; stars: number }>>(() =>
    JSON.parse(localStorage.getItem("notely_progress") || "{}")
  );

  useEffect(() => {
    const sync = () => setProgress(JSON.parse(localStorage.getItem("notely_progress") || "{}"));
    window.addEventListener("storage", sync);
    const onVis = () => { if (document.visibilityState === "visible") sync(); };
    document.addEventListener("visibilitychange", onVis);
    return () => { window.removeEventListener("storage", sync); document.removeEventListener("visibilitychange", onVis); };
  }, []);

  // Derive status: linear progression — each lesson unlocks when previous is complete
  function getStatus(node: SkillNode): NodeStatus {
    if (progress[node.lessonId]?.completed) return "completed";
    const lessonNum = parseInt(node.lessonId, 10);
    if (lessonNum === 1) return "current";
    const prevCompleted = progress[String(lessonNum - 1)]?.completed;
    if (prevCompleted) return "current";
    return "locked";
  }

  function getStars(node: SkillNode): number {
    return progress[node.lessonId]?.stars ?? 0;
  }

  // Connection lights up when the lower-numbered endpoint's lesson is completed
  function isConnectionActive(fromId: string, toId: string): boolean {
    const fromNode = SKILL_NODES.find((n) => n.id === fromId);
    if (!fromNode) return false;
    return progress[fromNode.lessonId]?.completed === true;
  }

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

        {/* SVG connections — curved paths */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          {CONNECTIONS.map((conn) => {
            const from = getNodeById(conn.from);
            const to = getNodeById(conn.to);
            if (!from || !to) return null;
            const active = isConnectionActive(conn.from, conn.to);
            return (
              <path
                key={`${conn.from}-${conn.to}`}
                d={`M ${from.x} ${from.y} Q ${conn.cx} ${conn.cy} ${to.x} ${to.y}`}
                fill="none"
                stroke={active ? "#FFB800" : "rgba(255,255,255,0.15)"}
                strokeWidth={active ? 3 : 2}
                strokeDasharray={active ? "none" : "6,4"}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {SKILL_NODES.map((node) => {
          const status = getStatus(node);
          const stars = getStars(node);
          return (
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
                  width: status === "current" ? "4rem" : "3.2rem",
                  height: status === "current" ? "4rem" : "3.2rem",
                  background:
                    status === "completed" ? "#3ECFA4" :
                    status === "current" ? node.color :
                    "rgba(255,255,255,0.06)",
                  border:
                    status === "completed" ? "3px solid #3ECFA4" :
                    status === "current" ? `4px solid ${node.color}` :
                    "2px solid rgba(255,255,255,0.1)",
                  boxShadow:
                    status === "current" ? `0 0 20px ${node.color}66` :
                    status === "completed" ? "0 0 12px rgba(62,207,164,0.4)" : "none",
                  filter: status === "locked" ? "grayscale(0.8) opacity(0.5)" : "none",
                }}
              >
                {status === "completed" ? "✓" : status === "locked" ? "🔒" : node.emoji}
              </div>

              {/* Stars for completed */}
              {status === "completed" && (
                <div className="flex gap-0.5 mt-1">
                  {[1, 2, 3].map((s) => (
                    <span key={s} className="text-xs" style={{ opacity: s <= stars ? 1 : 0.3 }}>
                      ⭐
                    </span>
                  ))}
                </div>
              )}

              {/* Current pulse ring */}
              {status === "current" && (
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
                  color: status === "locked" ? "rgba(255,255,255,0.3)" : "white",
                  fontFamily: "'Baloo 2', cursive",
                  maxWidth: "4.5rem",
                  lineHeight: "1.2",
                  textShadow: "0 1px 3px rgba(0,0,0,0.5)",
                }}
              >
                {node.title}
              </span>
            </button>
          );
        })}
      </div>

      {/* Node detail panel */}
      {selectedNode && (() => {
        const status = getStatus(selectedNode);
        const stars = getStars(selectedNode);
        return (
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
                        status === "completed" ? "#3ECFA4" :
                        status === "current" ? selectedNode.color :
                        "#E5DDD0",
                      color:
                        status === "locked" ? "#999" :
                        selectedNode.color === "#FFB800" && status === "current" ? "#1A1A2E" : "white",
                    }}
                  >
                    {status === "completed" ? "✓ Done" :
                     status === "current" ? "▶ Now" : "🔒 Locked"}
                  </span>
                </div>
                <p className="text-sm text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  {selectedNode.description}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-4 text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              <span>📚 Lesson {selectedNode.lessonId}</span>
              {status === "completed" && (
                <span>{"⭐".repeat(stars)} earned</span>
              )}
            </div>

            <div className="flex gap-3">
              {status === "current" && (
                <button
                  onClick={() => { navigate(`/lesson/${selectedNode.lessonId}`); setSelectedNode(null); }}
                  className="btn-notely flex-1 py-3 text-base"
                  style={{ background: selectedNode.color, color: selectedNode.color === "#FFB800" ? "#1A1A2E" : "white", fontFamily: "'Baloo 2', cursive" }}
                >
                  Continue →
                </button>
              )}
              {status === "completed" && (
                <button
                  onClick={() => { navigate(`/lesson/${selectedNode.lessonId}`); setSelectedNode(null); }}
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
        );
      })()}

      {/* Tap hint */}
      {!selectedNode && (
        <p className="text-center text-gray-500 text-sm mt-2 pb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Tap any node to see details ✨
        </p>
      )}
    </div>
  );
}
