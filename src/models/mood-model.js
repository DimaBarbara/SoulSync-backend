const { Schema, model } = require('mongoose')

const MoodSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  emotions: [{
    label: { type: String, required: true },
    score: { type: Number, required: true }
  }],
  advice: { type: String }, 
  date: { type: Date, default: Date.now }
})

module.exports = model('Mood', MoodSchema)