const express = require('express');
const router  = express.Router();
const { getWordExplanation } = require('../controllers/wordController');

// GET /api/words/:word
// No auth middleware — word lookup should be fast and public within the app
router.get('/:word', getWordExplanation);

module.exports = router;