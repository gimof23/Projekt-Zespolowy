const pool = require('../db/connection');
const bcrypt = require('bcryptjs');

function calculatePrice(booking, layout, pricingRules) {
    const screeningDate = new Date(booking.date);
    let bookingDate = new Date();
    if (booking.created_at) {
        bookingDate = new Date(booking.created_at);
    }

    const diffTime = screeningDate - bookingDate;
    let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        diffDays = 0;
    }
    if (diffDays > 4) {
        diffDays = 4;
    }

    let rule = null;
    for (let r = 0; r < pricingRules.length; r++) {
        if (pricingRules[r].days_before == diffDays) {
            rule = pricingRules[r];
            break;
        }
    }

    let basePrice = 25.0;
    if (rule) {
        basePrice = parseFloat(rule.price_base);
    }

    let seatType = 1;

    try {
        if (booking.seat_number && layout) {
            const parts = booking.seat_number.replace('R', '').split('-S');
            const rowIdx = parseInt(parts[0], 10) - 1;
            const seatNum = parseInt(parts[1], 10);

            let layoutGrid = layout;
            if (Array.isArray(layout) && layout.length > 0 && !Array.isArray(layout[0])) {
                const COLUMNS = 15;
                const chunked = [];
                for (let i = 0; i < layout.length; i += COLUMNS) {
                    chunked.push(layout.slice(i, i + COLUMNS));
                }
                layoutGrid = chunked;
            }

            if (layoutGrid[rowIdx]) {
                let currentCount = 0;
                const rowArr = layoutGrid[rowIdx];
                for (let c = 0; c < rowArr.length; c++) {
                    const cellVal = parseInt(rowArr[c], 10);
                    if (cellVal === 1 || cellVal === 2 || cellVal === 3) {
                        currentCount++;
                        if (currentCount === seatNum) {
                            seatType = cellVal;
                            break;
                        }
                    }
                }
            }
        }
    } catch (e) {}

    if (seatType === 2) {
        return basePrice + 15.0;
    }
    if (seatType === 3) {
        return basePrice - 10.0;
    }

    return basePrice;
}

exports.profile = async function (req, res) {
    const userId = req.session.user.id;
    const now = new Date();

    try {
        const [pricingRules] = await pool.query('Select * from pricing_rules');

        const sql = `
            Select b.id, b.seat_number, b.status, b.created_at,
                s.date, s.time, s.cancelled as screening_cancelled,
                m.title as movie_title, m.image_url,
                h.name as hall_name, h.layout_data
            from bookings b
            join screenings s on b.screening_id = s.id
            join movies m on s.movie_id = m.id
            join halls h on s.hall_id = h.id
            where b.user_id = ?
            order by b.created_at desc
        `;

        const [bookings] = await pool.query(sql, [userId]);

        const activeTickets = [];
        const historyTickets = [];
        const cancelledTickets = [];
        let totalHistorySpent = 0.0;

        for (let i = 0; i < bookings.length; i++) {
            const booking = bookings[i];
            const screeningDate = new Date(booking.date);
            const timeParts = booking.time.split(':');
            screeningDate.setHours(timeParts[0], timeParts[1], 0);

            booking.displayDate = screeningDate.toLocaleDateString('pl-PL');
            booking.displayTime = booking.time.toString().slice(0, 5);
            booking.created_at_formatted = new Date(booking.created_at).toLocaleDateString('pl-PL');

            let layoutArray = [];
            try {
                if (booking.layout_data) {
                    if (typeof booking.layout_data === 'string') {
                        layoutArray = JSON.parse(booking.layout_data);
                    } else {
                        layoutArray = booking.layout_data;
                    }
                }
            } catch (e) {}

            const priceVal = calculatePrice(booking, layoutArray, pricingRules);
            booking.price = priceVal.toFixed(2);

            const status = booking.status ? booking.status.toLowerCase() : '';
            const isScreeningCancelled = booking.screening_cancelled == 1;
            const isTicketCancelled =
                status === 'cancelled' || status === 'anulowany' || status === 'zwrócony';

            if (isTicketCancelled || isScreeningCancelled) {
                cancelledTickets.push(booking);
            } else if (screeningDate < now) {
                historyTickets.push(booking);
                if (status === 'paid' || status === 'finished' || status === 'booked') {
                    totalHistorySpent += priceVal;
                }
            } else {
                activeTickets.push(booking);
            }
        }

        let message = req.query.message;
        if (!message) {
            message = req.query.msg;
        }

        res.render('accountUser', {
            title: 'Moje Konto',
            user: req.session.user,
            activeTickets: activeTickets,
            historyTickets: historyTickets,
            cancelledTickets: cancelledTickets,
            activeCount: activeTickets.length,
            historyCount: historyTickets.length,
            cancelledCount: cancelledTickets.length,
            totalHistorySpent: totalHistorySpent.toFixed(2),
            message: message,
            error: req.query.error
        });
    } catch (err) {
        console.error('Błąd ładowania profilu:', err);
        res.redirect('/?error=Błąd ładowania profilu');
    }
};

