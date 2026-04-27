const express = require('express');
const { requireAdmin, requireLogin, requireEmployee } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');
const pageController = require('../controllers/pageController');
const movieController = require('../controllers/movieController');
const bookingController = require('../controllers/bookingController');
const adminController = require('../controllers/adminController');
const userController = require('../controllers/userController');
const employeeController = require('../controllers/employeeController');

const router = express.Router();

const apiRouter = express.Router();
apiRouter.post('/register', authController.register);
apiRouter.post('/login', authController.login);
apiRouter.post('/forgot-password', authController.forgotPassword);
apiRouter.post('/reset-password-confirm', authController.resetPasswordConfirm);
apiRouter.get('/repertuar', movieController.apiRepertuar);
router.use('/api', apiRouter);

const adminRouter = express.Router();
adminRouter.get('/', requireAdmin, adminController.dashboard);
adminRouter.get('/halls', requireAdmin, adminController.redirectHalls);
adminRouter.post('/movies/add', requireAdmin, adminController.moviesAdd);
adminRouter.post('/movies/edit', requireAdmin, adminController.moviesEdit);
adminRouter.post('/movies/delete', requireAdmin, adminController.moviesDelete);
adminRouter.post('/screenings/add', requireAdmin, adminController.screeningsAdd);
adminRouter.post('/screenings/edit', requireAdmin, adminController.screeningsEdit);
adminRouter.post('/screenings/delete', requireAdmin, adminController.screeningsDelete);
adminRouter.post('/users/add', requireAdmin, adminController.usersAdd);
adminRouter.post('/users/edit', requireAdmin, adminController.usersEdit);
adminRouter.post('/users/delete', requireAdmin, adminController.usersDelete);
adminRouter.post('/halls/save', requireAdmin, adminController.hallsSave);
adminRouter.post('/halls/delete', requireAdmin, adminController.hallsDelete);
adminRouter.post('/bookings/add', requireAdmin, adminController.bookingsAdd);
adminRouter.post('/bookings/edit', requireAdmin, adminController.bookingsEdit);
adminRouter.post('/bookings/delete', requireAdmin, adminController.bookingsDelete);
adminRouter.get('/stats', requireAdmin, adminController.redirectStats);
adminRouter.get('/api/chart-data', requireAdmin, adminController.chartData);
router.use('/admin', adminRouter);

const rezerwacjaRouter = express.Router();
rezerwacjaRouter.post('/book', bookingController.book);
rezerwacjaRouter.get('/:id', bookingController.chooseSeat);
router.use('/rezerwacja', rezerwacjaRouter);

const profilRouter = express.Router();
profilRouter.get('/', requireLogin, userController.profile);
profilRouter.post('/cancel-ticket', requireLogin, userController.cancelTicket);
profilRouter.post('/change-password', requireLogin, userController.changePassword);
profilRouter.post('/delete-account', requireLogin, userController.deleteAccount);
router.use('/profil', profilRouter);

router.get('/admin-panel', pageController.adminPanelRedirect);
router.get('/wyloguj', pageController.logout);
router.get('/kontakt', pageController.contact);
router.get('/cennik', pageController.priceList);
router.get('/logowanie', pageController.loginPage);
router.get('/ustaw-nowe-haslo/:token', pageController.newPasswordPage);

const employeeRouter = express.Router();
employeeRouter.get('/', requireEmployee, employeeController.dashboard);
employeeRouter.post('/screenings/add', requireEmployee, employeeController.screeningsAdd);
employeeRouter.post('/screenings/edit', requireEmployee, employeeController.screeningsEdit);
employeeRouter.post('/screenings/delete', requireEmployee, employeeController.screeningsDelete);
employeeRouter.get('/get-movies-list', requireEmployee, employeeController.getMoviesList);
employeeRouter.get('/api/tickets', requireEmployee, employeeController.apiTickets);
employeeRouter.post('/refund-ticket', requireEmployee, employeeController.refundTicket);
router.use('/employee', employeeRouter);

router.get('/', movieController.index);
router.get('/zapowiedzi', movieController.premieres);
router.get('/repertuar', movieController.repertuarPage);

module.exports = router;
