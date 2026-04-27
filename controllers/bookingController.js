const pool = require('../db/connection');
const { sendTicketEmail } = require('../utils/emailSender');
const { generateTicketPDF } = require('../utils/ticketGenerator');

exports.book = async function (req, res) {
    if (!req.session.isLoggedIn || !req.session.user) {
        return res.status(401).json({ success: false, message: 'Musisz być zalogowany.' });
    }

    const screeningId = req.body.screeningId;
    const selectedSeats = req.body.selectedSeats;
    const userId = req.session.user.id;
    const role = req.session.user.role;
    const isEmployee = role === 'employee' || role === 'admin';

    if (!selectedSeats || selectedSeats.length === 0) {
        return res.status(400).json({ success: false, message: 'Nie wybrano miejsc.' });
    }

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const sqlCheck =
            "Select seat_number from bookings where screening_id = ? and seat_number = ? and status = 'paid' for update";

        const sqlInsert =
            "insert into bookings (user_id, screening_id, seat_number, status, created_at) values (?, ?, ?, 'paid', now())";

        let mainReservationId = null;

        for (let i = 0; i < selectedSeats.length; i++) {
            const seatId = selectedSeats[i];
            const [existing] = await connection.query(sqlCheck, [screeningId, seatId]);
            if (existing.length > 0) {
                throw new Error('Miejsce ' + seatId + ' zostało już wykupione.');
            }

            const [result] = await connection.query(sqlInsert, [userId, screeningId, seatId]);

            if (mainReservationId === null) {
                mainReservationId = result.insertId;
            }
        }

        const sqlDetails = `
            Select m.title, s.date, s.time, h.name as hall_name, h.layout_data, u.email
            from screenings s
            join movies m on s.movie_id = m.id
            join halls h on s.hall_id = h.id
            join users u on u.id = ?
            where s.id = ?
        `;

        const [detailsResult] = await connection.query(sqlDetails, [userId, screeningId]);

        if (detailsResult.length > 0) {
            const info = detailsResult[0];

            const screeningDate = new Date(info.date);
            const now = new Date();
            const diffTime = screeningDate - now;
            let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 0) {
                diffDays = 0;
            }
            if (diffDays > 4) {
                diffDays = 4;
            }

            const [prices] = await connection.query(
                'Select price_base from pricing_rules where days_before = ? limit 1',
                [diffDays]
            );
            let basePrice = 25.0;
            if (prices.length > 0) {
                basePrice = parseFloat(prices[0].price_base);
            }

            let layout = [];
            try {
                layout = JSON.parse(info.layout_data);
                if (layout.length > 0 && !Array.isArray(layout[0])) {
                    const COLUMNS = 15;
                    const chunked = [];
                    for (let j = 0; j < layout.length; j += COLUMNS) {
                        chunked.push(layout.slice(j, j + COLUMNS));
                    }
                    layout = chunked;
                }
            } catch (e) {
                console.error('Błąd parsowania layoutu', e);
            }

            let totalSum = 0;
            const seatsListForPdf = [];

            for (let s = 0; s < selectedSeats.length; s++) {
                const seatId = selectedSeats[s];
                const parts = seatId.replace('R', '').split('-S');
                const rowIndex = parseInt(parts[0], 10) - 1;
                const seatNumber = parseInt(parts[1], 10);

                let seatType = 1;
                if (layout[rowIndex]) {
                    let currentSeatCount = 0;
                    const rowCells = layout[rowIndex];
                    for (let c = 0; c < rowCells.length; c++) {
                        const cellVal = parseInt(rowCells[c], 10);
                        if (cellVal === 1 || cellVal === 2 || cellVal === 3) {
                            currentSeatCount++;
                            if (currentSeatCount === seatNumber) {
                                seatType = cellVal;
                                break;
                            }
                        }
                    }
                }

                let finalPrice = basePrice;
                let typeLabel = 'Normalny';

                if (seatType === 2) {
                    finalPrice = basePrice + 15.0;
                    typeLabel = 'VIP (Kanapa)';
                } else if (seatType === 3) {
                    finalPrice = basePrice - 10.0;
                    typeLabel = 'Ulgowy';
                }

                totalSum += finalPrice;

                seatsListForPdf.push({
                    label: 'Rząd ' + parts[0] + ', M. ' + parts[1] + ' (' + typeLabel + ')',
                    price: finalPrice.toFixed(2)
                });
            }

            const ticketData = {
                movieTitle: info.title,
                date: new Date(info.date).toLocaleDateString('pl-PL'),
                time: info.time.toString().slice(0, 5),
                hallName: info.hall_name,
                hall: info.hall_name,
                seats: seatsListForPdf,
                totalPrice: totalSum.toFixed(2),
                reservationId: mainReservationId,
                employeeName: req.session.user.name
            };

            if (isEmployee) {
                await connection.commit();

                const seatLines = [];
                for (let k = 0; k < seatsListForPdf.length; k++) {
                    seatLines.push(seatsListForPdf[k].label + ' - ' + seatsListForPdf[k].price + ' PLN');
                }

                return res.render('miniTicket', {
                    layout: false,
                    movieTitle: ticketData.movieTitle,
                    date: ticketData.date,
                    time: ticketData.time,
                    hallName: ticketData.hallName,
                    hall: ticketData.hall,
                    seats: seatLines,
                    totalPrice: ticketData.totalPrice,
                    reservationId: ticketData.reservationId,
                    employeeName: ticketData.employeeName
                });
            }

            const pdfBuffer = await generateTicketPDF(ticketData);

            sendTicketEmail(info.email, ticketData, pdfBuffer).catch(function (err) {
                console.error('Błąd maila:', err);
            });

            await connection.commit();
            return res.json({ success: true, message: 'Zakup udany! Bilet wysłany.' });
        }

        await connection.commit();
        return res.status(500).json({ success: false, message: 'Błąd pobierania danych biletu.' });
    } catch (err) {
        await connection.rollback();
        console.error('Błąd rezerwacji:', err);
        let msg = 'Wystąpił błąd.';
        if (err.message && err.message.indexOf('Miejsce') !== -1) {
            msg = err.message;
        }
        res.status(409).json({ success: false, message: msg });
    } finally {
        connection.release();
    }
};

