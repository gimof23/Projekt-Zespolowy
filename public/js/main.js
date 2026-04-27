function initCarousel() {
    const trailerCarousel = document.getElementById('trailerCarousel');
    if (!trailerCarousel) return;

    const track = document.getElementById('carouselTrack');
    const nextButton = document.getElementById('nextBtn');
    const prevButton = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('dotsContainer');
    const slides = Array.from(track.children);

    if (slides.length === 0) return;

    let currentSlideIndex = 0;

    function stopAllVideos() {
        const iframes = trailerCarousel.querySelectorAll('iframe');
        for (let fi = 0; fi < iframes.length; fi++) {
            iframes[fi].contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
        }
    }

    function updateDots(index) {
        const dots = Array.from(dotsContainer.children);
        for (let di = 0; di < dots.length; di++) {
            const dot = dots[di];
            if (di === index) {
                dot.classList.remove('bg-stone-300', 'h-2', 'w-2');
                dot.classList.add('bg-rose-500', 'h-2.5', 'w-8');
            } else {
                dot.classList.add('bg-stone-300', 'h-2', 'w-2');
                dot.classList.remove('bg-rose-500', 'h-2.5', 'w-8');
            }
        }
    }

    function moveToSlide(targetIndex) {
        stopAllVideos();

        if (targetIndex < 0) {
            targetIndex = slides.length - 1;
        } else if (targetIndex >= slides.length) {
            targetIndex = 0;
        }

        track.style.transform = 'translateX(-' + targetIndex * 100 + '%)';
        updateDots(targetIndex);
        currentSlideIndex = targetIndex;
    }

    for (let index = 0; index < slides.length; index++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'h-2 w-2 rounded-full bg-stone-300 transition-all duration-300 hover:bg-stone-400';
        dot.setAttribute('aria-label', 'Slajd ' + (index + 1));
        if (index === 0) {
            dot.classList.remove('h-2', 'w-2', 'bg-stone-300');
            dot.classList.add('h-2.5', 'w-8', 'bg-rose-500');
        }

        (function (idx) {
            dot.addEventListener('click', function () {
                moveToSlide(idx);
            });
        })(index);

        dotsContainer.appendChild(dot);
    }

    nextButton.addEventListener('click', function () {
        moveToSlide(currentSlideIndex + 1);
    });

    prevButton.addEventListener('click', function () {
        moveToSlide(currentSlideIndex - 1);
    });
}

