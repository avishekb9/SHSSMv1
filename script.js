document.addEventListener('DOMContentLoaded', () => {
    // --- CINEMATIC PRELOADER ---
    const preloader = document.getElementById('preloader');
    if (preloader) {
        const preloaderTextSpans = document.querySelectorAll('.preloader-text span');
        window.addEventListener('load', () => {
            let delay = 0;
            preloaderTextSpans.forEach(span => {
                span.style.animationDelay = `${delay}s`;
                delay += 0.05;
            });
            setTimeout(() => preloader.classList.add('fade-out'), 3000);
            setTimeout(() => preloader.style.display = 'none', 3800);
        });
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

    // GitHub API Configuration
    const GITHUB_TOKEN = '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';
    const GITHUB_REPO = 'avishekb9/SHSSMv1';
    const UPLOAD_PATH = 'logos';

    // Convert file to base64
    function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                // Remove the data URL prefix (e.g., "data:image/png;base64,")
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Generate safe filename
    function generateFilename(teamName, originalName) {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const safeName = teamName.toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 30);
        const extension = originalName.split('.').pop().toLowerCase();
        return `${safeName}_${timestamp}.${extension}`;
    }

    // Collect team members data
    function collectMembersData() {
        const members = [];
        const entries = membersContainer.querySelectorAll('.member-entry');
        entries.forEach((entry, index) => {
            const name = entry.querySelector(`input[name="member_${index + 1}_name"]`)?.value || '';
            const discipline = entry.querySelector(`select[name="member_${index + 1}_discipline"]`)?.value || '';
            const roll = entry.querySelector(`input[name="member_${index + 1}_roll"]`)?.value || '';
            if (name) {
                members.push({ name, discipline, roll });
            }
        });
        return members;
    }

    // Upload to GitHub
    async function uploadToGitHub(file, teamName, members, email, concept) {
        const filename = generateFilename(teamName, file.name);
        const base64Content = await fileToBase64(file);

        // Create commit message with metadata
        const membersList = members.map(m => `  - ${m.name} (${m.discipline}${m.roll ? ', ' + m.roll : ''})`).join('\n');
        const commitMessage = `Logo submission: ${teamName}

Team: ${teamName}
Contact: ${email}
Members:
${membersList}
${concept ? '\nConcept: ' + concept.substring(0, 200) : ''}

Submitted: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST`;

        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${UPLOAD_PATH}/${filename}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Content-Type': 'application/json',
                'Accept': 'application/vnd.github.v3+json'
            },
            body: JSON.stringify({
                message: commitMessage,
                content: base64Content
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Upload failed');
        }

        return await response.json();
    }

    // Form submission
    if (logoForm) {
        logoForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage();

            // Validate file is selected
            if (!logoFileInput.files.length) {
                showMessage('Please upload your logo file.', 'error');
                return;
            }

            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoading = submitBtn.querySelector('.btn-loading');

            // Show loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            submitBtn.disabled = true;

            try {
                const file = logoFileInput.files[0];
                const teamName = document.getElementById('team-name').value;
                const email = document.getElementById('team-email').value;
                const concept = document.getElementById('design-concept').value;
                const members = collectMembersData();

                // Upload to GitHub
                await uploadToGitHub(file, teamName, members, email, concept);

                showMessage('Your logo has been submitted successfully! Thank you for participating in the SHSSM Logo Design Competition.', 'success');

                // Reset form
                logoForm.reset();
                filePreview.style.display = 'none';
                fileUploadArea.style.display = 'block';
                previewImage.src = '';

                // Reset members
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