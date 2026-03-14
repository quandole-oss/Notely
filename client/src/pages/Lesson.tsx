/*
 * NOTELY — LESSON PLAYER PAGE
 * Design: Sunny Studio — Bauhaus playful modernism
 * Route-aware: reads /lesson/:id and loads lesson data from data/lessons.ts
 */

import { useState, useEffect, useRef } from "react";
import { useLocation, useRoute } from "wouter";
import { useAudio } from "@/hooks/useAudio";
import { nanoid } from "nanoid";
import { motion } from "framer-motion";
import { LESSONS } from "@/data/lessons";
import type { LessonStep } from "@/data/lessons";

// Keyboard mapping: physical key → note name
const KEY_TO_NOTE: Record<string, string> = {
  a: "C", s: "D", d: "E", f: "F", g: "G", h: "A", j: "B",
};

export default function Lesson() {
  const [, navigate] = useLocation();
  const [matched, params] = useRoute("/lesson/:id");
  const lessonId = params?.id ?? "1";
  const lessonData = LESSONS[lessonId] ?? LESSONS["1"];
  const lessonSteps = lessonData.steps;
  const reflectionPrompts = lessonData.reflections;

  const { playNote, playSuccessChime, playErrorSound, playCelebration, playInstrumentNote } = useAudio();
  const [currentStep, setCurrentStep] = useState(0);
  const [playedNotes, setPlayedNotes] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);
  const [isDemoPlaying, setIsDemoPlaying] = useState(false);
  const [demoNoteIdx, setDemoNoteIdx] = useState<number | null>(null);
  const [activeKeyboardNote, setActiveKeyboardNote] = useState<string | null>(null);
  const demoTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [exploreTaps, setExploreTaps] = useState(0);
  const [reflectionAnswer, setReflectionAnswer] = useState<string | null>(null);
  const [previewedOptions, setPreviewedOptions] = useState<Set<number>>(new Set());
  const [bestMomentSaved, setBestMomentSaved] = useState(false);
  const [favoriteInstrument, setFavoriteInstrument] = useState<string | null>(null);
  const noteCountRef = useRef(0);

  const step = lessonSteps[currentStep];
  const isLastStep = currentStep === lessonSteps.length - 1;
  const hasReflection = step.type === "play" && reflectionPrompts[currentStep] !== undefined;

  // ─── Listen First: play all notes in sequence ───────────────────────────────
  const handleListenDemo = () => {
    if (!step.notes || isDemoPlaying) return;
    setIsDemoPlaying(true);
    setPlayedNotes([]);
    demoTimeoutsRef.current.forEach(clearTimeout);
    demoTimeoutsRef.current = [];
    const GAP = 600;
    step.notes.forEach((note, idx) => {
      const t1 = setTimeout(() => { setDemoNoteIdx(idx); playNote(note.note, 0.7); }, idx * GAP);
      const t2 = setTimeout(() => { setDemoNoteIdx(null); }, idx * GAP + 400);
      demoTimeoutsRef.current.push(t1, t2);
    });
    const tEnd = setTimeout(() => { setIsDemoPlaying(false); setDemoNoteIdx(null); }, step.notes.length * GAP + 400);
    demoTimeoutsRef.current.push(tEnd);
  };

  // ─── Listen step preview — uses previewNotes if defined ────────────────────
  const handleListenPreview = () => {
    const notes = step.previewNotes ?? ["C4", "D4", "E4", "F4", "G4", "A4", "B4"];
    notes.forEach((note, i) => {
      setTimeout(() => playNote(note, 0.6), i * 250);
    });
  };

  // ─── Note tap handler (play steps) ─────────────────────────────────────────
  const handleNotePlay = (idx: number) => {
    if (isDemoPlaying) return;
    noteCountRef.current += 1;
    if (!playedNotes.includes(idx) && step.notes) {
      playNote(step.notes[idx].note, 1.0);
      const newPlayed = [...playedNotes, idx];
      setPlayedNotes(newPlayed);
      if (newPlayed.length === step.notes.length) {
        setTimeout(() => { playSuccessChime(); setShowFeedback(true); setFeedbackCorrect(true); }, 300);
      }
    }
  };

  // ─── Explore tap handler ───────────────────────────────────────────────────
  const handleExploreTap = (noteObj: { note: string }) => {
    noteCountRef.current += 1;
    playNote(noteObj.note, 1.0);
    setExploreTaps((prev) => prev + 1);
  };

  // ─── Instrument tap handler ───────────────────────────────────────────────
  const handleInstrumentTap = (instrumentId: string) => {
    noteCountRef.current += 1;
    playInstrumentNote(instrumentId, "C4", 0.8);
    setExploreTaps((prev) => prev + 1);
  };

  // ─── Keyboard support ────────────────────────────────────────────────────────
  useEffect(() => {
    if (step.type !== "play" && step.type !== "explore") return;
    if (!step.notes) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = KEY_TO_NOTE[e.key.toLowerCase()];
      if (!note) return;
      if (step.type === "explore") {
        const noteObj = step.notes?.find((n) => n.note === note);
        if (noteObj?.dimmed) return; // ignore dimmed keys
        setActiveKeyboardNote(note);
        playNote(note, 1.0);
        noteCountRef.current += 1; setExploreTaps((prev) => prev + 1); return;
      }
      setActiveKeyboardNote(note);
      playNote(note, 1.0);
      if (step.notes) {
        noteCountRef.current += 1;
        const nextIdx = step.notes.findIndex((n, i) => n.note === note && !playedNotes.includes(i));
        if (nextIdx !== -1) {
          const newPlayed = [...playedNotes, nextIdx];
          setPlayedNotes(newPlayed);
          if (newPlayed.length === step.notes.length) {
            setTimeout(() => { playSuccessChime(); setShowFeedback(true); setFeedbackCorrect(true); }, 300);
          }
        }
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { const note = KEY_TO_NOTE[e.key.toLowerCase()]; if (note) setActiveKeyboardNote(null); };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [step, playedNotes, isDemoPlaying, playNote, playSuccessChime, exploreTaps]);

  // ─── Quiz handlers ─────────────────────────────────────────────────────────
  const handleQuizListen = (idx: number) => {
    if (showFeedback) return;
    const option = step.options?.[idx];
    if (!option?.note) return;
    playNote(option.note, 1.0);
    setPreviewedOptions((prev) => new Set(prev).add(idx));
  };

  const handleOptionSelect = (idx: number) => {
    if (showFeedback) return;
    const option = step.options?.[idx];
    if (!option) return;
    if (option.note) playNote(option.note, 0.5);
    setSelectedOption(idx);
    setFeedbackCorrect(option.correct);
    setShowFeedback(true);
    if (option.correct) playSuccessChime();
    else playErrorSound();
  };

  // ─── Reflection handler ────────────────────────────────────────────────────
  const handleReflection = (value: string) => {
    setReflectionAnswer(value);
    const stored = JSON.parse(localStorage.getItem("notely_reflections") || "[]");
    stored.push({ lessonId, stepIndex: currentStep, answer: value, timestamp: new Date().toISOString() });
    localStorage.setItem("notely_reflections", JSON.stringify(stored));
  };

  // ─── Next step ───────────────────────────────────────────────────────────────
  const handleNext = () => {
    demoTimeoutsRef.current.forEach(clearTimeout);
    setIsDemoPlaying(false);
    setDemoNoteIdx(null);
    setShowFeedback(false);
    setSelectedOption(null);
    setPlayedNotes([]);
    setExploreTaps(0);
    setReflectionAnswer(null);
    setPreviewedOptions(new Set());
    setFavoriteInstrument(null);
    if (isLastStep) {
      playCelebration();
      const session = JSON.parse(localStorage.getItem("notely_session") || "{}");
      session.lastSessionSummary = { lessonName: lessonData.name, notesPlayed: noteCountRef.current, dismissed: false };
      localStorage.setItem("notely_session", JSON.stringify(session));
      setLessonComplete(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  // ─── Save to Best Moments ─────────────────────────────────────────────────
  const handleSaveBestMoment = () => {
    const stored = JSON.parse(localStorage.getItem("notely_best_moments") || "[]");
    stored.push({ id: nanoid(), label: `${lessonData.name} Complete!`, emoji: "🎹", savedAt: new Date().toISOString() });
    localStorage.setItem("notely_best_moments", JSON.stringify(stored));
    setBestMomentSaved(true);
  };

  const canProceed =
    step.type === "watch" ||
    step.type === "listen" ||
    (step.type === "explore" && exploreTaps >= (step.minTaps ?? 3) && (!step.pickFavorite || favoriteInstrument !== null)) ||
    (step.type === "play" && step.notes && playedNotes.length === step.notes.length && (!hasReflection || reflectionAnswer !== null)) ||
    (step.type === "quiz" && selectedOption !== null);

  // ─── Lesson complete screen ──────────────────────────────────────────────────
  if (lessonComplete) {
    return (
      <div className="min-h-screen bg-[#FEFAF3] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-8xl mb-4 animate-bounce-notely">🎉</div>
        <h1 className="text-4xl font-display font-800 mb-2" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
          Lesson Complete!
        </h1>
        <p className="text-xl text-gray-600 mb-6" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          You're a music star! You earned 3 stars! ⭐⭐⭐
        </p>
        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="text-5xl animate-pop" style={{ animationDelay: `${s * 0.2}s` }}>⭐</div>
          ))}
        </div>
        <div className="flex flex-col items-center gap-3">
          <div className="flex gap-4">
            <button onClick={() => navigate("/dashboard")} className="btn-notely px-8 py-3 text-base" style={{ background: "#FFB800", color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
              Back to Home 🏠
            </button>
            <button onClick={() => navigate("/practice")} className="btn-notely px-8 py-3 text-base" style={{ background: "#4AABF5", color: "white", fontFamily: "'Baloo 2', cursive" }}>
              Practice More 🎹
            </button>
          </div>
          <button
            onClick={bestMomentSaved ? undefined : handleSaveBestMoment}
            disabled={bestMomentSaved}
            className="btn-notely px-8 py-3 text-base mt-2"
            style={{ background: bestMomentSaved ? "#E5DDD0" : "#FFB800", color: "#1A1A2E", fontFamily: "'Baloo 2', cursive", cursor: bestMomentSaved ? "default" : "pointer" }}
          >
            {bestMomentSaved ? "✓ Saved!" : "⭐ Save This to My Best Moments"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFAF3] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5DDD0]">
        <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {lessonSteps.map((_, idx) => (
            <div key={idx} className="transition-all duration-300" style={{ width: idx === currentStep ? "2rem" : "0.6rem", height: "0.6rem", borderRadius: "9999px", background: idx < currentStep ? "#3ECFA4" : idx === currentStep ? "#FFB800" : "#E5DDD0" }} />
          ))}
        </div>
        <div className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {currentStep + 1} / {lessonSteps.length}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">
        {/* Step type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="badge-notely" style={{
            background: step.type === "watch" ? "#FFB800" : step.type === "listen" ? "#4AABF5" : step.type === "play" ? "#FF5C35" : step.type === "explore" ? "#3ECFA4" : "#3ECFA4",
            color: step.type === "watch" ? "#1A1A2E" : "white",
          }}>
            {step.type === "watch" ? "👀 Watch" : step.type === "listen" ? "👂 Listen" : step.type === "play" ? "🎹 Play" : step.type === "explore" ? (step.instruments ? "🎶 Explore" : "🎹 Explore") : "🧠 Quiz"}
          </span>
        </div>

        <h1 className="text-3xl font-display font-800 mb-2" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>{step.title}</h1>
        <p className="text-gray-600 mb-6 text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>{step.instruction}</p>

        {/* Watch/Listen content */}
        {(step.type === "watch" || step.type === "listen") && (
          <div className="animate-slide-up">
            <div className="rounded-3xl overflow-hidden mb-5 relative cursor-pointer" style={{ height: "200px" }} onClick={step.type === "listen" ? handleListenPreview : undefined}>
              <img src="https://d2xsxph8kpxj0f.cloudfront.net/310519663422386160/FwxdRn7gyJEfzV8667mpvP/lesson-bg-Cen66WZRxYbX8NVgUd7ZgM.webp" alt="Music lesson" className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl transition-transform hover:scale-110" style={{ background: "rgba(255,255,255,0.95)" }}>
                  {step.type === "watch" ? "▶️" : "🔊"}
                </div>
              </div>
              {step.type === "listen" && (
                <div className="absolute bottom-3 left-0 right-0 text-center text-sm font-medium" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'DM Sans', sans-serif" }}>
                  Tap to listen 🎵
                </div>
              )}
            </div>
            <div className="card-notely p-5 mb-4">
              <p className="text-base text-gray-700 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>{step.content}</p>
            </div>
            <div className="rounded-2xl p-4 flex items-start gap-3" style={{ background: "#FFF8E1", border: "2px solid #FFB800" }}>
              <span className="text-2xl">💡</span>
              <p className="text-sm text-gray-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <strong>Fun fact:</strong> The piano has 88 keys! But you only need to learn 7 note names to understand all of them.
              </p>
            </div>
          </div>
        )}

        {/* Instrument explore exercise */}
        {step.type === "explore" && step.instruments && (() => {
          const minReached = exploreTaps >= (step.minTaps ?? 3);
          const showPicker = step.pickFavorite && minReached;
          return (
            <div className="animate-slide-up">
              <div className="flex justify-center gap-4 mb-6 flex-wrap">
                {step.instruments.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => handleInstrumentTap(inst.id)}
                    className="flex flex-col items-center justify-center rounded-3xl transition-all duration-150 shadow-lg select-none active:scale-95 active:translate-y-1"
                    style={{
                      width: "6rem",
                      height: "7.5rem",
                      background: "white",
                      border: `4px solid ${inst.color}`,
                      color: inst.color,
                      boxShadow: `0 6px 0 ${inst.color}55`,
                    }}
                  >
                    <span className="text-4xl mb-1">{inst.emoji}</span>
                    <span className="text-sm font-display font-700" style={{ fontFamily: "'Baloo 2', cursive" }}>{inst.label}</span>
                  </button>
                ))}
              </div>
              {!showPicker && (
                <>
                  <p className="text-center text-base font-display font-700 mb-2" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                    Instruments tapped: {exploreTaps}
                  </p>
                  <p className="text-center text-sm italic mb-3" style={{ color: "#999", fontFamily: "'DM Sans', sans-serif" }}>
                    Every instrument has its own voice — listen and discover!
                  </p>
                </>
              )}
              {showPicker && (
                <motion.div
                  initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  className="rounded-2xl p-4"
                  style={{ background: "#FFF8E1", border: "2px solid #FFB800" }}
                >
                  <p className="font-display font-700 text-base text-center mb-3" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                    Which one is YOUR favorite?
                  </p>
                  <div className="flex justify-center gap-2 flex-wrap">
                    {step.instruments.map((inst) => {
                      const selected = favoriteInstrument === inst.id;
                      return (
                        <button
                          key={inst.id}
                          onClick={() => setFavoriteInstrument(inst.id)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-150 select-none"
                          style={{
                            background: selected ? inst.color : "white",
                            border: `2px solid ${inst.color}`,
                            color: selected ? "white" : "#1A1A2E",
                          }}
                        >
                          <span
                            className="w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs"
                            style={{ borderColor: selected ? "white" : inst.color, background: selected ? "white" : "transparent", color: inst.color }}
                          >
                            {selected && "✓"}
                          </span>
                          <span className="text-lg">{inst.emoji}</span>
                          <span className="text-sm font-display font-700" style={{ fontFamily: "'Baloo 2', cursive" }}>{inst.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </div>
          );
        })()}

        {/* Explore exercise */}
        {step.type === "explore" && !step.instruments && step.notes && (
          <div className="animate-slide-up">
            <div className="flex justify-center gap-3 mb-6 flex-wrap">
              {step.notes.map((note, idx) => {
                const isKeyboardActive = activeKeyboardNote === note.note && !note.dimmed;
                if (note.dimmed) {
                  return (
                    <div key={`${note.note}-${idx}`} className="flex flex-col items-center justify-center rounded-3xl select-none"
                      style={{ width: "4.5rem", height: "7rem", background: "#F0EDE8", border: "4px solid #E5DDD0", color: "#CCC", boxShadow: "0 4px 0 #E5DDD055" }}>
                      <span className="text-3xl mb-1 font-display font-800" style={{ fontFamily: "'Baloo 2', cursive" }}>{note.note}</span>
                    </div>
                  );
                }
                return (
                  <button key={`${note.note}-${idx}`} onClick={() => handleExploreTap(note)} className="flex flex-col items-center justify-center rounded-3xl transition-all duration-150 shadow-lg select-none"
                    style={{ width: "4.5rem", height: "7rem", background: isKeyboardActive ? note.color : "white", border: `4px solid ${note.color}`, color: isKeyboardActive ? "white" : note.color, transform: isKeyboardActive ? "translateY(4px) scale(0.97)" : "translateY(0) scale(1)", boxShadow: isKeyboardActive ? `0 2px 0 ${note.color}88` : `0 6px 0 ${note.color}55` }}>
                    <span className="text-3xl mb-1 font-display font-800" style={{ fontFamily: "'Baloo 2', cursive" }}>{note.note}</span>
                    <span className="text-sm font-display font-700" style={{ fontFamily: "'Baloo 2', cursive" }}>{note.label}</span>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-base font-display font-700 mb-2" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>Notes explored: {exploreTaps}</p>
            <p className="text-center text-sm italic mb-3" style={{ color: "#999", fontFamily: "'DM Sans', sans-serif" }}>There are no wrong notes here — just sounds to discover!</p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "#F0F7FF", border: "2px solid #4AABF5" }}>
              <span className="text-xl">⌨️</span>
              <div>
                <p className="text-xs font-display font-700" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>Keyboard shortcut</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">A</kbd>=C &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">S</kbd>=D &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">D</kbd>=E &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">F</kbd>=F &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">G</kbd>=G &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">H</kbd>=A &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">J</kbd>=B
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Play exercise */}
        {step.type === "play" && step.notes && (
          <div className="animate-slide-up">
            <div className="flex justify-center mb-5">
              <button onClick={handleListenDemo} disabled={isDemoPlaying} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display font-700 text-sm transition-all duration-200 select-none"
                style={{ background: isDemoPlaying ? "#E5DDD0" : "#4AABF5", color: isDemoPlaying ? "#999" : "white", fontFamily: "'Baloo 2', cursive", boxShadow: isDemoPlaying ? "none" : "0 4px 0 rgba(74,171,245,0.4)", transform: isDemoPlaying ? "translateY(2px)" : "translateY(0)" }}>
                <span className="text-lg">{isDemoPlaying ? "🎵" : "👂"}</span>
                {isDemoPlaying ? "Listening…" : "Listen First"}
              </button>
            </div>
            <div className="flex justify-center gap-3 mb-6 flex-wrap">
              {step.notes.map((note, idx) => {
                const played = playedNotes.includes(idx);
                const isDemo = demoNoteIdx === idx;
                const isKeyboardActive = activeKeyboardNote === note.note;
                const isHighlighted = isDemo || isKeyboardActive;
                return (
                  <button key={`${note.note}-${idx}`} onClick={() => handleNotePlay(idx)} disabled={isDemoPlaying}
                    className="flex flex-col items-center justify-center rounded-3xl transition-all duration-150 shadow-lg select-none"
                    style={{ width: "4.5rem", height: "7rem", background: played ? note.color : isHighlighted ? note.color : "white", border: `4px solid ${note.color}`, color: played || isHighlighted ? "white" : note.color, transform: played || isHighlighted ? "translateY(4px) scale(0.97)" : "translateY(0) scale(1)", boxShadow: played ? `0 2px 0 ${note.color}88` : isHighlighted ? `0 2px 0 ${note.color}88` : `0 6px 0 ${note.color}55`, opacity: isDemoPlaying && !isDemo ? 0.5 : 1 }}>
                    <span className="text-3xl mb-1 font-display font-800" style={{ fontFamily: "'Baloo 2', cursive" }}>{played ? "✓" : note.note}</span>
                    <span className="text-sm font-display font-700" style={{ fontFamily: "'Baloo 2', cursive" }}>{note.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="flex justify-center gap-2 mb-3">
              {step.notes.map((_, idx) => (
                <div key={idx} className="transition-all duration-300" style={{ width: playedNotes.includes(idx) ? "1.5rem" : "0.75rem", height: "0.75rem", borderRadius: "9999px", background: playedNotes.includes(idx) ? "#3ECFA4" : "#E5DDD0" }} />
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {isDemoPlaying ? "Listen carefully…" : `${playedNotes.length} / ${step.notes.length} notes played`}
            </p>
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "#F0F7FF", border: "2px solid #4AABF5" }}>
              <span className="text-xl">⌨️</span>
              <div>
                <p className="text-xs font-display font-700" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>Keyboard shortcut</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">A</kbd>=C &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">S</kbd>=D &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">D</kbd>=E &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">F</kbd>=F &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">G</kbd>=G &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">H</kbd>=A &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">J</kbd>=B
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Quiz — Piano layout */}
        {step.type === "quiz" && step.options && step.quizLayout === "piano" && (
          <div className="animate-slide-up">
            {!showFeedback && (
              <div className="flex justify-center gap-2 mb-6">
                {step.options.map((option, idx) => {
                  const isPreviewed = previewedOptions.has(idx);
                  const PIANO_COLORS = ["#FFB800", "#FF5C35", "#4AABF5", "#3ECFA4"];
                  const keyColor = PIANO_COLORS[idx % PIANO_COLORS.length];
                  return (
                    <button key={idx} onClick={() => handleQuizListen(idx)} className="flex flex-col items-center justify-center gap-2 rounded-2xl select-none transition-all duration-150"
                      style={{ width: "5rem", height: "9rem", background: isPreviewed ? keyColor : "white", border: `3px solid ${keyColor}`, color: isPreviewed ? "white" : keyColor, boxShadow: isPreviewed ? `0 2px 0 ${keyColor}88` : `0 6px 0 ${keyColor}55`, transform: isPreviewed ? "translateY(3px)" : "translateY(0)" }}>
                      <span className="text-3xl">{isPreviewed ? "🔊" : "🔈"}</span>
                      <span className="font-display font-700 text-base" style={{ fontFamily: "'Baloo 2', cursive" }}>{option.label}</span>
                      <span className="text-xs" style={{ opacity: 0.8, fontFamily: "'DM Sans', sans-serif" }}>{isPreviewed ? "Again" : "Listen"}</span>
                    </button>
                  );
                })}
              </div>
            )}
            {!showFeedback && (
              <p className="text-center text-xs text-gray-400 mb-4" style={{ fontFamily: "'DM Sans', sans-serif" }}>← Lower &nbsp;&nbsp;&nbsp; Higher →</p>
            )}
            {!showFeedback && previewedOptions.size > 0 && (
              <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
                <p className="text-center font-display font-700 text-sm mb-3" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                  Pick your answer:
                </p>
                <div className="flex gap-2 justify-center flex-wrap">
                  {step.options.map((option, idx) => {
                    const PIANO_COLORS = ["#FFB800", "#FF5C35", "#4AABF5", "#3ECFA4"];
                    const keyColor = PIANO_COLORS[idx % PIANO_COLORS.length];
                    return (
                      <button key={idx} onClick={() => handleOptionSelect(idx)} className="px-5 py-3 rounded-2xl font-display font-700 text-sm transition-all duration-150 select-none"
                        style={{ background: "white", border: `3px solid ${keyColor}`, color: "#1A1A2E", fontFamily: "'Baloo 2', cursive", boxShadow: `0 4px 0 ${keyColor}66` }}>
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
            {showFeedback && (
              <div className="flex justify-center gap-2">
                {step.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrect = option.correct;
                  let bg = "#E5DDD0"; let border = "#E5DDD0";
                  if (isSelected && isCorrect) { bg = "#3ECFA4"; border = "#3ECFA4"; }
                  else if (isSelected && !isCorrect) { bg = "#FF5C35"; border = "#FF5C35"; }
                  else if (isCorrect) { bg = "#3ECFA4"; border = "#3ECFA4"; }
                  return (
                    <div key={idx} className="flex flex-col items-center justify-center gap-2 rounded-2xl" style={{ width: "5rem", height: "9rem", background: bg, border: `3px solid ${border}`, color: isSelected || isCorrect ? "white" : "#999" }}>
                      <span className="text-2xl">{isCorrect ? "✓" : isSelected ? "✗" : ""}</span>
                      <span className="font-display font-700 text-base" style={{ fontFamily: "'Baloo 2', cursive" }}>{option.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Quiz — Grid layout */}
        {step.type === "quiz" && step.options && step.quizLayout !== "piano" && (
          <div className="animate-slide-up grid grid-cols-2 gap-3">
            {step.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = option.correct;
              let bg = "white"; let border = "#E5DDD0";
              if (isSelected && isCorrect) { bg = "#3ECFA4"; border = "#3ECFA4"; }
              else if (isSelected && !isCorrect) { bg = "#FF5C35"; border = "#FF5C35"; }
              else if (showFeedback && isCorrect) { bg = "#3ECFA4"; border = "#3ECFA4"; }
              return (
                <button key={idx} onClick={() => handleOptionSelect(idx)} disabled={showFeedback} className="card-notely p-4 flex flex-col items-center gap-2 text-center select-none"
                  style={{ background: bg, border: `3px solid ${border}`, color: isSelected || (showFeedback && isCorrect) ? "white" : "#1A1A2E" }}>
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="font-display font-700 text-base" style={{ fontFamily: "'Baloo 2', cursive" }}>{option.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback */}
        {showFeedback && (
          <div className="mt-5 rounded-2xl p-4 flex items-center gap-3 animate-pop" style={{ background: feedbackCorrect ? "#E8F5E9" : "#FFF3E0", border: `2px solid ${feedbackCorrect ? "#3ECFA4" : "#FF5C35"}` }}>
            <span className="text-3xl">{feedbackCorrect ? "🎉" : "🔍"}</span>
            <div>
              <p className="font-display font-700" style={{ color: feedbackCorrect ? "#2E7D32" : "#E65100", fontFamily: "'Baloo 2', cursive" }}>
                {feedbackCorrect ? "Amazing! That's correct!" : "Interesting choice!"}
              </p>
              <p className="text-sm text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {feedbackCorrect
                  ? (selectedOption !== null && step.options?.[selectedOption]?.discoveryText) ? step.options[selectedOption].discoveryText : "You're doing great — keep it up!"
                  : (selectedOption !== null && step.options?.[selectedOption]?.discoveryText) ? step.options[selectedOption].discoveryText : "You'll get it next time! Keep practicing!"}
              </p>
              {!feedbackCorrect && selectedOption !== null && step.options?.[selectedOption]?.discoveryText && (
                <p className="text-sm text-gray-500 mt-1 italic" style={{ fontFamily: "'DM Sans', sans-serif" }}>Every note has its own personality — you're discovering them!</p>
              )}
            </div>
          </div>
        )}

        {/* Reflection prompt */}
        {step.type === "play" && showFeedback && feedbackCorrect && hasReflection && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3 }} className="mt-4 rounded-2xl p-4" style={{ background: "#FFF8E1", border: "2px solid #FFB800" }}>
            <p className="font-display font-700 text-base mb-3" style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "0.95rem", color: "#1A1A2E" }}>
              {reflectionPrompts[currentStep].prompt}
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              {[reflectionPrompts[currentStep].optionA, reflectionPrompts[currentStep].optionB].map((opt) => (
                <button key={opt.value} onClick={() => handleReflection(opt.value)} className="flex-1 py-3 px-4 rounded-xl font-display font-700 text-sm transition-all duration-200"
                  style={{ background: reflectionAnswer === opt.value ? "#FFB800" : "white", color: reflectionAnswer === opt.value ? "white" : "#1A1A2E", border: "2px solid #FFB800", fontFamily: "'Baloo 2', cursive" }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Continue button */}
        <div className="mt-auto pt-6">
          <button onClick={canProceed ? handleNext : undefined} disabled={!canProceed}
            className="btn-notely w-full py-4 text-lg shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: canProceed ? "#FFB800" : "#E5DDD0", color: canProceed ? "#1A1A2E" : "#999", fontFamily: "'Baloo 2', cursive" }}>
            {isLastStep ? "Finish Lesson! 🎉" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
