/*
 * NOTELY — DASHBOARD PAGE
 * Design: Sunny Studio — Bauhaus playful modernism
 * "Stage" metaphor: student's instrument center-stage, orbiting activity cards
 * Asymmetric editorial layout, large color blocks, varied card sizes
 * Colors: Sunflower Yellow hero, Coral Red achievements, Sky Blue theory, Mint Green success
 */

import { useLocation } from "wouter";
import { useEffect, useState } from "react";

const INSTRUMENT_EMOJIS: Record<string, string> = {
  piano: "🎹", guitar: "🎸", drums: "🥁", violin: "🎻", flute: "🎵", trumpet: "🎺",
};

const LESSONS = [
  { id: "1", title: "Meet the Piano", emoji: "🎹", color: "#FFB800", duration: "5 min", stars: 3, completed: true },
  { id: "2", title: "Your First Notes", emoji: "🎵", color: "#4AABF5", duration: "8 min", stars: 2, completed: true },
  { id: "3", title: "Play Do-Re-Mi", emoji: "🎶", color: "#FF5C35", duration: "10 min", stars: 0, completed: false, current: true },
  { id: "4", title: "Rhythm & Beat", emoji: "🥁", color: "#3ECFA4", duration: "8 min", stars: 0, completed: false },
  { id: "5", title: "Your First Song", emoji: "⭐", color: "#FFB800", duration: "12 min", stars: 0, completed: false },
];

