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
    initAccountUser();
    initMobileNav();
});
