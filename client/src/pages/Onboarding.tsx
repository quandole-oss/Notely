/*
 * NOTELY — ONBOARDING PAGE
 * Design: Sunny Studio — Bauhaus playful modernism
 * 3-step flow: Welcome → Name + Avatar → First Song (immediate win)
 * Colors: Sunflower Yellow primary, Coral Red accents, warm cream background
 * Animation: Springy bounce, staggered slide-up entrances
 */

import { useState } from "react";
import { useLocation } from "wouter";
import { useAudio } from "@/hooks/useAudio";

const AVATARS = [
  { id: "cat", emoji: "🐱", label: "Cool Cat" },
  { id: "bear", emoji: "🐻", label: "Music Bear" },
  { id: "fox", emoji: "🦊", label: "Funky Fox" },
  { id: "rabbit", emoji: "🐰", label: "Rhythm Rabbit" },
  { id: "owl", emoji: "🦉", label: "Wise Owl" },
  { id: "panda", emoji: "🐼", label: "Panda Star" },
];

const INSTRUMENTS = [
  { id: "piano", emoji: "🎹", label: "Piano" },
  { id: "guitar", emoji: "🎸", label: "Guitar" },
  { id: "drums", emoji: "🥁", label: "Drums" },
  { id: "violin", emoji: "🎻", label: "Violin" },
  { id: "flute", emoji: "🎵", label: "Flute" },
  { id: "trumpet", emoji: "🎺", label: "Trumpet" },
];

