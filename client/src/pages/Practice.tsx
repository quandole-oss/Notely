/*
 * NOTELY — PRACTICE ROOM PAGE
 * Design: Sunny Studio — Bauhaus playful modernism
 * Interactive piano keyboard + rhythm tap game + free play mode
 * Real-time visual feedback, note names shown, encouraging atmosphere
 * Audio: Web Audio API via useAudio hook — real piano synthesis on every key tap
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useAudio } from "@/hooks/useAudio";

// Keyboard mapping: physical key → note name (A=C, S=D, D=E, F=F, G=G, H=A, J=B)
const KEY_TO_NOTE: Record<string, string> = {
  a: "C", s: "D", d: "E", f: "F", g: "G", h: "A", j: "B",
};

const WHITE_KEYS = [
  { note: "C", label: "DO", color: "#FFB800" },
  { note: "D", label: "RE", color: "#FF5C35" },
  { note: "E", label: "MI", color: "#4AABF5" },
  { note: "F", label: "FA", color: "#3ECFA4" },
  { note: "G", label: "SOL", color: "#9C27B0" },
  { note: "A", label: "LA", color: "#FF5C35" },
  { note: "B", label: "SI", color: "#FFB800" },
  { note: "C2", label: "DO", color: "#FFB800" },
];

const BLACK_KEY_POSITIONS = [0, 1, null, 3, 4, 5, null]; // null = no black key after that white key

const RHYTHM_PATTERNS = [
  { name: "Simple Beat", pattern: [1, 0, 1, 0, 1, 0, 1, 0], bpm: 80 },
  { name: "Rock Beat", pattern: [1, 0, 0, 1, 1, 0, 0, 1], bpm: 100 },
  { name: "Waltz", pattern: [1, 0, 0, 1, 0, 0, 1, 0], bpm: 90 },
];

const SONGS = [
  { name: "Mary Had a Little Lamb", notes: ["E", "D", "C", "D", "E", "E", "E"], emoji: "🐑" },
  { name: "Hot Cross Buns", notes: ["E", "D", "C", "E", "D", "C"], emoji: "🥐" },
  { name: "Twinkle Twinkle", notes: ["C", "C", "G", "G", "A", "A", "G"], emoji: "⭐" },
];

export default function Practice() {
  const [, navigate] = useLocation();
  const { playNote, playDrumTap, playSuccessChime, playCelebration } = useAudio();
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [playedHistory, setPlayedHistory] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"piano" | "rhythm" | "songs">("piano");
  const [selectedSong, setSelectedSong] = useState(0);
  const [songProgress, setSongProgress] = useState(0);
  const [rhythmScore, setRhythmScore] = useState(0);
  const [lastTapFeedback, setLastTapFeedback] = useState<"great" | "good" | "miss" | null>(null);
  const [beatIndex, setBeatIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const beatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [activeKeyboardNote, setActiveKeyboardNote] = useState<string | null>(null);

  const handleKeyPress = useCallback((note: string) => {
    // Play the actual audio note
    playNote(note, 1.2);

    setActiveKey(note);
    setPlayedHistory((prev) => [...prev.slice(-7), note]);
    setTimeout(() => setActiveKey(null), 300);

    // Check if matches current song note
    if (activeTab === "songs") {
      const song = SONGS[selectedSong];
      const expectedNote = song.notes[songProgress];
      const normalizedNote = note === "C2" ? "C" : note;
      if (normalizedNote === expectedNote) {
        setSongProgress((prev) => {
          const next = prev + 1;
          if (next >= song.notes.length) {
            // Song complete!
            setTimeout(() => playCelebration(), 100);
            setTimeout(() => setSongProgress(0), 3000);
            return song.notes.length;
          }
          return next;
        });
      }
    }
  }, [activeTab, selectedSong, songProgress, playNote, playCelebration]);

  const handleRhythmTap = () => {
    const feedbacks: ("great" | "good" | "miss")[] = ["great", "good", "great", "good", "miss"];
    const fb = feedbacks[Math.floor(Math.random() * feedbacks.length)];
    setLastTapFeedback(fb);

    // Play drum sound based on feedback quality
    if (fb === "great") {
      playDrumTap("kick");
      setTimeout(() => playDrumTap("hihat"), 50);
    } else if (fb === "good") {
      playDrumTap("kick");
    } else {
      playDrumTap("snare");
    }

    if (fb !== "miss") setRhythmScore((s) => s + (fb === "great" ? 10 : 5));
    setTimeout(() => setLastTapFeedback(null), 600);
  };

  const toggleMetronome = () => {
    if (isPlaying) {
      if (beatIntervalRef.current) clearInterval(beatIntervalRef.current);
      setIsPlaying(false);
      setBeatIndex(0);
    } else {
      setIsPlaying(true);
      let beat = 0;
      beatIntervalRef.current = setInterval(() => {
        setBeatIndex(beat % 4);
        if (beat % 4 === 0) {
          playDrumTap("kick");
        } else {
          playDrumTap("hihat");
        }
        beat++;
      }, 500); // 120 BPM
    }
  };

  const song = SONGS[selectedSong];
  const songComplete = songProgress >= song.notes.length;

  // ── Keyboard support ─────────────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = KEY_TO_NOTE[e.key.toLowerCase()];
      if (!note) return;
      setActiveKeyboardNote(note);
      handleKeyPress(note);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const note = KEY_TO_NOTE[e.key.toLowerCase()];
      if (note) setActiveKeyboardNote(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyPress]);

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
          🎹 Practice Room
        </h1>
        <div className="w-16" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tab switcher */}
        <div className="flex gap-2 mb-6 p-1 rounded-2xl" style={{ background: "#F0EDE8" }}>
          {(["piano", "rhythm", "songs"] as const).map((tab) => (
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
              {tab === "piano" ? "🎹 Free Play" : tab === "rhythm" ? "🥁 Rhythm" : "🎵 Songs"}
            </button>
          ))}
        </div>

        {/* Piano Tab */}
        {activeTab === "piano" && (
          <div className="animate-slide-up">
            {/* Note history display */}
            <div
              className="rounded-2xl p-4 mb-5 min-h-[3.5rem] flex items-center gap-2 flex-wrap"
              style={{ background: "#1A1A2E" }}
            >
              {playedHistory.length === 0 ? (
                <p className="text-gray-500 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Tap the keys below to play! 🎵
                </p>
              ) : (
                playedHistory.map((note, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 rounded-full text-sm font-display font-700"
                    style={{
                      background: WHITE_KEYS.find((k) => k.note === note)?.color || "#FFB800",
                      color: "white",
                      fontFamily: "'Baloo 2', cursive",
                      opacity: 0.6 + (idx / playedHistory.length) * 0.4,
                    }}
                  >
                    {note.replace("2", "")}
                  </span>
                ))
              )}
            </div>

            {/* Piano keyboard */}
            <div className="card-notely p-6">
              <div className="relative flex justify-center">
                {/* White keys */}
                <div className="flex gap-1">
                  {WHITE_KEYS.map((key) => {
                    const physicalKey = Object.entries(KEY_TO_NOTE).find(([, n]) => n === key.note.replace("2",""))?.[0];
                    const isKbActive = activeKeyboardNote === key.note.replace("2","") || activeKey === key.note;
                    return (
                      <button
                        key={key.note}
                        onMouseDown={() => handleKeyPress(key.note)}
                        onTouchStart={(e) => { e.preventDefault(); handleKeyPress(key.note); }}
                        className="piano-key-white flex flex-col items-center justify-end pb-2 select-none"
                        style={{
                          width: "3.2rem",
                          height: "9rem",
                          background: isKbActive ? key.color : "white",
                          borderColor: isKbActive ? key.color : "#E5DDD0",
                          color: isKbActive ? "white" : "#999",
                          transform: isKbActive ? "translateY(3px)" : "translateY(0)",
                          transition: "all 0.08s ease",
                        }}
                      >
                        <span className="text-xs font-display font-700" style={{ fontFamily: "'Baloo 2', cursive" }}>
                          {key.note.replace("2", "")}
                        </span>
                        <span className="text-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                          {key.label}
                        </span>
                        {physicalKey && key.note !== "C2" && (
                          <span
                            className="text-xs font-mono mt-0.5 px-1 rounded"
                            style={{ background: "#F0EDE8", color: "#999", fontSize: "0.6rem" }}
                          >
                            {physicalKey.toUpperCase()}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-400 mb-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Tap, click, or use your keyboard to play! 🎵
                </p>
                <p className="text-xs text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  ⌨️ Keys: <span className="font-mono">A S D F G H J</span> = DO RE MI FA SOL LA SI
                </p>
              </div>
            </div>

            {/* Encouragement */}
            {playedHistory.length >= 5 && (
              <div
                className="mt-4 rounded-2xl p-4 flex items-center gap-3 animate-pop"
                style={{ background: "#E8F5E9", border: "2px solid #3ECFA4" }}
              >
                <span className="text-2xl">🎉</span>
                <p className="font-display font-700" style={{ color: "#2E7D32", fontFamily: "'Baloo 2', cursive" }}>
                  You're exploring! Keep playing and discover new sounds!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Rhythm Tab */}
        {activeTab === "rhythm" && (
          <div className="animate-slide-up text-center">
            <div className="card-notely p-6 mb-4">
              <h3 className="text-xl font-display font-700 mb-2" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                🥁 Tap the Beat!
              </h3>
              <p className="text-gray-500 mb-4 text-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                Tap the big drum button in time with the beat!
              </p>

              {/* Beat visualizer */}
              <div className="flex justify-center gap-3 mb-4">
                {[0, 1, 2, 3].map((beat) => (
                  <div
                    key={beat}
                    className="w-10 h-10 rounded-full transition-all duration-100"
                    style={{
                      background: isPlaying && beat === beatIndex ? "#FFB800" : "#E5DDD0",
                      transform: isPlaying && beat === beatIndex ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>

              {/* Metronome toggle */}
              <button
                onClick={toggleMetronome}
                className="btn-notely px-6 py-2 text-sm mb-5"
                style={{
                  background: isPlaying ? "#FF5C35" : "#4AABF5",
                  color: "white",
                  fontFamily: "'Baloo 2', cursive",
                }}
              >
                {isPlaying ? "⏹ Stop Beat" : "▶ Start Beat"}
              </button>

              {/* Score */}
              <div className="flex justify-center gap-6 mb-6">
                <div className="text-center">
                  <p className="text-3xl font-display font-800" style={{ color: "#FFB800", fontFamily: "'Baloo 2', cursive" }}>
                    {rhythmScore}
                  </p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>

              {/* Tap button */}
              <button
                onMouseDown={handleRhythmTap}
                onTouchStart={(e) => { e.preventDefault(); handleRhythmTap(); }}
                className="w-36 h-36 rounded-full text-5xl shadow-xl transition-all duration-100 mx-auto flex items-center justify-center select-none"
                style={{
                  background: lastTapFeedback === "great" ? "#3ECFA4" :
                               lastTapFeedback === "good" ? "#FFB800" :
                               lastTapFeedback === "miss" ? "#FF5C35" : "#1A1A2E",
                  transform: lastTapFeedback ? "scale(0.93)" : "scale(1)",
                  boxShadow: "0 8px 0 rgba(0,0,0,0.2)",
                }}
              >
                🥁
              </button>

              {/* Feedback label */}
              {lastTapFeedback && (
                <p
                  className="text-xl font-display font-700 mt-3 animate-pop"
                  style={{
                    color: lastTapFeedback === "great" ? "#3ECFA4" : lastTapFeedback === "good" ? "#FFB800" : "#FF5C35",
                    fontFamily: "'Baloo 2', cursive",
                  }}
                >
                  {lastTapFeedback === "great" ? "🎯 GREAT!" : lastTapFeedback === "good" ? "👍 GOOD!" : "💨 Miss!"}
                </p>
              )}
            </div>

            <p className="text-sm text-gray-400" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              Rhythm is the heartbeat of music! Keep tapping!
            </p>
          </div>
        )}

        {/* Songs Tab */}
        {activeTab === "songs" && (
          <div className="animate-slide-up">
            {/* Song selector */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {SONGS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => { setSelectedSong(idx); setSongProgress(0); }}
                  className="flex-shrink-0 px-4 py-2 rounded-full font-display font-700 text-sm transition-all"
                  style={{
                    background: selectedSong === idx ? "#FFB800" : "white",
                    color: selectedSong === idx ? "#1A1A2E" : "#999",
                    border: `2px solid ${selectedSong === idx ? "#FFB800" : "#E5DDD0"}`,
                    fontFamily: "'Baloo 2', cursive",
                  }}
                >
                  {s.emoji} {s.name}
                </button>
              ))}
            </div>

            {/* Song progress */}
            <div className="card-notely p-5 mb-4">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">{song.emoji}</span>
                <div>
                  <h3 className="font-display font-700 text-lg" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                    {song.name}
                  </h3>
                  <p className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    Play the notes in order!
                  </p>
                </div>
              </div>

              {/* Note sequence */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {song.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded-xl flex items-center justify-center font-display font-700 text-sm transition-all duration-300"
                    style={{
                      background:
                        idx < songProgress ? "#3ECFA4" :
                        idx === songProgress ? "#FFB800" : "#E5DDD0",
                      color:
                        idx < songProgress ? "white" :
                        idx === songProgress ? "#1A1A2E" : "#999",
                      transform: idx === songProgress && !songComplete ? "scale(1.2)" : "scale(1)",
                      fontFamily: "'Baloo 2', cursive",
                    }}
                  >
                    {idx < songProgress ? "✓" : note}
                  </div>
                ))}
              </div>

              {songComplete ? (
                <div className="text-center animate-pop">
                  <p className="text-2xl font-display font-700 mb-1" style={{ color: "#3ECFA4", fontFamily: "'Baloo 2', cursive" }}>
                    🎉 Song Complete!
                  </p>
                  <button
                    onClick={() => setSongProgress(0)}
                    className="btn-notely px-6 py-2 text-sm mt-2"
                    style={{ background: "#FFB800", color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}
                  >
                    Play Again! 🔄
                  </button>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Next note: <strong style={{ color: "#FFB800" }}>{song.notes[songProgress]}</strong> — tap it on the piano below!
                </p>
              )}
            </div>

            {/* Piano for song play */}
            <div className="card-notely p-4">
              <div className="flex justify-center gap-1">
                {WHITE_KEYS.map((key) => {
                  const normalizedNote = key.note === "C2" ? "C" : key.note;
                  const isNextNote = song.notes[songProgress] === normalizedNote && !songComplete;
                  return (
                    <button
                      key={key.note}
                      onMouseDown={() => handleKeyPress(key.note)}
                      onTouchStart={(e) => { e.preventDefault(); handleKeyPress(key.note); }}
                      className="piano-key-white flex flex-col items-center justify-end pb-2 select-none"
                      style={{
                        width: "2.8rem",
                        height: "8rem",
                        background:
                          activeKey === key.note ? key.color :
                          isNextNote ? `${key.color}44` : "white",
                        borderColor: isNextNote ? key.color : "#E5DDD0",
                        color: activeKey === key.note ? "white" : "#999",
                        transform: activeKey === key.note ? "translateY(3px)" : isNextNote ? "translateY(-2px)" : "translateY(0)",
                        transition: "all 0.08s ease",
                        boxShadow: isNextNote ? `0 0 12px ${key.color}88` : undefined,
                      }}
                    >
                      <span className="text-xs font-display font-700" style={{ fontFamily: "'Baloo 2', cursive" }}>
                        {key.note.replace("2", "")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
