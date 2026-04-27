exports.contact = function (req, res) {
    res.render('contact', { title: 'Kontakt' });
};

exports.priceList = function (req, res) {
    res.render('priceList', { title: 'Cennik' });
};

exports.loginPage = function (req, res) {
    if (req.session.isLoggedIn) {
        if (req.session.user.role === 'admin') {
            return res.redirect('/admin');
        }

        return res.redirect('/');
    }

    res.render('login', { title: 'Logowanie' });
};

exports.newPasswordPage = function (req, res) {
    const resetTokenFromUrl = req.params.token;

    res.render('newPassword', { layout: false, token: resetTokenFromUrl });
};

exports.adminPanelRedirect = function (req, res) {
    if (req.session.isLoggedIn && req.session.user.role === 'admin') {
        res.redirect('/admin');
    } else {
        res.redirect('/logowanie');
    }
};

exports.logout = function (req, res) {
    req.session.destroy(function (destroyErr) {
        if (destroyErr) {
            console.error(destroyErr);
        }

        res.clearCookie('connect.sid');
        res.redirect('/logowanie');
    });
};
