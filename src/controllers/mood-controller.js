const moodService = require('../service/mood-service')

class MoodController {
  async create(req, res, next) {
    try {
      const userId = req.user.id 
      const { text } = req.body

      const mood = await moodService.createMood(userId, text)
      return res.json(mood)
    } catch (e) {
      next(e)
    }
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user.id
      const moods = await moodService.getUserMoods(userId)
      return res.json(moods)
    } catch (e) {
      next(e)
    }
  }
}

module.exports = new MoodController()
