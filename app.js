const express = require('express');
const exphbs = require('express-handlebars');
require('dotenv').config();
const path = require('path');
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

app.engine(
    'hbs',
    exphbs.engine({
        extname: 'hbs',
        defaultLayout: 'main',
        layoutsDir: path.join(__dirname, 'views/layouts'),
        partialsDir: path.join(__dirname, 'views/partials'),
        helpers: {
            formatDateInput: (date) => {
                if (!date) return '';
                const d = new Date(date);
                if (isNaN(d.getTime())) return '';
                return d.toISOString().split('T')[0];
            },
            truncateDescription: (text, length) => {
                if (!text) return 'Brak opisu';
                length = length || 40;
                if (text.length <= length) return text;
                return text.substring(0, length) + '...';
            },
            eq: function (v1, v2) {
                return v1 === v2;
            },
            json: function (context) {
                return JSON.stringify(context);
            },
            addOne: function (value) {
                return parseInt(value) + 1;
            },
            gt: function (v1, v2) {
                return v1 > v2;
            }
        }
    })
);
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(routes);

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