function initReportory() {
    const datesContainer = document.getElementById('datesContainer');
    const moviesContainer = document.getElementById('moviesContainer');

    if (!datesContainer || !moviesContainer) return;

    const templates = {
        dateCard: document.getElementById('date-card-template'),
        movieCard: document.getElementById('movie-card-template'),
        timeBtn: document.getElementById('time-btn-template'),
        noMovies: document.getElementById('no-movies-template')
    };

    if (!templates.dateCard || !templates.movieCard || !templates.timeBtn || !templates.noMovies) return;

    let currentDate = new Date().toISOString().split('T')[0];
    let repertuarAbort = null;
    let repertuarLoaderTimer = null;

    const repertuarLoaderHtml = `
            <div class="flex min-h-96 flex-col items-center justify-center gap-5 rounded-3xl border border-stone-200 bg-white/90 py-8 text-stone-500">
                <i class="fas fa-circle-notch fa-spin text-4xl text-rose-500"></i>
                <p class="text-base font-semibold text-stone-600">Ładujemy repertuar…</p>
            </div>`;

    function renderDates() {
        datesContainer.innerHTML = '';
        const today = new Date();
        const daysPl = ['Nd', 'Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb'];
        const monthsPl = ['.01', '.02', '.03', '.04', '.05', '.06', '.07', '.08', '.09', '.10', '.11', '.12'];

        for (let i = 0; i < 7; i++) {
            const d = new Date();
            d.setDate(today.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];

            let label = daysPl[d.getDay()];
            if (i === 0) label = 'Dziś';
            if (i === 1) label = 'Jutro';

            const dayDate = `${d.getDate() < 10 ? '0' + d.getDate() : d.getDate()}${monthsPl[d.getMonth()]}`;

            const clone = templates.dateCard.content.cloneNode(true);
            const btn = clone.querySelector('.date-card');

            clone.querySelector('.day-name').textContent = label;
            clone.querySelector('.day-date').textContent = dayDate;

            if (dateStr === currentDate) {
                btn.classList.add('is-active');
            }

            btn.addEventListener('click', function () {
                const allDateBtns = document.querySelectorAll('.date-card');
                for (let bi = 0; bi < allDateBtns.length; bi++) {
                    allDateBtns[bi].classList.remove('is-active');
                }
                btn.classList.add('is-active');
                currentDate = dateStr;
                loadMovies(dateStr);
            });

            datesContainer.appendChild(clone);
        }
    }

    async function loadMovies(date) {
        if (repertuarAbort) {
            repertuarAbort.abort();
        }
        if (repertuarLoaderTimer !== null) {
            clearTimeout(repertuarLoaderTimer);
            repertuarLoaderTimer = null;
        }

        repertuarAbort = new AbortController();
        const signal = repertuarAbort.signal;

        repertuarLoaderTimer = setTimeout(function () {
            repertuarLoaderTimer = null;
            if (date !== currentDate) {
                return;
            }
            moviesContainer.innerHTML = repertuarLoaderHtml;
        }, 200);

        try {
            const response = await fetch(`/api/repertuar?date=${date}`, { signal });
            if (!response.ok) throw new Error('Błąd API');

            const data = await response.json();

            if (repertuarLoaderTimer !== null) {
                clearTimeout(repertuarLoaderTimer);
                repertuarLoaderTimer = null;
            }

            if (date !== currentDate) {
                return;
            }

            renderMovies(data.movies);
        } catch (error) {
            if (repertuarLoaderTimer !== null) {
                clearTimeout(repertuarLoaderTimer);
                repertuarLoaderTimer = null;
            }

            if (error.name === 'AbortError') {
                return;
            }

            console.error(error);

            if (date !== currentDate) {
                return;
            }

            moviesContainer.innerHTML = `
                <div class="rounded-2xl border border-rose-200 bg-rose-50 py-12 text-center text-rose-800">
                    <p class="font-medium">Nie udało się pobrać repertuaru</p>
                </div>`;
        }
    }

    function renderMovies(movies) {
        moviesContainer.innerHTML = '';

        if (!movies || movies.length === 0) {
            moviesContainer.appendChild(templates.noMovies.content.cloneNode(true));
            return;
        }

        for (let mi = 0; mi < movies.length; mi++) {
            const movie = movies[mi];
            const cardClone = templates.movieCard.content.cloneNode(true);

            const img = cardClone.querySelector('.poster-img');
            const noPoster = cardClone.querySelector('.no-poster');

            if (movie.image_url) {
                img.src = movie.image_url;
                img.alt = movie.title;
                img.onerror = function () {
                    img.classList.add('hidden');
                    noPoster.classList.remove('hidden');
                    noPoster.classList.add('flex');
                };
            } else {
                img.classList.add('hidden');
                noPoster.classList.remove('hidden');
                noPoster.classList.add('flex');
            }

            cardClone.querySelector('.movie-title').textContent = movie.title;
            cardClone.querySelector('.movie-duration').textContent = movie.duration + ' min';
            cardClone.querySelector('.movie-genre').textContent = movie.genre || 'Kino';
            cardClone.querySelector('.movie-description').textContent = movie.description || '';

            const showtimesList = cardClone.querySelector('.showtimes-list');

            for (let si = 0; si < movie.showtimes.length; si++) {
                const show = movie.showtimes[si];
                const btnClone = templates.timeBtn.content.cloneNode(true);
                const link = btnClone.querySelector('.time-btn');

                const timeString = show.time.length > 5 ? show.time.slice(0, 5) : show.time;

                const now = new Date();

                const screeningDate = new Date(currentDate + 'T' + timeString);

                const cutoffTime = new Date(screeningDate.getTime() + 5 * 60000);

                if (now > cutoffTime) {
                    link.removeAttribute('href');
                    link.classList.add('cursor-not-allowed', 'opacity-50', 'pointer-events-none', 'bg-stone-200');
                    link.classList.remove('hover:border-rose-400', 'hover:bg-rose-500');
                    link.title = 'Sprzedaż zakończona';
                } else {
                    link.href = `/rezerwacja/${show.id}`;
                }

                if (link.querySelector('.time')) {
                    link.querySelector('.time').textContent = timeString;
                } else {
                    const timeSpan = document.createElement('span');
                    timeSpan.className = 'time text-rose-700';
                    timeSpan.textContent = timeString;
                    link.prepend(timeSpan);
                }

                btnClone.querySelector('.hall').textContent = show.hall;

                showtimesList.appendChild(btnClone);
            }

            moviesContainer.appendChild(cardClone);
        }
    }

    renderDates();
    loadMovies(currentDate);
}

