const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendResetPasswordEmail } = require('../utils/emailSender');

exports.register = async function (req, res) {
    const userDisplayName = req.body.name;
    const userEmail = req.body.email;
    const plainPassword = req.body.password;

    if (!userDisplayName || !userEmail || !plainPassword) {
        return res.status(400).json({ message: 'Wypełnij wszystkie pola!' });
    }

    try {
        const [existingUsers] = await db.execute('Select id from users where email = ?', [userEmail]);

        if (existingUsers.length > 0) {
            return res.status(409).json({ message: 'Taki email jest już zajęty.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(plainPassword, salt);

        await db.execute(
            'insert into users (name, email, password_hash, role) values (?, ?, ?, ?)',
            [userDisplayName, userEmail, passwordHash, 'user']
        );

        res.status(201).json({ message: 'Rejestracja udana! Możesz się zalogować.' });
    } catch (err) {
        console.error('Błąd rejestracji:', err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
};

exports.login = async function (req, res) {
    const userEmail = req.body.email;
    const plainPassword = req.body.password;

    if (!userEmail || !plainPassword) {
        return res.status(400).json({ message: 'Podaj email i hasło.' });
    }

    try {
        const [userRows] = await db.execute('Select * from users where email = ?', [userEmail]);
        const userRow = userRows[0];

        if (!userRow) {
            return res.status(401).json({ message: 'Błędny email lub hasło.' });
        }

        const passwordMatches = await bcrypt.compare(plainPassword, userRow.password_hash);

        if (!passwordMatches) {
            return res.status(401).json({ message: 'Błędny email lub hasło.' });
        }

        req.session.isLoggedIn = true;
        req.session.user = {
            id: userRow.id,
            name: userRow.name,
            email: userRow.email,
            role: userRow.role
        };

        let afterLoginRedirectUrl = '/';

        if (userRow.role === 'admin') {
            afterLoginRedirectUrl = '/admin-panel';
        }

        res.status(200).json({
            message: 'Zalogowano pomyślnie!',
            redirect: afterLoginRedirectUrl
        });
    } catch (err) {
        console.error('Błąd logowania:', err);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
};

exports.forgotPassword = async function (req, res) {
    const userEmail = req.body.email;

    if (!userEmail) {
        return res.status(400).json({ message: 'Podaj adres email.' });
    }

    try {
        const [usersWithEmail] = await db.execute('Select id from users where email = ?', [userEmail]);

        if (usersWithEmail.length === 0) {
            return res.json({ success: true, message: 'Jeśli konto istnieje, wysłaliśmy link.' });
        }

        const resetPasswordToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiresAt = new Date(Date.now() + 3600000);

        await db.execute(
            'update users set reset_token = ?, reset_token_expires = ? where email = ?',
            [resetPasswordToken, resetTokenExpiresAt, userEmail]
        );

        const protocol = req.protocol;
        const host = req.get('host');
        const passwordResetLink = protocol + '://' + host + '/ustaw-nowe-haslo/' + resetPasswordToken;

        sendResetPasswordEmail(userEmail, passwordResetLink).catch(function (mailErr) {
            console.error(mailErr);
        });

        res.json({ success: true, message: 'Link został wysłany na Twój email!' });
    } catch (error) {
        console.error('Błąd forgot-password:', error);
        res.status(500).json({ message: 'Błąd serwera.' });
    }
};

exports.resetPasswordConfirm = async function (req, res) {
    const resetTokenFromLink = req.body.token;
    const newPlainPassword = req.body.newPassword;

    try {
        const [usersWithToken] = await db.execute(
            'Select id from users where reset_token = ? and reset_token_expires > now()',
            [resetTokenFromLink]
        );

        if (usersWithToken.length === 0) {
            return res.status(400).json({ success: false, message: 'Link jest nieprawidłowy lub wygasł.' });
        }

        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPlainPassword, salt);

        await db.execute(
            'update users set password_hash = ?, reset_token = null, reset_token_expires = null where id = ?',
            [newPasswordHash, usersWithToken[0].id]
        );

        res.json({ success: true, message: 'Hasło zostało zmienione! Możesz się zalogować.' });
    } catch (error) {
        console.error('Błąd reset-password-confirm:', error);
        res.status(500).json({ message: 'Błąd zmiany hasła.' });
    }
};
