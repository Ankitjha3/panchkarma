/* ===================================================
   LANDING PAGE — JavaScript Interactions
   =================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ---- Navbar Scroll Effect ----
  const nav = document.getElementById('mainNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // ---- Mobile Navigation ----
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileClose = document.getElementById('mobileClose');

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      mobileNav.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  }

  if (mobileClose) {
    mobileClose.addEventListener('click', closeMobileNav);
  }

  // ---- FAQ Accordion ----
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close all
      faqItems.forEach(i => i.classList.remove('active'));
      // Toggle clicked
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // ---- Scroll Animations (Intersection Observer) ----
  const animateElements = document.querySelectorAll('.animate-fade-in-up, .animate-fade-in, .animate-slide-right');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        entry.target.classList.add('animated');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  animateElements.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });

  // ---- Smooth Scroll for Anchor Links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});

// Global function for mobile nav close
function closeMobileNav() {
  const mobileNav = document.getElementById('mobileNav');
  mobileNav.classList.remove('active');
  document.body.style.overflow = '';
}
