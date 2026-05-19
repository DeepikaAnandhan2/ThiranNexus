import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LogicGame.css";

const COLOR_CYCLE = ["none", "Green", "Yellow", "Orange", "Blue"];

const levels = {
  easy: {
    clues: [
      "Green is in row 5",
      "Orange is in row 8",
      "Yellow is in rows 1, 3, 7, 9",
      "Blue is in rows 2, 4, 6",
    ],
    answers: {
      1: "Yellow", 2: "Blue", 3: "Yellow", 4: "Blue", 5: "Green",
      6: "Blue", 7: "Yellow", 8: "Orange", 9: "Yellow",
    },
  },
  medium: {
    clues: [
      "Green is the middle row",
      "Orange is in row 8",
      "Yellow is in odd rows",
      "Blue is in even rows",
      "Blue is not in row 8",
    ],
    answers: {
      1: "Yellow", 2: "Blue", 3: "Yellow", 4: "Blue", 5: "Green",
      6: "Blue", 7: "Yellow", 8: "Orange", 9: "Yellow",
    },
  },
  hard: {
    clues: [
      "Green is in the middle row",
      "Yellow is in odd rows",
      "Orange is in row 8",
      "Blue cannot be in row 1 or row 9",
    ],
    answers: {
      1: "Yellow", 2: "Blue", 3: "Yellow", 4: "Blue", 5: "Green",
      6: "Blue", 7: "Yellow", 8: "Orange", 9: "Yellow",
    },
  },
};

export default function LogicGame() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [answers, setAnswers] = useState({});
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");

  const currentLevel = levels[level] || levels.easy;

  /* Tap the bar → cycle to next color */
  const cycleColor = (row) => {
    const current = answers[row] || "none";
    const idx = COLOR_CYCLE.indexOf(current);
    const next = COLOR_CYCLE[(idx + 1) % COLOR_CYCLE.length];
    setAnswers((prev) => ({ ...prev, [row]: next }));
    setMessage("");
  };

  /* Tap a dot → jump directly to that color */
  const setColor = (e, row, color) => {
    e.stopPropagation();
    setAnswers((prev) => ({ ...prev, [row]: color }));
    setMessage("");
  };

  const handleSubmit = () => {
    let correct = 0;
    Object.keys(currentLevel.answers).forEach((row) => {
      if (answers[Number(row)] === currentLevel.answers[Number(row)]) correct++;
    });
    setScore(correct);
    setMessage(
      correct === 9
        ? "🎉 Perfect! You solved the logic."
        : `Keep trying! ${correct}/9 correct.`
    );
  };

  const handleReset = () => {
    setAnswers({});
    setMessage("");
    setScore(0);
  };

  const speak = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";
    window.speechSynthesis.speak(speech);
  };

  return (
    <div className="logic-game-wrapper">
      <header className="game-header">
        <div className="header-nav">
          <button className="back-link" onClick={() => navigate("/games")}>
            ← EXIT
          </button>
          <div className="score-pill">SCORE: {score * 100}</div>
        </div>
        <h1 className="title-text">Logic Challenge</h1>
      </header>

      <main className="game-content">
        {!gameStarted ? (
          <div className="setup-card">
            <h2 className="setup-title">Select Difficulty</h2>
            <div className="difficulty-row">
              {["easy", "medium", "hard"].map((l) => (
                <button
                  key={l}
                  className={`diff-btn ${level === l ? "active" : ""}`}
                  onClick={() => setLevel(l)}
                >
                  {l}
                </button>
              ))}
            </div>
            {level && (
              <button
                className="start-btn"
                onClick={() => {
                  handleReset();
                  setGameStarted(true);
                }}
              >
                BEGIN PUZZLE
              </button>
            )}
          </div>
        ) : (
          <div className="sequential-layout">

            {/* SECTION 1: CLUES */}
            <section className="clues-section">
              <div className="clues-card-header">
                <h3 className="section-title-black">Read the Clues</h3>
                <button
                  className="listen-btn"
                  onClick={() => speak(currentLevel.clues.join(". "))}
                >
                  🔊 Listen
                </button>
              </div>
              <div className="clues-grid">
                {currentLevel.clues.map((clue, i) => (
                  <div key={i} className="clue-card-item">
                    <span className="clue-number">{i + 1}</span>
                    <p className="clue-text-black">{clue}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* COLOR LEGEND */}
            <div className="color-legend">
              <span className="legend-label">Tap a row to assign a color:</span>
              <div className="legend-dots">
                {["Green", "Yellow", "Orange", "Blue"].map((c) => (
                  <span key={c} className="legend-item">
                    <span className={`legend-dot dot-${c.toLowerCase()}`} />
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* SECTION 2: GAME AREA — tap to color */}
            <section className="input-section">
              <h3 className="section-label">TAP A ROW TO CHANGE ITS COLOR</h3>
              <div className="rows-container">
                {[...Array(9)].map((_, i) => {
                  const rowNum = i + 1;
                  const selected = answers[rowNum] || "none";
                  const colorClass = selected.toLowerCase();

                  return (
                    <div
                      key={rowNum}
                      className={`answer-row color-row-${colorClass}`}
                      onClick={() => cycleColor(rowNum)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) =>
                        e.key === "Enter" && cycleColor(rowNum)
                      }
                      aria-label={`Row ${rowNum}, currently ${selected}. Tap to change.`}
                    >
                      <span className="row-number">ROW {rowNum}</span>

                      <div className={`color-bar-fill color-fill-${colorClass}`}>
                        {selected !== "none" ? selected : "Tap to choose"}
                      </div>

                      {/* Quick-pick dots */}
                      <div className="dot-picker">
                        {["Green", "Yellow", "Orange", "Blue"].map((c) => (
                          <span
                            key={c}
                            className={`pick-dot dot-${c.toLowerCase()} ${
                              selected === c ? "dot-active" : ""
                            }`}
                            onClick={(e) => setColor(e, rowNum, c)}
                            role="button"
                            aria-label={`Set row ${rowNum} to ${c}`}
                            tabIndex={0}
                            onKeyDown={(e) =>
                              e.key === "Enter" && setColor(e, rowNum, c)
                            }
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* SECTION 3: FOOTER */}
            <footer className="action-footer">
              <button className="submit-btn" onClick={handleSubmit}>
                VERIFY ANSWERS
              </button>
              <button className="reset-btn" onClick={handleReset}>
                Clear All
              </button>
              {message && (
                <div
                  className={`message-banner ${score === 9 ? "success" : "retry"}`}
                >
                  {message}
                </div>
              )}
            </footer>

          </div>
        )}
      </main>
    </div>
  );
}