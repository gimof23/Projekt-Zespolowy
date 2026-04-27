const db = require('../db/connection');
const screeningValidation = require('../utils/screeningValidation');

function calculateExactPrice(booking, layout, pricingRules) {
    const screeningDate = new Date(booking.screening_date);
    const bookingDate = new Date(booking.created_at);

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

exports.dashboard = async function (req, res) {
    try {
        const [pricingRules] = await db.query('Select * from pricing_rules');

        const [todaysBookings] = await db.execute(`
            Select b.seat_number, b.created_at, s.date as screening_date, h.layout_data
            from bookings b
            join screenings s on b.screening_id = s.id
            join halls h on s.hall_id = h.id
            where date(b.created_at) = curdate()
                and (b.status = 'paid' or b.status = 'sold_pos')
        `);

        let totalRevenue = 0.0;
        for (let i = 0; i < todaysBookings.length; i++) {
            const booking = todaysBookings[i];
            let layoutArray = [];
            try {
                if (typeof booking.layout_data === 'string') {
                    layoutArray = JSON.parse(booking.layout_data);
                } else {
                    layoutArray = booking.layout_data;
                }
            } catch (e) {}

            const price = calculateExactPrice(booking, layoutArray, pricingRules);
            totalRevenue += price;
        }

        const ticketsSold = todaysBookings.length;

        const [screenings] = await db.execute(`
            Select s.id, s.date, s.time, s.cancelled, s.movie_id, s.hall_id,
                m.title as movie_title, m.image_url, h.name as hall_name,
                (select count(*) from bookings b where b.screening_id = s.id and (b.status = 'paid' or b.status = 'booked')) as sold_count,
                h.seats as total_seats
            from screenings s
            join movies m on s.movie_id = m.id
            join halls h on s.hall_id = h.id
            where (s.date > curdate()) or (s.date = curdate() and s.time > curtime())
            order by s.date asc, s.time asc
        `);

        const [activeMovies] = await db.execute(
            'Select * from movies where end_date >= curdate() or end_date is null order by title asc'
        );
        const [halls] = await db.execute('Select id, name, seats from halls order by name asc');

        const formattedScreenings = [];
        for (let j = 0; j < screenings.length; j++) {
            const s = screenings[j];
            let occupancy = 0;
            if (s.total_seats > 0) {
                occupancy = Math.round((s.sold_count / s.total_seats) * 100);
            }
            const isFinished = false;

            const row = Object.assign({}, s);
            row.displayDate = new Date(s.date).toLocaleDateString('pl-PL');
            row.time = s.time.slice(0, 5);
            row.occupancy = occupancy;
            row.isFinished = isFinished;
            formattedScreenings.push(row);
        }

        res.render('Employee', {
            title: 'Panel Pracownika',
            user: req.session.user,
            stats: {
                tickets_sold: ticketsSold,
                revenue: totalRevenue.toFixed(2)
            },
            screenings: formattedScreenings,
            activeMovies: activeMovies,
            halls: halls,
            layout: 'main'
        });
    } catch (err) {
        console.error('Błąd panelu pracownika:', err);
        res.redirect('/');
    }
};

exports.screeningsAdd = async function (req, res) {
    const movie_id = req.body.movie_id;
    const hall_id = req.body.hall_id;
    const date_time = req.body.date_time;

    try {
        const dtParts = String(date_time || '').split('T');
        const date = dtParts[0];
        const time = dtParts[1];

        if (!date || !time) {
            res.redirect('/employee?error=screening_invalid_input');

            return;
        }

        const slotCheck = await screeningValidation.validateScreeningSlot(db, {
            movieId: movie_id,
            hallId: hall_id,
            screeningDate: date,
            screeningTime: time,
            excludeScreeningId: null
        });

        if (!slotCheck.ok) {
            res.redirect('/employee?error=' + slotCheck.code);

            return;
        }

        await db.execute(`insert into screenings (movie_id, hall_id, date, time) values (?, ?, ?, ?)`, [
            movie_id,
            hall_id,
            date,
            time
        ]);
        res.redirect('/employee');
    } catch (err) {
        console.error('Błąd dodawania:', err);
        res.redirect('/employee?error=add_failed');
    }
};

exports.screeningsEdit = async function (req, res) {
    const id = req.body.id;
    const movie_id = req.body.movie_id;
    const hall_id = req.body.hall_id;
    const date_time = req.body.date_time;
    const cancelled = req.body.cancelled;
    let isCancelled = 0;

    if (cancelled === 'on') {
        isCancelled = 1;
    }

    try {
        const pastInfo = await screeningValidation.screeningIsPast(db, id);

        if (pastInfo.missing || pastInfo.past) {
            res.redirect('/employee?error=screening_past_locked');

            return;
        }

        const dtParts = String(date_time || '').split('T');
        const date = dtParts[0];
        const time = dtParts[1];

        if (!date || !time) {
            res.redirect('/employee?error=screening_invalid_input');

            return;
        }

        const slotCheck = await screeningValidation.validateScreeningSlot(db, {
            movieId: movie_id,
            hallId: hall_id,
            screeningDate: date,
            screeningTime: time,
            excludeScreeningId: id
        });

        if (!slotCheck.ok) {
            res.redirect('/employee?error=' + slotCheck.code);

            return;
        }

        await db.execute(`update screenings set movie_id=?, hall_id=?, date=?, time=?, cancelled=? where id=?`, [
            movie_id,
            hall_id,
            date,
            time,
            isCancelled,
            id
        ]);
        res.redirect('/employee');
    } catch (err) {
        console.error('Błąd edycji:', err);
        res.redirect('/employee?error=edit_failed');
    }
};

exports.screeningsDelete = async function (req, res) {
    const id = req.body.id;

    try {
        const pastInfo = await screeningValidation.screeningIsPast(db, id);

        if (pastInfo.missing || pastInfo.past) {
            res.redirect('/employee?error=screening_past_locked');

            return;
        }

        await db.execute('delete from screenings where id = ?', [id]);
        res.redirect('/employee');
    } catch (err) {
        console.error('Błąd usuwania:', err);
        res.redirect('/employee?error=delete_failed');
    }
};

exports.getMoviesList = async function (req, res) {
    try {
        const [movies] = await db.execute(
            'Select id, title from movies where end_date >= curdate() or end_date is null order by title asc'
        );
        res.json({ success: true, movies: movies });
    } catch (e) {
        res.status(500).json({ success: false, message: e.message });
    }
};

exports.apiTickets = async function (req, res) {
    const email = req.query.email;
    const movieId = req.query.movieId;
    const date = req.query.date;
    const page = req.query.page;
    const limit = req.query.limit;

    const pageNum = Math.max(1, parseInt(String(page), 10) || 1);
    const pageSize = Math.min(50, Math.max(1, parseInt(String(limit), 10) || 10));
    try {
        const fromSql = `
            from bookings b
            join screenings s on b.screening_id = s.id
            join movies m on s.movie_id = m.id
            join users u on b.user_id = u.id
            where 1 = 1
        `;
        const params = [];
        let whereExtra = '';

        if (email) {
            whereExtra += ' and u.email like ?';
            params.push('%' + email + '%');
        }

        if (movieId) {
            whereExtra += ' and m.id = ?';
            params.push(movieId);
        }

        if (date) {
            whereExtra += ' and s.date = ?';
            params.push(date);
        }

        const countSql = 'Select count(*) as cnt ' + fromSql + whereExtra;
        const countParams = params.slice();
        const [countRows] = await db.execute(countSql, countParams);

        let total = 0;
        if (countRows.length > 0 && countRows[0].cnt != null) {
            total = Number(countRows[0].cnt);
            if (isNaN(total)) {
                total = 0;
            }
        }

        const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize);
        let safePage = 1;
        if (totalPages === 0) {
            safePage = 1;
        } else {
            if (pageNum < totalPages) {
                safePage = pageNum;
            } else {
                safePage = totalPages;
            }
        }
        const offset = (safePage - 1) * pageSize;

        const dataSql =
            'Select b.id, b.seat_number, b.status, b.created_at,' +
            ' s.date, s.time, m.title as movie_title,' +
            ' u.email as user_email, u.name as user_name ' +
            fromSql +
            whereExtra +
            ' order by b.created_at desc limit ? offset ?';

        const dataParams = params.slice();
        dataParams.push(pageSize);
        dataParams.push(offset);
        const [tickets] = await db.execute(dataSql, dataParams);

        res.json({
            success: true,
            tickets: tickets,
            total: total,
            page: safePage,
            limit: pageSize,
            totalPages: totalPages
        });
    } catch (err) {
        console.error('Błąd wyszukiwania biletów:', err);
        res.status(500).json({ success: false, message: 'Błąd serwera: ' + err.message });
    }
};

exports.refundTicket = async function (req, res) {
    const ticketId = req.body.ticketId;
    try {
        await db.execute("update bookings set status = 'cancelled' where id = ?", [ticketId]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