function initPriceList() {
    const priceCards = document.querySelectorAll('.main-card');
    if (!priceCards.length) return;

    for (let pci = 0; pci < priceCards.length; pci++) {
        const card = priceCards[pci];
        const badgesContainer = card.querySelector('.price-options');
        if (!badgesContainer) {
            continue;
        }

        const badges = Array.from(badgesContainer.querySelectorAll('.price-badge'));
        const alertMain = card.querySelector('.price-alert-main');

        if (!alertMain) {
            continue;
        }

        for (let bj = 0; bj < badges.length; bj++) {
            const badge = badges[bj];
            badge.addEventListener('click', function () {
                const days = parseInt(badge.dataset.days, 10);
                if (days === 0) {
                    alertMain.textContent = 'Dzień seansu';
                } else {
                    alertMain.textContent = days + ' dni do seansu';
                }

                const accentClass = card.dataset.priceAccent === 'marathon' ? 'bg-amber-600' : 'bg-rose-600';

                for (let bk = 0; bk < badges.length; bk++) {
                    const b = badges[bk];
                    b.classList.remove(accentClass, 'text-white', 'border-rose-300', 'border-amber-300', 'hover:border-rose-300', 'hover:bg-rose-50', 'hover:border-amber-300', 'hover:bg-amber-50');
                    b.classList.add('border-stone-200', 'bg-white', 'text-stone-700');
                }

                badge.classList.add(accentClass, 'text-white');
                badge.classList.remove('border-stone-200', 'bg-white', 'text-stone-700');
            });

            if (badge.dataset.days === '4') {
                badge.click();
            }
        }
    }
}

