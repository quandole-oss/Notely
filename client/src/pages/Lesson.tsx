/*
 * NOTELY — LESSON PLAYER PAGE
 * Design: Sunny Studio — Bauhaus playful modernism
 * Full-screen immersive lesson: video area (top 55%) + interactive exercise (bottom 45%)
 * Progress dots, animated feedback, step-by-step structure
 * Immediate positive reinforcement on every correct action
 */

import { useState } from "react";
import { useLocation } from "wouter";

interface LessonStep {
  type: "watch" | "listen" | "play" | "quiz";
  title: string;
  instruction: string;
  content?: string;
  options?: { label: string; correct: boolean; emoji: string }[];
  notes?: { note: string; label: string; color: string }[];
}

const LESSON_STEPS: LessonStep[] = [
  {
    type: "watch",
    title: "Meet the Piano! 🎹",
    instruction: "Watch and learn about the piano keys",
    content: "The piano has white keys and black keys. Each key makes a different sound — from low and deep to high and bright! The white keys are named after the first 7 letters of the alphabet: A, B, C, D, E, F, G.",
  },
  {
    type: "listen",
    title: "Hear the Notes 🎵",
    instruction: "Listen to how each note sounds different",
    content: "Every note has a name! The most important note is called C — it's like the 'home base' of music. When you play C, E, and G together, you make a C chord — that's three notes that sound beautiful together!",
  },
  {
    type: "play",
    title: "Play Do-Re-Mi! 🎶",
    instruction: "Tap the notes in order: DO → RE → MI",
    notes: [
      { note: "C", label: "DO", color: "#FFB800" },
      { note: "D", label: "RE", color: "#FF5C35" },
      { note: "E", label: "MI", color: "#4AABF5" },
    ],
  },
  {
    type: "quiz",
    title: "Quick Check! 🧠",
    instruction: "Which note is called 'DO'?",
    options: [
      { label: "Note A", correct: false, emoji: "🎵" },
      { label: "Note C", correct: true, emoji: "🎹" },
      { label: "Note G", correct: false, emoji: "🎶" },
      { label: "Note B", correct: false, emoji: "🎸" },
    ],
  },
  {
    type: "play",
    title: "Play a Real Melody! ⭐",
    instruction: "Tap all 5 notes to play 'Mary Had a Little Lamb'!",
    notes: [
      { note: "E", label: "MI", color: "#4AABF5" },
      { note: "D", label: "RE", color: "#FF5C35" },
      { note: "C", label: "DO", color: "#FFB800" },
      { note: "D", label: "RE", color: "#FF5C35" },
      { note: "E", label: "MI", color: "#4AABF5" },
    ],
  },
];

