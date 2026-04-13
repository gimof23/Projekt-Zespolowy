function initCarousel() {
    const trailerCarousel = document.getElementById('trailerCarousel');
    if (!trailerCarousel) {
        return;
    }

    const track = document.getElementById('carouselTrack');
    const nextButton = document.getElementById('nextBtn');
    const prevButton = document.getElementById('prevBtn');
    const dotsContainer = document.getElementById('dotsContainer');
    const slides = Array.from(track.children);

    if (slides.length === 0) {
        return;
    }

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

function initAccountUser() {
    const cards = document.querySelectorAll('.user-card');
    const sections = document.querySelectorAll('.content-section');

    if (!cards.length || !sections.length) {
        return;
    }

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
        } else if (del) {
            card.classList.add('border-rose-200', 'bg-rose-50/50');
        } else {
            card.classList.add('border-stone-200', 'bg-stone-50/80');
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
        const targetCard = document.querySelector('.user-card[data-target="' + targetId + '"]');

        if (targetCard) {
            activateTab(targetCard);
        }
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

function initMobileNav() {
    const root = document.getElementById('mobileNavRoot');
    const toggle = document.getElementById('mobileNavToggle');
    const closeBtn = document.getElementById('mobileNavClose');
    const backdrop = document.getElementById('mobileNavBackdrop');

    if (!root || !toggle) {
        return;
    }

    function openNav() {
        root.classList.remove('hidden');
        root.setAttribute('aria-hidden', 'false');
        toggle.setAttribute('aria-expanded', 'true');
    }

    function closeNav() {
        root.classList.add('hidden');
        root.setAttribute('aria-hidden', 'true');
        toggle.setAttribute('aria-expanded', 'false');
    }

    toggle.addEventListener('click', openNav);

    if (closeBtn) {
        closeBtn.addEventListener('click', closeNav);
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeNav);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    initCarousel();
    initAccountUser();
    initMobileNav();
});