exports.cancelTicket = async function (req, res) {
    const bookingId = req.body.bookingId;
    const userId = req.session.user.id;

    console.log('[CANCEL] User ' + userId + ' próbuje anulować bilet ' + bookingId);

    if (!bookingId) {
        return res.status(400).json({ success: false, message: 'Brak ID' });
    }

    try {
        const sqlCheck = `
            Select b.id
            from bookings b
            join screenings s on b.screening_id = s.id
            where b.id = ? and b.user_id = ?
                and concat(s.date, ' ', s.time) > now()
                and b.status != 'cancelled'
        `;

        const [check] = await pool.query(sqlCheck, [bookingId, userId]);

        if (check.length === 0) {
            return res.status(403).json({
                success: false,
                message: 'Nie można zwrócić biletu (zbyt późno lub brak uprawnień).'
            });
        }

        await pool.query("update bookings set status = 'cancelled' where id = ?", [bookingId]);

        console.log('[CANCEL SUCCESS] Bilet ' + bookingId + ' anulowany.');
        res.json({ success: true, message: 'Bilet został zwrócony.' });
    } catch (err) {
        console.error('[CANCEL ERROR]', err);
        res.status(500).json({ success: false, message: 'Błąd serwera: ' + err.message });
    }
};

exports.changePassword = async function (req, res) {
    const oldPassword = req.body.oldPassword;
    const newPassword = req.body.newPassword;
    const confirmPassword = req.body.confirmPassword;
    const userId = req.session.user.id;

    try {
        if (newPassword !== confirmPassword) {
            return res.redirect('/profil?error=Hasła nie są identyczne#section-password');
        }

        const [users] = await pool.query('Select password_hash from users where id = ?', [userId]);

        if (users.length === 0) {
            return res.redirect('/logowanie');
        }

        const currentUser = users[0];

        const isMatch = await bcrypt.compare(oldPassword, currentUser.password_hash);

        if (!isMatch) {
            return res.redirect('/profil?error=Stare hasło jest nieprawidłowe#section-password');
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await pool.query('update users set password_hash = ? where id = ?', [newHash, userId]);

        res.redirect('/profil?message=Hasło zostało zmienione#section-password');
    } catch (err) {
        console.error('Błąd hasła:', err);
        res.redirect('/profil?error=Wystąpił błąd serwera#section-password');
    }
};

exports.deleteAccount = async function (req, res) {
    const password = req.body.password;
    const userId = req.session.user.id;

    try {
        const [users] = await pool.query('Select password_hash from users where id = ?', [userId]);
        if (users.length === 0) {
            return res.redirect('/logowanie');
        }

        const isMatch = await bcrypt.compare(password, users[0].password_hash);

        if (!isMatch) {
            return res.redirect('/profil?error=Błędne hasło#section-delete');
        }

        await pool.query('delete from users where id = ?', [userId]);
        req.session.destroy(function () {
            res.redirect('/logowanie?message=Konto usunięte');
        });
    } catch (err) {
        console.error('Błąd usuwania:', err);
        res.redirect('/profil?error=Nie można usunąć konta#section-delete');
    }
};
