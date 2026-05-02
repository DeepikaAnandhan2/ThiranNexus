const mongoose = require('mongoose');

const QuizQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: [{ type: String }],
  correctAnswer: { type: Number, required: true }, // index of correct option
  explanation: { type: String }
});

const CourseDataSchema = new mongoose.Schema({
  className: { type: String, required: true },    // e.g. "Class 12"
  subjectName: { type: String, required: true },  // e.g. "Biology"
  unitNumber: { type: Number, required: true },
  unitTitle: { type: String, required: true },
  content: {
    text: { type: String },                        // Rich HTML/markdown text explanation
    videoUrl: { type: String },                    // Standard YouTube video URL
    signLanguageVideoUrl: { type: String },        // Sign language YouTube video URL
    quiz: [QuizQuestionSchema]
  }
}, { timestamps: true });

module.exports = mongoose.model('CourseData', CourseDataSchema);