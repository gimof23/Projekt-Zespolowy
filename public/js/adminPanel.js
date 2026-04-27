document.addEventListener('DOMContentLoaded', function () {
    function formatInputDate(dateString) {
        if (!dateString || dateString === '0000-00-00') {
            return '';
        }
        const d = new Date(dateString);
        if (isNaN(d.getTime())) {
            return '';
        }
        return d.toISOString().split('T')[0];
    }

    const ADMIN_PAGE_SIZE = 10;

    function adminTableRows(tbody) {
        if (!tbody) {
            return [];
        }
        return Array.from(tbody.querySelectorAll(':scope > tr'));
    }

    function adminTableInitPass(tbody) {
        const list = adminTableRows(tbody);
        for (let i = 0; i < list.length; i++) {
            const row = list[i];
            if (row.dataset.adminPass !== '0' && row.dataset.adminPass !== '1') {
                row.dataset.adminPass = '1';
            }
        }
    }

    function adminTableApplyPagination(tbody, pageRef, barEl) {
        if (!tbody || !barEl) {
            return;
        }
        const rows = adminTableRows(tbody);
        const passed = [];
        for (let pi = 0; pi < rows.length; pi++) {
            if (rows[pi].dataset.adminPass === '1') {
                passed.push(rows[pi]);
            }
        }
        const n = passed.length;
        const pages = Math.max(1, Math.ceil(n / ADMIN_PAGE_SIZE) || 1);
        if (pageRef.page > pages) {
            pageRef.page = pages;
        }
        if (pageRef.page < 1) {
            pageRef.page = 1;
        }
        const start = (pageRef.page - 1) * ADMIN_PAGE_SIZE;
        const end = start + ADMIN_PAGE_SIZE;

        for (let rj = 0; rj < rows.length; rj++) {
            const row = rows[rj];
            if (row.dataset.adminPass === '0') {
                row.style.display = 'none';
                continue;
            }
            let idx = -1;
            for (let pk = 0; pk < passed.length; pk++) {
                if (passed[pk] === row) {
                    idx = pk;
                    break;
                }
            }
            if (idx >= start && idx < end) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }

        let info;
        if (n === 0) {
            info = 'Brak wyników';
        } else {
            info =
                'Strona ' +
                pageRef.page +
                ' z ' +
                pages +
                ' · ' +
                n +
                ' pozycji (po ' +
                ADMIN_PAGE_SIZE +
                ')';
        }
        barEl.innerHTML =
            '<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">' +
            '<p class="text-sm font-medium leading-relaxed text-stone-600">' +
            info +
            '</p>' +
            '<div class="flex flex-wrap items-center gap-2">' +
            '<button type="button" class="admin-pag-prev rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40">Poprzednia</button>' +
            '<button type="button" class="admin-pag-next rounded-xl border border-stone-300 bg-white px-4 py-2.5 text-sm font-bold text-stone-800 shadow-sm transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-40">Następna</button>' +
            '</div></div>';

        const prev = barEl.querySelector('.admin-pag-prev');
        const next = barEl.querySelector('.admin-pag-next');
        prev.disabled = pageRef.page <= 1 || n === 0;
        next.disabled = pageRef.page >= pages || n === 0;
        prev.onclick = function () {
            if (pageRef.page > 1) {
                pageRef.page--;
                adminTableApplyPagination(tbody, pageRef, barEl);
            }
        };
        next.onclick = function () {
            if (pageRef.page < pages) {
                pageRef.page++;
                adminTableApplyPagination(tbody, pageRef, barEl);
            }
        };
    }

    function overlayShow(el) {
        el.classList.remove('hidden');
        el.classList.add('flex');
    }

    function overlayHide(el) {
        el.classList.add('hidden');
        el.classList.remove('flex');
    }

    function slideFormOpen(container) {
        if (!container) {
            return;
        }
        const s = container.querySelector('.admin-slide-wrap');
        if (s) {
            s.classList.add('-translate-x-1/2');
        }
    }

    function slideFormClose(container) {
        if (!container) {
            return;
        }
        const s = container.querySelector('.admin-slide-wrap');
        if (s) {
            s.classList.remove('-translate-x-1/2');
        }
    }

    const openManagerBtn = document.getElementById('openMoviesManager'); 
    const managerOverlay = document.getElementById('moviesManagerOverlay'); 
    const movieManagerContainer = document.getElementById('movieManagerContainer'); 
    const closeManagerBtn = document.getElementById('closeManagerBtn'); 

    const movieForm = document.getElementById('movieForm');
    const managerTitle = document.getElementById('managerTitle'); 
    const backToMovieTableBtn = document.getElementById('backToTableBtn'); 
    const addMovieBtn = document.getElementById('addMovieBtn'); 

    const openMovieFormView = (mode) => {
        if (movieManagerContainer) {
            slideFormOpen(movieManagerContainer);
            managerTitle.innerText = mode === 'edit' ? 'Edytuj Film' : 'Dodaj Nowy Film';
            addMovieBtn.classList.add('hidden');
            backToMovieTableBtn.classList.remove('hidden');
        }
    };

    const closeMovieFormView = () => {
        if (movieManagerContainer) {
            slideFormClose(movieManagerContainer);
            managerTitle.innerText = 'Zarządzanie Filmami';
            addMovieBtn.classList.remove('hidden');
            backToMovieTableBtn.classList.add('hidden');
        }
    };

    if (openManagerBtn && managerOverlay) {
        const closeMovieManager = () => overlayHide(managerOverlay);

        const moviesTbody = document.querySelector('#movieManagerContainer .admin-table tbody');
        const moviesPagBar = document.getElementById('adminPaginationMovies');
        const moviesPageRef = { page: 1 };
        const refreshMoviesPagination = () => {
            if (!moviesTbody || !moviesPagBar) return;
            adminTableInitPass(moviesTbody);
            adminTableRows(moviesTbody).forEach((r) => { r.dataset.adminPass = '1'; });
            adminTableApplyPagination(moviesTbody, moviesPageRef, moviesPagBar);
        };

        openManagerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            overlayShow(managerOverlay);
            closeMovieFormView();
            moviesPageRef.page = 1;
            refreshMoviesPagination();
        });
        
        closeManagerBtn.addEventListener('click', closeMovieManager);
        managerOverlay.addEventListener('click', (e) => { if (e.target === managerOverlay) closeMovieManager(); });

        backToMovieTableBtn.addEventListener('click', closeMovieFormView);
        
        addMovieBtn.addEventListener('click', () => {
            movieForm.reset(); 
            movieForm.action = '/admin/movies/add'; 
            document.getElementById('movieId').value = ''; 
            openMovieFormView('add');
        });

        const movieTableEl = document.querySelector('#movieManagerContainer .admin-table');
        if (movieTableEl) {
            movieTableEl.addEventListener('click', (e) => {
                const btn = e.target.closest('.edit-movie-btn');
                if (!btn) return;
                const data = btn.dataset;
                movieForm.action = '/admin/movies/edit';
                document.getElementById('movieId').value = data.id;
                document.getElementById('inputTitle').value = data.title;
                document.getElementById('inputDescription').value = data.description;
                document.getElementById('inputDuration').value = data.duration;
                document.getElementById('inputImageUrl').value = data.imageUrl;
                document.getElementById('inputYoutube').value = data.youtubeLink;
                document.getElementById('inputReleaseDate').value = formatInputDate(data.releaseDate);
                document.getElementById('inputEndDate').value = formatInputDate(data.endDate);
                openMovieFormView('edit');
            });
        }

        if (window.location.hash === '#movies') {
            overlayShow(managerOverlay);
            moviesPageRef.page = 1;
            refreshMoviesPagination();
            history.replaceState(null, null, ' ');
        }

        if (moviesTbody && moviesPagBar) {
            refreshMoviesPagination();
        }
    }

    const openUsersManagerBtn = document.getElementById('openUsersManager'); 
    const usersManagerOverlay = document.getElementById('usersManagerOverlay'); 
    const userManagerContainer = document.getElementById('userManagerContainer'); 
    const closeUserManagerBtn = document.getElementById('closeUserManagerBtn'); 

    const userForm = document.getElementById('userForm');
    const userManagerTitle = document.getElementById('user-managerTitle');
    
    const inputUserName = document.getElementById('inputName');
    const inputUserPassword = document.getElementById('inputUserPassword');
    const backToUserListBtn = document.getElementById('backToUserListBtn');
    const addUserBtn = document.getElementById('addUserBtn'); 
    const filterUserRole = document.getElementById('filterUserRole');
    const resetUserFiltersBtn = document.getElementById('resetUserFiltersBtn');

    const openUserFormView = (mode) => {
        if (userManagerContainer) {
            slideFormOpen(userManagerContainer);
            userManagerTitle.innerText = mode === 'edit' ? 'Edytuj Użytkownika' : 'Dodaj Nowego Użytkownika';
            addUserBtn.classList.add('hidden');
            backToUserListBtn.classList.remove('hidden');
        }
    };

    const closeUserFormView = () => {
        if (userManagerContainer) {
            slideFormClose(userManagerContainer);
            userManagerTitle.innerText = 'Zarządzanie Użytkownikami';
            addUserBtn.classList.remove('hidden');
            backToUserListBtn.classList.add('hidden');
        }
    };

    if (openUsersManagerBtn && usersManagerOverlay) {
        const closeUserManager = () => overlayHide(usersManagerOverlay);

        const usersTbody = document.querySelector('#userManagerContainer .admin-table tbody');
        const usersPagBar = document.getElementById('adminPaginationUsers');
        const usersPageRef = { page: 1 };
        const refreshUsersPagination = () => {
            if (!usersTbody || !usersPagBar) return;
            adminTableApplyPagination(usersTbody, usersPageRef, usersPagBar);
        };
        const runUserFilter = () => {
            if (!filterUserRole || !usersTbody) return;
            const roleVal = filterUserRole.value;
            document.querySelectorAll('.user-row').forEach((row) => {
                const rRole = row.getAttribute('data-role');
                row.dataset.adminPass = roleVal === 'all' || roleVal === rRole ? '1' : '0';
            });
            usersPageRef.page = 1;
            refreshUsersPagination();
        };

        if (filterUserRole && usersTbody && usersPagBar && resetUserFiltersBtn) {
            adminTableInitPass(usersTbody);
            filterUserRole.addEventListener('change', runUserFilter);
            resetUserFiltersBtn.addEventListener('click', () => {
                filterUserRole.value = 'all';
                runUserFilter();
            });
            runUserFilter();
        } else if (usersTbody && usersPagBar) {
            adminTableInitPass(usersTbody);
            usersPageRef.page = 1;
            refreshUsersPagination();
        }

        openUsersManagerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            overlayShow(usersManagerOverlay);
            closeUserFormView();
            usersPageRef.page = 1;
            refreshUsersPagination();
        });
        
        closeUserManagerBtn.addEventListener('click', closeUserManager);
        usersManagerOverlay.addEventListener('click', (e) => { if (e.target === usersManagerOverlay) closeUserManager(); });

        backToUserListBtn.addEventListener('click', closeUserFormView);

        addUserBtn.addEventListener('click', () => {
            userForm.reset(); 
            userForm.action = '/admin/users/add'; 
            document.getElementById('userId').value = ''; 
            if(inputUserPassword) inputUserPassword.required = true;
            openUserFormView('add');
        });

        const table = document.querySelector('#userManagerContainer .admin-table');
        if (table) {
            table.addEventListener('click', (e) => {
                const btn = e.target.closest('.edit-user-btn');
                if (!btn) return;
                const data = btn.dataset;
                userForm.action = '/admin/users/edit'; 
                document.getElementById('userId').value = data.id;
                inputUserName.value = data.name;
                document.getElementById('inputUserEmail').value = data.email;
                document.getElementById('inputUserRole').value = data.role;
                if(inputUserPassword) {
                    inputUserPassword.required = false;
                    inputUserPassword.value = ''; 
                }
                openUserFormView('edit');
            });
        }

        if (window.location.hash === '#users') {
            overlayShow(usersManagerOverlay);
            usersPageRef.page = 1;
            refreshUsersPagination();
            history.replaceState(null, null, ' ');
        }
    }

    const hallsManagerContainer = document.getElementById('hallsManagerContainer');
    if (hallsManagerContainer) { 
        const hallsLayoutJsonEl = document.getElementById('admin-halls-layout-json');
        const getHallsLayoutMap = () => {
            if (!hallsLayoutJsonEl) return {};
            try {
                return JSON.parse(hallsLayoutJsonEl.textContent.trim() || '{}');
            } catch (e) {
                return {};
            }
        };

        const hallsForm = document.getElementById('hallForm');
        const hallsManagerTitle = document.getElementById('halls-managerTitle');
        const inputHallName = document.getElementById('inputHallName');
        const inputHallId = document.getElementById('hallId');
        const backToHallsListBtn = document.getElementById('backToHallsListBtn');
        const addHallBtn = document.getElementById('addHallBtn'); 

        const gridContainer = document.getElementById('halls-cinema-grid');
        const hallsViewsSlide = document.getElementById('halls-viewsWrapper');

        const GRID_SIZE = 15;
        
        let currentLayout = []; 
        let currentTool = 0; 
        
        const seatsCountDisplay = document.getElementById('halls-seats-count');
        const layoutDataInput = document.getElementById('halls-layoutDataInput');
        const seatsCountInput = document.getElementById('halls-seatsCountInput');
        const toolItems = document.querySelectorAll('#hallsManagerContainer .tool-item');

        const TYPE_EMPTY = 0;
        const TYPE_SEAT = 1;
        const TYPE_COUCH_L = 2; 
        const TYPE_WHEEL = 3;
        const TYPE_COUCH_R = 5; 

        const initializeEmptyGrid = () => {
            currentLayout = [];
            for (let r = 0; r < GRID_SIZE; r++) {
                currentLayout.push(Array(GRID_SIZE).fill(TYPE_EMPTY));
            }
            renderGrid();
        };

        const loadGrid = (layoutJson) => {
            if (!layoutJson) {
                initializeEmptyGrid();
                return;
            }
            try {
                const parsedLayout = JSON.parse(layoutJson);
                if (Array.isArray(parsedLayout) && parsedLayout.length === GRID_SIZE) {
                     currentLayout = parsedLayout;
                } else {
                     initializeEmptyGrid();
                }
            } catch (e) {
                console.error(e);
                initializeEmptyGrid();
            }
            renderGrid();
        };
        
        const updateStats = () => {
            let seatCount = 0;
            currentLayout.forEach(row => {
                row.forEach(cellType => {
                    if (cellType === TYPE_SEAT || cellType === TYPE_COUCH_L || cellType === TYPE_COUCH_R || cellType === TYPE_WHEEL) {
                        seatCount++;
                    }
                });
            });
            if (seatsCountDisplay) seatsCountDisplay.textContent = seatCount;
            if (seatsCountInput) seatsCountInput.value = seatCount;
            if (layoutDataInput) layoutDataInput.value = JSON.stringify(currentLayout);
        };

        const gcBase = 'grid-cell pointer-events-auto flex h-[30px] w-[30px] cursor-pointer items-center justify-center rounded border text-[11px] transition-colors';
        const gcStyle = {
            0: `${gcBase} border-stone-200 bg-white text-stone-400`,
            1: `${gcBase} border-teal-700 bg-teal-500 text-white shadow-sm`,
            2: `${gcBase} relative z-[5] -mr-1 w-[34px] overflow-visible rounded-r-none border-r-0 border-violet-700 bg-violet-600 text-white`,
            3: `${gcBase} border-sky-600 bg-sky-500 text-white shadow-sm`,
            5: `${gcBase} rounded-l-none border-l-0 border-violet-700 bg-violet-600 text-white`
        };

        const renderGrid = () => {
            if (!gridContainer) return;
            gridContainer.innerHTML = '';

            currentLayout.forEach((row, r) => {
                const rowLabel = document.createElement('div');
                rowLabel.className = 'row-label flex h-[30px] w-[30px] items-center justify-center text-[13px] font-bold text-stone-500';
                rowLabel.textContent = r + 1;
                gridContainer.appendChild(rowLabel);

                row.forEach((cellType, c) => {
                    const cell = document.createElement('div');
                    cell.className = gcStyle[cellType] || gcStyle[0];
                    cell.setAttribute('data-row', r);
                    cell.setAttribute('data-col', c);
                    cell.setAttribute('data-type', cellType);

                    if (cellType === TYPE_SEAT) {
                        cell.innerHTML = '<i class="fas fa-couch pointer-events-none text-sm"></i>';
                    } else if (cellType === TYPE_WHEEL) {
                        cell.innerHTML = '<i class="fas fa-wheelchair pointer-events-none"></i>';
                    } else if (cellType === TYPE_COUCH_L) {
                        cell.innerHTML = '<div class="pointer-events-none absolute left-0 top-1/2 w-16 -translate-y-1/2 text-center"><i class="fas fa-couch text-lg"></i></div>';
                    }

                    gridContainer.appendChild(cell);
                });
            });
            updateStats();
        };

        const handleCellClick = (e) => {
            const cell = e.target.closest('.grid-cell');
            if (!cell) return;

            const r = parseInt(cell.getAttribute('data-row'));
            const c = parseInt(cell.getAttribute('data-col'));
            
            if (currentTool === TYPE_COUCH_L) {
                if (c + 1 < GRID_SIZE) {
                    cleanCell(r, c); 
                    cleanCell(r, c+1);
                    currentLayout[r][c] = TYPE_COUCH_L; 
                    currentLayout[r][c+1] = TYPE_COUCH_R; 
                } else {
                    alert("Kanapa nie mieści się w tym rzędzie.");
                    return;
                }
            } 
            else if (currentTool === TYPE_EMPTY) {
                 cleanCell(r, c);
            }
            else {
                cleanCell(r, c); 
                currentLayout[r][c] = currentTool;
            }

            renderGrid(); 
        };

        const cleanCell = (r, c) => {
            const type = currentLayout[r][c];
            if (type === TYPE_COUCH_L) {
                currentLayout[r][c] = TYPE_EMPTY;
                if (c + 1 < GRID_SIZE && currentLayout[r][c+1] === TYPE_COUCH_R) currentLayout[r][c+1] = TYPE_EMPTY;
            } 
            else if (type === TYPE_COUCH_R) {
                currentLayout[r][c] = TYPE_EMPTY;
                if (c > 0 && currentLayout[r][c-1] === TYPE_COUCH_L) currentLayout[r][c-1] = TYPE_EMPTY;
            } 
            else {
                currentLayout[r][c] = TYPE_EMPTY;
            }
        };

        const handleMouseOver = (e) => {
            const cell = e.target.closest('.grid-cell');
            if (!cell) return;

            const r = parseInt(cell.getAttribute('data-row'));
            const c = parseInt(cell.getAttribute('data-col'));
            const type = parseInt(cell.getAttribute('data-type'));

            if (type === TYPE_COUCH_L && c + 1 < GRID_SIZE) {
                const rightCell = gridContainer.querySelector(`.grid-cell[data-row="${r}"][data-col="${c + 1}"]`);
                if (rightCell) rightCell.classList.add('ring-2', 'ring-stone-500', 'z-10');
            } else if (type === TYPE_COUCH_R && c > 0) {
                const leftCell = gridContainer.querySelector(`.grid-cell[data-row="${r}"][data-col="${c - 1}"]`);
                if (leftCell) leftCell.classList.add('ring-2', 'ring-stone-500', 'z-10');
            }
        };

        const handleMouseOut = () => {
            if (!gridContainer) return;
            gridContainer.querySelectorAll('.grid-cell').forEach(c => c.classList.remove('ring-2', 'ring-stone-500', 'z-10'));
        };

        const toolActiveClasses = ['border-rose-500', 'bg-rose-50', 'ring-2', 'ring-rose-200'];
        const toolIdleClasses = ['border-stone-300', 'bg-white'];

        const handleToolSelect = (e) => {
            const toolBtn = e.target.closest('.tool-item');
            if (!toolBtn) return;

            toolItems.forEach(btn => {
                btn.classList.remove(...toolActiveClasses);
                toolIdleClasses.forEach(c => btn.classList.add(c));
            });
            toolBtn.classList.remove(...toolIdleClasses);
            toolBtn.classList.add(...toolActiveClasses);

            currentTool = parseInt(toolBtn.getAttribute('data-type'), 10);
        };
        
        if (gridContainer) {
            gridContainer.addEventListener('click', handleCellClick);
            gridContainer.addEventListener('mouseover', handleMouseOver);
            gridContainer.addEventListener('mouseout', handleMouseOut);
            
            toolItems.forEach(item => item.addEventListener('click', handleToolSelect));
            
            const resetTool = document.getElementById('hall-tool-reset');
            if (resetTool) {
                toolItems.forEach(btn => {
                    btn.classList.remove(...toolActiveClasses);
                    toolIdleClasses.forEach(c => btn.classList.add(c));
                });
                resetTool.classList.remove(...toolIdleClasses);
                resetTool.classList.add(...toolActiveClasses);
            }

            const initialLayoutData = layoutDataInput.value;
            if (initialLayoutData) {
                 loadGrid(initialLayoutData);
            } else {
                 initializeEmptyGrid();
            }
        }

        const openHallsFormView = (mode, layoutData = null) => {
            if (hallsViewsSlide) hallsViewsSlide.classList.add('-translate-x-1/2');
            if (hallsManagerTitle) hallsManagerTitle.innerText = mode === 'edit' ? 'Edytuj Salę' : 'Dodaj Nową Salę';

            if (addHallBtn) addHallBtn.classList.add('hidden');
            if (backToHallsListBtn) backToHallsListBtn.classList.remove('hidden');

            if (layoutData) loadGrid(layoutData);
            else initializeEmptyGrid();
        };

        const closeHallsFormView = () => {
            if (hallsViewsSlide) hallsViewsSlide.classList.remove('-translate-x-1/2');
            if (hallsManagerTitle) hallsManagerTitle.innerText = 'Zarządzanie salami';

            if (addHallBtn) addHallBtn.classList.remove('hidden');
            if (backToHallsListBtn) backToHallsListBtn.classList.add('hidden');
        };
        
        if (addHallBtn && hallsForm && inputHallId && inputHallName) {
            addHallBtn.addEventListener('click', () => {
                hallsForm.reset();
                hallsForm.action = '/admin/halls/save';
                inputHallId.value = '';
                inputHallName.value = '';

                toolItems.forEach(btn => {
                    btn.classList.remove(...toolActiveClasses);
                    toolIdleClasses.forEach(c => btn.classList.add(c));
                });
                const defaultTool = document.getElementById('hall-tool-reset');
                if (defaultTool) {
                    defaultTool.classList.remove(...toolIdleClasses);
                    defaultTool.classList.add(...toolActiveClasses);
                }
                currentTool = 0;

                initializeEmptyGrid();
                openHallsFormView('add');
            });
        }

        if (backToHallsListBtn) backToHallsListBtn.addEventListener('click', closeHallsFormView);

        const hallsTable = document.querySelector('#hallsManagerContainer .admin-table');
        if (hallsTable && hallsForm && inputHallId && inputHallName) {
            hallsTable.addEventListener('click', (e) => {
                const btn = e.target.closest('.edit-hall-btn');
                if (!btn) return;
                const data = btn.dataset;
                hallsForm.action = '/admin/halls/save';
                inputHallId.value = data.id;
                inputHallName.value = data.name;
                const map = getHallsLayoutMap();
                const raw = map[data.id] ?? map[String(data.id)];
                const layoutData = raw != null && raw !== '' ? raw : null;
                openHallsFormView('edit', layoutData);
            });
        }

        const openHallsManagerBtn = document.getElementById('openHallsManager');
        const hallsManagerOverlay = document.getElementById('hallsManagerOverlay');
        const closeHallsManagerBtn = document.getElementById('closeHallsManagerBtn');

        const openHallsModal = () => {
            if (!hallsManagerOverlay) return;
            overlayShow(hallsManagerOverlay);
            closeHallsFormView();
        };

        const closeHallsModal = () => {
            if (!hallsManagerOverlay) return;
            overlayHide(hallsManagerOverlay);
        };

        if (openHallsManagerBtn && hallsManagerOverlay) {
            openHallsManagerBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openHallsModal();
            });
        }

        if (closeHallsManagerBtn && hallsManagerOverlay) {
            closeHallsManagerBtn.addEventListener('click', closeHallsModal);
            hallsManagerOverlay.addEventListener('click', (e) => {
                if (e.target === hallsManagerOverlay) closeHallsModal();
            });
        }

        if (window.location.hash === '#halls') {
            openHallsModal();
            history.replaceState(null, null, ' ');
        }
    }

    const openScreeningsBtn = document.getElementById('openScreeningsManager');
    const screeningsOverlay = document.getElementById('screeningsManagerOverlay');
    const screeningsContainer = document.getElementById('screeningsManagerContainer');
    
    if (openScreeningsBtn && screeningsOverlay) {
        
        const closeScreeningsBtn = document.getElementById('closeScreeningsManagerBtn');
        const screeningForm = document.getElementById('screeningForm');
        const managerTitle = document.getElementById('screenings-managerTitle');
        const backToListBtn = document.getElementById('backToScreeningsListBtn');
        const addScreeningBtn = document.getElementById('addScreeningBtn');
        
        const inputId = document.getElementById('screeningId');
        const inputMovie = document.getElementById('inputScreeningMovie');
        const inputHall = document.getElementById('inputScreeningHall');
        const inputDate = document.getElementById('inputScreeningDate');
        const inputCancelled = document.getElementById('inputScreeningCancelled');
        const cancelledGroup = document.getElementById('cancelledGroup');

        const filterStatus = document.getElementById('filterScreeningStatus');
        const filterMovie = document.getElementById('filterScreeningMovie');
        const filterHall = document.getElementById('filterScreeningHall');
        const filterDate = document.getElementById('filterScreeningDate');
        const resetFiltersBtn = document.getElementById('resetScreeningFiltersBtn');

        const screeningsTbody = document.querySelector('#screeningsManagerContainer .admin-table tbody');
        const screeningsPagBar = document.getElementById('adminPaginationScreenings');
        const screeningsPageRef = { page: 1 };
        const refreshScreeningsPagination = () => {
            if (!screeningsTbody || !screeningsPagBar) return;
            adminTableApplyPagination(screeningsTbody, screeningsPageRef, screeningsPagBar);
        };

        const filterScreenings = () => {
            if (!filterStatus || !filterDate) return;
            const statusVal = filterStatus.value;
            const movieVal = filterMovie ? filterMovie.value : 'all';
            const hallVal = filterHall ? filterHall.value : 'all';
            const dateVal = filterDate.value;

            document.querySelectorAll('.screening-row').forEach((row) => {
                const rStatus = row.getAttribute('data-status');
                const rMovie = row.getAttribute('data-movie-id');
                const rHall = row.getAttribute('data-hall-id');
                const rDate = row.getAttribute('data-date');

                let show = true;
                if (statusVal !== 'all' && statusVal !== rStatus) show = false;
                if (movieVal !== 'all' && movieVal !== rMovie) show = false;
                if (hallVal !== 'all' && hallVal !== rHall) show = false;
                if (dateVal && dateVal !== rDate) show = false;

                row.dataset.adminPass = show ? '1' : '0';
            });
            screeningsPageRef.page = 1;
            refreshScreeningsPagination();
        };

        if (filterStatus && filterDate && resetFiltersBtn) {
            filterStatus.addEventListener('change', filterScreenings);
            if (filterMovie) filterMovie.addEventListener('change', filterScreenings);
            if (filterHall) filterHall.addEventListener('change', filterScreenings);
            filterDate.addEventListener('input', filterScreenings);
            
            resetFiltersBtn.addEventListener('click', () => {
                filterStatus.value = 'all';
                if (filterMovie) filterMovie.value = 'all';
                if (filterHall) filterHall.value = 'all';
                filterDate.value = '';
                filterScreenings();
            });
        }
    
        const openForm = (mode) => {
            slideFormOpen(screeningsContainer);
            managerTitle.innerText = mode === 'edit' ? 'Edytuj Seans' : 'Dodaj Seans';
            addScreeningBtn.classList.add('hidden');
            backToListBtn.classList.remove('hidden');
        };

        const closeForm = () => {
            slideFormClose(screeningsContainer);
            managerTitle.innerText = 'Repertuar Seansów';
            addScreeningBtn.classList.remove('hidden');
            backToListBtn.classList.add('hidden');
        };

        const closeManager = () => overlayHide(screeningsOverlay);

        openScreeningsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            overlayShow(screeningsOverlay);
            closeForm();
            screeningsPageRef.page = 1;
            refreshScreeningsPagination();
        });

        closeScreeningsBtn.addEventListener('click', closeManager);
        screeningsOverlay.addEventListener('click', (e) => { if(e.target === screeningsOverlay) closeManager(); });

        backToListBtn.addEventListener('click', closeForm);

        addScreeningBtn.addEventListener('click', () => {
            screeningForm.reset();
            screeningForm.action = '/admin/screenings/add';
            inputId.value = '';
            cancelledGroup.style.display = 'none'; 
            openForm('add');
        });

        const table = document.querySelector('#screeningsManagerContainer .admin-table');
        if(table) {
            table.addEventListener('click', (e) => {
                const btn = e.target.closest('.edit-screening-btn');
                if (!btn) return;
                const data = btn.dataset;

                screeningForm.action = '/admin/screenings/edit';
                inputId.value = data.id;
                inputMovie.value = data.movieId;
                inputHall.value = data.hallId;
                
                const datePart = data.date; 
                let timePart = data.time;
                if(timePart && timePart.length > 5) timePart = timePart.substring(0, 5);
                inputDate.value = `${datePart}T${timePart}`;
                
                cancelledGroup.style.display = 'block';
                inputCancelled.checked = (data.cancelled == '1' || data.cancelled == 'true');
                openForm('edit');
            });
        }

        if (screeningsTbody && screeningsPagBar) {
            adminTableInitPass(screeningsTbody);
            if (filterStatus && filterDate) {
                filterScreenings();
            } else {
                adminTableRows(screeningsTbody).forEach((r) => { r.dataset.adminPass = '1'; });
                screeningsPageRef.page = 1;
                refreshScreeningsPagination();
            }
        }

        if (window.location.hash === '#screenings') {
            overlayShow(screeningsOverlay);
            screeningsPageRef.page = 1;
            refreshScreeningsPagination();
            history.replaceState(null, null, ' ');
        }
    }

    const openBookingsBtn = document.getElementById('openBookingsManager');
    const bookingsOverlay = document.getElementById('bookingsManagerOverlay');
    const bookingsContainer = document.getElementById('bookingsManagerContainer');

    if (openBookingsBtn && bookingsOverlay) {
        
        const closeBookingsBtn = document.getElementById('closeBookingsManagerBtn');
        const bookingForm = document.getElementById('bookingForm');
        const managerTitle = document.getElementById('bookings-managerTitle');
        const backToListBtn = document.getElementById('backToBookingsListBtn');
        const addBookingBtn = document.getElementById('addBookingBtn');
        
        const inputId = document.getElementById('bookingId');
        const inputUser = document.getElementById('inputBookingUser');
        const inputScreening = document.getElementById('inputBookingScreening');
        const inputSeat = document.getElementById('inputBookingSeat');
        const inputStatus = document.getElementById('inputBookingStatus');

        const filterStatus = document.getElementById('filterBookingStatus');
        const filterMovie = document.getElementById('filterBookingMovie');
        const filterDate = document.getElementById('filterBookingDate');
        const resetFiltersBtn = document.getElementById('resetBookingFiltersBtn');

        const bookingsTbody = document.querySelector('#bookingsManagerContainer .admin-table tbody');
        const bookingsPagBar = document.getElementById('adminPaginationBookings');
        const bookingsPageRef = { page: 1 };
        const refreshBookingsPagination = () => {
            if (!bookingsTbody || !bookingsPagBar) return;
            adminTableApplyPagination(bookingsTbody, bookingsPageRef, bookingsPagBar);
        };

        const filterBookings = () => {
            if (!filterStatus || !filterMovie || !filterDate) return;
            const statusVal = filterStatus.value;
            const movieVal = filterMovie.value;
            const dateVal = filterDate.value;

            document.querySelectorAll('.booking-row').forEach((row) => {
                const rStatus = row.getAttribute('data-status');
                const rMovie = row.getAttribute('data-movie-id');
                const rDate = row.getAttribute('data-date');

                let show = true;
                if (statusVal !== 'all' && statusVal !== rStatus) show = false;
                if (movieVal !== 'all' && movieVal !== rMovie) show = false;
                if (dateVal && dateVal !== rDate) show = false;

                row.dataset.adminPass = show ? '1' : '0';
            });
            bookingsPageRef.page = 1;
            refreshBookingsPagination();
        };

        if(filterStatus) {
            filterStatus.addEventListener('change', filterBookings);
            filterMovie.addEventListener('change', filterBookings);
            filterDate.addEventListener('input', filterBookings);
            
            resetFiltersBtn.addEventListener('click', () => {
                filterStatus.value = 'all';
                filterMovie.value = 'all';
                filterDate.value = '';
                filterBookings();
            });
        }

        const openForm = (mode) => {
            slideFormOpen(bookingsContainer);
            managerTitle.innerText = mode === 'edit' ? 'Edytuj Bilet' : 'Dodaj Bilet';
            addBookingBtn.classList.add('hidden');
            backToListBtn.classList.remove('hidden');
        };

        const closeForm = () => {
            slideFormClose(bookingsContainer);
            managerTitle.innerText = 'Rezerwacje i Bilety';
            addBookingBtn.classList.remove('hidden');
            backToListBtn.classList.add('hidden');
        };

        const closeManager = () => overlayHide(bookingsOverlay);

        openBookingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            overlayShow(bookingsOverlay);
            closeForm();
            bookingsPageRef.page = 1;
            refreshBookingsPagination();
        });

        closeBookingsBtn.addEventListener('click', closeManager);
        bookingsOverlay.addEventListener('click', (e) => { if(e.target === bookingsOverlay) closeManager(); });
        backToListBtn.addEventListener('click', closeForm);

        addBookingBtn.addEventListener('click', () => {
            bookingForm.reset();
            bookingForm.action = '/admin/bookings/add';
            inputId.value = '';
            if (inputStatus) inputStatus.value = 'paid';
            openForm('add');
        });

        const table = document.querySelector('#bookingsManagerContainer .admin-table');
        if(table) {
            table.addEventListener('click', (e) => {
                const btn = e.target.closest('.edit-booking-btn');
                if (!btn) return;
                const data = btn.dataset;
                bookingForm.action = '/admin/bookings/edit';
                inputId.value = data.id;
                inputUser.value = data.userId;
                inputScreening.value = data.screeningId;
                inputSeat.value = data.seatNumber;
                inputStatus.value = data.status;
                openForm('edit');
            });
        }

        if (bookingsTbody && bookingsPagBar) {
            adminTableInitPass(bookingsTbody);
            if (filterStatus && filterMovie && filterDate) {
                filterBookings();
            } else {
                adminTableRows(bookingsTbody).forEach((r) => { r.dataset.adminPass = '1'; });
                bookingsPageRef.page = 1;
                refreshBookingsPagination();
            }
        }

        if (window.location.hash === '#bookings') {
            overlayShow(bookingsOverlay);
            bookingsPageRef.page = 1;
            refreshBookingsPagination();
            history.replaceState(null, null, ' ');
        }
    }

    const openStatsManagerBtn = document.getElementById('openStatsManager');
    const statsManagerOverlay = document.getElementById('statsManagerOverlay');
    const closeStatsManagerBtn = document.getElementById('closeStatsManagerBtn');

    if (openStatsManagerBtn && statsManagerOverlay) {
        const closeStatsModal = () => overlayHide(statsManagerOverlay);

        openStatsManagerBtn.addEventListener('click', (e) => {
            e.preventDefault();
            overlayShow(statsManagerOverlay);
        });

        if (closeStatsManagerBtn) {
            closeStatsManagerBtn.addEventListener('click', closeStatsModal);
        }

        statsManagerOverlay.addEventListener('click', (e) => {
            if (e.target === statsManagerOverlay) closeStatsModal();
        });

        if (window.location.hash === '#stats') {
            overlayShow(statsManagerOverlay);
            history.replaceState(null, null, ' ');
        }
    }

    const movieModalStandalone = document.getElementById('movieModal');
    const addMovieStandalone = document.getElementById('addMovieBtn');
    if (movieModalStandalone && addMovieStandalone && !openManagerBtn) {
        const closeModal = () => {
            movieModalStandalone.classList.add('hidden');
            movieModalStandalone.classList.remove('flex');
        };
        addMovieStandalone.addEventListener('click', () => {
            const mf = document.getElementById('movieForm');
            const mt = document.getElementById('modalTitle');
            if (mf) {
                mf.reset();
                mf.action = '/admin/movies/add';
                document.getElementById('movieId').value = '';
            }
            if (mt) mt.textContent = 'Dodaj Film';
            movieModalStandalone.classList.remove('hidden');
            movieModalStandalone.classList.add('flex');
        });
        const closeModalBtnEl = document.getElementById('closeModalBtn');
        if (closeModalBtnEl) {
            closeModalBtnEl.addEventListener('click', closeModal);
        }
        const cancelModalBtnEl = document.getElementById('cancelModalBtn');
        if (cancelModalBtnEl) {
            cancelModalBtnEl.addEventListener('click', closeModal);
        }
        movieModalStandalone.addEventListener('click', function (e) {
            if (e.target === movieModalStandalone) closeModal();
        });
        const standaloneTable = document.querySelector('.movies-table-container .admin-table');
        if (standaloneTable) {
            standaloneTable.addEventListener('click', (e) => {
                const btn = e.target.closest('.edit-movie-btn');
                if (!btn) return;
                const data = btn.dataset;
                const mf = document.getElementById('movieForm');
                if (mf) {
                    mf.action = '/admin/movies/edit';
                    document.getElementById('movieId').value = data.id;
                    document.getElementById('inputTitle').value = data.title;
                    document.getElementById('inputDescription').value = data.description;
                    document.getElementById('inputDuration').value = data.duration;
                    document.getElementById('inputImageUrl').value = data.imageUrl;
                    document.getElementById('inputYoutube').value = data.youtubeLink;
                    document.getElementById('inputReleaseDate').value = formatInputDate(data.releaseDate);
                    document.getElementById('inputEndDate').value = formatInputDate(data.endDate);
                }
                const mt = document.getElementById('modalTitle');
                if (mt) mt.textContent = 'Edytuj Film';
                movieModalStandalone.classList.remove('hidden');
                movieModalStandalone.classList.add('flex');
            });
        }
    }

});

