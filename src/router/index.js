const Router = require('express').Router;
const { body } = require('express-validator');
const userController = require('../controllers/user-controller');
const router = new Router();
const moodRouter = require('./mood-router')
const authRouter = require('./auth-router');
const authMiddleware = require('../middlewares/auth-middleware');

//mood
router.use('/mood', moodRouter)

//auth
router.use('/auth', authRouter)

//user
router.get('/users',authMiddleware, userController.getUsers);

module.exports = router;
