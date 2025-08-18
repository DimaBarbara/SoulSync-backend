const Router = require('express').Router
const router = new Router()
const moodController = require('../controllers/mood-controller')
const authMiddleware = require('../middlewares/auth-middleware')

router.post('/',authMiddleware, moodController.create)
router.get('/',authMiddleware, moodController.getAll)

module.exports = router
