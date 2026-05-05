const db = require('../db/connection');
const bcrypt = require('bcryptjs');
const screeningValidation = require('../utils/screeningValidation');

function countFromAggregateRow(row) {
    if (!row || row.count === undefined || row.count === null) {
        return 0;
    }

    const n = Number(row.count);

    if (Number.isFinite(n)) {
        return n;
    }

    return 0;
}

function normalizeHallRow(hallRow) {
    let layoutJson = hallRow.layout_data;

    if (layoutJson != null && typeof layoutJson !== 'string') {
        try {
            layoutJson = JSON.stringify(layoutJson);
        } catch (e) {
            layoutJson = '';
        }
    }

    if (layoutJson == null) {
        layoutJson = '';
    }

    const hallOut = Object.assign({}, hallRow);
    hallOut.layout_data = layoutJson;

    return hallOut;
}

exports.dashboard = async function (req, res) {
    let halls = [];
    let hallsFull = [];
    let hallsLayoutMapJson = '{}';

    try {
        const [hallsRows] = await db.execute('Select id, name, seats from halls order by name asc');

        const [hallsFullRows] = await db.execute(
            'Select id, name, seats, layout_data, created_at from halls order by created_at asc'
        );

        halls = Array.isArray(hallsRows) ? hallsRows : [];

        const hallsFullRaw = Array.isArray(hallsFullRows) ? hallsFullRows : [];

        hallsFull = [];

        for (let hallIdx = 0; hallIdx < hallsFullRaw.length; hallIdx++) {
            hallsFull.push(normalizeHallRow(hallsFullRaw[hallIdx]));
        }

        const hallLayoutById = {};

        for (let mapIdx = 0; mapIdx < hallsFull.length; mapIdx++) {
            hallLayoutById[String(hallsFull[mapIdx].id)] = hallsFull[mapIdx].layout_data;
        }

        hallsLayoutMapJson = JSON.stringify(hallLayoutById);
    } catch (hallErr) {
        console.error('Admin — odczyt sal:', hallErr.message || hallErr);
    }

    function emptyDashboard() {
        res.render('Admin', {
            error: 'Błąd bazy danych przy ładowaniu panelu.',
            title: 'Panel Administratora',
            movies: [],
            activeMovies: [],
            activeScreenings: [],
            users: [],
            halls: halls,
            hallsFull: hallsFull,
            hallsLayoutMapJson: hallsLayoutMapJson,
            screenings: [],
            bookings: [],
            stats: { users: 0, employees: 0, movies: 0, tickets: 0, revenue: 0 },
            topMovies: [],
            recentTransactions: []
        });
    }

    try {
        const queryResults = await Promise.all([
            db.execute('Select * from movies order by created_at desc'),
            db.execute('Select id, name, email, role, created_at from users order by created_at desc'),
            db.execute(
                'Select * from movies where end_date >= curdate() or end_date is null order by title asc'
            ),
            db.execute(`
                Select s.id, s.movie_id, s.hall_id, s.date, s.time, s.cancelled, s.created_at,
                    m.title as movie_title, h.name as hall_name
                from screenings s
                join movies m on s.movie_id = m.id
                join halls h on s.hall_id = h.id
                order by s.date desc, s.time desc
            `),
            db.execute(`
                Select b.id, b.user_id, b.screening_id, b.seat_number, b.status, b.created_at,
                    u.email as user_email, m.title as movie_title, m.id as movie_id,
                    s.date as screening_date, s.time as screening_time, h.name as hall_name
                from bookings b
                left join users u on b.user_id = u.id
                left join screenings s on b.screening_id = s.id
                left join movies m on s.movie_id = m.id
                left join halls h on s.hall_id = h.id
                order by b.created_at desc
            `),
            db.execute("Select count(*) as count from users where role = 'user'"),
            db.execute("Select count(*) as count from users where role = 'employee'"),
            db.execute('Select count(*) as count from movies'),
            db.execute("Select count(*) as count from bookings where status = 'paid'"),
            db.execute(`
                Select m.title, count(b.id) as tickets_sold
                from bookings b
                join screenings s on b.screening_id = s.id
                join movies m on s.movie_id = m.id
                where b.status = 'paid'
                group by m.id, m.title
                order by tickets_sold desc
                limit 5
            `),
            db.execute(`
                Select b.id, b.created_at, b.seat_number, b.status, u.email, m.title
                from bookings b
                left join users u on b.user_id = u.id
                left join screenings s on b.screening_id = s.id
                left join movies m on s.movie_id = m.id
                order by b.created_at desc
                limit 10
            `),
            db.execute(`
                Select s.id, s.date, s.time, m.title as movie_title, h.name as hall_name
                from screenings s
                join movies m on s.movie_id = m.id
                join halls h on s.hall_id = h.id
                where s.cancelled = 0
                    and (s.date > curdate() or (s.date = curdate() and s.time > curtime()))
                order by s.date asc, s.time asc
            `)
        ]);

        const movies = queryResults[0][0];
        const users = queryResults[1][0];
        const activeMovies = queryResults[2][0];
        const screeningsRaw = queryResults[3][0];
        const bookingsRaw = queryResults[4][0];
        const usersCount = queryResults[5][0];
        const employeesCount = queryResults[6][0];
        const moviesCount = queryResults[7][0];
        const ticketsCount = queryResults[8][0];
        const topMovies = queryResults[9][0];
        const recentTransactions = queryResults[10][0];
        const activeScreenings = queryResults[11][0];

        const totalRevenue = countFromAggregateRow(ticketsCount[0]) * 25;
        const now = new Date();

        const bookingsSourceRows = Array.isArray(bookingsRaw) ? bookingsRaw : [];
        const bookings = [];

        for (let bi = 0; bi < bookingsSourceRows.length; bi++) {
            const bookingRow = bookingsSourceRows[bi];
            const screeningDate = new Date(bookingRow.screening_date);

            if (bookingRow.screening_time) {
                const hourMinute = bookingRow.screening_time.split(':');
                screeningDate.setHours(hourMinute[0], hourMinute[1], 0);
            }

            let displayStatus = bookingRow.status;

            if (screeningDate < now && bookingRow.status === 'paid') {
                displayStatus = 'finished';
            }

            const bookingOut = Object.assign({}, bookingRow);
            bookingOut.displayStatus = displayStatus;
            bookings.push(bookingOut);
        }

        const screeningsSourceRows = Array.isArray(screeningsRaw) ? screeningsRaw : [];
        const screenings = [];

        for (let si = 0; si < screeningsSourceRows.length; si++) {
            const screeningRow = screeningsSourceRows[si];
            const screeningDateTime = new Date(screeningRow.date);
            const hourMinute2 = screeningRow.time.split(':');
            screeningDateTime.setHours(hourMinute2[0], hourMinute2[1], 0);

            const isFinished = screeningDateTime < now;
            let statusText = 'Aktywny';

            if (screeningRow.cancelled) {
                statusText = 'Anulowany';
            } else if (isFinished) {
                statusText = 'Zakończony';
            }

            const screeningOut = Object.assign({}, screeningRow);
            screeningOut.isFinished = isFinished;
            screeningOut.statusText = statusText;
            screenings.push(screeningOut);
        }

        const topMoviesSourceRows = Array.isArray(topMovies) ? topMovies : [];
        const topMoviesSafe = [];

        for (let ti = 0; ti < topMoviesSourceRows.length; ti++) {
            const topMovieRow = topMoviesSourceRows[ti];
            const topMovieOut = Object.assign({}, topMovieRow);
            topMovieOut.tickets_sold = Number(topMovieRow.tickets_sold) || 0;
            topMoviesSafe.push(topMovieOut);
        }

        res.render('Admin', {
            title: 'Panel Administratora',
            movies,
            activeMovies,
            activeScreenings,
            users,
            halls,
            hallsFull,
            hallsLayoutMapJson,
            screenings,
            bookings,
            stats: {
                users: countFromAggregateRow(usersCount[0]),
                employees: countFromAggregateRow(employeesCount[0]),
                movies: countFromAggregateRow(moviesCount[0]),
                tickets: countFromAggregateRow(ticketsCount[0]),
                revenue: totalRevenue
            },
            topMovies: topMoviesSafe,
            recentTransactions
        });
    } catch (err) {
        console.error('Błąd ładowania dashboardu:', err.message || err);
        emptyDashboard();
    }
};

