exports.loginPage = function (req, res) {
    if (req.session.isLoggedIn) {
        return res.redirect('/profil');
    }

    res.render('login', { title: 'Logowanie' });
};

exports.newPasswordPage = function (req, res) {
    res.render('newPassword', { title: 'Nowe hasło', token: req.params.token });
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

exports.home = function (req, res) {
    if (req.session.isLoggedIn) {
        return res.redirect('/profil');
    }

    res.redirect('/logowanie');
};
