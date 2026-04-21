// ============================================
// INFRANEST — Frontend JS v3.0
// ============================================

// Navbar scroll effect
window.addEventListener('scroll', () => {
  const navbar = document.querySelector('.navbar');
  if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 50);
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (scrollBtn) scrollBtn.classList.toggle('visible', window.scrollY > 500);
});

// Mobile menu
function toggleMenu() {
  const links = document.querySelector('.nav-links');
  if (links) links.classList.toggle('open');
}

// Scroll to top
function scrollToTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

// User dropdown toggle
function toggleUserMenu() {
  const dropdown = document.getElementById('userDropdown');
  if (dropdown) dropdown.classList.toggle('open');
}

// Close dropdown on outside click
document.addEventListener('click', (e) => {
  const dropdown = document.getElementById('userDropdown');
  const userIcon = document.querySelector('.user-icon');
  if (dropdown && !dropdown.contains(e.target) && userIcon && !userIcon.contains(e.target)) {
    dropdown.classList.remove('open');
  }
});

// DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  // Trigger main content fade-in
  document.querySelector(".main-content")?.classList.add("loaded");

  // Global image load handler to prevent flash and force cache-busting
  document.querySelectorAll("img").forEach(img => {
    // Dynamic Cache Busting
    const src = img.getAttribute("src");
    if (src && !src.includes("?v=") && !src.startsWith("data:")) {
      img.setAttribute("src", src + "?v=" + Date.now());
    }

    if (img.complete) {
      img.classList.add("loaded");
    } else {
      img.addEventListener("load", () => {
        img.classList.add("loaded");
      });
      img.addEventListener("error", () => {
        img.style.opacity = "1";
      });
    }
  });

  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      const links = document.querySelector('.nav-links');
      if (links) links.classList.remove('open');
    });
  });

  // Inject scroll-to-top button
  if (!document.getElementById('scrollTopBtn')) {
    const btn = document.createElement('button');
    btn.id = 'scrollTopBtn';
    btn.className = 'scroll-top';
    btn.innerHTML = '<i class="fas fa-chevron-up"></i>';
    btn.title = 'Scroll to top';
    btn.addEventListener('click', scrollToTop);
    document.body.appendChild(btn);
  }

  // Intersection Observer for fade-up
  window.fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });

  document.querySelectorAll('.fade-up').forEach(el => window.fadeObserver.observe(el));

  // Counter animation
  document.querySelectorAll('.stat-number[data-target]').forEach(counter => {
    const cObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCounter(counter); cObs.unobserve(counter); }
      });
    }, { threshold: 0.4 });
    cObs.observe(counter);
  });

  // Dynamic User Icon / Menu Logic
  updateUserMenu();
  
  // Init testimonial slider if exists
  initTestimonialSlider();

  // Load global company info
  loadCompanyInfo();
});

// Load Company Info Globally
async function loadCompanyInfo() {
  try {
    const res = await fetch('/api/settings');
    const response = await res.json();
    if (response && response.success && response.data) {
      const data = response.data;
      
      // Update phone numbers
      document.querySelectorAll('.dynamic-phone').forEach(el => {
        if(el.tagName === 'A') el.href = `tel:${data.company_phone}`;
        el.innerHTML = `${el.querySelector('i') ? el.querySelector('i').outerHTML + ' ' : ''}${data.company_phone}`;
      });

      // Update emails
      document.querySelectorAll('.dynamic-email').forEach(el => {
        if(el.tagName === 'A') el.href = `mailto:${data.company_email}`;
        el.innerHTML = `${el.querySelector('i') ? el.querySelector('i').outerHTML + ' ' : ''}${data.company_email}`;
      });

      // Update addresses
      document.querySelectorAll('.dynamic-address').forEach(el => {
        el.innerHTML = `${el.querySelector('i') ? el.querySelector('i').outerHTML + ' ' : ''}${data.company_address}`;
      });

      // Update about description (footer, etc)
      document.querySelectorAll('.dynamic-about').forEach(el => {
        el.innerHTML = data.about_description;
      });
    }
  } catch (err) {
    console.error('Failed to load company info globally:', err);
  }
}