export default function Lesson() {
  const [, navigate] = useLocation();
  const [currentStep, setCurrentStep] = useState(0);
  const [playedNotes, setPlayedNotes] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackCorrect, setFeedbackCorrect] = useState(false);
  const [lessonComplete, setLessonComplete] = useState(false);

  const step = LESSON_STEPS[currentStep];
  const isLastStep = currentStep === LESSON_STEPS.length - 1;

  const handleNotePlay = (idx: number) => {
    if (!playedNotes.includes(idx)) {
      const newPlayed = [...playedNotes, idx];
      setPlayedNotes(newPlayed);
      if (step.notes && newPlayed.length === step.notes.length) {
        setTimeout(() => {
          setShowFeedback(true);
          setFeedbackCorrect(true);
        }, 300);
      }
    }
  };

  const handleOptionSelect = (idx: number) => {
    setSelectedOption(idx);
    const correct = step.options?.[idx]?.correct ?? false;
    setFeedbackCorrect(correct);
    setShowFeedback(true);
  };

  const handleNext = () => {
    setShowFeedback(false);
    setSelectedOption(null);
    setPlayedNotes([]);
    if (isLastStep) {
      setLessonComplete(true);
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const canProceed =
    step.type === "watch" ||
    step.type === "listen" ||
    (step.type === "play" && step.notes && playedNotes.length === step.notes.length) ||
    (step.type === "quiz" && selectedOption !== null);

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
        {/* Stars */}
        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className="text-5xl animate-pop"
              style={{ animationDelay: `${s * 0.2}s` }}
            >
              ⭐
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="btn-notely px-8 py-3 text-base"
            style={{ background: "#FFB800", color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}
          >
            Back to Home 🏠
          </button>
          <button
            onClick={() => navigate("/practice")}
            className="btn-notely px-8 py-3 text-base"
            style={{ background: "#4AABF5", color: "white", fontFamily: "'Baloo 2', cursive" }}
          >
            Practice More 🎹
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FEFAF3] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-[#E5DDD0]">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          ← Back
        </button>
        <div className="flex items-center gap-2">
          {LESSON_STEPS.map((_, idx) => (
            <div
              key={idx}
              className="transition-all duration-300"
              style={{
                width: idx === currentStep ? "2rem" : "0.6rem",
                height: "0.6rem",
                borderRadius: "9999px",
                background: idx < currentStep ? "#3ECFA4" : idx === currentStep ? "#FFB800" : "#E5DDD0",
              }}
            />
          ))}
        </div>
        <div className="text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {currentStep + 1} / {LESSON_STEPS.length}
        </div>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full px-4 py-6">
        {/* Step type badge */}
        <div className="flex items-center gap-2 mb-4">
          <span
            className="badge-notely"
            style={{
              background:
                step.type === "watch" ? "#FFB800" :
                step.type === "listen" ? "#4AABF5" :
                step.type === "play" ? "#FF5C35" : "#3ECFA4",
              color: step.type === "watch" ? "#1A1A2E" : "white",
            }}
          >
            {step.type === "watch" ? "👀 Watch" :
             step.type === "listen" ? "👂 Listen" :
             step.type === "play" ? "🎹 Play" : "🧠 Quiz"}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-display font-800 mb-2" style={{ color: "#1A1A2E", fontFamily: "'Baloo 2', cursive" }}>
          {step.title}
        </h1>
        <p className="text-gray-600 mb-6 text-base" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {step.instruction}
        </p>

        {/* Watch/Listen content */}
        {(step.type === "watch" || step.type === "listen") && (
          <div className="animate-slide-up">
            {/* Lesson visual */}
            <div
              className="rounded-3xl overflow-hidden mb-5 relative"
              style={{ height: "200px" }}
            >
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663422386160/FwxdRn7gyJEfzV8667mpvP/lesson-bg-Cen66WZRxYbX8NVgUd7ZgM.webp"
                alt="Music lesson"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-xl"
                  style={{ background: "rgba(255,255,255,0.95)" }}
                >
                  {step.type === "watch" ? "▶️" : "🔊"}
                </div>
              </div>
            </div>

            {/* Content card */}
            <div className="card-notely p-5 mb-4">
              <p className="text-base text-gray-700 leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {step.content}
              </p>
            </div>

            {/* Fun fact */}
            <div
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{ background: "#FFF8E1", border: "2px solid #FFB800" }}
            >
              <span className="text-2xl">💡</span>
              <p className="text-sm text-gray-700" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                <strong>Fun fact:</strong> The piano has 88 keys! But you only need to learn 7 note names to understand all of them.
              </p>
            </div>
          </div>
        )}

        {/* Play exercise */}
        {step.type === "play" && step.notes && (
          <div className="animate-slide-up">
            <div className="flex justify-center gap-3 mb-6">
              {step.notes.map((note, idx) => {
                const played = playedNotes.includes(idx);
                return (
                  <button
                    key={`${note.note}-${idx}`}
                    onClick={() => handleNotePlay(idx)}
                    className="flex flex-col items-center justify-center rounded-3xl transition-all duration-200 shadow-lg"
                    style={{
                      width: "4.5rem",
                      height: "7rem",
                      background: played ? note.color : "white",
                      border: `4px solid ${note.color}`,
                      color: played ? "white" : note.color,
                      transform: played ? "translateY(4px) scale(0.97)" : "translateY(0) scale(1)",
                      boxShadow: played ? `0 2px 0 ${note.color}88` : `0 6px 0 ${note.color}55`,
                    }}
                  >
                    <span className="text-3xl mb-1 font-display font-800" style={{ fontFamily: "'Baloo 2', cursive" }}>
                      {played ? "✓" : note.note}
                    </span>
                    <span className="text-sm font-display font-700" style={{ fontFamily: "'Baloo 2', cursive" }}>
                      {note.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Progress dots */}
            <div className="flex justify-center gap-2 mb-4">
              {step.notes.map((_, idx) => (
                <div
                  key={idx}
                  className="transition-all duration-300"
                  style={{
                    width: playedNotes.includes(idx) ? "1.5rem" : "0.75rem",
                    height: "0.75rem",
                    borderRadius: "9999px",
                    background: playedNotes.includes(idx) ? "#3ECFA4" : "#E5DDD0",
                  }}
                />
              ))}
            </div>

            <p className="text-center text-sm text-gray-500" style={{ fontFamily: "'DM Sans', sans-serif" }}>
              {playedNotes.length} / {step.notes.length} notes played
            </p>
          </div>
        )}

        {/* Quiz */}
        {step.type === "quiz" && step.options && (
          <div className="animate-slide-up grid grid-cols-2 gap-3">
            {step.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrect = option.correct;
              let bg = "white";
              let border = "#E5DDD0";
              if (isSelected && isCorrect) { bg = "#3ECFA4"; border = "#3ECFA4"; }
              else if (isSelected && !isCorrect) { bg = "#FF5C35"; border = "#FF5C35"; }
              else if (showFeedback && isCorrect) { bg = "#3ECFA4"; border = "#3ECFA4"; }

              return (
                <button
                  key={idx}
                  onClick={() => !showFeedback && handleOptionSelect(idx)}
                  disabled={showFeedback}
                  className="card-notely p-4 flex flex-col items-center gap-2 text-center"
                  style={{
                    background: bg,
                    border: `3px solid ${border}`,
                    color: isSelected || (showFeedback && isCorrect) ? "white" : "#1A1A2E",
                  }}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <span className="font-display font-700 text-base" style={{ fontFamily: "'Baloo 2', cursive" }}>
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* Feedback overlay */}
        {showFeedback && (
          <div
            className="mt-5 rounded-2xl p-4 flex items-center gap-3 animate-pop"
            style={{
              background: feedbackCorrect ? "#E8F5E9" : "#FFF3E0",
              border: `2px solid ${feedbackCorrect ? "#3ECFA4" : "#FF5C35"}`,
            }}
          >
            <span className="text-3xl">{feedbackCorrect ? "🎉" : "💪"}</span>
            <div>
              <p className="font-display font-700" style={{ color: feedbackCorrect ? "#2E7D32" : "#E65100", fontFamily: "'Baloo 2', cursive" }}>
                {feedbackCorrect ? "Amazing! That's correct!" : "Good try! The answer is Note C (DO)"}
              </p>
              <p className="text-sm text-gray-600" style={{ fontFamily: "'DM Sans', sans-serif" }}>
                {feedbackCorrect ? "You're doing great — keep it up!" : "You'll get it next time! Keep practicing!"}
              </p>
            </div>
          </div>
        )}

        {/* Continue button */}
        <div className="mt-auto pt-6">
          <button
            onClick={canProceed ? handleNext : undefined}
            disabled={!canProceed}
            className="btn-notely w-full py-4 text-lg shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: canProceed ? "#FFB800" : "#E5DDD0", color: canProceed ? "#1A1A2E" : "#999", fontFamily: "'Baloo 2', cursive" }}
          >
            {isLastStep ? "Finish Lesson! 🎉" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}