exports.redirectHalls = function (req, res) {
    res.redirect('/admin#halls');
};

exports.moviesAdd = async function (req, res) {
    const movieTitle = req.body.title;
    const movieDescription = req.body.description;
    const releaseDate = req.body.release_date;
    let endDate = req.body.end_date;

    if (!endDate) {
        endDate = null;
    }

    const durationMinutes = req.body.duration;
    const posterImageUrl = req.body.image_url;
    const trailerYoutubeUrl = req.body.youtube_link;

    try {
        await db.execute(
            `insert into movies (title, description, release_date, end_date, duration, image_url, youtube_link) values (?, ?, ?, ?, ?, ?, ?)`,
            [
                movieTitle,
                movieDescription,
                releaseDate,
                endDate,
                durationMinutes,
                posterImageUrl,
                trailerYoutubeUrl
            ]
        );

        res.redirect('/admin#movies');
    } catch (err) {
        console.error('Błąd dodawania filmu:', err);
        res.redirect('/admin?error=add_failed');
    }
};

exports.moviesEdit = async function (req, res) {
    const movieId = req.body.id;
    const movieTitle = req.body.title;
    const movieDescription = req.body.description;
    const releaseDate = req.body.release_date;
    let endDate = req.body.end_date;

    if (!endDate) {
        endDate = null;
    }

    const durationMinutes = req.body.duration;
    const posterImageUrl = req.body.image_url;
    const trailerYoutubeUrl = req.body.youtube_link;

    try {
        await db.execute(
            `update movies set title=?, description=?, release_date=?, end_date=?, duration=?, image_url=?, youtube_link=? where id=?`,
            [
                movieTitle,
                movieDescription,
                releaseDate,
                endDate,
                durationMinutes,
                posterImageUrl,
                trailerYoutubeUrl,
                movieId
            ]
        );

        res.redirect('/admin#movies');
    } catch (err) {
        console.error('Błąd edycji filmu:', err);
        res.redirect('/admin?error=edit_failed');
    }
};

