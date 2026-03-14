/*
 * NOTELY — LESSON PLAYER PAGE
 * Design: Sunny Studio — Bauhaus playful modernism
 * Route-aware: reads /lesson/:id and loads lesson data from data/lessons.ts
 */

import { useState, useEffect, useRef, useCallback } from "react";
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

  const { playNote, playSuccessChime, playErrorSound, playCelebration, playInstrumentNote, playDrumTap } = useAudio();
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

  // ─── Sequence play state ─────────────────────────────────────────────────────
  const [sequencePosition, setSequencePosition] = useState(0);
  const [sequenceErrorNote, setSequenceErrorNote] = useState<string | null>(null);

  // ─── Rhythm state ──────────────────────────────────────────────────────────
  const [rhythmRound, setRhythmRound] = useState(0);
  const [rhythmUserInput, setRhythmUserInput] = useState<string[]>([]);
  const [rhythmDemoPlaying, setRhythmDemoPlaying] = useState(false);
  const [rhythmDemoBeatIdx, setRhythmDemoBeatIdx] = useState<number | null>(null);
  const [rhythmRoundComplete, setRhythmRoundComplete] = useState(false);
  const [rhythmAllRoundsComplete, setRhythmAllRoundsComplete] = useState(false);
  const [rhythmQuizQuestion, setRhythmQuizQuestion] = useState(0);
  const [activeDrumPad, setActiveDrumPad] = useState<string | null>(null);
  const [beatPulse, setBeatPulse] = useState(false);
  const [rhythmHasPlayedDemo, setRhythmHasPlayedDemo] = useState(false);
  const [rhythmQuizHasPlayed, setRhythmQuizHasPlayed] = useState(false);
  const rhythmDemoTimeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const beatLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = lessonSteps[currentStep];
  const isLastStep = currentStep === lessonSteps.length - 1;
  const hasReflection = (step.type === "play" || step.type === "explore") && reflectionPrompts[currentStep] !== undefined;

  // ─── Listen First: play all notes in sequence ───────────────────────────────
  const handleListenDemo = () => {
    if (!step.notes || isDemoPlaying) return;
    setIsDemoPlaying(true);
    setPlayedNotes([]);
    demoTimeoutsRef.current.forEach(clearTimeout);
    demoTimeoutsRef.current = [];
    const GAP = 600;
    if (step.sequence) {
      // Sequence mode: play through the sequence, highlighting corresponding keys
      step.sequence.forEach((noteName, idx) => {
        const noteIdx = step.notes!.findIndex(n => n.note === noteName);
        const t1 = setTimeout(() => { setDemoNoteIdx(noteIdx); playNote(noteName, 0.7); }, idx * GAP);
        const t2 = setTimeout(() => { setDemoNoteIdx(null); }, idx * GAP + 400);
        demoTimeoutsRef.current.push(t1, t2);
      });
      const tEnd = setTimeout(() => { setIsDemoPlaying(false); setDemoNoteIdx(null); }, step.sequence.length * GAP + 400);
      demoTimeoutsRef.current.push(tEnd);
    } else {
      step.notes.forEach((note, idx) => {
        const t1 = setTimeout(() => { setDemoNoteIdx(idx); playNote(note.note, 0.7); }, idx * GAP);
        const t2 = setTimeout(() => { setDemoNoteIdx(null); }, idx * GAP + 400);
        demoTimeoutsRef.current.push(t1, t2);
      });
      const tEnd = setTimeout(() => { setIsDemoPlaying(false); setDemoNoteIdx(null); }, step.notes.length * GAP + 400);
      demoTimeoutsRef.current.push(tEnd);
    }
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

  // ─── Sequence play handler (guided melody) ─────────────────────────────────
  const handleSequenceNotePlay = (noteName: string) => {
    if (isDemoPlaying || !step.sequence) return;
    if (sequencePosition >= step.sequence.length) return;
    noteCountRef.current += 1;
    playNote(noteName, 1.0);
    const expected = step.sequence[sequencePosition];
    if (noteName === expected) {
      const newPos = sequencePosition + 1;
      setSequencePosition(newPos);
      setSequenceErrorNote(null);
      if (newPos === step.sequence.length) {
        setTimeout(() => { playSuccessChime(); setShowFeedback(true); setFeedbackCorrect(true); }, 300);
      }
    } else {
      playErrorSound();
      setSequenceErrorNote(expected);
      setTimeout(() => setSequenceErrorNote(null), 1500);
    }
  };

  // ─── Instrument tap handler ───────────────────────────────────────────────
  const handleInstrumentTap = (instrumentId: string) => {
    noteCountRef.current += 1;
    playInstrumentNote(instrumentId, "C4", 0.8);
    setExploreTaps((prev) => prev + 1);
  };

  // ─── Drum pad tap handler ─────────────────────────────────────────────────
  const handleDrumPadTap = useCallback((pad: { id: string; sound: "kick" | "hihat" | "snare" }) => {
    noteCountRef.current += 1;
    playDrumTap(pad.sound);
    setExploreTaps((prev) => prev + 1);
    setActiveDrumPad(pad.id);
    setTimeout(() => setActiveDrumPad(null), 150);
  }, [playDrumTap]);

  // ─── Rhythm demo: play current round's pattern ────────────────────────────
  const handleRhythmDemo = () => {
    if (!step.rhythmPatterns || rhythmDemoPlaying) return;
    setRhythmHasPlayedDemo(true);
    const pattern = step.rhythmPatterns[rhythmRound];
    if (!pattern) return;
    setRhythmDemoPlaying(true);
    rhythmDemoTimeoutsRef.current.forEach(clearTimeout);
    rhythmDemoTimeoutsRef.current = [];
    const ms = 60000 / pattern.bpm;
    pattern.sequence.forEach((sound, idx) => {
      const t1 = setTimeout(() => { setRhythmDemoBeatIdx(idx); playDrumTap(sound); }, idx * ms);
      const t2 = setTimeout(() => { setRhythmDemoBeatIdx(null); }, idx * ms + ms * 0.6);
      rhythmDemoTimeoutsRef.current.push(t1, t2);
    });
    const tEnd = setTimeout(() => { setRhythmDemoPlaying(false); setRhythmDemoBeatIdx(null); }, pattern.sequence.length * ms + 200);
    rhythmDemoTimeoutsRef.current.push(tEnd);
  };

  // ─── Rhythm input: check user's tap against pattern ───────────────────────
  const handleRhythmInput = useCallback((sound: "kick" | "hihat" | "snare") => {
    if (!step.rhythmPatterns || rhythmRoundComplete || rhythmDemoPlaying) return;
    const pattern = step.rhythmPatterns[rhythmRound];
    if (!pattern) return;
    const nextIdx = rhythmUserInput.length;
    const expected = pattern.sequence[nextIdx];
    playDrumTap(sound);
    noteCountRef.current += 1;
    if (sound === expected) {
      const newInput = [...rhythmUserInput, sound];
      setRhythmUserInput(newInput);
      if (newInput.length === pattern.sequence.length) {
        // Round complete
        playSuccessChime();
        setRhythmRoundComplete(true);
        if (rhythmRound >= step.rhythmPatterns.length - 1) {
          setRhythmAllRoundsComplete(true);
        }
      }
    } else {
      playErrorSound();
      setRhythmUserInput([]);
    }
  }, [step.rhythmPatterns, rhythmRound, rhythmUserInput, rhythmRoundComplete, rhythmDemoPlaying, playDrumTap, playSuccessChime, playErrorSound]);

  // ─── Rhythm: advance to next round ────────────────────────────────────────
  const handleRhythmNextRound = () => {
    setRhythmRound((r) => r + 1);
    setRhythmUserInput([]);
    setRhythmRoundComplete(false);
    setRhythmHasPlayedDemo(false);
  };

  // ─── Rhythm quiz: play the correct pattern for current question ───────────
  const handleRhythmQuizListen = () => {
    if (!step.rhythmQuizOptions) return;
    setRhythmQuizHasPlayed(true);
    const qStart = rhythmQuizQuestion * 2;
    const correctOpt = step.rhythmQuizOptions.slice(qStart, qStart + 2).find((o) => o.correct);
    if (!correctOpt) return;
    const GAP = 400;
    correctOpt.pattern.forEach((beat, i) => {
      setTimeout(() => {
        playDrumTap(beat === "long" ? "kick" : "hihat");
      }, i * GAP);
    });
  };

  // ─── Rhythm quiz: select answer ───────────────────────────────────────────
  const handleRhythmQuizSelect = (localIdx: number) => {
    if (showFeedback) return;
    if (!step.rhythmQuizOptions) return;
    const qStart = rhythmQuizQuestion * 2;
    const option = step.rhythmQuizOptions[qStart + localIdx];
    if (!option) return;
    setSelectedOption(localIdx);
    setFeedbackCorrect(option.correct);
    setShowFeedback(true);
    if (option.correct) playSuccessChime();
    else playErrorSound();
  };

  // ─── Keyboard support ────────────────────────────────────────────────────────
  useEffect(() => {
    // Drum pad keyboard support
    if (step.drumPads && !step.notes && !step.rhythmPatterns) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        const key = e.key.toLowerCase();
        if (key === "q" || key === " ") {
          e.preventDefault();
          handleDrumPadTap(step.drumPads![0]);
        } else if (key === "w" || key === "enter") {
          e.preventDefault();
          if (step.drumPads![1]) handleDrumPadTap(step.drumPads![1]);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
    // Rhythm pattern keyboard support
    if (step.drumPads && step.rhythmPatterns) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        const key = e.key.toLowerCase();
        if (key === "q" || key === " ") {
          e.preventDefault();
          handleRhythmInput("kick");
          setActiveDrumPad("boom");
          setTimeout(() => setActiveDrumPad(null), 150);
        } else if (key === "w" || key === "enter") {
          e.preventDefault();
          handleRhythmInput("hihat");
          setActiveDrumPad("tick");
          setTimeout(() => setActiveDrumPad(null), 150);
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
    // Tap anywhere keyboard support
    if (step.tapAnywhere) {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.repeat) return;
        e.preventDefault();
        playDrumTap("kick");
        noteCountRef.current += 1;
        setExploreTaps((prev) => prev + 1);
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
    // Piano keyboard support
    if (step.type !== "play" && step.type !== "explore") return;
    if (!step.notes) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const note = KEY_TO_NOTE[e.key.toLowerCase()];
      if (!note) return;
      // Only allow notes that exist in step.notes
      if (!step.notes?.some((n) => n.note === note)) return;
      if (step.type === "explore") {
        const noteObj = step.notes?.find((n) => n.note === note);
        if (noteObj?.dimmed) return;
        setActiveKeyboardNote(note);
        playNote(note, 1.0);
        noteCountRef.current += 1; setExploreTaps((prev) => prev + 1); return;
      }
      setActiveKeyboardNote(note);
      // Sequence play: delegate to sequence handler
      if (step.sequence) {
        handleSequenceNotePlay(note);
        return;
      }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, playedNotes, isDemoPlaying, playNote, playSuccessChime, exploreTaps, handleDrumPadTap, handleRhythmInput, playDrumTap, sequencePosition]);

  // ─── Background beat loop ────────────────────────────────────────────────────
  useEffect(() => {
    if (beatLoopRef.current) clearInterval(beatLoopRef.current);

    if (step.backgroundBeat) {
      const ms = 60000 / step.backgroundBeat.bpm;
      beatLoopRef.current = setInterval(() => {
        playDrumTap("kick");
        setBeatPulse(true);
        setTimeout(() => setBeatPulse(false), 150);
      }, ms);
    }

    return () => { if (beatLoopRef.current) clearInterval(beatLoopRef.current); };
  }, [currentStep, step.backgroundBeat, playDrumTap]);

  // ─── Auto-play rhythm demo on entering pattern step / new round ───────────
  useEffect(() => {
    if (step.rhythmPatterns && !rhythmRoundComplete && !rhythmDemoPlaying) {
      const t = setTimeout(() => handleRhythmDemo(), 500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, rhythmRound]);

  // ─── Auto-play rhythm quiz on entering quiz step / advancing question ─────
  useEffect(() => {
    if (step.rhythmQuizOptions) {
      const t = setTimeout(() => handleRhythmQuizListen(), 500);
      return () => clearTimeout(t);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep, rhythmQuizQuestion]);

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
    // Multi-question rhythm quiz: advance to Q1 instead of next step
    if (step.rhythmQuizOptions && rhythmQuizQuestion === 0 && showFeedback) {
      setRhythmQuizQuestion(1);
      setShowFeedback(false);
      setSelectedOption(null);
      setFeedbackCorrect(false);
      setRhythmQuizHasPlayed(false);
      return;
    }

    demoTimeoutsRef.current.forEach(clearTimeout);
    rhythmDemoTimeoutsRef.current.forEach(clearTimeout);
    if (beatLoopRef.current) clearInterval(beatLoopRef.current);
    beatLoopRef.current = null;
    setIsDemoPlaying(false);
    setDemoNoteIdx(null);
    setShowFeedback(false);
    setSelectedOption(null);
    setPlayedNotes([]);
    setExploreTaps(0);
    setReflectionAnswer(null);
    setPreviewedOptions(new Set());
    setFavoriteInstrument(null);
    // Reset sequence state
    setSequencePosition(0);
    setSequenceErrorNote(null);
    // Reset rhythm state
    setRhythmRound(0);
    setRhythmUserInput([]);
    setRhythmDemoPlaying(false);
    setRhythmDemoBeatIdx(null);
    setRhythmRoundComplete(false);
    setRhythmAllRoundsComplete(false);
    setRhythmQuizQuestion(0);
    setActiveDrumPad(null);
    setBeatPulse(false);
    setRhythmHasPlayedDemo(false);
    setRhythmQuizHasPlayed(false);
    if (isLastStep) {
      playCelebration();
      const session = JSON.parse(localStorage.getItem("notely_session") || "{}");
      session.lastSessionSummary = { lessonName: lessonData.name, notesPlayed: noteCountRef.current, dismissed: false };
      localStorage.setItem("notely_session", JSON.stringify(session));
      // Persist lesson completion
      const progress: Record<string, { completed: boolean; stars: number }> = JSON.parse(localStorage.getItem("notely_progress") || "{}");
      progress[lessonId] = { completed: true, stars: 3 };
      localStorage.setItem("notely_progress", JSON.stringify(progress));
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
    (step.type === "explore" && exploreTaps >= (step.minTaps ?? 3) &&
      (!step.pickFavorite || favoriteInstrument !== null) &&
      (!hasReflection || reflectionAnswer !== null)) ||
    (step.type === "play" && step.rhythmPatterns && rhythmAllRoundsComplete) ||
    (step.type === "play" && step.sequence && sequencePosition === step.sequence.length &&
      (!hasReflection || reflectionAnswer !== null)) ||
    (step.type === "play" && !step.rhythmPatterns && !step.sequence && step.notes &&
      playedNotes.length === step.notes.length &&
      (!hasReflection || reflectionAnswer !== null)) ||
    (step.type === "quiz" && step.rhythmQuizOptions && showFeedback) ||
    (step.type === "quiz" && !step.rhythmQuizOptions && selectedOption !== null);

  // ─── Drum pad rendering helper ────────────────────────────────────────────
  const renderDrumPads = (onTap: (pad: NonNullable<LessonStep["drumPads"]>[number]) => void) => {
    if (!step.drumPads) return null;
    return (
      <div className="flex justify-center gap-6 mb-6">
        {step.drumPads.map((pad) => {
          const isActive = activeDrumPad === pad.id;
          return (
            <button
              key={pad.id}
              onClick={() => onTap(pad)}
              className="flex flex-col items-center justify-center rounded-3xl transition-all duration-150 shadow-lg select-none"
              style={{
                width: "7rem",
                height: "8.5rem",
                background: isActive ? pad.color : "white",
                border: `4px solid ${pad.color}`,
                color: isActive ? "white" : pad.color,
                transform: isActive ? "translateY(4px) scale(0.95)" : "translateY(0) scale(1)",
                boxShadow: isActive ? `0 2px 0 ${pad.color}88` : `0 6px 0 ${pad.color}55`,
              }}
            >
              <span className="text-4xl mb-1">{pad.emoji}</span>
              <span className="text-base font-display font-700" style={{ fontFamily: "'Baloo 2', cursive" }}>{pad.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // ─── Drum pad keyboard hint ───────────────────────────────────────────────
  const renderDrumKeyboardHint = () => (
    <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "#F0F7FF", border: "2px solid #4AABF5" }}>
      <span className="text-xl">⌨️</span>
      <div>
        <p className="text-xs font-display font-700" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>Keyboard shortcut</p>
        <p className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">Q</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">Space</kbd> = Boom &nbsp;
          <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">W</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">Enter</kbd> = Tick
        </p>
      </div>
    </div>
  );

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

  // ─── Badge text ───────────────────────────────────────────────────────────────
  const getBadgeText = () => {
    if (step.type === "watch") return "👀 Watch";
    if (step.type === "listen") return step.drumPads ? "🥁 Listen" : "👂 Listen";
    if (step.type === "play") return step.rhythmPatterns ? "🥁 Play" : "🎹 Play";
    if (step.type === "explore") {
      if (step.tapAnywhere || step.drumPads) return "🥁 Explore";
      if (step.instruments) return "🎶 Explore";
      return "🎹 Explore";
    }
    if (step.type === "quiz") return step.rhythmQuizOptions ? "🥁 Quiz" : "🧠 Quiz";
    return "🧠 Quiz";
  };

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
            {getBadgeText()}
          </span>
        </div>

        <h1 className="text-3xl font-display font-800 mb-2" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>{step.title}</h1>
        <p className="text-gray-600 mb-6 text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>{step.instruction}</p>

        {/* ─── Watch / Listen with drum pads ─────────────────────────────────── */}
        {step.type === "listen" && step.drumPads && (
          <div className="animate-slide-up">
            {renderDrumPads(handleDrumPadTap)}
            <div className="card-notely p-5 mb-4">
              <p className="text-base text-gray-700 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>{step.content}</p>
            </div>
            {renderDrumKeyboardHint()}
          </div>
        )}

        {/* Watch/Listen content (non-drum) */}
        {(step.type === "watch" || (step.type === "listen" && !step.drumPads)) && (
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

        {/* ─── Explore: tap anywhere (pulsing circle + background beat) ────── */}
        {step.type === "explore" && step.tapAnywhere && (
          <div className="animate-slide-up">
            <div
              className="flex flex-col items-center justify-center rounded-3xl mb-6 select-none"
              style={{ minHeight: "16rem", cursor: "pointer" }}
              onClick={() => {
                playDrumTap("kick");
                noteCountRef.current += 1;
                setExploreTaps((prev) => prev + 1);
              }}
            >
              {step.pulsingCircle && (
                <div
                  className="w-40 h-40 rounded-full flex items-center justify-center mb-4 transition-transform duration-150"
                  style={{
                    background: "linear-gradient(135deg, #3ECFA4, #4AABF5)",
                    transform: beatPulse ? "scale(1.15)" : "scale(1)",
                    animation: "notely-beat-pulse 0.6s ease-out",
                    boxShadow: beatPulse ? "0 0 40px rgba(62,207,164,0.5)" : "0 8px 24px rgba(62,207,164,0.3)",
                  }}
                >
                  <span className="text-5xl">💓</span>
                </div>
              )}
              <p className="text-lg font-display font-700 text-center" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                Tap anywhere!
              </p>
            </div>
            <p className="text-center text-base font-display font-700 mb-2" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
              Taps: {exploreTaps}
            </p>
            <p className="text-center text-sm italic mb-3" style={{ color: "#999", fontFamily: "'DM Sans', sans-serif" }}>
              Feel the rhythm — tap along with the beat!
            </p>
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

        {/* ─── Explore with drum pads ─────────────────────────────────────── */}
        {step.type === "explore" && step.drumPads && !step.tapAnywhere && (
          <div className="animate-slide-up">
            {/* Beat indicator for background beat */}
            {step.backgroundBeat && (
              <div className="flex justify-center gap-3 mb-4">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-4 h-4 rounded-full transition-all duration-150"
                    style={{
                      background: beatPulse && i === 0 ? "#3ECFA4" : "#E5DDD0",
                      transform: beatPulse && i === 0 ? "scale(1.3)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            )}
            {renderDrumPads(handleDrumPadTap)}
            <p className="text-center text-base font-display font-700 mb-2" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
              Beats tapped: {exploreTaps}
            </p>
            <p className="text-center text-sm italic mb-3" style={{ color: "#999", fontFamily: "'DM Sans', sans-serif" }}>
              There's no wrong rhythm — just sounds to discover!
            </p>
            {renderDrumKeyboardHint()}
          </div>
        )}

        {/* Explore exercise (piano notes) */}
        {step.type === "explore" && !step.instruments && !step.drumPads && !step.tapAnywhere && step.notes && (
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

        {/* ─── Play: rhythm pattern matching ─────────────────────────────── */}
        {step.type === "play" && step.rhythmPatterns && step.drumPads && (() => {
          const totalRounds = step.rhythmPatterns.length;
          const currentPattern = step.rhythmPatterns[rhythmRound];
          return (
            <div className="animate-slide-up">
              {/* Round indicator */}
              <div className="flex justify-center items-center gap-2 mb-4">
                <span className="text-sm font-display font-700" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                  Round {rhythmRound + 1} of {totalRounds}
                </span>
                <div className="flex gap-1">
                  {step.rhythmPatterns.map((_, i) => (
                    <div key={i} className="w-3 h-3 rounded-full" style={{ background: i < rhythmRound ? "#3ECFA4" : i === rhythmRound ? "#FFB800" : "#E5DDD0" }} />
                  ))}
                </div>
              </div>

              {/* Listen First button */}
              <div className="flex justify-center mb-5">
                <button onClick={handleRhythmDemo} disabled={rhythmDemoPlaying || rhythmRoundComplete}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display font-700 text-sm transition-all duration-200 select-none"
                  style={{
                    background: rhythmDemoPlaying ? "#E5DDD0" : "#4AABF5",
                    color: rhythmDemoPlaying ? "#999" : "white",
                    fontFamily: "'Baloo 2', cursive",
                    boxShadow: rhythmDemoPlaying ? "none" : "0 4px 0 rgba(74,171,245,0.4)",
                    transform: rhythmDemoPlaying ? "translateY(2px)" : "translateY(0)",
                  }}>
                  <span className="text-lg">{rhythmDemoPlaying ? "🎵" : "👂"}</span>
                  {rhythmDemoPlaying ? "Listening..." : rhythmHasPlayedDemo ? "Listen Again" : "Listen First"}
                </button>
              </div>

              {/* Visual beat sequence */}
              {currentPattern && (
                <div className="flex justify-center gap-2 mb-5">
                  {currentPattern.sequence.map((sound, i) => {
                    const isMatched = i < rhythmUserInput.length;
                    const isDemoing = rhythmDemoBeatIdx === i;
                    const isKick = sound === "kick";
                    return (
                      <div
                        key={i}
                        className="rounded-xl flex items-center justify-center transition-all duration-150"
                        style={{
                          width: isKick ? "3rem" : "2rem",
                          height: "3rem",
                          background: isMatched ? (isKick ? "#3ECFA4" : "#4AABF5") : isDemoing ? (isKick ? "#3ECFA4" : "#4AABF5") : "#F0EDE8",
                          border: `3px solid ${isMatched ? (isKick ? "#3ECFA4" : "#4AABF5") : isDemoing ? (isKick ? "#3ECFA4" : "#4AABF5") : "#E5DDD0"}`,
                          transform: isDemoing ? "scale(1.15)" : "scale(1)",
                          opacity: isMatched ? 1 : isDemoing ? 1 : 0.6,
                        }}
                      >
                        {isMatched && <span className="text-white text-sm font-bold">✓</span>}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Drum pads for input */}
              {!rhythmRoundComplete && (
                <>
                  {renderDrumPads((pad) => handleRhythmInput(pad.sound))}
                  <p className="text-center text-sm text-gray-500 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                    {rhythmDemoPlaying ? "Listen carefully..." : `${rhythmUserInput.length} / ${currentPattern?.sequence.length ?? 0} beats matched`}
                  </p>
                </>
              )}

              {/* Round complete */}
              {rhythmRoundComplete && !rhythmAllRoundsComplete && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-4">
                  <p className="text-2xl mb-2">🎉</p>
                  <p className="font-display font-700 text-base mb-3" style={{ color: "#2E7D32", fontFamily: "'Baloo 2', cursive" }}>
                    Round {rhythmRound + 1} complete!
                  </p>
                  <button onClick={handleRhythmNextRound}
                    className="px-6 py-2.5 rounded-2xl font-display font-700 text-sm select-none"
                    style={{ background: "#4AABF5", color: "white", fontFamily: "'Baloo 2', cursive", boxShadow: "0 4px 0 rgba(74,171,245,0.4)" }}>
                    Next Round →
                  </button>
                </motion.div>
              )}

              {rhythmAllRoundsComplete && (
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center mb-4">
                  <p className="text-3xl mb-2">🎉🥁🎉</p>
                  <p className="font-display font-700 text-lg" style={{ color: "#2E7D32", fontFamily: "'Baloo 2', cursive" }}>
                    All rounds done! You've got rhythm!
                  </p>
                </motion.div>
              )}

              {renderDrumKeyboardHint()}
            </div>
          );
        })()}

        {/* ─── Play: guided sequence (melody) ──────────────────────────── */}
        {step.type === "play" && step.sequence && step.notes && (
          <div className="animate-slide-up">
            {/* Listen First button */}
            <div className="flex justify-center mb-5">
              <button onClick={handleListenDemo} disabled={isDemoPlaying || sequencePosition === step.sequence.length}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display font-700 text-sm transition-all duration-200 select-none"
                style={{
                  background: isDemoPlaying ? "#E5DDD0" : "#4AABF5",
                  color: isDemoPlaying ? "#999" : "white",
                  fontFamily: "'Baloo 2', cursive",
                  boxShadow: isDemoPlaying ? "none" : "0 4px 0 rgba(74,171,245,0.4)",
                  transform: isDemoPlaying ? "translateY(2px)" : "translateY(0)",
                }}>
                <span className="text-lg">{isDemoPlaying ? "🎵" : "👂"}</span>
                {isDemoPlaying ? "Listening..." : "Listen First"}
              </button>
            </div>

            {/* Sequence progress: note labels */}
            <div className="flex justify-center items-center gap-1 mb-4 flex-wrap">
              {step.sequence.map((noteName, idx) => {
                const done = idx < sequencePosition;
                const isCurrent = idx === sequencePosition;
                return (
                  <div key={idx} className="flex items-center gap-1">
                    <span
                      className="inline-flex items-center justify-center rounded-full text-sm font-display font-700 transition-all duration-200"
                      style={{
                        width: "2rem",
                        height: "2rem",
                        background: done ? "#3ECFA4" : isCurrent ? "#FFB800" : "#F0EDE8",
                        color: done ? "white" : isCurrent ? "#1A1A2E" : "#999",
                        fontFamily: "'Baloo 2', cursive",
                        transform: isCurrent ? "scale(1.15)" : "scale(1)",
                        boxShadow: isCurrent ? "0 0 8px rgba(255,184,0,0.4)" : "none",
                      }}
                    >
                      {done ? "✓" : noteName}
                    </span>
                    {idx < step.sequence!.length - 1 && (
                      <span className="text-gray-300 text-xs">→</span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Piano keys */}
            <div className="flex justify-center gap-3 mb-6 flex-wrap">
              {step.notes.map((note, idx) => {
                const isDemo = demoNoteIdx === idx;
                const isKeyboardActive = activeKeyboardNote === note.note;
                const nextExpected = step.sequence![sequencePosition];
                const isNextNote = note.note === nextExpected && sequencePosition < step.sequence!.length;
                const isErrorHint = note.note === sequenceErrorNote;
                const isHighlighted = isDemo || isKeyboardActive;
                return (
                  <button
                    key={`${note.note}-${idx}`}
                    onClick={() => handleSequenceNotePlay(note.note)}
                    disabled={isDemoPlaying || sequencePosition >= step.sequence!.length}
                    className="flex flex-col items-center justify-center rounded-3xl transition-all duration-150 shadow-lg select-none"
                    style={{
                      width: "5rem",
                      height: "7.5rem",
                      background: isHighlighted ? note.color : isErrorHint ? "#FF5C3533" : "white",
                      border: `4px solid ${isErrorHint ? "#FF5C35" : note.color}`,
                      color: isHighlighted ? "white" : note.color,
                      transform: isHighlighted ? "translateY(4px) scale(0.97)" : "translateY(0) scale(1)",
                      boxShadow: isNextNote && !isHighlighted
                        ? `0 0 16px ${note.color}66, 0 6px 0 ${note.color}55`
                        : isHighlighted ? `0 2px 0 ${note.color}88` : `0 6px 0 ${note.color}55`,
                      opacity: isDemoPlaying && !isDemo ? 0.5 : 1,
                      animation: isNextNote && !isDemoPlaying && !isHighlighted ? "notely-glow-pulse 1.2s ease-in-out infinite" : "none",
                    }}
                  >
                    <span className="text-3xl mb-1 font-display font-800" style={{ fontFamily: "'Baloo 2', cursive" }}>{note.note}</span>
                    <span className="text-sm font-display font-700" style={{ fontFamily: "'Baloo 2', cursive" }}>{note.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Progress */}
            <div className="flex justify-center gap-2 mb-3">
              {step.sequence.map((_, idx) => (
                <div key={idx} className="transition-all duration-300" style={{
                  width: idx < sequencePosition ? "1.5rem" : "0.75rem",
                  height: "0.75rem",
                  borderRadius: "9999px",
                  background: idx < sequencePosition ? "#3ECFA4" : "#E5DDD0",
                }} />
              ))}
            </div>
            <p className="text-center text-sm text-gray-500 mb-3" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {isDemoPlaying ? "Listen carefully..." : sequencePosition >= step.sequence.length ? "You did it!" : `${sequencePosition} / ${step.sequence.length} notes`}
            </p>

            {/* Keyboard hint */}
            <div className="rounded-2xl p-3 flex items-center gap-3" style={{ background: "#F0F7FF", border: "2px solid #4AABF5" }}>
              <span className="text-xl">⌨️</span>
              <div>
                <p className="text-xs font-display font-700" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>Keyboard shortcut</p>
                <p className="text-xs text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">A</kbd>=C &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">S</kbd>=D &nbsp;
                  <kbd className="px-1.5 py-0.5 rounded bg-white border border-gray-200 text-xs font-mono">D</kbd>=E
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Play exercise (piano notes — non-sequence) */}
        {step.type === "play" && !step.rhythmPatterns && !step.sequence && step.notes && (
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

        {/* ─── Quiz: rhythm (visual block notation) ──────────────────────── */}
        {step.type === "quiz" && step.rhythmQuizOptions && (() => {
          const qStart = rhythmQuizQuestion * 2;
          const qOptions = step.rhythmQuizOptions.slice(qStart, qStart + 2);
          return (
            <div className="animate-slide-up">
              <p className="text-center text-sm font-display font-700 mb-4" style={{ color: "#999", fontFamily: "'Baloo 2', cursive" }}>
                Question {rhythmQuizQuestion + 1} of 2
              </p>

              {/* Listen button */}
              <div className="flex justify-center mb-5">
                <button onClick={handleRhythmQuizListen}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-display font-700 text-sm transition-all duration-200 select-none"
                  style={{ background: "#4AABF5", color: "white", fontFamily: "'Baloo 2', cursive", boxShadow: "0 4px 0 rgba(74,171,245,0.4)" }}>
                  <span className="text-lg">👂</span>
                  {rhythmQuizHasPlayed ? "Listen Again" : "Listen"}
                </button>
              </div>

              {/* Option cards with visual block notation */}
              <div className="flex flex-col gap-3">
                {qOptions.map((option, localIdx) => {
                  const isSelected = selectedOption === localIdx;
                  let bg = "white"; let border = "#E5DDD0";
                  if (showFeedback && isSelected && option.correct) { bg = "#E8F5E9"; border = "#3ECFA4"; }
                  else if (showFeedback && isSelected && !option.correct) { bg = "#FFF3E0"; border = "#FF5C35"; }
                  else if (showFeedback && option.correct) { bg = "#E8F5E9"; border = "#3ECFA4"; }

                  return (
                    <button
                      key={localIdx}
                      onClick={() => handleRhythmQuizSelect(localIdx)}
                      disabled={showFeedback}
                      className="card-notely p-4 flex flex-col items-center gap-3 select-none transition-all duration-150"
                      style={{ background: bg, border: `3px solid ${border}` }}
                    >
                      {/* Block notation */}
                      <div className="flex items-center gap-2">
                        {option.pattern.map((beat, i) => (
                          <div
                            key={i}
                            className="rounded-lg"
                            style={{
                              width: beat === "long" ? "3rem" : "1.5rem",
                              height: "2rem",
                              background: beat === "long" ? "#3ECFA4" : "#4AABF5",
                            }}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-display font-700" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
                        {option.label}
                      </span>
                      {showFeedback && isSelected && (
                        <span className="text-lg">{option.correct ? "✓" : "✗"}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}

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

        {/* Feedback (standard quiz) */}
        {showFeedback && !step.rhythmQuizOptions && (
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

        {/* Feedback (rhythm quiz) */}
        {showFeedback && step.rhythmQuizOptions && (
          <div className="mt-5 rounded-2xl p-4 flex items-center gap-3 animate-pop" style={{ background: feedbackCorrect ? "#E8F5E9" : "#FFF3E0", border: `2px solid ${feedbackCorrect ? "#3ECFA4" : "#FF5C35"}` }}>
            <span className="text-3xl">{feedbackCorrect ? "🎉" : "🔍"}</span>
            <div>
              <p className="font-display font-700" style={{ color: feedbackCorrect ? "#2E7D32" : "#E65100", fontFamily: "'Baloo 2', cursive" }}>
                {feedbackCorrect ? "You read the rhythm!" : "Not quite — try listening again!"}
              </p>
              <p className="text-sm text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {feedbackCorrect
                  ? "Wide blocks = Boom (long), narrow blocks = Tick (short). You've got it!"
                  : "Remember: wide blocks are long Boom sounds, narrow blocks are short Tick sounds."}
              </p>
            </div>
          </div>
        )}

        {/* Reflection prompt (play + explore steps) */}
        {hasReflection && (
          (step.type === "play" && ((step.rhythmPatterns && rhythmAllRoundsComplete) || (!step.rhythmPatterns && showFeedback && feedbackCorrect))) ||
          (step.type === "explore" && exploreTaps >= (step.minTaps ?? 3))
        ) && (
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
            {isLastStep ? "Finish Lesson! 🎉" : step.rhythmQuizOptions && rhythmQuizQuestion === 0 && showFeedback ? "Next Question →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
