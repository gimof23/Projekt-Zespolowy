const panelOn = 'login-panel absolute inset-0 z-10 flex flex-col translate-x-0 opacity-100 transition-all duration-300 ease-out pointer-events-auto';
const panelOffLeft = 'login-panel pointer-events-none absolute inset-0 z-0 flex flex-col -translate-x-full opacity-0 transition-all duration-300 ease-out';
const panelOffRight = 'login-panel pointer-events-none absolute inset-0 z-0 flex flex-col translate-x-full opacity-0 transition-all duration-300 ease-out';

let authModalEscapeHandler = null;
let authModalCloseTimer = null;

function closeAuthModal(onAfterClose) {
    const root = document.getElementById('auth-modal');
    const panel = document.getElementById('auth-modal-panel');
    if (!root) {
        if (typeof onAfterClose === 'function') onAfterClose();
        return;
    }

    if (root.classList.contains('hidden')) {
        if (typeof onAfterClose === 'function') onAfterClose();
        return;
    }

    if (authModalCloseTimer) {
        clearTimeout(authModalCloseTimer);
        authModalCloseTimer = null;
    }

    root.classList.remove('opacity-100');
    root.classList.add('opacity-0');

    if (panel) {
        panel.classList.remove('translate-y-0', 'scale-100', 'opacity-100');
        panel.classList.add('translate-y-3', 'scale-95', 'opacity-0');
    }

    authModalCloseTimer = setTimeout(() => {
        authModalCloseTimer = null;
        root.classList.add('hidden');
        root.classList.remove('flex', 'opacity-0', 'opacity-100');
        if (panel) {
            panel.classList.remove('translate-y-3', 'scale-95', 'opacity-0', 'translate-y-0', 'scale-100', 'opacity-100');
        }
        root.setAttribute('aria-hidden', 'true');
        if (authModalEscapeHandler) {
            document.removeEventListener('keydown', authModalEscapeHandler);
            authModalEscapeHandler = null;
        }
        if (typeof onAfterClose === 'function') onAfterClose();
    }, 300);
}

function showAuthModal(title, message, variant, confirmLabel, onConfirm) {
    if (!variant) {
        variant = 'success';
    }
    if (!confirmLabel) {
        confirmLabel = 'OK';
    }

    const root = document.getElementById('auth-modal');
    const panel = document.getElementById('auth-modal-panel');
    const titleEl = document.getElementById('auth-modal-title');
    const textEl = document.getElementById('auth-modal-text');
    const btn = document.getElementById('auth-modal-btn');
    const iconWrap = document.getElementById('auth-modal-icon-wrap');
    const icon = document.getElementById('auth-modal-icon');
    if (!root || !panel || !titleEl || !textEl || !btn || !iconWrap || !icon) {
        return;
    }

    if (authModalCloseTimer) {
        clearTimeout(authModalCloseTimer);
        authModalCloseTimer = null;
    }

    let titleText = title;
    if (!titleText) {
        if (variant === 'error') {
            titleText = 'Ups…';
        } else {
            titleText = 'Gotowe';
        }
    }
    titleEl.textContent = titleText;
    if (!message) {
        textEl.textContent = '';
    } else {
        textEl.textContent = message;
    }
    btn.textContent = confirmLabel;

    if (variant === 'error') {
        iconWrap.className =
            'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-2xl text-white shadow-lg shadow-rose-500/35';
        icon.className = 'fas fa-triangle-exclamation';
    } else {
        iconWrap.className =
            'mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 text-2xl text-white shadow-lg shadow-emerald-500/30';
        icon.className = 'fas fa-check';
    }

    function handleConfirm() {
        root.onclick = null;
        btn.onclick = null;
        closeAuthModal(function () {
            if (typeof onConfirm === 'function') {
                onConfirm();
            }
        });
    }

    btn.onclick = function () {
        handleConfirm();
    };
    root.onclick = function (e) {
        if (e.target === root) {
            handleConfirm();
        }
    };

    authModalEscapeHandler = function (e) {
        if (e.key === 'Escape') {
            handleConfirm();
        }
    };
    document.addEventListener('keydown', authModalEscapeHandler);

    root.classList.remove('hidden', 'opacity-100');
    root.classList.add('flex', 'opacity-0');
    panel.classList.remove('translate-y-0', 'scale-100', 'opacity-100');
    panel.classList.add('translate-y-4', 'scale-95', 'opacity-0');

    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            root.classList.remove('opacity-0');
            root.classList.add('opacity-100');
            panel.classList.remove('translate-y-4', 'scale-95', 'opacity-0');
            panel.classList.add('translate-y-0', 'scale-100', 'opacity-100');
        });
    });

    root.setAttribute('aria-hidden', 'false');
}