exports.moviesDelete = async function (req, res) {
    const movieId = req.body.id;

    try {
        await db.execute('delete from movies where id = ?', [movieId]);
        res.redirect('/admin#movies');
    } catch (err) {
        console.error('Błąd usuwania filmu:', err);
        res.redirect('/admin?error=delete_failed');
    }
};

exports.screeningsAdd = async function (req, res) {
    const movieId = req.body.movie_id;
    const hallId = req.body.hall_id;
    const screeningDateTimeLocal = req.body.date_time;

    try {
        const dateTimeParts = String(screeningDateTimeLocal || '').split('T');
        const screeningDate = dateTimeParts[0];
        const screeningTime = dateTimeParts[1];

        if (!screeningDate || !screeningTime) {
            res.redirect('/admin?error=screening_invalid_input#screenings');

            return;
        }

        const slotCheck = await screeningValidation.validateScreeningSlot(db, {
            movieId,
            hallId,
            screeningDate,
            screeningTime,
            excludeScreeningId: null
        });

        if (!slotCheck.ok) {
            res.redirect('/admin?error=' + slotCheck.code + '#screenings');

            return;
        }

        await db.execute(`insert into screenings (movie_id, hall_id, date, time) values (?, ?, ?, ?)`, [
            movieId,
            hallId,
            screeningDate,
            screeningTime
        ]);

        res.redirect('/admin#screenings');
    } catch (err) {
        console.error('Błąd dodawania seansu:', err);
        res.redirect('/admin?error=screening_add_failed#screenings');
    }
};

exports.screeningsEdit = async function (req, res) {
    const screeningId = req.body.id;
    const movieId = req.body.movie_id;
    const hallId = req.body.hall_id;
    const screeningDateTimeLocal = req.body.date_time;
    const cancelledCheckbox = req.body.cancelled;

    let isScreeningCancelled = 0;

    if (cancelledCheckbox === 'on') {
        isScreeningCancelled = 1;
    }

    try {
        const pastInfo = await screeningValidation.screeningIsPast(db, screeningId);

        if (pastInfo.missing || pastInfo.past) {
            res.redirect('/admin?error=screening_past_locked#screenings');

            return;
        }

        const dateTimeParts = String(screeningDateTimeLocal || '').split('T');
        const screeningDate = dateTimeParts[0];
        const screeningTime = dateTimeParts[1];

        if (!screeningDate || !screeningTime) {
            res.redirect('/admin?error=screening_invalid_input#screenings');

            return;
        }

        const slotCheck = await screeningValidation.validateScreeningSlot(db, {
            movieId,
            hallId,
            screeningDate,
            screeningTime,
            excludeScreeningId: screeningId
        });

        if (!slotCheck.ok) {
            res.redirect('/admin?error=' + slotCheck.code + '#screenings');

            return;
        }

        await db.execute(`update screenings set movie_id=?, hall_id=?, date=?, time=?, cancelled=? where id=?`, [
            movieId,
            hallId,
            screeningDate,
            screeningTime,
            isScreeningCancelled,
            screeningId
        ]);

        res.redirect('/admin#screenings');
    } catch (err) {
        console.error('Błąd edycji seansu:', err);
        res.redirect('/admin?error=screening_edit_failed#screenings');
    }
};

