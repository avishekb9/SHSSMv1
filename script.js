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
    const mainNav = document.querySelector('.nav-menu');
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-menu--active');
        });
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
                if (mainNav.classList.contains('nav-menu--active')) {
                    mainNav.classList.remove('nav-menu--active');
                }
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
            if (window.innerWidth <= 992) {
                e.preventDefault();
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
    const staggerContainers = document.querySelectorAll('.research-grid, .labs-grid, .discipline-grid, .events-showcase, .competition-info');
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

    // --- LOGO SUBMISSION FORM FUNCTIONALITY ---
    const logoForm = document.getElementById('logo-submission-form');
    const membersContainer = document.getElementById('members-container');
    const addMemberBtn = document.getElementById('add-member-btn');
    const fileUploadArea = document.getElementById('file-upload-area');
    const logoFileInput = document.getElementById('logo-file');
    const filePreview = document.getElementById('file-preview');
    const previewImage = document.getElementById('preview-image');
    const fileName = document.getElementById('file-name');
    const fileSize = document.getElementById('file-size');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const formMessage = document.getElementById('form-message');
    const submitBtn = document.getElementById('submit-btn');

    let memberCount = 1;
    const MAX_MEMBERS = 5;
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    const MIN_RESOLUTION = 1000;

    // Add team member functionality
    if (addMemberBtn) {
        addMemberBtn.addEventListener('click', () => {
            if (memberCount >= MAX_MEMBERS) {
                addMemberBtn.disabled = true;
                return;
            }
            memberCount++;
            const memberEntry = document.createElement('div');
            memberEntry.className = 'member-entry removable';
            memberEntry.innerHTML = `
                <input type="text" name="member_${memberCount}_name" required placeholder="Member ${memberCount} Name">
                <select name="member_${memberCount}_discipline" required>
                    <option value="">Select Discipline</option>
                    <option value="Economics">Economics</option>
                    <option value="English">English</option>
                    <option value="Psychology">Psychology</option>
                    <option value="Philosophy">Philosophy</option>
                    <option value="Other">Other</option>
                </select>
                <input type="text" name="member_${memberCount}_roll" placeholder="Roll No. (Optional)">
                <button type="button" class="remove-member-btn" aria-label="Remove member"><i class="fas fa-times"></i></button>
            `;
            membersContainer.appendChild(memberEntry);

            // Add remove functionality
            memberEntry.querySelector('.remove-member-btn').addEventListener('click', () => {
                memberEntry.remove();
                memberCount--;
                addMemberBtn.disabled = false;
                updateMemberLabels();
            });

            if (memberCount >= MAX_MEMBERS) {
                addMemberBtn.disabled = true;
            }
        });
    }

    function updateMemberLabels() {
        const entries = membersContainer.querySelectorAll('.member-entry');
        entries.forEach((entry, index) => {
            const nameInput = entry.querySelector('input[type="text"]:first-child');
            if (nameInput) {
                nameInput.placeholder = `Member ${index + 1} Name`;
                nameInput.name = `member_${index + 1}_name`;
            }
            const selectInput = entry.querySelector('select');
            if (selectInput) selectInput.name = `member_${index + 1}_discipline`;
            const rollInput = entry.querySelector('input[placeholder*="Roll"]');
            if (rollInput) rollInput.name = `member_${index + 1}_roll`;
        });
    }

    // File upload functionality
    if (fileUploadArea && logoFileInput) {
        fileUploadArea.addEventListener('click', () => logoFileInput.click());

        fileUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            fileUploadArea.classList.add('drag-over');
        });

        fileUploadArea.addEventListener('dragleave', () => {
            fileUploadArea.classList.remove('drag-over');
        });

        fileUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            fileUploadArea.classList.remove('drag-over');
            const files = e.dataTransfer.files;
            if (files.length) {
                logoFileInput.files = files;
                handleFileSelect(files[0]);
            }
        });

        logoFileInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        // Validate file type
        const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!validTypes.includes(file.type)) {
            showMessage('Please upload a PNG or JPEG file only.', 'error');
            return;
        }

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
            showMessage('File size exceeds 10 MB limit.', 'error');
            return;
        }

        // Validate image resolution
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);
        img.onload = function() {
            URL.revokeObjectURL(objectUrl);
            if (img.width < MIN_RESOLUTION || img.height < MIN_RESOLUTION) {
                showMessage(`Image resolution should be at least ${MIN_RESOLUTION}×${MIN_RESOLUTION} pixels. Your image is ${img.width}×${img.height} px.`, 'error');
                return;
            }
            // Show preview
            displayFilePreview(file, objectUrl);
        };
        img.onerror = function() {
            URL.revokeObjectURL(objectUrl);
            showMessage('Could not read the image file.', 'error');
        };
        img.src = objectUrl;
    }

    function displayFilePreview(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            previewImage.src = e.target.result;
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            fileUploadArea.style.display = 'none';
            filePreview.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            logoFileInput.value = '';
            filePreview.style.display = 'none';
            fileUploadArea.style.display = 'block';
            previewImage.src = '';
            hideMessage();
        });
    }

    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = 'form-message ' + type;
    }

    function hideMessage() {
        formMessage.textContent = '';
        formMessage.className = 'form-message';
        formMessage.style.display = 'none';
    }

    // SHSSM form backend (Cloud Run)
    const API_BASE = (window.SHSSM_API_BASE || 'https://shssm-form-api-672903689767.asia-south1.run.app').replace(/\/$/, '');
    const SUBMISSION_ENDPOINT = `${API_BASE}/api/logo-submission`;

    async function submitLogo(file, teamName, members, email, concept) {
        const fd = new FormData();
        fd.append('team_name', teamName);
        fd.append('team_email', email);
        fd.append('design_concept', concept || '');
        fd.append('terms_agree', 'true');
        members.forEach((m, i) => {
            const idx = i + 1;
            fd.append(`member_${idx}_name`, m.name);
            fd.append(`member_${idx}_discipline`, m.discipline || '');
            fd.append(`member_${idx}_roll`, m.roll || '');
        });
        fd.append('logo_file', file, file.name);

        const res = await fetch(SUBMISSION_ENDPOINT, { method: 'POST', body: fd });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.ok === false) {
            const msg = (data.errors && data.errors.join('; ')) || data.error || `Upload failed (HTTP ${res.status})`;
            throw new Error(msg);
        }
        return data;
    }

    function collectMembersData() {
        const members = [];
        const entries = membersContainer.querySelectorAll('.member-entry');
        entries.forEach((entry, index) => {
            const name = entry.querySelector(`input[name="member_${index + 1}_name"]`)?.value || '';
            const discipline = entry.querySelector(`select[name="member_${index + 1}_discipline"]`)?.value || '';
            const roll = entry.querySelector(`input[name="member_${index + 1}_roll"]`)?.value || '';
            if (name) members.push({ name, discipline, roll });
        });
        return members;
    }

    if (logoForm) {
        logoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage();

            if (!logoFileInput.files.length) {
                showMessage('Please upload your logo file.', 'error');
                return;
            }

            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.disabled = true;

            try {
                const file = logoFileInput.files[0];
                const teamName = document.getElementById('team-name').value;
                const email = document.getElementById('team-email').value;
                const concept = document.getElementById('design-concept').value;
                const members = collectMembersData();

                await submitLogo(file, teamName, members, email, concept);

                showMessage('Your logo has been submitted successfully! Thank you for participating in the SHSSM Logo Design Competition.', 'success');

                logoForm.reset();
                filePreview.style.display = 'none';
                fileUploadArea.style.display = 'block';
                previewImage.src = '';

                while (membersContainer.children.length > 1) {
                    membersContainer.lastChild.remove();
                }
                memberCount = 1;
                addMemberBtn.disabled = false;

            } catch (error) {
                console.error('Upload error:', error);
                showMessage('There was an error submitting your logo: ' + error.message + '. Please try again or contact Dr. Avishek Bhandari.', 'error');
            } finally {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }
});