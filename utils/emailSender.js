require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

const sendResetPasswordEmail = async (userEmail, resetLink) => {
    try {
        const mailOptions = {
            from: `"Kino CinemaŚty - Pomoc" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: 'Resetowanie hasła w Kinie CinemaŚty',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                    <h2 style="color: #333;">Odzyskiwanie hasła</h2>
                    <p>Próbujesz odzyskać hasło do swojego konta w kinie CinemaŚty powiązanego z tym mailem.</p>
                    <p>Kliknij w poniższy przycisk, aby ustawić nowe hasło (link ważny przez 1 godzinę):</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #e11d48; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold;">USTAW NOWE HASŁO</a>
                    </div>
                    
                    <p style="font-size: 12px; color: #777;">Jeśli to nie Ty prosiłeś o reset hasła, zignoruj tę wiadomość.</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return true;
    } catch {
        return false;
    }
};

module.exports = { sendResetPasswordEmail };
