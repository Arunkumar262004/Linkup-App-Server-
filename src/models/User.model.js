const mongoose = require('mongoose')
const bcrypt   = require('bcryptjs')

const userSchema = new mongoose.Schema({
  name:         { type: String, required: true, trim: true },
  email:        { type: String, unique: true, sparse: true, lowercase: true, trim: true },
  mobile:       { type: String, unique: true, sparse: true, trim: true },
  passwordHash: { type: String, required: true },
  fcmToken:     { type: String, default: null },
  avatar:       { type: String, default: null },
  bio:          { type: String, default: '' },
  isOnline:     { type: Boolean, default: false },
}, { timestamps: true })

userSchema.index({ email: 1 })
userSchema.index({ mobile: 1 })

userSchema.pre('save', async function () {
  if (!this.isModified('passwordHash')) return
  this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
})

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash)
}

module.exports = mongoose.model('User', userSchema)