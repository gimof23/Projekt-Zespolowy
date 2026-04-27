function toDateOnlyString(value) {
    if (value == null) {
        return '';
    }

    if (typeof value === 'string') {
        return value.slice(0, 10);
    }

    if (value instanceof Date) {
        const y = value.getFullYear();
        const m = String(value.getMonth() + 1).padStart(2, '0');
        const d = String(value.getDate()).padStart(2, '0');

        return `${y}-${m}-${d}`;
    }

    return String(value).slice(0, 10);
}

function screeningInstantFromParts(screeningDate, screeningTime) {
    const dateStr = toDateOnlyString(screeningDate);
    const timeStr = String(screeningTime || '00:00:00');
    const parts = timeStr.split(':');
    const h = Number(parts[0]) || 0;
    const min = Number(parts[1]) || 0;
    const sec = Number(parts[2]) || 0;
    const ymd = dateStr.split('-').map((x) => Number(x));
    const y = ymd[0] || 1970;
    const mo = ymd[1] || 1;
    const da = ymd[2] || 1;
    const d = new Date(y, mo - 1, da, h, min, sec, 0);

    return d;
}

function addMinutes(date, minutes) {
    const out = new Date(date.getTime());

    out.setMinutes(out.getMinutes() + minutes);

    return out;
}

function compareDateOnlyToString(calendarDayStr, releaseDate, endDate) {
    const D = calendarDayStr;

    if (!D || D.length < 10) {
        return false;
    }

    if (releaseDate != null) {
        const r = toDateOnlyString(releaseDate);

        if (r && D < r) {
            return false;
        }
    }

    if (endDate != null) {
        const e = toDateOnlyString(endDate);

        if (e && D > e) {
            return false;
        }
    }

    return true;
}

exports.screeningInstantFromParts = screeningInstantFromParts;

exports.screeningIsPast = async function (db, screeningId) {
    const sid = Number(screeningId);

    if (!Number.isFinite(sid) || sid < 1) {
        return { past: false, missing: true };
    }

    const [rows] = await db.execute('select date, time from screenings where id = ? limit 1', [sid]);

    if (!rows.length) {
        return { past: false, missing: true };
    }

    const instant = screeningInstantFromParts(rows[0].date, rows[0].time);

    return { past: instant < new Date(), missing: false };
};

exports.validateScreeningSlot = async function (db, params) {
    const movieId = Number(params.movieId);
    const hallId = Number(params.hallId);
    const screeningDate = params.screeningDate;
    const screeningTime = params.screeningTime;
    let excludeScreeningId = params.excludeScreeningId;

    if (excludeScreeningId != null && excludeScreeningId !== '') {
        excludeScreeningId = Number(excludeScreeningId);
    } else {
        excludeScreeningId = null;
    }

    if (!Number.isFinite(movieId) || movieId < 1) {
        return { ok: false, code: 'screening_invalid_input' };
    }

    if (!Number.isFinite(hallId) || hallId < 1) {
        return { ok: false, code: 'screening_invalid_input' };
    }

    const dayStr = toDateOnlyString(screeningDate);

    if (!dayStr || dayStr.length < 10) {
        return { ok: false, code: 'screening_invalid_input' };
    }

    const [movieRows] = await db.execute(
        'select release_date, end_date, duration from movies where id = ? limit 1',
        [movieId]
    );

    if (!movieRows.length) {
        return { ok: false, code: 'screening_movie_not_in_repertoire' };
    }

    const movieRow = movieRows[0];
    const duration = Number(movieRow.duration);

    if (!Number.isFinite(duration) || duration < 1) {
        return { ok: false, code: 'screening_invalid_input' };
    }

    if (!compareDateOnlyToString(dayStr, movieRow.release_date, movieRow.end_date)) {
        return { ok: false, code: 'screening_movie_not_in_repertoire' };
    }

    const start = screeningInstantFromParts(screeningDate, screeningTime);
    const end = addMinutes(start, duration);

    let sql = `
        select s.id, s.date, s.time, m.duration as movie_duration
        from screenings s
        join movies m on s.movie_id = m.id
        where s.hall_id = ? and s.cancelled = 0
    `;
    const sqlParams = [hallId];

    if (excludeScreeningId != null && Number.isFinite(excludeScreeningId) && excludeScreeningId > 0) {
        sql += ' and s.id <> ?';
        sqlParams.push(excludeScreeningId);
    }

    const [otherRows] = await db.execute(sql, sqlParams);

    for (let i = 0; i < otherRows.length; i++) {
        const row = otherRows[i];
        const otherStart = screeningInstantFromParts(row.date, row.time);
        const otherDur = Number(row.movie_duration) || 0;
        const otherEnd = addMinutes(otherStart, otherDur);

        if (start < otherEnd && end > otherStart) {
            return { ok: false, code: 'screening_hall_overlap' };
        }
    }

    return { ok: true };
};