exports.screeningsDelete = async function (req, res) {
    const screeningId = req.body.id;

    try {
        const pastInfo = await screeningValidation.screeningIsPast(db, screeningId);

        if (pastInfo.missing || pastInfo.past) {
            res.redirect('/admin?error=screening_past_locked#screenings');

            return;
        }

        await db.execute('delete from screenings where id = ?', [screeningId]);
        res.redirect('/admin#screenings');
    } catch (err) {
        console.error('Błąd usuwania seansu:', err);
        res.redirect('/admin?error=screening_delete_failed#screenings');
    }
};

exports.usersAdd = async function (req, res) {
    const userName = req.body.name;
    const userEmail = req.body.email;
    const plainPassword = req.body.password;
    const userRole = req.body.role;

    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(plainPassword, salt);

        await db.execute(`insert into users (name, email, password_hash, role) values (?, ?, ?, ?)`, [
            userName,
            userEmail,
            passwordHash,
            userRole
        ]);

        res.redirect('/admin#users');
    } catch (err) {
        console.error('Błąd dodawania użytkownika:', err);
        res.redirect('/admin?error=user_add_failed');
    }
};

exports.usersEdit = async function (req, res) {
    const userId = req.body.id;
    const userName = req.body.name;
    const userEmail = req.body.email;
    const plainPassword = req.body.password;
    const userRole = req.body.role;

    let updateSql = 'update users set name=?, email=?, role=?';
    let updateParams = [userName, userEmail, userRole];

    try {
        if (plainPassword) {
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(plainPassword, salt);
            updateSql += ', password_hash = ?';
            updateParams.push(passwordHash);
        }

        updateSql += ' where id = ?';
        updateParams.push(userId);

        await db.execute(updateSql, updateParams);

        res.redirect('/admin#users');
    } catch (err) {
        console.error('Błąd edycji użytkownika:', err);
        res.redirect('/admin?error=user_edit_failed');
    }
};

exports.usersDelete = async function (req, res) {
    const userId = req.body.id;

    try {
        await db.execute('delete from users where id = ?', [userId]);
        res.redirect('/admin#users');
    } catch (err) {
        console.error('Błąd usuwania użytkownika:', err);
        res.redirect('/admin?error=user_delete_failed');
    }
};

exports.hallsSave = async function (req, res) {
    const hallId = req.body.id;
    const hallName = req.body.name;
    const hallLayoutJson = req.body.layout_data;
    const seatsField = req.body.seats;
    const seatCount = parseInt(seatsField) || 0;

    try {
        if (hallId) {
            await db.execute(`update halls set name=?, layout_data=?, seats=? where id=?`, [
                hallName,
                hallLayoutJson,
                seatCount,
                hallId
            ]);
        } else {
            await db.execute(`insert into halls (name, layout_data, seats) values (?, ?, ?)`, [
                hallName,
                hallLayoutJson,
                seatCount
            ]);
        }

        res.redirect('/admin#halls');
    } catch (err) {
        console.error('Błąd zapisu sali:', err);
        res.redirect('/admin?error=hall_save_failed');
    }
};

exports.hallsDelete = async function (req, res) {
    const hallId = req.body.id;

    try {
        await db.execute('delete from halls where id = ?', [hallId]);
        res.redirect('/admin#halls');
    } catch (err) {
        console.error('Błąd usuwania sali:', err);
        res.redirect('/admin?error=hall_delete_failed');
    }
};

