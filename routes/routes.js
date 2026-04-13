const express = require('express');
const { requireLogin, requireLoginApi } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const pageController = require('../controllers/pageController');
const movieController = require('../controllers/movieController');

const router = express.Router();

const apiRouter = express.Router();
apiRouter.post('/register', authController.register);
apiRouter.post('/login', authController.login);
apiRouter.post('/forgot-password', authController.forgotPassword);
apiRouter.post('/reset-password-confirm', authController.resetPasswordConfirm);
router.use('/api', apiRouter);

const profilApiRouter = express.Router();
profilApiRouter.get('/', requireLoginApi, userController.profileApi);
profilApiRouter.post('/cancel-ticket', requireLoginApi, userController.cancelTicket);
profilApiRouter.post('/change-password', requireLoginApi, userController.changePassword);
profilApiRouter.post('/delete-account', requireLoginApi, userController.deleteAccount);
router.use('/api/profil', profilApiRouter);

const profilRouter = express.Router();
profilRouter.get('/', requireLogin, userController.profile);
profilRouter.post('/cancel-ticket', requireLogin, userController.cancelTicket);
profilRouter.post('/change-password', requireLogin, userController.changePassword);
profilRouter.post('/delete-account', requireLogin, userController.deleteAccount);
router.use('/profil', profilRouter);

router.get('/', movieController.index);
router.get('/logowanie', pageController.loginPage);
router.get('/ustaw-nowe-haslo/:token', pageController.newPasswordPage);
router.get('/wyloguj', pageController.logout);

module.exports = router;
