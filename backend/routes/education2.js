const express = require('express');
const router = express.Router();
const CourseData = require('../models/CourseData');

// GET /api/education2/subjects?className=Class 12
router.get('/subjects', async (req, res) => {
  try {
    const { className } = req.query;
    if (!className) return res.status(400).json({ error: 'className is required' });

    const subjects = await CourseData.distinct('subjectName', { className });
    res.json({ subjects });
  } catch (err) {
    console.error('education2/subjects error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/education2/units?className=Class 12&subjectName=Biology
router.get('/units', async (req, res) => {
  try {
    const { className, subjectName } = req.query;
    if (!className || !subjectName)
      return res.status(400).json({ error: 'className and subjectName are required' });

    const units = await CourseData.find(
      { className, subjectName },
      { unitNumber: 1, unitTitle: 1, _id: 1 }
    ).sort({ unitNumber: 1 });

    res.json({ units });
  } catch (err) {
    console.error('education2/units error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/education2/content/:id
router.get('/content/:id', async (req, res) => {
  try {
    const doc = await CourseData.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: 'Content not found' });
    res.json(doc);
  } catch (err) {
    console.error('education2/content error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;