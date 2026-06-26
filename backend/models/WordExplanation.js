const mongoose = require('mongoose');

const WordExplanationSchema = new mongoose.Schema({
  word:         { type: String, required: true, unique: true, lowercase: true, trim: true },
  definition:   { type: String, default: '' },
  example:      { type: String, default: '' },
  subject:      { type: String, default: 'general' },
  level:        { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  color:        { type: String, default: '#7c3aed' },
  animationUrl: { type: String, default: '' },
  videoUrl:     { type: String, default: '' },
  simplifiedDefinition: { type: String, default: '' },
  islGloss:     { type: [String], default: [] },
  directSignUrl:{ type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('WordExplanation', WordExplanationSchema);