// Update User Menu based on Login Status
function updateUserMenu() {
  const role = localStorage.getItem("role");
  const dropdown = document.getElementById('userDropdown');
  const userIcon = document.querySelector('.user-icon');
  const navLinks = document.getElementById('navLinks');
  
  if (!dropdown) return;

  let mobileAuthHTML = '';

  if (!role) {
    // NOT logged in
    dropdown.innerHTML = `
      <a href="login.html"><i class="fas fa-sign-in-alt"></i> Login</a>
      <a href="login.html?tab=signup"><i class="fas fa-user-plus"></i> Sign Up</a>
    `;
    mobileAuthHTML = `
      <div class="mobile-auth-divider"></div>
      <a href="login.html" class="mobile-auth-link"><i class="fas fa-sign-in-alt" style="color:var(--accent); width:28px; text-align:left;"></i> Login</a>
      <a href="login.html?tab=signup" class="mobile-auth-link"><i class="fas fa-user-plus" style="color:var(--accent); width:28px; text-align:left;"></i> Sign Up</a>
    `;
    // If not logged in, clicking the icon redirects to login.html
    if (userIcon) {
        userIcon.onclick = null;
        userIcon.addEventListener('click', () => {
            window.location.href = 'login.html';
        });
    }
  } else if (role === 'admin') {
    // Logged in as ADMIN
    dropdown.innerHTML = `
      <a href="admin/dashboard.html"><i class="fas fa-tachometer-alt"></i> Admin Dashboard</a>
      <a href="#" id="globalLogoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
    `;
    mobileAuthHTML = `
      <div class="mobile-auth-divider"></div>
      <a href="admin/dashboard.html" class="mobile-auth-link"><i class="fas fa-tachometer-alt" style="color:var(--accent); width:28px; text-align:left;"></i> Admin Dashboard</a>
      <a href="#" class="mobile-auth-link" id="mobileLogoutBtn"><i class="fas fa-sign-out-alt" style="color:var(--accent); width:28px; text-align:left;"></i> Logout</a>
    `;
  } else if (role === 'user') {
    // Logged in as USER
    dropdown.innerHTML = `
      <a href="user/dashboard.html"><i class="fas fa-user-circle"></i> My Dashboard</a>
      <a href="#" id="globalLogoutBtn"><i class="fas fa-sign-out-alt"></i> Logout</a>
    `;
    mobileAuthHTML = `
      <div class="mobile-auth-divider"></div>
      <a href="user/dashboard.html" class="mobile-auth-link"><i class="fas fa-user-circle" style="color:var(--accent); width:28px; text-align:left;"></i> My Dashboard</a>
      <a href="#" class="mobile-auth-link" id="mobileLogoutBtn"><i class="fas fa-sign-out-alt" style="color:var(--accent); width:28px; text-align:left;"></i> Logout</a>
    `;
  }
  
  // Handle Logout (Desktop)
  const logoutBtn = document.getElementById('globalLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.clear();
        window.location.href = '/login.html';
    });
  }

  // Handle Mobile Auth Links in Hamburger
  if (navLinks) {
    // Remove existing mobile auth elements to prevent duplication
    const existingAuthElements = navLinks.querySelectorAll('.mobile-auth-link, .mobile-auth-divider');
    existingAuthElements.forEach(el => el.remove());
    
    // Append the new mobile auth HTML
    navLinks.insertAdjacentHTML('beforeend', mobileAuthHTML);

    // Handle Logout (Mobile)
    const mobileLogoutBtn = document.getElementById('mobileLogoutBtn');
    if (mobileLogoutBtn) {
      mobileLogoutBtn.addEventListener('click', (e) => {
          e.preventDefault();
          localStorage.clear();
          window.location.href = '/login.html';
      });
    }
  }
}

// Counter animation
function animateCounter(el) {
  const target = parseInt(el.getAttribute('data-target'));
  const suffix = el.getAttribute('data-suffix') || '';
  const duration = 2400;
  const start = performance.now();
  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 4);
    el.textContent = Math.floor(target * eased) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}

// Project filter
function filterProjects(category, btn) {
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.project-card').forEach((card, i) => {
    if (category === 'all' || card.dataset.category === category) {
      card.style.display = '';
      setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, i * 70);
    } else {
      card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
      setTimeout(() => { card.style.display = 'none'; }, 400);
    }
  });
}

// Testimonial Slider
function initTestimonialSlider() {
  const track = document.querySelector('.testimonials-track');
  if (!track) return;

  let currentIndex = 0;
  const cards = track.children;
  const total = cards.length;

  function getVisibleCount() {
    if (window.innerWidth <= 576) return 1;
    if (window.innerWidth <= 992) return 2;
    return 3;
  }

  function slideTo(index) {
    const visible = getVisibleCount();
    const maxIndex = Math.max(0, total - visible);
    currentIndex = Math.max(0, Math.min(index, maxIndex));
    const percent = currentIndex * (100 / visible);
    track.style.transform = `translateX(-${percent}%)`;
  }

  window.slideTestimonials = function(dir) {
    slideTo(currentIndex + dir);
  };

  // Auto-slide every 5s
  let autoSlide = setInterval(() => {
    const visible = getVisibleCount();
    if (currentIndex >= total - visible) currentIndex = -1;
    slideTo(currentIndex + 1);
  }, 5000);

  // Pause on hover
  track.closest('.testimonials-slider')?.addEventListener('mouseenter', () => clearInterval(autoSlide));
  track.closest('.testimonials-slider')?.addEventListener('mouseleave', () => {
    autoSlide = setInterval(() => {
      const visible = getVisibleCount();
      if (currentIndex >= total - visible) currentIndex = -1;
      slideTo(currentIndex + 1);
    }, 5000);
  });

  window.addEventListener('resize', () => slideTo(currentIndex));
}

// Global Toast Utility for Frontend
window.showToast = function(msg, type = 'success') {
  let toast = document.getElementById('frontend-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'frontend-toast';
    document.body.appendChild(toast);
  }
  
  toast.className = 'custom-toast';
  
  let icon = '<i class="fas fa-check-circle"></i>';
  if (type === 'error') {
    toast.classList.add('toast-error');
    icon = '<i class="fas fa-exclamation-circle"></i>';
  } else {
    toast.classList.add('toast-success');
  }
  
  toast.innerHTML = `${icon} <span>${msg}</span>`;
  
  // Force reflow
  void toast.offsetWidth;
  
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
};