function switchView(target) {
    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const forgotSection = document.getElementById('forgot-section');

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');

    if (target === 'register') {
        loginSection.className = panelOffLeft;
        registerSection.className = panelOn;
        forgotSection.className = panelOffLeft;
        setTimeout(() => loginForm.reset(), 300);
    } else if (target === 'forgot') {
        loginSection.className = panelOffRight;
        forgotSection.className = panelOn;
        registerSection.className = panelOffRight;
        setTimeout(() => loginForm.reset(), 300);
    } else {
        loginSection.className = panelOn;
        registerSection.className = panelOffRight;
        forgotSection.className = panelOffLeft;
        setTimeout(() => {
            if (registerForm) registerForm.reset();
            if (forgotForm) forgotForm.reset();
        }, 300);
    }
}

function togglePassword(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    const accent = inputId.includes('login') ? 'text-amber-600' : 'text-rose-600';

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
        btn.classList.add(accent);
        btn.classList.remove('text-slate-500');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
        btn.classList.remove(accent);
        btn.classList.add('text-slate-500');
    }
}

window.switchView = switchView;
window.togglePassword = togglePassword;

document.addEventListener('DOMContentLoaded', function () {
    const newPasswordForm = document.getElementById('newPasswordForm');
    if (newPasswordForm) {
        if (window.history.replaceState) {
            window.history.replaceState({}, document.title, window.location.pathname.replace(/\/ustaw-nowe-haslo\/.*/, '/ustaw-nowe-haslo'));
        }

        newPasswordForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const newPass = document.getElementById('newPass').value;
            const confirmPass = document.getElementById('confirmPass').value;
            const token = document.getElementById('token').value;

            if (newPass !== confirmPass) {
                alert('Hasła nie są identyczne!');
                return;
            }

            const btn = e.target.querySelector('button');
            btn.innerText = 'Zmienianie...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/reset-password-confirm', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: token, newPassword: newPass })
                });
                const data = await res.json();

                if (res.ok) {
                    alert('Hasło zmienione! Zaloguj się nowym hasłem.');
                    window.location.href = '/logowanie';
                } else {
                    alert(data.message || 'Błąd zmiany hasła');
                    btn.innerText = 'Zmień hasło';
                    btn.disabled = false;
                }
            } catch (err) {
                console.error(err);
                alert('Błąd połączenia');
                btn.disabled = false;
                btn.innerText = 'Zmień hasło';
            }
        });

        return;
    }

    const loginSection = document.getElementById('login-section');
    const registerSection = document.getElementById('register-section');
    const forgotSection = document.getElementById('forgot-section');

    if (!loginSection || !registerSection || !forgotSection) return;

    loginSection.className = panelOn;
    registerSection.className = panelOffRight;
    forgotSection.className = panelOffLeft;

    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const forgotForm = document.getElementById('forgotForm');

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;

            const btn = loginForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Logowanie...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    let msg = data.message;
                    if (!msg) {
                        msg = 'Zalogowano pomyślnie!';
                    }
                    let redir = data.redirect;
                    if (!redir) {
                        redir = '/';
                    }
                    showAuthModal('Zalogowano', msg, 'success', 'Przejdź dalej', function () {
                        window.location.href = redir;
                    });
                } else {
                    let errMsg = data.message;
                    if (!errMsg) {
                        errMsg = 'Błąd logowania';
                    }
                    showAuthModal('Logowanie nieudane', errMsg, 'error');
                }
            } catch (err) {
                console.error(err);
                showAuthModal('Brak połączenia', 'Sprawdź internet i spróbuj ponownie.', 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const name = registerForm.name.value;
            const email = registerForm.email.value;
            const password = registerForm.password.value;

            const btn = registerForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Tworzenie konta...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });
                const data = await res.json();
                if (res.ok) {
                    showAuthModal(
                        'Konto utworzone',
                        'Możesz się teraz zalogować.',
                        'success',
                        'Zaloguj się',
                        function () {
                            switchView('login');
                            registerForm.reset();
                        }
                    );
                } else {
                    let errMsg = data.message;
                    if (!errMsg) {
                        errMsg = 'Błąd rejestracji';
                    }
                    showAuthModal('Rejestracja nieudana', errMsg, 'error');
                }
            } catch (err) {
                console.error(err);
                showAuthModal('Brak połączenia', 'Sprawdź internet i spróbuj ponownie.', 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    if (forgotForm) {
        forgotForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const email = forgotForm.email.value;

            const btn = forgotForm.querySelector('button[type="submit"]');
            const originalText = btn.innerText;
            btn.innerText = 'Wysyłanie...';
            btn.disabled = true;

            try {
                const res = await fetch('/api/forgot-password', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email })
                });

                if (res.ok) {
                    showAuthModal(
                        'Wiadomość wysłana',
                        'Jeśli konto istnieje, na podany e-mail trafi link do resetu hasła.',
                        'success',
                        'Rozumiem',
                        function () {
                            switchView('login');
                            forgotForm.reset();
                        }
                    );
                } else {
                    const errData = await res.json();
                    let errMsg = errData.message;
                    if (!errMsg) {
                        errMsg = 'Błąd wysyłania';
                    }
                    showAuthModal('Nie udało się wysłać', errMsg, 'error');
                }
            } catch (err) {
                console.error(err);
                showAuthModal('Brak połączenia', 'Sprawdź internet i spróbuj ponownie.', 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});
