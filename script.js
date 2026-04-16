'use strict';

/* ── NAVBAR: scroll shadow + active link ─────────────────── */
const navbar = document.getElementById('navbar');
const sections = document.querySelectorAll('section[id], footer[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const onScroll = () => {
  // Scrolled class
  navbar.classList.toggle('scrolled', window.scrollY > 60);

  // Active nav link
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 120) {
      current = sec.id;
    }
  });
  navLinks.forEach(a => {
    const matches = a.getAttribute('href') === `#${current}`;
    a.classList.toggle('active', matches);
  });
};

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── MOBILE MENU ─────────────────────────────────────────── */
const navToggle = document.querySelector('.nav-toggle');
const navMenu   = document.querySelector('.nav-links');

navToggle.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', String(isOpen));
});

// Close when a link is clicked
navMenu.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
  });
});

/* ── GALLERY FILTERING ───────────────────────────────────── */
const filterBtns  = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;
    let delay = 0;

    galleryItems.forEach(item => {
      const matches = filter === 'all' || item.dataset.category === filter;
      if (matches) {
        item.classList.remove('hidden');
        // Stagger animation
        item.style.animationDelay = `${delay}ms`;
        item.classList.remove('animate-in');
        // Force reflow to restart animation
        void item.offsetWidth;
        item.classList.add('animate-in');
        delay += 50;
      } else {
        item.classList.add('hidden');
      }
    });
  });
});

/* ── LIGHTBOX ────────────────────────────────────────────── */
const lightbox   = document.getElementById('lightbox');
const lbBackdrop = document.getElementById('lightbox-backdrop');
const lbImg      = document.getElementById('lb-img');
const lbCategory = document.getElementById('lb-category');
const lbTitle    = document.getElementById('lb-title');
const lbCurrent  = document.getElementById('lb-current');
const lbTotal    = document.getElementById('lb-total');

let currentIndex  = 0;
let visibleItems  = [];

function openLightbox(index) {
  visibleItems = [...galleryItems].filter(i => !i.classList.contains('hidden'));
  currentIndex = index;
  lbTotal.textContent = visibleItems.length;
  showImage(currentIndex);
  lightbox.hidden   = false;
  lbBackdrop.hidden = false;
  document.body.style.overflow = 'hidden';
  lightbox.focus();
}

function closeLightbox() {
  lightbox.hidden   = true;
  lbBackdrop.hidden = true;
  document.body.style.overflow = '';
}

function showImage(idx) {
  if (idx < 0) idx = visibleItems.length - 1;
  if (idx >= visibleItems.length) idx = 0;
  currentIndex = idx;

  const item = visibleItems[idx];
  const imgEl = item.querySelector('img');

  // Animate out then in
  lbImg.style.opacity = '0';
  lbImg.style.transform = 'scale(0.95)';

  setTimeout(() => {
    lbImg.src = imgEl.src.replace(/w=800/, 'w=1400');
    lbImg.alt = imgEl.alt;
    lbCategory.textContent = item.querySelector('.gallery-category').textContent;
    lbTitle.textContent    = item.querySelector('.gallery-title').textContent;
    lbCurrent.textContent  = idx + 1;

    lbImg.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    lbImg.style.opacity = '1';
    lbImg.style.transform = 'scale(1)';
  }, 120);
}

// Open lightbox when a gallery item is clicked
galleryItems.forEach(item => {
  item.addEventListener('click', () => {
    visibleItems = [...galleryItems].filter(i => !i.classList.contains('hidden'));
    const idx = visibleItems.indexOf(item);
    openLightbox(idx);
  });
});

document.querySelector('.lb-close').addEventListener('click', closeLightbox);
lbBackdrop.addEventListener('click', closeLightbox);
document.querySelector('.lb-prev').addEventListener('click', () => showImage(currentIndex - 1));
document.querySelector('.lb-next').addEventListener('click', () => showImage(currentIndex + 1));

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (lightbox.hidden) return;
  if (e.key === 'Escape')     closeLightbox();
  if (e.key === 'ArrowLeft')  showImage(currentIndex - 1);
  if (e.key === 'ArrowRight') showImage(currentIndex + 1);
});

// Touch swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 50) showImage(currentIndex + (diff > 0 ? 1 : -1));
});

/* ── SCROLL-REVEAL ───────────────────────────────────────── */
const revealEls = document.querySelectorAll(
  '#portfolio .section-header, .gallery-item, #about .about-image, #about .about-content, #contact .contact-info, .contact-form'
);

revealEls.forEach(el => el.classList.add('reveal'));

const revealObserver = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

revealEls.forEach(el => revealObserver.observe(el));

/* ── CONTACT FORM ────────────────────────────────────────── */
const form        = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');

form.addEventListener('submit', e => {
  e.preventDefault();

  let valid = true;
  ['name', 'email', 'message'].forEach(id => {
    const field = document.getElementById(id);
    const empty = !field.value.trim();
    const invalidEmail = id === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value);

    if (empty || invalidEmail) {
      field.classList.add('error');
      valid = false;
    } else {
      field.classList.remove('error');
    }
  });

  if (!valid) return;

  // Simulate send
  const submitBtn = form.querySelector('[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Sending…';

  setTimeout(() => {
    form.reset();
    submitBtn.disabled = false;
    submitBtn.textContent = 'Send Message';
    formSuccess.hidden = false;
    setTimeout(() => { formSuccess.hidden = true; }, 5000);
  }, 1200);
});

// Remove error state on input
form.querySelectorAll('input, textarea').forEach(el => {
  el.addEventListener('input', () => el.classList.remove('error'));
});

/* ── FOOTER YEAR ─────────────────────────────────────────── */
document.getElementById('year').textContent = new Date().getFullYear();
