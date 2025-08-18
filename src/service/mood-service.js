const MoodModel = require('../models/mood-model')
const { analyzeMood } = require('./ai-service')

exports.createMood = async (userId, text) => {
  const moodEntry = await analyzeMood(userId, text)
  const newMood = await MoodModel.create(moodEntry)
  return newMood
}

exports.getUserMoods = async (userId) => {
  return MoodModel.find({ userId }).sort({ date: -1 })
}