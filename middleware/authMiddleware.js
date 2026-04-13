const requireAdmin = (req, res, next) => {
    if (req.session.isLoggedIn && req.session.user.role === 'admin') {
        next();
    } else {
        res.redirect('/logowanie');
    }
};

const requireLogin = (req, res, next) => {
    if (!req.session.isLoggedIn || !req.session.user) {
        return res.redirect('/logowanie');
    }
    next();
};

const requireEmployee = (req, res, next) => {
    if (req.session.isLoggedIn && (req.session.user.role === 'employee' || req.session.user.role === 'admin')) {
        next();
    } else {
        res.redirect('/logowanie');
    }
};

const requireLoginApi = (req, res, next) => {
    if (!req.session.isLoggedIn || !req.session.user) {
        return res.status(401).json({ message: 'Wymagane logowanie.' });
    }

    next();
};

module.exports = { requireAdmin, requireLogin, requireEmployee, requireLoginApi };
