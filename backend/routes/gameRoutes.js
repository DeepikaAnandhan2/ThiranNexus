const express = require("express");
const router = express.Router();
const Game = require("../models/games");

// GET logic game
router.get("/logic", (req, res) => {
  res.json({
    clues: [
      "Green is in the middle row",
      "Yellow is in odd rows",
      "Orange is in row 8"
    ],
    options: ["Green", "Yellow", "Orange", "Blue"]
  });
});

// VALIDATE logic game
router.post("/logic/validate", async (req, res) => {
  const { answers } = req.body;

  let result = "Incorrect";

  if (
    answers[4] === "Green" &&
    answers[7] === "Orange"
  ) {
    const yellowIndex = answers.indexOf("Yellow");
    if ([0, 2, 4, 6, 8].includes(yellowIndex)) {
      result = "Correct";
    }
  }

  await Game.create({ answers, result });

  res.json({ result });
});

module.exports = router;