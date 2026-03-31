// Fields to include:
// udid, name, age, disabilityType, educationLevel,
// class/college, state, phone, passwordHash, createdAt

const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const UserSchema = new mongoose.Schema({
  // ── Basic Info ─────────────────────────────────────────
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone:    { type: String, default: '' },

  // ── Role ───────────────────────────────────────────────
  // 'student' = differently abled student
  // 'parent'  = caregiver / parent
  role: {
    type: String,
    enum: ['student', 'parent'],
    default: 'student'
  },

  // ── UDID Info (for students) ───────────────────────────
  udid: {
    type: String,
    default: '',
    trim: true,
  },

  // ── Disability Info (auto-filled from UDID or manual) ─
  disabilityType: {
  type: String,
  enum: ['visual', 'hearing', 'cognitive', 'motor', 'speech', 'multiple', 'other', 'none'],
  default: 'none'
},

  disabilityDetails: { type: String, default: '' },

  // ── Education Info ─────────────────────────────────────
  educationLevel: {
    type: String,
    enum: ['school', 'college', 'higher', 'none'],
    default: 'none'
  },

  // For school students
  className: { type: String, default: '' },   // e.g. "8"
  subject:   { type: String, default: '' },

  // For college students
  course:    { type: String, default: '' },

  // ── Location (for govt scheme filtering) ──────────────
  state:    { type: String, default: '' },
  district: { type: String, default: '' },

  // ── Parent Link ────────────────────────────────────────
  // If role is parent, link to student's UDID
  linkedStudentUDID: { type: String, default: '' },

  // ── Timestamps ─────────────────────────────────────────
}, { timestamps: true })

UserSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password helper
UserSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('User', UserSchema)