const ACHIEVEMENTS = [
  { id: "first_note", title: "First Note!", emoji: "🎵", earned: true },
  { id: "three_days", title: "3-Day Streak", emoji: "🔥", earned: true },
  { id: "first_song", title: "Musician!", emoji: "🎸", earned: false },
];

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [student, setStudent] = useState({ name: "Musician", avatar: "cat", instrument: "piano" });
  const [greeting, setGreeting] = useState("Good morning");

  useEffect(() => {
    const stored = localStorage.getItem("notely_student");
    if (stored) setStudent(JSON.parse(stored));
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const avatarEmojis: Record<string, string> = {
    cat: "🐱", bear: "🐻", fox: "🦊", rabbit: "🐰", owl: "🦉", panda: "🐼",
  };

  const currentLesson = LESSONS.find((l) => l.current) || LESSONS[2];
  const xpPercent = 42;
  const streak = 3;

  return (
    <div className="min-h-screen bg-[#FEFAF3]">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E5DDD0]">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-display font-800" style={{ color: "#FFB800", fontFamily: "'Baloo 2', cursive" }}>
            🎵 Notely
          </span>
        </div>
        <div className="flex items-center gap-4">
          {/* Streak */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: "#FFF3E0" }}>
            <span className="text-lg">🔥</span>
            <span className="font-display font-700 text-sm" style={{ color: "#FF5C35", fontFamily: "'Baloo 2', cursive" }}>
              {streak} days
            </span>
          </div>
          {/* XP */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-full" style={{ background: "#E8F5E9" }}>
            <span className="text-lg">⭐</span>
            <span className="font-display font-700 text-sm" style={{ color: "#3ECFA4", fontFamily: "'Baloo 2', cursive" }}>
              420 XP
            </span>
          </div>
          {/* Avatar */}
          <button
            className="w-10 h-10 rounded-full flex items-center justify-center text-xl border-2 border-[#FFB800]"
            style={{ background: "#FFF8E1" }}
          >
            {avatarEmojis[student.avatar] || "🐱"}
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Hero Section — Stage */}
        <div
          className="relative rounded-3xl overflow-hidden mb-6 p-6"
          style={{
            background: "linear-gradient(135deg, #FFB800 0%, #FF8C00 100%)",
            minHeight: "220px",
          }}
        >
          {/* Background image overlay */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663422386160/FwxdRn7gyJEfzV8667mpvP/hero-banner-amQDE8bUH6nmQbiRwtnXTu.webp)`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <p className="text-[#1A1A2E] opacity-70 font-medium mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {greeting}, {student.name}! 👋
              </p>
              <h1 className="text-3xl font-display font-800 text-[#1A1A2E] mb-3" style={{ fontFamily: "'Baloo 2', cursive" }}>
                Ready to make music?
              </h1>
              {/* XP Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-700 text-[#1A1A2E] opacity-70">Level 2 — Beginner</span>
                  <span className="text-sm font-700 text-[#1A1A2E] opacity-70">420 / 1000 XP</span>
                </div>
                <div className="progress-notely w-48" style={{ background: "rgba(255,255,255,0.4)" }}>
                  <div
                    className="progress-notely-fill"
                    style={{ background: "#1A1A2E", "--progress-width": `${xpPercent}%` } as React.CSSProperties}
                  />
                </div>
              </div>
              <button
                onClick={() => navigate(`/lesson/${currentLesson.id}`)}
                className="btn-notely px-6 py-3 text-base shadow-md"
                style={{ background: "#1A1A2E", color: "white", fontFamily: "'Baloo 2', cursive" }}
              >
                Continue: {currentLesson.title} →
              </button>
            </div>
            {/* Instrument mascot */}
            <div className="text-8xl animate-bounce-notely hidden md:block">
              {INSTRUMENT_EMOJIS[student.instrument] || "🎹"}
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Today's Lessons — wide card */}
          <div className="md:col-span-2">
            <h2 className="text-xl font-display font-700 mb-3" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
              📚 Your Lessons
            </h2>
            <div className="space-y-3">
              {LESSONS.map((lesson, idx) => (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/lesson/${lesson.id}`)}
                  className="card-notely w-full flex items-center gap-4 p-4 text-left"
                  style={{
                    opacity: lesson.completed || lesson.current ? 1 : 0.55,
                    animationDelay: `${idx * 0.08}s`,
                  }}
                >
                  {/* Lesson icon */}
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${lesson.color}22`, border: `2px solid ${lesson.color}` }}
                  >
                    {lesson.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-display font-700 text-base" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                        {lesson.title}
                      </span>
                      {lesson.current && (
                        <span
                          className="badge-notely text-xs"
                          style={{ background: "#FF5C35", color: "white" }}
                        >
                          Now
                        </span>
                      )}
                      {lesson.completed && (
                        <span
                          className="badge-notely text-xs"
                          style={{ background: "#3ECFA4", color: "white" }}
                        >
                          Done ✓
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">{lesson.duration}</span>
                  </div>
                  {/* Stars */}
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <span
                        key={s}
                        className="text-lg"
                        style={{ opacity: s <= lesson.stars ? 1 : 0.2 }}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Quick Practice */}
            <div
              className="card-notely p-5 cursor-pointer"
              onClick={() => navigate("/practice")}
              style={{ background: "linear-gradient(135deg, #4AABF5 0%, #2196F3 100%)" }}
            >
              <div className="text-4xl mb-2 animate-float">🎹</div>
              <h3 className="text-lg font-display font-700 text-white mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
                Practice Room
              </h3>
              <p className="text-blue-100 text-sm mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Play freely and explore!
              </p>
              <div
                className="inline-block px-4 py-2 rounded-full text-sm font-display font-700"
                style={{ background: "rgba(255,255,255,0.25)", color: "white", fontFamily: "'Baloo 2', cursive" }}
              >
                Open Studio →
              </div>
            </div>

            {/* Achievements */}
            <div className="card-notely p-5">
              <h3 className="text-base font-display font-700 mb-3" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                🏆 Badges
              </h3>
              <div className="flex gap-3">
                {ACHIEVEMENTS.map((badge) => (
                  <div
                    key={badge.id}
                    className="flex flex-col items-center gap-1"
                    style={{ opacity: badge.earned ? 1 : 0.35 }}
                  >
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                      style={{
                        background: badge.earned ? "#FFF3E0" : "#F5F5F5",
                        border: badge.earned ? "2px solid #FFB800" : "2px solid #E0E0E0",
                      }}
                    >
                      {badge.emoji}
                    </div>
                    <span className="text-xs text-center text-gray-500 leading-tight" style={{ maxWidth: "3.5rem" }}>
                      {badge.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Skill Tree shortcut */}
            <div
              className="card-notely p-5 cursor-pointer relative overflow-hidden"
              onClick={() => navigate("/skill-tree")}
              style={{ background: "#1A1A2E" }}
            >
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: `url(https://d2xsxph8kpxj0f.cloudfront.net/310519663422386160/FwxdRn7gyJEfzV8667mpvP/skill-tree-bg-fSiA7XU4SNMpWRdmvikDvo.webp)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="relative z-10">
                <div className="text-3xl mb-2 animate-star-pulse">🌟</div>
                <h3 className="text-base font-display font-700 text-white mb-1" style={{ fontFamily: "'Baloo 2', cursive" }}>
                  Skill Journey
                </h3>
                <p className="text-gray-400 text-sm mb-2" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  See your path to mastery
                </p>
                <div
                  className="inline-block px-3 py-1.5 rounded-full text-xs font-display font-700"
                  style={{ background: "#FFB800", color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}
                >
                  Explore →
                </div>
              </div>
            </div>

            {/* Progress shortcut */}
            <button
              onClick={() => navigate("/progress")}
              className="card-notely w-full p-4 flex items-center gap-3 text-left"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: "#E8F5E9" }}>
                📊
              </div>
              <div>
                <p className="font-display font-700 text-sm" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                  My Progress
                </p>
                <p className="text-xs text-gray-500">Stars & achievements</p>
              </div>
              <span className="ml-auto text-gray-400">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