function initAccountUser() {
    const cards = document.querySelectorAll('.user-card');
    const sections = document.querySelectorAll('.content-section');

    if (!cards.length || !sections.length) return;

    function styleCard(card, on) {
        const del = card.dataset.target === 'section-delete';
        card.classList.remove(
            'border-rose-300', 'border-rose-500', 'border-stone-200', 'border-rose-400',
            'bg-white', 'bg-rose-50', 'bg-rose-50/50', 'bg-stone-50/80',
            'ring-2', 'ring-rose-200', 'ring-rose-300', 'shadow-md'
        );

        if (on) {
            if (del) {
                card.classList.add('border-rose-500', 'bg-rose-50', 'ring-2', 'ring-rose-300', 'shadow-md');
            } else {
                card.classList.add('border-rose-300', 'bg-white', 'ring-2', 'ring-rose-200', 'shadow-md');
            }
        } else {
            if (del) {
                card.classList.add('border-rose-200', 'bg-rose-50/50');
            } else {
                card.classList.add('border-stone-200', 'bg-stone-50/80');
            }
        }
    }

    function activateTab(activeCard) {
        for (let ci = 0; ci < cards.length; ci++) {
            styleCard(cards[ci], cards[ci] === activeCard);
        }

        for (let sj = 0; sj < sections.length; sj++) {
            sections[sj].classList.add('hidden');
        }
        const sec = document.getElementById(activeCard.dataset.target);
        if (sec) {
            sec.classList.remove('hidden');
        }
    }

    const hash = window.location.hash;
    if (hash) {
        const targetId = hash.replace('#', '');
        const targetCard = document.querySelector(`.user-card[data-target="${targetId}"]`);
        if (targetCard) activateTab(targetCard);
    }

    for (let ck = 0; ck < cards.length; ck++) {
        const card = cards[ck];
        card.addEventListener('click', function () {
            activateTab(card);
        });
    }

    const returnBtns = document.querySelectorAll('.btn-return-ticket');
    for (let ri = 0; ri < returnBtns.length; ri++) {
        const btn = returnBtns[ri];
        btn.addEventListener('click', async function () {
            const bookingId = btn.dataset.id;

            if (!confirm('Czy na pewno chcesz zwrócić ten bilet? Pieniądze nie zostaną automatycznie zwrócone na konto bankowe (wymagany kontakt z obsługą), ale miejsce zostanie zwolnione.')) {
                return;
            }

            const originalContent = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Przetwarzanie...';
            btn.disabled = true;
            btn.classList.add('opacity-70');

            try {
                const response = await fetch('/profil/cancel-ticket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ bookingId: bookingId })
                });

                const result = await response.json();

                if (result.success) {
                    alert('Sukces! Bilet został zwrócony.');
                    window.location.reload();
                } else {
                    alert('Błąd: ' + result.message);
                    btn.innerHTML = originalContent;
                    btn.disabled = false;
                    btn.classList.remove('opacity-70');
                }
            } catch (err) {
                console.error(err);
                alert('Wystąpił błąd połączenia z serwerem.');
                btn.innerHTML = originalContent;
                btn.disabled = false;
                btn.classList.remove('opacity-70');
            }
        });
    }
}