const openTicketsBtn = document.getElementById('openTicketsChart');
const openRevenueBtn = document.getElementById('openRevenueChart');
const chartOverlay = document.getElementById('chartOverlay');
const closeChartBtn = document.getElementById('closeChartBtn');
const chartCanvas = document.getElementById('salesChart');
const filterBtns = document.querySelectorAll('.chart-filter-btn');
const chartTitle = document.querySelector('#chartOverlay .manager-header h2');

let myChart = null;
let currentMode = 'tickets';

if (typeof Chart !== 'undefined' && (openTicketsBtn || openRevenueBtn) && chartOverlay && chartCanvas) {

    const getChartConfig = (mode) => {
        if (mode === 'revenue') {
            return {
                label: 'Przychód (PLN)',
                color: '#e11d48',
                bgColor: 'rgba(225, 29, 72, 0.55)',
                bgColorEnd: 'rgba(225, 29, 72, 0)',
                title: 'Analiza Finansowa',
                apiParam: 'revenue'
            };
        } else {
            return {
                label: 'Sprzedane Bilety',
                color: '#22c55e', 
                bgColor: 'rgba(34, 197, 94, 0.6)',
                bgColorEnd: 'rgba(34, 197, 94, 0.0)',
                title: 'Analiza Sprzedaży',
                apiParam: 'tickets'
            };
        }
    };

    const fetchAndRenderChart = async (filterType) => {
        try {
            const config = getChartConfig(currentMode);
            if (chartTitle) chartTitle.innerText = config.title;

            const response = await fetch(`/admin/api/chart-data?type=${filterType}&dataType=${config.apiParam}`);
            
            const result = await response.json(); 

            if (myChart) myChart.destroy();

            const ctx = chartCanvas.getContext('2d');
            
            let gradient = ctx.createLinearGradient(0, 0, 0, 400);
            gradient.addColorStop(0, config.bgColor);
            gradient.addColorStop(1, config.bgColorEnd);

            myChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: result.labels,
                    datasets: [{
                        label: config.label,
                        data: result.data,
                        backgroundColor: gradient,
                        borderColor: config.color,
                        borderWidth: 3,
                        pointBackgroundColor: '#fff',
                        pointBorderColor: config.color,
                        pointBorderWidth: 2,
                        pointRadius: 5,
                        pointHoverRadius: 7,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: '#292524',
                            padding: 10,
                            titleFont: { size: 14 },
                            bodyFont: { size: 14, weight: 'bold' },
                            callbacks: {
                                label: (context) => ` ${config.label}: ${context.raw}`
                            }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            grid: { color: '#f1f5f9' }
                        },
                        x: {
                            grid: { display: false }
                        }
                    }
                }
            });

        } catch (err) {
            console.error(err);
        }
    };

    const chartOverlayShow = () => {
        chartOverlay.classList.remove('hidden');
        chartOverlay.classList.add('flex');
    };

    const chartOverlayHide = () => {
        chartOverlay.classList.add('hidden');
        chartOverlay.classList.remove('flex');
    };

    const chartFilterOn = ['bg-rose-600', 'text-white'];
    const chartFilterOff = ['bg-stone-200', 'text-stone-700'];

    const openChartModal = (mode) => {
        currentMode = mode;
        chartOverlayShow();

        filterBtns.forEach(b => {
            b.classList.remove(...chartFilterOn);
            b.classList.add(...chartFilterOff);
        });
        const todayBtn = document.querySelector('[data-filter="today"]');
        if (todayBtn) {
            todayBtn.classList.remove(...chartFilterOff);
            todayBtn.classList.add(...chartFilterOn);
        }

        fetchAndRenderChart('today');
    };


    if (openTicketsBtn) {
        openTicketsBtn.addEventListener('click', () => openChartModal('tickets'));
    }

    if (openRevenueBtn) {
        openRevenueBtn.addEventListener('click', () => openChartModal('revenue'));
    }

    const closeChart = () => chartOverlayHide();
    if (closeChartBtn) closeChartBtn.addEventListener('click', closeChart);
    chartOverlay.addEventListener('click', (e) => { if (e.target === chartOverlay) closeChart(); });

    filterBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const t = e.target.closest('.chart-filter-btn');
            if (!t) return;
            filterBtns.forEach(b => {
                b.classList.remove(...chartFilterOn);
                b.classList.add(...chartFilterOff);
            });
            t.classList.remove(...chartFilterOff);
            t.classList.add(...chartFilterOn);

            const filter = t.getAttribute('data-filter');
            fetchAndRenderChart(filter);
        });
    });
}