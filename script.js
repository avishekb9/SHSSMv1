document.addEventListener('DOMContentLoaded', () => {
    // --- CINEMATIC PRELOADER (skip on revisit) ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        if (sessionStorage.getItem('shssm-visited')) {
            preloader.classList.add('fade-out');
            preloader.style.display = 'none';
        } else {
            const preloaderTextSpans = document.querySelectorAll('.preloader-text span');
            window.addEventListener('load', () => {
                sessionStorage.setItem('shssm-visited', 'true');
                let delay = 0;
                preloaderTextSpans.forEach(span => {
                    span.style.animationDelay = `${delay}s`;
                    delay += 0.05;
                });
                setTimeout(() => preloader.classList.add('fade-out'), 3000);
                setTimeout(() => preloader.style.display = 'none', 3800);
            });
        }
    }

    // --- ENHANCED MOBILE NAVIGATION ---
    const navToggle = document.querySelector('.nav-toggle');
    const navbarEl = document.querySelector('.navbar');
    const mainNav = document.querySelector('.nav-menu');

    function closeMobileMenu() {
        if (!navbarEl) return;
        navbarEl.classList.remove('menu-open');
        if (navToggle) {
            navToggle.setAttribute('aria-expanded', 'false');
            const icon = navToggle.querySelector('i');
            if (icon) { icon.classList.remove('fa-times'); icon.classList.add('fa-bars'); }
        }
        // Close any open dropdowns
        document.querySelectorAll('.dropdown.open').forEach(dd => dd.classList.remove('open'));
    }

    if (navToggle && navbarEl) {
        navToggle.addEventListener('click', () => {
            const isOpen = navbarEl.classList.toggle('menu-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
            const icon = navToggle.querySelector('i');
            if (icon) {
                icon.classList.toggle('fa-bars', !isOpen);
                icon.classList.toggle('fa-times', isOpen);
            }
        });

        // Close menu when a nav link is clicked
        document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 992) closeMobileMenu();
            });
        });

        // Close on outside click
        document.addEventListener('click', (e) => {
            if (navbarEl.classList.contains('menu-open') && !navbarEl.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close on resize above breakpoint
        window.addEventListener('resize', () => {
            if (window.innerWidth > 992) closeMobileMenu();
        }, { passive: true });
    }

    // --- DYNAMIC MODAL LOGIC FOR FACULTY ---
    const disciplineCards = document.querySelectorAll('.discipline-card');
    const modalOverlays = document.querySelectorAll('.modal-overlay');
    const modalCloseButtons = document.querySelectorAll('.modal-close');

    disciplineCards.forEach(card => {
        card.addEventListener('click', () => {
            const modalId = card.getAttribute('data-modal-target');
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
                document.body.classList.add('no-scroll');
            }
        });
    });

    const closeModal = () => {
        modalOverlays.forEach(modal => modal.classList.remove('active'));
        document.body.classList.remove('no-scroll');
    };

    modalCloseButtons.forEach(button => button.addEventListener('click', closeModal));
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) closeModal();
        });
    });
    
    // --- ROBUST TAB FUNCTIONALITY & DROPDOWN-TO-TAB LINKING ---
    const allTabsContainers = document.querySelectorAll('.tabs-container');
    const dropdownLinks = document.querySelectorAll('.dropdown-menu a[data-tab-link]');

    const activateTab = (container, tabId) => {
        const tabButtons = container.querySelectorAll('.tab-button');
        const tabPanes = container.querySelectorAll('.tab-pane');
        const targetButton = container.querySelector(`.tab-button[data-tab="${tabId}"]`);
        const targetPane = container.querySelector(`#${tabId}`);

        if (targetButton && targetPane) {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabPanes.forEach(pane => pane.classList.remove('active'));
            targetButton.classList.add('active');
            targetPane.classList.add('active');
        }
    };
    
    allTabsContainers.forEach(container => {
        container.querySelectorAll('.tab-button').forEach(button => {
            button.addEventListener('click', () => {
                activateTab(container, button.getAttribute('data-tab'));
            });
        });
        const initialActiveButton = container.querySelector('.tab-button.active');
        if (initialActiveButton) activateTab(container, initialActiveButton.getAttribute('data-tab'));
    });

    dropdownLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const tabId = link.getAttribute('data-tab-link');
            const peopleTabsContainer = document.getElementById('people-tabs');
            if (tabId && peopleTabsContainer) {
                activateTab(peopleTabsContainer, tabId);
                // Close mobile menu if open
                closeMobileMenu();
            }
        });
    });

    // --- SCHOLAR DISCIPLINE FILTER ---
    document.querySelectorAll('.scholar-filters').forEach(filterNav => {
        const container = filterNav.nextElementSibling;
        if (!container || !container.hasAttribute('data-scholar-container')) return;
        const items = container.querySelectorAll('.scholar-item');
        const pills = filterNav.querySelectorAll('.scholar-pill');

        pills.forEach(pill => {
            pill.addEventListener('click', () => {
                const filter = pill.dataset.filter;
                pills.forEach(p => p.classList.remove('active'));
                pill.classList.add('active');

                items.forEach(item => {
                    const match = filter === 'all' || item.dataset.discipline === filter;
                    if (match) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            });
        });
    });

    // --- SCROLL-TRIGGERED FADE-IN ANIMATION ---
    const revealElements = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => observer.observe(el));

    // --- NAVBAR SHRINK ON SCROLL ---
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 60);
        }, { passive: true });
    }

    // --- SCROLL-SPY FOR ACTIVE NAV LINK ---
    const spySections = document.querySelectorAll('main section[id]');
    const navLinksAll = document.querySelectorAll('.nav-link');
    if (spySections.length) {
        window.addEventListener('scroll', () => {
            let current = '';
            spySections.forEach(sec => {
                if (window.pageYOffset >= sec.offsetTop - 120) current = sec.getAttribute('id');
            });
            navLinksAll.forEach(link => {
                link.classList.remove('active');
                const href = link.getAttribute('href');
                if (href === `#${current}` || (current === 'home' && href === '#home')) link.classList.add('active');
            });
        }, { passive: true });
    }

    // --- BACK TO TOP ---
    const backToTop = document.querySelector('.back-to-top');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 500);
        }, { passive: true });
        backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }

    // --- MOBILE DROPDOWN TOGGLE ---
    document.querySelectorAll('.dropdown').forEach(dd => {
        const trigger = dd.querySelector('.nav-link');
        if (!trigger) return;
        trigger.addEventListener('click', (e) => {
            if (window.innerWidth <= 992 && navbarEl && navbarEl.classList.contains('menu-open')) {
                e.preventDefault();
                // Close sibling dropdowns
                document.querySelectorAll('.dropdown.open').forEach(other => {
                    if (other !== dd) other.classList.remove('open');
                });
                dd.classList.toggle('open');
            }
        });
    });

    // --- PAGE TRANSITION FOR EVENT LINKS ---
    const pageOverlay = document.querySelector('.page-transition');
    document.querySelectorAll('a[href^="/events/"]').forEach(link => {
        link.addEventListener('click', (e) => {
            if (!pageOverlay) return;
            e.preventDefault();
            const target = link.href;
            pageOverlay.classList.add('active');
            setTimeout(() => { window.location.href = target; }, 450);
        });
    });

    // --- STAGGER GRID ANIMATIONS ---
    const staggerContainers = document.querySelectorAll('.research-grid, .labs-grid, .discipline-grid, .events-showcase');
    const staggerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                Array.from(entry.target.children).forEach((child, i) => {
                    child.classList.add('stagger-child');
                    setTimeout(() => child.classList.add('stagger-visible'), i * 100);
                });
                staggerObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    staggerContainers.forEach(el => staggerObserver.observe(el));
});