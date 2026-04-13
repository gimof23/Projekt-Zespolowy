const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

const apiRouter = express.Router();
apiRouter.post('/register', authController.register);
apiRouter.post('/login', authController.login);
apiRouter.post('/forgot-password', authController.forgotPassword);
apiRouter.post('/reset-password-confirm', authController.resetPasswordConfirm);
router.use('/api', apiRouter);

router.get('/wyloguj', authController.logout);

module.exports = router;
