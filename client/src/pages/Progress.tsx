/*
 * NOTELY — PROGRESS PAGE
 * Design: Sunny Studio — Bauhaus playful modernism
 * Star collection map, achievement badges wall, skill growth visual
 * Celebratory, visual-first — numbers are secondary to symbols and colors
 */

import { useLocation } from "wouter";
import { useState } from "react";

const ACHIEVEMENTS = [
  { id: "first_note", title: "First Note!", desc: "Played your very first note", emoji: "🎵", color: "#FFB800", earned: true, date: "Today" },
  { id: "three_days", title: "3-Day Streak!", desc: "Practiced 3 days in a row", emoji: "🔥", color: "#FF5C35", earned: true, date: "Yesterday" },
  { id: "do_re_mi", title: "Do-Re-Mi!", desc: "Learned the first 3 notes", emoji: "🎶", color: "#4AABF5", earned: true, date: "2 days ago" },
  { id: "first_song", title: "Musician!", desc: "Completed your first full song", emoji: "🎸", color: "#3ECFA4", earned: false, date: null },
  { id: "week_streak", title: "Week Warrior!", desc: "7-day practice streak", emoji: "⚡", color: "#9C27B0", earned: false, date: null },
  { id: "chord_master", title: "Chord Master!", desc: "Learned 3 different chords", emoji: "🎹", color: "#FF5C35", earned: false, date: null },
  { id: "ear_training", title: "Sharp Ears!", desc: "Identified 10 notes by ear", emoji: "👂", color: "#FFB800", earned: false, date: null },
  { id: "performer", title: "Performer!", desc: "Played a full song without mistakes", emoji: "🌟", color: "#3ECFA4", earned: false, date: null },
];

const SKILLS = [
  { name: "Notes", emoji: "🎵", level: 3, maxLevel: 5, color: "#FFB800" },
  { name: "Rhythm", emoji: "🥁", level: 2, maxLevel: 5, color: "#FF5C35" },
  { name: "Chords", emoji: "🎹", level: 1, maxLevel: 5, color: "#4AABF5" },
  { name: "Ear", emoji: "👂", level: 2, maxLevel: 5, color: "#3ECFA4" },
  { name: "Songs", emoji: "🎶", level: 1, maxLevel: 5, color: "#9C27B0" },
];

const WEEKLY_PRACTICE = [
  { day: "Mon", minutes: 15, emoji: "🔥" },
  { day: "Tue", minutes: 20, emoji: "🔥" },
  { day: "Wed", minutes: 10, emoji: "🔥" },
  { day: "Thu", minutes: 0, emoji: "" },
  { day: "Fri", minutes: 25, emoji: "🔥" },
  { day: "Sat", minutes: 0, emoji: "" },
  { day: "Sun", minutes: 0, emoji: "" },
];

const MAX_MINUTES = 30;

