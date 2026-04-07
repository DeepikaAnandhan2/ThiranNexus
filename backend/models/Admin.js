// backend/models/Admin.js
const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const AdminSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, minlength: 6 },
  role:     { type: String, enum: ['super_admin', 'admin', 'moderator', 'support'], default: 'admin' },
  status:   { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  lastLogin:{ type: Date },
}, { timestamps: true })

AdminSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

AdminSchema.methods.matchPassword = async function (entered) {
  return await bcrypt.compare(entered, this.password)
}

module.exports = mongoose.model('Admin', AdminSchema)
