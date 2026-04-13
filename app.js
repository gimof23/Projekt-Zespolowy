const express = require('express');
require('dotenv').config();
const session = require('express-session');
const routes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.JWT_SECRET || 'fallback_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

app.use((req, res, next) => {
    res.locals.isLoggedIn = req.session.isLoggedIn || false;
    res.locals.user = req.session.user || null;
    res.locals.isAdmin = req.session.user && req.session.user.role === 'admin';
    next();
});

app.use(routes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
