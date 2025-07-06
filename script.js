document.addEventListener('DOMContentLoaded', () => {
    
    // Encapsulate all functionality within a single App object for organization
    const App = {
        // Centralized element selectors for easy maintenance and performance
        els: {
            html: document.documentElement,
            header: document.getElementById('home'),
            headerBackground: document.querySelector('.header-background'),
            headerContent: document.querySelector('.header-content'),
            nav: document.getElementById('main-nav'),
            navToggle: document.querySelector('.nav-toggle'),
            navLinksContainer: document.getElementById('nav-links'),
            themeSwitch: document.getElementById('theme-switch'),
            backToTopBtn: document.getElementById('back-to-top'),
            contactForm: document.getElementById('contact-form'),
            formStatus: document.getElementById('form-status'),
            tourFilters: document.getElementById('tour-filters'),
            toursGrid: document.getElementById('tours-grid'),
            faqContainer: document.getElementById('faq-container'),
            tourModal: {
                overlay: document.getElementById('tour-modal'),
                closeBtn: document.getElementById('modal-close-btn'),
                bookBtn: document.getElementById('modal-book-btn'),
                img: document.getElementById('modal-img'),
                title: document.getElementById('modal-title'),
                price: document.getElementById('modal-price'),
                description: document.getElementById('modal-description'),
            },
            testimonialSlider: document.getElementById('testimonial-slider'),
            paginationDots: document.getElementById('pagination-dots'),
        },

        // Application state, like the testimonial timer
        state: {
            testimonialInterval: null,
            currentSlide: 0,
        },

        // Initialize all application modules
        init() {
            this.initParallaxHeader();
            this.initTheme();
            this.initMobileNav();
            this.initScrollEffects();
            this.initIntersectionObservers();
            this.initTourModal();
            this.initTestimonialSlider();
            this.initFormHandler();
            this.initTourFilters();
            this.initFaqAccordion();
        },

       
        // This effect is disabled on touch devices for better performance.
        initParallaxHeader() {
            const { header, headerBackground, headerContent } = this.els;
            if (!header || !headerBackground || !headerContent || window.matchMedia("(pointer: coarse)").matches) {
                return;
            }

            header.addEventListener('mousemove', (e) => {
                const { clientX, clientY } = e;
                const { offsetWidth, offsetHeight } = header;

                // Calculate rotation based on mouse position from the center of the header
                const yRotation = 15 * ((clientX - offsetWidth / 2) / offsetWidth);
                const xRotation = -15 * ((clientY - offsetHeight / 2) / offsetHeight);
                
                // Apply a more pronounced transform to the content for a 3D feel
                headerContent.style.transform = `rotateX(${xRotation}deg) rotateY(${yRotation}deg) translateZ(50px)`;
                
                // Apply a subtler transform to the background to create depth
                const bgYRotation = yRotation * 0.5;
                const bgXRotation = xRotation * 0.5;
                headerBackground.style.transform = `scale(1.1) rotateX(${bgXRotation}deg) rotateY(${bgYRotation}deg)`;
            });

            // Reset the transforms smoothly when the mouse leaves the header
            header.addEventListener('mouseleave', () => {
                headerContent.style.transform = `rotateX(0) rotateY(0) translateZ(0)`;
                headerBackground.style.transform = 'scale(1.1) rotateX(0) rotateY(0)';
            });
        },

        // Manages the light/dark theme switcher and saves the user's preference
        initTheme() {
            const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
            this.setTheme(savedTheme);
            this.els.themeSwitch.addEventListener('click', () => this.setTheme(this.els.html.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));
        },
        setTheme(theme) {
            this.els.html.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this.els.themeSwitch.setAttribute('aria-checked', theme === 'dark');
        },

        // Handles the mobile navigation toggle and closing behavior
        initMobileNav() {
            if (!this.els.navToggle || !this.els.navLinksContainer) return;
            this.els.navToggle.addEventListener('click', () => {
                const isExpanded = this.els.navLinksContainer.classList.toggle('nav-open');
                this.els.navToggle.setAttribute('aria-expanded', isExpanded);
                const icon = this.els.navToggle.querySelector('i');
                icon.classList.toggle('fa-bars', !isExpanded);
                icon.classList.toggle('fa-xmark', isExpanded);
                document.body.style.overflow = isExpanded ? 'hidden' : '';
            });

            // Close nav when a link is clicked for seamless single-page navigation
            this.els.navLinksContainer.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && this.els.navLinksContainer.classList.contains('nav-open')) {
                    this.els.navToggle.click(); // Simulate a click to properly toggle all states
                }
            });
        },
        
        // Handles scroll-based UI changes like the sticky nav background and back-to-top button
        initScrollEffects() {
            window.addEventListener('scroll', () => {
                this.els.nav.classList.toggle('nav-scrolled', window.scrollY > 50);
                this.els.backToTopBtn.classList.toggle('visible', window.scrollY > 300);
            }, { passive: true });
            this.els.backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        },
        
        // Manages the tour details modal popup
        initTourModal() {
            if (!this.els.toursGrid) return;

            const openModal = (card) => {
                const { title, location, price, img, description } = card.dataset;
                const { tourModal } = this.els;

                tourModal.img.src = img;
                tourModal.img.alt = `Photo of ${title}`;
                tourModal.title.textContent = title;
                tourModal.price.textContent = `${location} · ${price}`;
                tourModal.description.textContent = description;
                
                tourModal.overlay.hidden = false;
                tourModal.overlay.classList.add('is-open');
                document.body.style.overflow = 'hidden';
            };

            const closeModal = () => {
                const { tourModal } = this.els;
                tourModal.overlay.classList.remove('is-open');
                document.body.style.overflow = '';
                // Hide element after the closing animation completes for accessibility
                setTimeout(() => {
                    tourModal.overlay.hidden = true;
                }, 400); // Must match CSS transition duration
            };

            this.els.toursGrid.addEventListener('click', (e) => {
                const card = e.target.closest('.tour-card');
                if (card) openModal(card);
            });

            this.els.tourModal.overlay.addEventListener('click', (e) => { if (e.target === this.els.tourModal.overlay) closeModal(); });
            this.els.tourModal.closeBtn.addEventListener('click', closeModal);
            this.els.tourModal.bookBtn.addEventListener('click', closeModal);
            document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && this.els.tourModal.overlay.classList.contains('is-open')) closeModal(); });
        },

        // Handles filtering logic for the tour cards
        initTourFilters() {
            if (!this.els.tourFilters) return;
            this.els.tourFilters.addEventListener('click', (e) => {
                const target = e.target;
                if (!target.matches('.filter-btn')) return;

                this.els.tourFilters.querySelector('.filter-btn.active').classList.remove('active');
                target.classList.add('active');

                const filter = target.dataset.filter;
                this.els.toursGrid.querySelectorAll('.tour-card').forEach(card => {
                    const category = card.dataset.category;
                    card.classList.toggle('hidden', filter !== 'all' && filter !== category);
                });
            });
        },

        // Manages the FAQ accordion functionality
        initFaqAccordion() {
            if (!this.els.faqContainer) return;
            this.els.faqContainer.addEventListener('click', e => {
                const questionBtn = e.target.closest('.faq-question');
                if (!questionBtn) return;
                
                const answer = questionBtn.nextElementSibling;
                const isExpanded = questionBtn.getAttribute('aria-expanded') === 'true';
                
                questionBtn.setAttribute('aria-expanded', !isExpanded);
                answer.style.maxHeight = isExpanded ? '0px' : `${answer.scrollHeight}px`;
            });
        },

        // Initializes the auto-playing, fading testimonial slider
        initTestimonialSlider() {
            const slides = this.els.testimonialSlider.querySelectorAll('.testimonial-slide');
            if (slides.length <= 1) {
                if (slides.length === 1) slides[0].classList.add('active');
                this.els.paginationDots.hidden = true;
                return;
            }

            this.els.paginationDots.innerHTML = '';
            slides.forEach((_, i) => {
                const dot = document.createElement('button');
                dot.classList.add('dot');
                dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
                dot.addEventListener('click', () => { this.showSlide(i); this.resetInterval(); });
                this.els.paginationDots.appendChild(dot);
            });
            
            this.showSlide(0);
            this.resetInterval();
        },
        showSlide(n) {
            const slides = this.els.testimonialSlider.querySelectorAll('.testimonial-slide');
            const dots = this.els.paginationDots.querySelectorAll('.dot');
            if (!slides.length || !dots.length) return;

            slides[this.state.currentSlide].classList.remove('active');
            dots[this.state.currentSlide].classList.remove('active');
            
            this.state.currentSlide = (n + slides.length) % slides.length;
            
            slides[this.state.currentSlide].classList.add('active');
            dots[this.state.currentSlide].classList.add('active');
        },
        resetInterval() {
            clearInterval(this.state.testimonialInterval);
            const slides = this.els.testimonialSlider.querySelectorAll('.testimonial-slide');
            if (slides.length > 1) {
                this.state.testimonialInterval = setInterval(() => this.showSlide(this.state.currentSlide + 1), 6000);
            }
        },

        // Handles the contact form submission with a simulated success message
        initFormHandler() {
            if (!this.els.contactForm) return;
            this.els.contactForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const submitButton = this.els.contactForm.querySelector('button[type="submit"]');
                submitButton.textContent = 'Sending...';
                submitButton.disabled = true;
                
                setTimeout(() => {
                    this.els.formStatus.textContent = 'Thank you for your message! We will get back to you shortly.';
                    this.els.formStatus.className = 'form-status-success';
                    this.els.contactForm.reset();
                    submitButton.textContent = 'Send Message';
                    submitButton.disabled = false;
                    
                    setTimeout(() => { this.els.formStatus.style.display = 'none'; }, 5000);
                }, 1000);
            });
        },

        // Uses Intersection Observers for performance-friendly scroll-based animations
        initIntersectionObservers() {
            const sections = document.querySelectorAll('main > .section');
            const navLinks = document.querySelectorAll('.nav-links a');
            
            // Observer for fading in sections as they enter the viewport
            const sectionFadeObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('is-visible');
                        // Trigger counter animation only when the 'why-us' section is visible
                        if (entry.target.id === 'why-us') {
                            this.animateCounters(entry.target);
                        }
                    }
                });
            }, { threshold: 0.1 });
            
            sections.forEach(section => sectionFadeObserver.observe(section));
            
            // Observer for highlighting the current navigation link based on scroll position
            const navHighlighterObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const id = entry.target.getAttribute('id');
                        const activeLink = document.querySelector(`.nav-links a[href="#${id}"]`);
                        navLinks.forEach(link => link.classList.remove('active-link'));
                        if (activeLink) activeLink.classList.add('active-link');
                    }
                });
            }, { rootMargin: '-30% 0px -70% 0px' });
            
            document.querySelectorAll('section[id], header[id]').forEach(section => {
                navHighlighterObserver.observe(section);
            });
        },
        
        // Animates the number counters in the 'Why Us' section
        animateCounters(section) {
            const counters = section.querySelectorAll('.number');
            counters.forEach(counter => {
                if (counter.dataset.animated) return; // Prevent re-animation
                counter.dataset.animated = 'true';

                const target = +counter.dataset.target;
                counter.innerText = '0';
                
                const updateCounter = () => {
                    const current = +counter.innerText;
                    const increment = Math.ceil(target / 100);

                    if (current < target) {
                        counter.innerText = `${Math.min(current + increment, target)}`;
                        setTimeout(updateCounter, 15);
                    } else {
                        counter.innerText = target.toLocaleString();
                    }
                };
                updateCounter();
            });
        }
    };

    App.init();
});