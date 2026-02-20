/* =========================================
   Main JavaScript Logic
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // --- Hero Slider Logic ---
    const slides = document.querySelectorAll('.hero-slide');
    const heroTitle = document.getElementById('hero-title');

    if (slides.length > 1) {
        let currentSlide = 0;

        setInterval(() => {
            // 1. Prepare to change - Fade out text
            if (heroTitle) heroTitle.classList.add('fade-out');

            setTimeout(() => {
                // 2. Change Slide
                slides[currentSlide].classList.remove('active');
                currentSlide = (currentSlide + 1) % slides.length;
                slides[currentSlide].classList.add('active');

                // 3. Update Text from new slide
                if (heroTitle) {
                    const newText = slides[currentSlide].getAttribute('data-text');
                    if (newText) heroTitle.textContent = newText;

                    // 4. Fade in text
                    heroTitle.classList.remove('fade-out');
                }
            }, 500); // 500ms matches CSS transition time

        }, 5000); // Change every 5 seconds (reduced for better UX with 3 slides)
    }
    // --- Mobile Menu Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const navbar = document.querySelector('.navbar');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navbar.classList.toggle('mobile-menu-open');
            const isActive = navbar.classList.contains('mobile-menu-open');
            navToggle.innerHTML = isActive ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';

            // Prevent body scroll when menu is open
            document.body.style.overflow = isActive ? 'hidden' : '';
        });
    }

    // --- Counter Animation Logic ---
    const counters = document.querySelectorAll('.stat-number');
    const speed = 200; // The lower the slower

    const animateCounters = () => {
        counters.forEach(counter => {
            const updateCount = () => {
                const target = +counter.getAttribute('data-target');
                const count = +counter.innerText;

                // Lower increment to update slower
                const inc = target / speed;

                if (count < target) {
                    // Add inc to count and output in counter
                    counter.innerText = Math.ceil(count + inc);
                    // Call function every ms
                    setTimeout(updateCount, 20);
                } else {
                    counter.innerText = target;
                }
            };
            updateCount();
        });
    };

    // Use Intersection Observer to trigger animation when visible
    const achievementsSection = document.querySelector('.achievements-section');
    if (achievementsSection) {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                animateCounters();
                observer.disconnect(); // Only run once
            }
        });
        observer.observe(achievementsSection);
    }

    // --- Dark Mode Logic (Imported & Adapted) ---
    const themeBtn = document.getElementById('theme-toggle');
    const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;

    // Check local storage or system preference
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

    let initialTheme = 'light';
    if (savedTheme === 'dark' || savedTheme === 'light') {
        initialTheme = savedTheme;
    } else {
        initialTheme = systemPrefersDark ? 'dark' : 'light';
    }

    document.body.classList.toggle('dark-mode', initialTheme === 'dark');
    updateThemeUI(initialTheme === 'dark');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isDark = !document.body.classList.contains('dark-mode');
            document.body.classList.toggle('dark-mode', isDark);
            updateThemeUI(isDark);
        });
    }

    function updateThemeUI(isDark) {
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        if (themeIcon) {
            themeIcon.classList.toggle('fa-sun', isDark);
            themeIcon.classList.toggle('fa-moon', !isDark);
        }
    }

    // --- Language Logic (Full Implementation) ---
    const langToggleBtn = document.getElementById('lang-toggle');
    const langTextSpan = langToggleBtn ? langToggleBtn.querySelector('.lang-text') : null;

    // Available languages from translations.js
    const availableLangs = typeof translations !== 'undefined' ? Object.keys(translations) : ['es', 'en'];
    const DEFAULT_LANG = 'es';

    // Load saved preference
    let currentLang = localStorage.getItem('language') || DEFAULT_LANG;
    if (!availableLangs.includes(currentLang)) currentLang = DEFAULT_LANG;

    function getText(lang, key) {
        if (typeof translations === 'undefined') return null;
        if (translations[lang] && translations[lang][key] != null) return translations[lang][key];
        if (translations[DEFAULT_LANG] && translations[DEFAULT_LANG][key] != null) return translations[DEFAULT_LANG][key];
        return null;
    }

    function updateLanguage(lang) {
        if (!availableLangs.includes(lang)) lang = DEFAULT_LANG;

        // 1. Update Text Content
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const value = getText(lang, key);
            if (value == null) return;

            // Preserve icons if present (simple check)
            const icon = element.querySelector('i');
            if (icon) {
                // If it has children (like icon), we assume text is a node next to it
                // This is a simple safe approach: keep icon, update text
                // Determine if icon is start or end? Assuming start for now or specific structure
                // For this specific project, most links are Text <i...> or <i...> Text
                // Let's rebuild:
                if (element.classList.contains('btn-creative')) {
                    // Specific case for Hero Button: Text <i...>
                    element.innerHTML = `${value} <i class="fas fa-arrow-right"></i>`;
                } else if (element.tagName === 'A' && element.querySelector('.fa-chevron-down')) {
                    // Specific case for Dropdown: Text <i...>
                    element.innerHTML = `${value} <i class="fas fa-chevron-down"></i>`;
                } else {
                    // Generic: just set text textContent (might lose icon if not careful)
                    // Safest: Iterate childNodes and replace text node
                    let textNodeUpdated = false;
                    element.childNodes.forEach(node => {
                        if (node.nodeType === Node.TEXT_NODE && node.textContent.trim().length > 0) {
                            node.textContent = value;
                            textNodeUpdated = true;
                        }
                    });
                    if (!textNodeUpdated) {
                        // Fallback structure check
                        if (element.children.length === 0) element.textContent = value;
                    }
                }
            } else {
                element.textContent = value;
            }
        });

        // 2. Update Placeholders
        const placeholders = document.querySelectorAll('[data-i18n-placeholder]');
        placeholders.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const value = getText(lang, key);
            if (value) element.placeholder = value;
        });

        // 3. Update Data Attributes (Hero Slider)
        const dataTexts = document.querySelectorAll('[data-i18n-data-text]');
        dataTexts.forEach(element => {
            const key = element.getAttribute('data-i18n-data-text');
            const value = getText(lang, key);
            if (value) {
                element.setAttribute('data-text', value);
                // Should also update visible text if active
                if (element.classList.contains('active')) {
                    const heroTitle = document.getElementById('hero-title');
                    if (heroTitle) heroTitle.textContent = value;
                }
            }
        });

        // 4. Update Toggle Text
        if (langTextSpan) {
            langTextSpan.textContent = lang.toUpperCase();
        }

        // 5. Save Preference
        localStorage.setItem('language', lang);
        currentLang = lang;
    }

    // Initialize
    updateLanguage(currentLang);

    // Event Listener
    if (langToggleBtn) {
        langToggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const idx = availableLangs.indexOf(currentLang);
            const nextLang = availableLangs[(idx + 1) % availableLangs.length];
            updateLanguage(nextLang);
        });
    }

    // --- Gallery Modal Logic ---
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('caption');
    const closeBtn = document.getElementsByClassName('modal-close')[0];

    // Get all images that are part of galleries
    const galleryImages = document.querySelectorAll('.gallery-img');

    galleryImages.forEach(img => {
        img.addEventListener('click', function () {
            modal.style.display = "block";
            modalImg.src = this.src;
            captionText.innerHTML = this.alt;
        });
    });

    if (closeBtn) {
        closeBtn.onclick = function () {
            modal.style.display = "none";
        }
    }

    // Close on outside click
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
});