exports.bookingsAdd = async function (req, res) {
    const userId = req.body.user_id;
    const screeningId = req.body.screening_id;
    const seatCode = req.body.seat_number;
    let bookingStatus = req.body.status;

    if (!bookingStatus) {
        bookingStatus = 'paid';
    }

    try {
        await db.execute(
            `insert into bookings (user_id, screening_id, seat_number, status, created_at) values (?, ?, ?, ?, now())`,
            [userId, screeningId, seatCode, bookingStatus]
        );

        res.redirect('/admin#bookings');
    } catch (err) {
        console.error('Błąd dodawania rezerwacji:', err);
        res.redirect('/admin?error=booking_add_failed');
    }
};

exports.bookingsEdit = async function (req, res) {
    const bookingId = req.body.id;
    const userId = req.body.user_id;
    const screeningId = req.body.screening_id;
    const seatCode = req.body.seat_number;
    const bookingStatus = req.body.status;

    try {
        await db.execute(`update bookings set user_id=?, screening_id=?, seat_number=?, status=? where id=?`, [
            userId,
            screeningId,
            seatCode,
            bookingStatus,
            bookingId
        ]);

        res.redirect('/admin#bookings');
    } catch (err) {
        console.error('Błąd edycji rezerwacji:', err);
        res.redirect('/admin?error=booking_edit_failed');
    }
};

exports.bookingsDelete = async function (req, res) {
    const bookingId = req.body.id;

    try {
        await db.execute('delete from bookings where id = ?', [bookingId]);
        res.redirect('/admin#bookings');
    } catch (err) {
        console.error('Błąd usuwania rezerwacji:', err);
        res.redirect('/admin?error=booking_delete_failed');
    }
};

exports.redirectStats = function (req, res) {
    res.redirect('/admin#stats');
};

exports.chartData = async function (req, res) {
    let chartRangeType = req.query.type;

    if (!chartRangeType) {
        chartRangeType = 'today';
    }

    let chartMetricType = req.query.dataType;

    if (!chartMetricType) {
        chartMetricType = 'tickets';
    }

    const now = new Date();

    try {
        let chartLabels = [];
        let chartValues = [];
        let sqlQuery = '';

        const countExpression =
            chartMetricType === 'revenue' ? 'count(*) * 25' : 'count(*)';

        if (chartRangeType === 'today') {
            for (let hourIdx = 0; hourIdx < 24; hourIdx++) {
                chartLabels.push(hourIdx + ':00');
            }

            chartValues = new Array(24).fill(0);

            sqlQuery = `
                Select hour(created_at) as label, ${countExpression} as count
                from bookings
                where status = 'paid' and date(created_at) = curdate()
                group by hour(created_at)
            `;

            const [rowsToday] = await db.execute(sqlQuery);

            for (let ri = 0; ri < rowsToday.length; ri++) {
                const row = rowsToday[ri];
                chartValues[row.label] = row.count;
            }
        } else if (chartRangeType === 'month') {
            const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

            for (let dayNum = 1; dayNum <= daysInMonth; dayNum++) {
                chartLabels.push(String(dayNum));
            }

            chartValues = new Array(daysInMonth).fill(0);

            sqlQuery = `
                Select day(created_at) as label, ${countExpression} as count
                from bookings
                where status = 'paid'
                    and month(created_at) = month(now())
                    and year(created_at) = year(now())
                group by day(created_at)
            `;

            const [rowsMonth] = await db.execute(sqlQuery);

            for (let ri2 = 0; ri2 < rowsMonth.length; ri2++) {
                const row = rowsMonth[ri2];
                chartValues[row.label - 1] = row.count;
            }
        } else if (chartRangeType === 'year') {
            const monthNamesShort = [
                'Sty',
                'Lut',
                'Mar',
                'Kwi',
                'Maj',
                'Cze',
                'Lip',
                'Sie',
                'Wrz',
                'Paź',
                'Lis',
                'Gru'
            ];

            chartLabels = monthNamesShort;
            chartValues = new Array(12).fill(0);

            sqlQuery = `
                Select month(created_at) as label, ${countExpression} as count
                from bookings
                where status = 'paid' and year(created_at) = year(now())
                group by month(created_at)
            `;

            const [rowsYear] = await db.execute(sqlQuery);

            for (let ri3 = 0; ri3 < rowsYear.length; ri3++) {
                const row = rowsYear[ri3];
                chartValues[row.label - 1] = row.count;
            }
        }

        res.json({ labels: chartLabels, data: chartValues });
    } catch (err) {
        console.error('Błąd API wykresu:', err);
        res.status(500).json({ error: 'Server error' });
    }
};
