const db = require('../db/connection');

function formatPremiereDatePolish(dateString) {
    if (!dateString) {
        return 'Wkrótce';
    }

    const options = { year: 'numeric', month: 'long', day: 'numeric' };

    return new Date(dateString).toLocaleDateString('pl-PL', options);
}

function extractTrailerYoutubeId(trailerUrl) {
    if (!trailerUrl || typeof trailerUrl !== 'string') {
        return null;
    }

    try {
        const parsedUrl = new URL(trailerUrl);

        if (parsedUrl.hostname.includes('youtube.com')) {
            return parsedUrl.searchParams.get('v');
        }

        if (parsedUrl.hostname.includes('youtu.be')) {
            const pathSegments = parsedUrl.pathname.split('/');
            return pathSegments[pathSegments.length - 1];
        }
    } catch (e) {
        return null;
    }

    return null;
}

exports.index = async function (req, res) {
    try {
        const [moviesFromDb] = await db.execute(`
            Select *
            from movies
            where youtube_link is not null
                and release_date <= current_date()
                and (end_date >= current_date() or end_date is null)
            order by created_at desc
        `);

        const moviesWithTrailers = [];

        for (let i = 0; i < moviesFromDb.length; i++) {
            const movieRow = moviesFromDb[i];
            const trailerYoutubeId = extractTrailerYoutubeId(movieRow.youtube_link);

            if (trailerYoutubeId) {
                const movieForView = Object.assign({}, movieRow);
                movieForView.youtubeId = trailerYoutubeId;
                moviesWithTrailers.push(movieForView);
            }
        }

        res.render('index', {
            title: 'Strona Główna',
            movies: moviesWithTrailers
        });
    } catch (err) {
        console.error('Błąd pobierania filmów:', err);
        res.render('index', {
            title: 'Strona Główna',
            movies: [],
            error: 'Błąd bazy danych'
        });
    }
};

exports.premieres = async function (req, res) {
    try {
        const [upcomingMovies] = await db.execute(`
            Select * from movies
            where release_date > current_date()
            order by release_date asc
        `);

        const moviesForView = [];

        for (let i = 0; i < upcomingMovies.length; i++) {
            const movieRow = upcomingMovies[i];
            const movieForView = Object.assign({}, movieRow);
            movieForView.formattedDate = formatPremiereDatePolish(movieRow.release_date);
            moviesForView.push(movieForView);
        }

        res.render('premieres', {
            title: 'Zapowiedzi',
            movies: moviesForView
        });
    } catch (err) {
        console.error(err);
        res.render('premieres', { title: 'Zapowiedzi', error: 'Błąd bazy' });
    }
};

exports.repertuarPage = function (req, res) {
    res.render('repertory', { title: 'Repertuar' });
};

exports.apiRepertuar = async function (req, res) {
    try {
        let repertoireDay = req.query.date;

        if (!repertoireDay) {
            repertoireDay = new Date().toISOString().split('T')[0];
        }

        const sqlRepertoireByDay = `
            Select m.id as movie_id, m.title, m.duration, m.description, m.image_url,
                s.id as screening_id, s.time, h.name as hall_name
            from screenings s
            join movies m on s.movie_id = m.id
            join halls h on s.hall_id = h.id
            where s.date = ? and s.cancelled = 0
            order by m.title, s.time asc
        `;

        const [scheduleRows] = await db.execute(sqlRepertoireByDay, [repertoireDay]);
        const moviesGroupedById = {};

        for (let i = 0; i < scheduleRows.length; i++) {
            const scheduleRow = scheduleRows[i];
            const movieId = scheduleRow.movie_id;

            if (!moviesGroupedById[movieId]) {
                moviesGroupedById[movieId] = {
                    id: movieId,
                    title: scheduleRow.title,
                    duration: scheduleRow.duration,
                    description: scheduleRow.description,
                    image_url: scheduleRow.image_url,
                    genre: 'Film',
                    showtimes: []
                };
            }

            const timeShort = scheduleRow.time.slice(0, 5);

            moviesGroupedById[movieId].showtimes.push({
                id: scheduleRow.screening_id,
                time: timeShort,
                hall: scheduleRow.hall_name
            });
        }

        const moviesListForJson = [];

        for (const movieKey in moviesGroupedById) {
            if (Object.prototype.hasOwnProperty.call(moviesGroupedById, movieKey)) {
                moviesListForJson.push(moviesGroupedById[movieKey]);
            }
        }

        res.json({ movies: moviesListForJson });
    } catch (err) {
        console.error('Błąd API repertuaru:', err);
        res.status(500).json({ error: 'Błąd serwera podczas pobierania repertuaru' });
    }
};