function initChooseSeat() {
    const seatMap = document.getElementById('seat-map');
    if (!seatMap) return;

    const countSpan = document.getElementById('count');
    const totalSpan = document.getElementById('total');
    const checkoutBtn = document.getElementById('checkout-btn');
    const selectedSeatsInput = document.getElementById('selected-seats-input');
    const selectedSeatsList = document.getElementById('selected-seats-list');

    const modal = document.getElementById('confirmation-modal');
    const modalSeatsSummary = document.getElementById('modal-seats-summary');
    const modalTotalPrice = document.getElementById('modal-total-price');
    const confirmBtn = document.getElementById('confirm-booking-btn');
    const cancelBtn = document.getElementById('cancel-booking-btn');
    const COLUMNS_COUNT = 15;
    const TYPE_EMPTY = 0;
    const TYPE_SEAT = 1;
    const TYPE_COUCH_L = 2;
    const TYPE_WHEEL = 3;

    const data = window.screeningData || {};
    let rawLayout = data.layout || [];
    const bookedSeats = data.bookedSeats || [];

    const priceStandard = parseFloat(data.priceStandard || 25);
    const priceWheel = parseFloat(data.priceWheel || 15);
    const priceVip = parseFloat(data.priceVip || 30);

    let selectedSeats = [];

    const rowLabelCls = 'row-label flex h-9 items-center justify-center text-xs font-bold text-stone-400 sm:h-10';
    const emptyCls = 'seat-cell empty min-h-[36px] min-w-0 sm:min-h-[40px]';
    const selExtra = ' ring-2 ring-rose-400 border-rose-400 bg-rose-500/20 scale-[1.02] z-[1]';

    function seatBase(kind) {
        const base = 'seat-cell seat flex min-h-[36px] cursor-pointer items-center justify-center rounded-lg border text-sm transition sm:min-h-[40px]';
        if (kind === 'std') return `${base} border-stone-500 bg-stone-700 text-amber-300 hover:border-amber-400/70`;
        if (kind === 'wheel') return `${base} border-sky-400 bg-sky-900/80 text-sky-200 hover:brightness-110`;
        if (kind === 'vip') return `${base} col-span-2 border-violet-400 bg-violet-900/80 text-violet-200 hover:brightness-110`;
        return base;
    }

    function occupiedCls(kind) {
        const o = ' pointer-events-none cursor-not-allowed border-stone-600 bg-stone-800 text-stone-500 opacity-50';
        if (kind === 'vip') return `seat-cell seat flex min-h-[36px] items-center justify-center rounded-lg border text-sm sm:min-h-[40px] col-span-2${o}`;
        return `seat-cell seat flex min-h-[36px] items-center justify-center rounded-lg border text-sm sm:min-h-[40px]${o}`;
    }

    function normalizeLayout(layoutInput) {
        let layout = layoutInput;
        if (typeof layout === 'string') {
            try {
                layout = JSON.parse(layout);
            } catch (e) {
                console.error(e);
                return [];
            }
        }
        if (Array.isArray(layout) && layout.length > 0 && !Array.isArray(layout[0])) {
            const chunked = [];
            for (let i = 0; i < layout.length; i += COLUMNS_COUNT) {
                chunked.push(layout.slice(i, i + COLUMNS_COUNT));
            }
            return chunked;
        }
        return layout;
    }

    const layout = normalizeLayout(rawLayout);

    function renderSeatMap() {
        seatMap.innerHTML = '';
        selectedSeats = [];
        updateSummary();

        if (!layout || layout.length === 0) {
            seatMap.innerHTML = '<div class="col-span-full py-8 text-center text-stone-400">Brak mapy sali.</div>';
            return;
        }

        const cols = layout[0].length || COLUMNS_COUNT;
        seatMap.style.gridTemplateColumns = `2.25rem repeat(${cols}, minmax(0, 1fr))`;

        for (let rIndex = 0; rIndex < layout.length; rIndex++) {
            const rowCells = layout[rIndex];
            const rowNumber = rIndex + 1;
            const rowLabel = document.createElement('div');
            rowLabel.className = rowLabelCls;
            rowLabel.textContent = rowNumber;
            seatMap.appendChild(rowLabel);

            let seatCounter = 0;

            for (let cIndex = 0; cIndex < rowCells.length; cIndex++) {
                const cellType = parseInt(rowCells[cIndex], 10);

                if (cellType === TYPE_SEAT || cellType === TYPE_WHEEL || cellType === TYPE_COUCH_L) {
                    seatCounter++;
                }

                const seatId = `R${rowNumber}-S${seatCounter}`;
                const cell = document.createElement('div');

                if (cellType === TYPE_EMPTY) {
                    cell.className = emptyCls;
                    seatMap.appendChild(cell);
                } else if (cellType === TYPE_SEAT) {
                    configureSeat(cell, seatId, priceStandard, 'fa-couch', 'Miejsce normalne', 'std');
                    seatMap.appendChild(cell);
                } else if (cellType === TYPE_WHEEL) {
                    configureSeat(cell, seatId, priceWheel, 'fa-wheelchair', 'Miejsce dla niepełnosprawnych', 'wheel');
                    seatMap.appendChild(cell);
                } else if (cellType === TYPE_COUCH_L) {
                    configureSeat(cell, seatId, priceVip, 'fa-couch', 'Kanapa (2 miejsca)', 'vip');
                    seatMap.appendChild(cell);
                    cIndex++;
                }
            }
        }
    }

    function configureSeat(element, id, price, iconClass, typeName, kind) {
        element.dataset.id = id;
        element.dataset.price = price;
        element.dataset.seatKind = kind;
        element.innerHTML = `<i class="fas ${iconClass} pointer-events-none text-xs sm:text-sm"></i>`;

        const r = id.split('-')[0].replace('R', '');
        const s = id.split('-')[1].replace('S', '');
        element.title = `${typeName} (Rząd ${r}, M. ${s})`;

        if (bookedSeats.includes(id)) {
            element.className = occupiedCls(kind);
            element.title += ' (Zajęte)';
            return;
        }

        element.className = seatBase(kind);

        element.addEventListener('click', function () {
            const isSel = element.dataset.selected === '1';
            let k = element.dataset.seatKind;
            if (!k) {
                k = 'std';
            }

            if (isSel) {
                element.dataset.selected = '0';
                element.className = seatBase(k);
                const newList = [];
                for (let si = 0; si < selectedSeats.length; si++) {
                    if (selectedSeats[si].id !== id) {
                        newList.push(selectedSeats[si]);
                    }
                }
                selectedSeats = newList;
            } else {
                element.dataset.selected = '1';
                element.className = seatBase(k) + selExtra;
                selectedSeats.push({
                    id: id,
                    price: price,
                    typeName: typeName,
                    row: r,
                    seat: s
                });
            }
            updateSummary();
        });
    }

    function updateSummary() {
        const count = selectedSeats.length;
        let total = 0;
        for (let ti = 0; ti < selectedSeats.length; ti++) {
            total += selectedSeats[ti].price;
        }

        if (countSpan) countSpan.innerText = count;
        if (totalSpan) totalSpan.innerText = total.toFixed(2);
        if (selectedSeatsInput) {
            const ids = [];
            for (let ii = 0; ii < selectedSeats.length; ii++) {
                ids.push(selectedSeats[ii].id);
            }
            selectedSeatsInput.value = JSON.stringify(ids);
        }
        if (checkoutBtn) checkoutBtn.disabled = count === 0;

        if (selectedSeatsList) {
            selectedSeatsList.innerHTML = '';
            if (count === 0) {
                selectedSeatsList.innerHTML = '<li class="empty-list-msg text-stone-500">Nie wybrano jeszcze miejsc</li>';
            } else {
                const sortedSeats = getSortedSeats();
                for (let lii = 0; lii < sortedSeats.length; lii++) {
                    const item = sortedSeats[lii];
                    const li = document.createElement('li');
                    li.className = 'seat-summary-item flex items-center justify-between gap-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2';
                    li.innerHTML =
                        '<span class="seat-info text-stone-800">' +
                        '<strong>Rząd ' +
                        item.row +
                        ', miejsce ' +
                        item.seat +
                        '</strong>' +
                        '<span class="seat-type text-stone-500"> (' +
                        item.typeName +
                        ')</span>' +
                        '</span>' +
                        '<span class="seat-price shrink-0 font-semibold text-rose-600">' +
                        item.price.toFixed(2) +
                        ' zł</span>';
                    selectedSeatsList.appendChild(li);
                }
            }
        }
    }

    function compareSeats(a, b) {
        const ar = parseInt(a.row, 10);
        const br = parseInt(b.row, 10);
        if (ar !== br) {
            return ar - br;
        }
        return parseInt(a.seat, 10) - parseInt(b.seat, 10);
    }

    function getSortedSeats() {
        const copy = selectedSeats.slice();
        copy.sort(compareSeats);
        return copy;
    }

    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function (e) {
            e.preventDefault();
            showConfirmationModal();
        });
    }

    function showConfirmationModal() {
        if (!modal || !modalSeatsSummary) return;
        modalSeatsSummary.innerHTML = '';
        const ul = document.createElement('ul');
        ul.className = 'space-y-2';
        const sortedForModal = getSortedSeats();
        for (let mi = 0; mi < sortedForModal.length; mi++) {
            const item = sortedForModal[mi];
            const li = document.createElement('li');
            li.className = 'flex justify-between gap-2 text-stone-700';
            li.innerHTML =
                '<span>Rząd ' +
                item.row +
                ', M. ' +
                item.seat +
                ' <small class="text-stone-500">(' +
                item.typeName +
                ')</small></span>' +
                '<strong class="text-rose-600">' +
                item.price.toFixed(2) +
                ' zł</strong>';
            ul.appendChild(li);
        }
        modalSeatsSummary.appendChild(ul);

        let total = 0;
        for (let tj = 0; tj < selectedSeats.length; tj++) {
            total += selectedSeats[tj].price;
        }
        if (modalTotalPrice) modalTotalPrice.innerText = total.toFixed(2);

        modal.classList.remove('hidden');
        modal.classList.add('flex');
    }

    function closeModal() {
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    }

    if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeModal();
        });
    }

    if (confirmBtn) {
        confirmBtn.addEventListener('click', async function () {
            confirmBtn.disabled = true;
            const originalText = confirmBtn.innerText;
            confirmBtn.innerText = 'Przetwarzanie...';

            const screeningId = document.getElementById('screening-id').value;
            const seatsIds = [];
            for (let si = 0; si < selectedSeats.length; si++) {
                seatsIds.push(selectedSeats[si].id);
            }

            try {
                const response = await fetch('/rezerwacja/book', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        screeningId: screeningId,
                        selectedSeats: seatsIds
                    })
                });

                const textData = await response.text();
                let jsonData = null;

                try {
                    jsonData = JSON.parse(textData);
                } catch (e) {
                    jsonData = null;
                }

                if (jsonData) {
                    if (jsonData.success) {
                        alert('Sukces! ' + jsonData.message);
                        window.location.href = '/profil';
                    } else {
                        alert('Błąd: ' + jsonData.message);
                        confirmBtn.disabled = false;
                        confirmBtn.innerText = originalText;
                        if (response.status === 401) window.location.href = '/logowanie';
                    }
                } else {
                    if (response.ok) {
                        const printWindow = window.open('', '_blank');
                        if (printWindow) {
                            printWindow.document.write(textData);
                            printWindow.document.close();
                            window.location.reload();
                        } else {
                            alert('Zablokowano wyskakujące okno. Zezwól na pop-upy, aby wydrukować bilet.');
                            window.location.reload();
                        }
                    } else {
                        alert('Wystąpił błąd serwera. Spróbuj ponownie.');
                        console.error(textData);
                        confirmBtn.disabled = false;
                        confirmBtn.innerText = originalText;
                    }
                }
            } catch (err) {
                console.error(err);
                alert('Wystąpił błąd połączenia z serwerem.');
                confirmBtn.disabled = false;
                confirmBtn.innerText = originalText;
            }
        });
    }

    renderSeatMap();
}

function initMobileNav() {
    const root = document.getElementById('mobileNavRoot');
    const toggle = document.getElementById('mobileNavToggle');
    const closeBtn = document.getElementById('mobileNavClose');
    const backdrop = document.getElementById('mobileNavBackdrop');

    if (!root || !toggle) {
        return;
    }

    const links = root.querySelectorAll('.mobile-nav-link');

    function setOpen(open) {
        if (open) {
            root.classList.remove('hidden');
            root.classList.add('block');
            root.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            document.body.classList.add('overflow-hidden');
        } else {
            root.classList.add('hidden');
            root.classList.remove('block');
            root.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            document.body.classList.remove('overflow-hidden');
        }
    }

    toggle.addEventListener('click', function () {
        const open = root.classList.contains('hidden');
        setOpen(open);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', function () {
            setOpen(false);
        });
    }

    if (backdrop) {
        backdrop.addEventListener('click', function () {
            setOpen(false);
        });
    }

    links.forEach(function (a) {
        a.addEventListener('click', function () {
            setOpen(false);
        });
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && !root.classList.contains('hidden')) {
            setOpen(false);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initCarousel();
    initReportory();
    initPriceList();
    initAccountUser();
    initChooseSeat();
    initMobileNav();
});