// Simple 3-note melody for the "first win" step
const FIRST_MELODY = [
  { note: "C", label: "DO", color: "#FFB800", key: "C4" },
  { note: "E", label: "MI", color: "#FF5C35", key: "E4" },
  { note: "G", label: "SOL", color: "#4AABF5", key: "G4" },
];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("cat");
  const [selectedInstrument, setSelectedInstrument] = useState("piano");
  const [playedNotes, setPlayedNotes] = useState<string[]>([]);
  const [, navigate] = useLocation();
  const { playNote, playCelebration } = useAudio();

  const handleNotePlay = (note: string) => {
    // Play the actual audio note
    const noteKey = FIRST_MELODY.find((n) => n.note === note)?.key || note;
    playNote(noteKey, 1.0);
    if (!playedNotes.includes(note)) {
      const newPlayed = [...playedNotes, note];
      setPlayedNotes(newPlayed);
      // If all 3 notes played, fire celebration
      if (newPlayed.length === FIRST_MELODY.length) {
        setTimeout(() => playCelebration(), 200);
      }
    }
  };

  const allNotesPlayed = FIRST_MELODY.every((n) => playedNotes.includes(n.note));

  const handleFinish = () => {
    // Store student data in localStorage for demo
    localStorage.setItem(
      "notely_student",
      JSON.stringify({ name, avatar: selectedAvatar, instrument: selectedInstrument })
    );
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[#FEFAF3] overflow-hidden relative">
      {/* Decorative background shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFB800] rounded-full opacity-10 -translate-y-1/2 translate-x-1/3" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#4AABF5] rounded-full opacity-10 translate-y-1/2 -translate-x-1/3" />
      <div className="absolute top-1/3 left-10 w-20 h-20 bg-[#3ECFA4] rounded-full opacity-20" />
      <div className="absolute top-1/4 right-20 w-12 h-12 bg-[#FF5C35] rounded-full opacity-20" />

      {/* Step indicator */}
      <div className="flex justify-center pt-8 gap-3 relative z-10">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="transition-all duration-500"
            style={{
              width: step === i ? "2.5rem" : "0.75rem",
              height: "0.75rem",
              borderRadius: "9999px",
              background: step >= i ? "#FFB800" : "#E5DDD0",
            }}
          />
        ))}
      </div>

      {/* Step 0: Welcome */}
      {step === 0 && (
        <div className="flex flex-col items-center justify-center min-h-[90vh] px-6 text-center animate-slide-up">
          {/* Hero illustration */}
          <div className="relative mb-6">
            <img
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663422386160/FwxdRn7gyJEfzV8667mpvP/hero-banner-amQDE8bUH6nmQbiRwtnXTu.webp"
              alt="Child playing music"
              className="w-80 h-48 object-cover rounded-3xl shadow-xl"
            />
            {/* Floating notes */}
            <span className="absolute -top-4 -right-4 text-3xl animate-bounce-notely">🎵</span>
            <span className="absolute -bottom-2 -left-4 text-2xl animate-float delay-300">🎶</span>
            <span className="absolute top-2 -left-6 text-xl animate-wiggle delay-200">⭐</span>
          </div>

          <h1
            className="text-5xl font-display font-800 mb-3"
            style={{ color: "#1A1A2E", lineHeight: 1.15 }}
          >
            Welcome to{" "}
            <span style={{ color: "#FFB800" }}>Notely!</span>
          </h1>
          <p className="text-xl text-gray-600 mb-2 font-medium max-w-sm" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            The music school made just for you 🎹
          </p>
          <p className="text-base text-gray-500 mb-10 max-w-xs" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Learn to play songs, earn stars, and become a music superstar!
          </p>

          <button
            onClick={() => setStep(1)}
            className="btn-notely text-xl px-12 py-4 shadow-lg"
            style={{ background: "#FFB800", color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}
          >
            Let's Go! 🚀
          </button>

          <p className="mt-6 text-sm text-gray-400">No experience needed — we start from zero!</p>
        </div>
      )}

      {/* Step 1: Name + Avatar + Instrument */}
      {step === 1 && (
        <div className="flex flex-col items-center px-6 pt-8 pb-12 max-w-lg mx-auto animate-slide-up">
          <div className="text-6xl mb-4 animate-bounce-notely">
            {AVATARS.find((a) => a.id === selectedAvatar)?.emoji}
          </div>
          <h2 className="text-3xl font-display font-700 mb-1 text-center" style={{ color: "#1A1A2E" }}>
            What's your name?
          </h2>
          <p className="text-gray-500 mb-6 text-center" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Tell us a bit about yourself!
          </p>

          {/* Name input */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Type your name here..."
            maxLength={20}
            className="w-full text-center text-2xl font-display font-700 py-4 px-6 rounded-2xl border-3 outline-none mb-8 transition-all"
            style={{
              borderWidth: "3px",
              borderColor: name ? "#FFB800" : "#E5DDD0",
              background: "white",
              color: "#1A1A2E",
              fontFamily: "'Baloo 2', cursive",
              boxShadow: name ? "0 4px 0 rgba(255,184,0,0.3)" : "0 4px 0 rgba(0,0,0,0.08)",
            }}
          />

          {/* Avatar picker */}
          <h3 className="text-lg font-display font-700 mb-3 self-start" style={{ color: "#1A1A2E" }}>
            Pick your avatar
          </h3>
          <div className="grid grid-cols-6 gap-2 w-full mb-8">
            {AVATARS.map((avatar) => (
              <button
                key={avatar.id}
                onClick={() => setSelectedAvatar(avatar.id)}
                className="flex flex-col items-center p-2 rounded-2xl transition-all duration-200"
                style={{
                  background: selectedAvatar === avatar.id ? "#FFB800" : "white",
                  border: `3px solid ${selectedAvatar === avatar.id ? "#FFB800" : "#E5DDD0"}`,
                  transform: selectedAvatar === avatar.id ? "scale(1.15)" : "scale(1)",
                  boxShadow: selectedAvatar === avatar.id ? "0 4px 0 rgba(255,184,0,0.4)" : "0 2px 0 rgba(0,0,0,0.08)",
                }}
              >
                <span className="text-2xl">{avatar.emoji}</span>
              </button>
            ))}
          </div>

          {/* Instrument picker */}
          <h3 className="text-lg font-display font-700 mb-3 self-start" style={{ color: "#1A1A2E" }}>
            Which instrument excites you?
          </h3>
          <div className="grid grid-cols-3 gap-3 w-full mb-8">
            {INSTRUMENTS.map((inst) => (
              <button
                key={inst.id}
                onClick={() => setSelectedInstrument(inst.id)}
                className="flex flex-col items-center p-3 rounded-2xl transition-all duration-200"
                style={{
                  background: selectedInstrument === inst.id ? "#FF5C35" : "white",
                  border: `3px solid ${selectedInstrument === inst.id ? "#FF5C35" : "#E5DDD0"}`,
                  color: selectedInstrument === inst.id ? "white" : "#1A1A2E",
                  transform: selectedInstrument === inst.id ? "scale(1.05)" : "scale(1)",
                  boxShadow: selectedInstrument === inst.id ? "0 4px 0 rgba(255,92,53,0.4)" : "0 2px 0 rgba(0,0,0,0.08)",
                }}
              >
                <span className="text-3xl mb-1">{inst.emoji}</span>
                <span className="text-sm font-display font-700">{inst.label}</span>
              </button>
            ))}
          </div>

          <button
            onClick={() => name.trim() && setStep(2)}
            disabled={!name.trim()}
            className="btn-notely text-xl px-12 py-4 w-full shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: "#FFB800", color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}
          >
            That's me! ✨
          </button>
        </div>
      )}

      {/* Step 2: First Song — Immediate Win */}
      {step === 2 && (
        <div className="flex flex-col items-center px-6 pt-8 pb-12 max-w-lg mx-auto animate-slide-up">
          <div className="text-5xl mb-2 animate-bounce-notely">🎹</div>
          <h2 className="text-3xl font-display font-700 mb-1 text-center" style={{ color: "#1A1A2E" }}>
            Play your first song, {name}!
          </h2>
          <p className="text-gray-500 mb-2 text-center text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>
            Tap each colored button in order to play a real melody!
          </p>
          <p className="text-sm text-gray-400 mb-8 text-center">
            DO → MI → SOL — that's a real musical chord! 🎵
          </p>

          {/* Big colorful note buttons */}
          <div className="flex gap-4 mb-8">
            {FIRST_MELODY.map((note, idx) => {
              const played = playedNotes.includes(note.note);
              return (
                <button
                  key={note.note}
                  onClick={() => handleNotePlay(note.note)}
                  className="flex flex-col items-center justify-center rounded-3xl transition-all duration-200 shadow-lg"
                  style={{
                    width: "5.5rem",
                    height: "8rem",
                    background: played ? note.color : "white",
                    border: `4px solid ${note.color}`,
                    color: played ? "white" : note.color,
                    transform: played ? "translateY(4px) scale(0.97)" : "translateY(0) scale(1)",
                    boxShadow: played
                      ? `0 2px 0 ${note.color}88`
                      : `0 6px 0 ${note.color}55`,
                    animationDelay: `${idx * 0.15}s`,
                  }}
                >
                  <span className="text-4xl mb-1">{played ? "✓" : note.note}</span>
                  <span className="text-lg font-display font-700">{note.label}</span>
                </button>
              );
            })}
          </div>

          {/* Progress indicator */}
          <div className="flex gap-2 mb-6">
            {FIRST_MELODY.map((note) => (
              <div
                key={note.note}
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-display font-700 transition-all duration-300"
                style={{
                  background: playedNotes.includes(note.note) ? note.color : "#E5DDD0",
                  color: playedNotes.includes(note.note) ? "white" : "#999",
                  transform: playedNotes.includes(note.note) ? "scale(1.2)" : "scale(1)",
                }}
              >
                {playedNotes.includes(note.note) ? "★" : "○"}
              </div>
            ))}
          </div>

          {/* Success state */}
          {allNotesPlayed && (
            <div className="animate-pop text-center mb-6">
              <div className="text-5xl mb-2">🎉</div>
              <p className="text-2xl font-display font-700" style={{ color: "#3ECFA4" }}>
                Amazing! You played music!
              </p>
              <p className="text-gray-500 mt-1" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                You just played a C major chord. You're already a musician!
              </p>
            </div>
          )}

          {allNotesPlayed ? (
            <button
              onClick={handleFinish}
              className="btn-notely text-xl px-12 py-4 w-full shadow-lg animate-pop"
              style={{ background: "#3ECFA4", color: "white", fontFamily: "'Baloo 2', cursive" }}
            >
              Start My Adventure! 🌟
            </button>
          ) : (
            <p className="text-gray-400 text-sm mt-2">
              Tap all 3 notes to continue →
            </p>
          )}
        </div>
      )}
    </div>
  );
}