exports.chooseSeat = async function (req, res) {
    try {
        const screeningId = req.params.id;

        const sqlScreening = `
            Select s.id, s.date, s.time, m.title, m.image_url, h.name as hall_name, h.layout_data
            from screenings s
            join movies m on s.movie_id = m.id
            join halls h on s.hall_id = h.id
            where s.id = ?
        `;
        const [results] = await pool.query(sqlScreening, [screeningId]);

        if (results.length === 0) {
            return res.status(404).send('Nie znaleziono seansu.');
        }
        const screening = results[0];

        const screeningDate = new Date(screening.date);
        const now = new Date();
        const diffTime = screeningDate - now;
        let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            diffDays = 0;
        }
        if (diffDays > 4) {
            diffDays = 4;
        }

        const [prices] = await pool.query(
            'Select price_base from pricing_rules where days_before = ? limit 1',
            [diffDays]
        );

        let standardPrice = 25.0;

        if (prices.length > 0) {
            standardPrice = parseFloat(prices[0].price_base);
        }

        const wheelPrice = standardPrice - 10.0;
        const vipPrice = standardPrice + 15.0;

        const [bookings] = await pool.query(
            "Select seat_number from bookings where screening_id = ? and (status = 'paid' or status = 'booked')",
            [screeningId]
        );

        const bookedSeats = [];
        for (let b = 0; b < bookings.length; b++) {
            bookedSeats.push(bookings[b].seat_number);
        }

        let layoutArray = screening.layout_data;
        if (typeof layoutArray === 'string') {
            try {
                layoutArray = JSON.parse(layoutArray);
            } catch (e) {
                layoutArray = [];
            }
        }

        res.render('chooseSeat', {
            title: 'Wybór miejsc',
            movieTitle: screening.title,
            date: screeningDate.toLocaleDateString('pl-PL'),
            time: screening.time.toString().slice(0, 5),
            hallName: screening.hall_name,
            screeningId: screeningId,
            rows: layoutArray,
            bookedSeats: bookedSeats,
            movieImage: screening.image_url,
            priceStandard: standardPrice.toFixed(2),
            priceWheel: wheelPrice.toFixed(2),
            priceVip: vipPrice.toFixed(2)
        });
    } catch (err) {
        console.error('Błąd trasy /rezerwacja:', err);
        res.status(500).send('Błąd serwera: ' + err.message);
    }
};