export default function Progress() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "badges" | "skills">("overview");

  const earnedCount = ACHIEVEMENTS.filter((a) => a.earned).length;
  const totalStars = 7; // from completed lessons
  const practiceStreak = 3;

  return (
    <div className="min-h-screen bg-[#FEFAF3]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5DDD0]">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Home
        </button>
        <h1 className="text-xl font-display font-700" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
          📊 My Progress
        </h1>
        <div className="w-16" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Hero stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div
            className="card-notely p-4 text-center"
            style={{ background: "linear-gradient(135deg, #FFB800, #FF8C00)" }}
          >
            <p className="text-4xl font-display font-800 text-white" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {totalStars}
            </p>
            <p className="text-yellow-100 text-sm font-medium">⭐ Stars</p>
          </div>
          <div
            className="card-notely p-4 text-center"
            style={{ background: "linear-gradient(135deg, #FF5C35, #E64A19)" }}
          >
            <p className="text-4xl font-display font-800 text-white" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {practiceStreak}
            </p>
            <p className="text-orange-100 text-sm font-medium">🔥 Day Streak</p>
          </div>
          <div
            className="card-notely p-4 text-center"
            style={{ background: "linear-gradient(135deg, #3ECFA4, #00897B)" }}
          >
            <p className="text-4xl font-display font-800 text-white" style={{ fontFamily: "'Baloo 2', cursive" }}>
              {earnedCount}
            </p>
            <p className="text-green-100 text-sm font-medium">🏆 Badges</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: "#F0EDE8" }}>
          {(["overview", "badges", "skills"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="flex-1 py-2.5 rounded-xl font-display font-700 text-sm transition-all duration-200"
              style={{
                background: activeTab === tab ? "white" : "transparent",
                color: activeTab === tab ? "#1A1A2E" : "#999",
                boxShadow: activeTab === tab ? "0 2px 8px rgba(0,0,0,0.1)" : "none",
                fontFamily: "'Baloo 2', cursive",
              }}
            >
              {tab === "overview" ? "📅 This Week" : tab === "badges" ? "🏆 Badges" : "💪 Skills"}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="animate-slide-up space-y-4">
            {/* Weekly practice chart */}
            <div className="card-notely p-5">
              <h3 className="font-display font-700 text-base mb-4" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                📅 This Week's Practice
              </h3>
              <div className="flex items-end gap-2 h-24">
                {WEEKLY_PRACTICE.map((day) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t-lg transition-all duration-700"
                      style={{
                        height: `${(day.minutes / MAX_MINUTES) * 100}%`,
                        minHeight: day.minutes > 0 ? "8px" : "0",
                        background:
                          day.minutes >= 20 ? "#3ECFA4" :
                          day.minutes >= 10 ? "#FFB800" :
                          day.minutes > 0 ? "#FF5C35" : "transparent",
                        border: day.minutes === 0 ? "2px dashed #E5DDD0" : "none",
                        borderRadius: "6px 6px 0 0",
                      }}
                    />
                    <span className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                      {day.day}
                    </span>
                    {day.emoji && <span className="text-xs">{day.emoji}</span>}
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#3ECFA4" }} /> 20+ min</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#FFB800" }} /> 10-20 min</span>
                <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full inline-block" style={{ background: "#FF5C35" }} /> Under 10</span>
              </div>
            </div>

            {/* XP Progress */}
            <div className="card-notely p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-display font-700 text-base" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                  ⭐ Level Progress
                </h3>
                <span className="badge-notely" style={{ background: "#FFB800", color: "#1A1A2E" }}>
                  Level 2
                </span>
              </div>
              <div className="progress-notely mb-2">
                <div
                  className="progress-notely-fill"
                  style={{ background: "linear-gradient(90deg, #FFB800, #FF8C00)", "--progress-width": "42%" } as React.CSSProperties}
                />
              </div>
              <div className="flex justify-between text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <span>420 XP</span>
                <span>580 XP to Level 3</span>
              </div>
            </div>

            {/* Recent achievements */}
            <div className="card-notely p-5">
              <h3 className="font-display font-700 text-base mb-3" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                🏆 Recent Badges
              </h3>
              <div className="space-y-3">
                {ACHIEVEMENTS.filter((a) => a.earned).map((badge) => (
                  <div key={badge.id} className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${badge.color}22`, border: `2px solid ${badge.color}` }}
                    >
                      {badge.emoji}
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-700 text-sm" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                        {badge.title}
                      </p>
                      <p className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                        {badge.desc}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">{badge.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Badges Tab */}
        {activeTab === "badges" && (
          <div className="animate-slide-up">
            <p className="text-sm text-gray-500 mb-4 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {earnedCount} of {ACHIEVEMENTS.length} badges earned — keep going!
            </p>
            <div className="grid grid-cols-2 gap-3">
              {ACHIEVEMENTS.map((badge, idx) => (
                <div
                  key={badge.id}
                  className="card-notely p-4 flex flex-col items-center text-center gap-2"
                  style={{
                    opacity: badge.earned ? 1 : 0.5,
                    animationDelay: `${idx * 0.06}s`,
                    border: badge.earned ? `2px solid ${badge.color}` : "2px solid #E5DDD0",
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
                    style={{
                      background: badge.earned ? `${badge.color}22` : "#F5F5F5",
                    }}
                  >
                    {badge.earned ? badge.emoji : "🔒"}
                  </div>
                  <p className="font-display font-700 text-sm" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                    {badge.title}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {badge.desc}
                  </p>
                  {badge.earned && badge.date && (
                    <span
                      className="badge-notely text-xs"
                      style={{ background: badge.color, color: badge.color === "#FFB800" ? "#1A1A2E" : "white" }}
                    >
                      ✓ {badge.date}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div className="animate-slide-up space-y-4">
            <p className="text-sm text-gray-500 text-center mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Each skill grows as you practice and complete lessons!
            </p>
            {SKILLS.map((skill, idx) => (
              <div
                key={skill.name}
                className="card-notely p-4"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                    style={{ background: `${skill.color}22`, border: `2px solid ${skill.color}` }}
                  >
                    {skill.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-display font-700 text-base" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                        {skill.name}
                      </p>
                      <span
                        className="badge-notely text-xs"
                        style={{ background: skill.color, color: skill.color === "#FFB800" ? "#1A1A2E" : "white" }}
                      >
                        Level {skill.level}
                      </span>
                    </div>
                    <div className="progress-notely">
                      <div
                        className="progress-notely-fill"
                        style={{
                          background: skill.color,
                          "--progress-width": `${(skill.level / skill.maxLevel) * 100}%`,
                        } as React.CSSProperties}
                      />
                    </div>
                  </div>
                </div>
                {/* Level dots */}
                <div className="flex gap-2 pl-13">
                  {Array.from({ length: skill.maxLevel }).map((_, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-display font-700 transition-all"
                      style={{
                        background: i < skill.level ? skill.color : "#E5DDD0",
                        color: i < skill.level ? (skill.color === "#FFB800" ? "#1A1A2E" : "white") : "#999",
                        fontFamily: "'Baloo 2', cursive",
                      }}
                    >
                      {i < skill.level ? "★" : i + 1}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
