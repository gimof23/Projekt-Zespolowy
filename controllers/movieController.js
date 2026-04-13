const db = require('../db/connection');

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
