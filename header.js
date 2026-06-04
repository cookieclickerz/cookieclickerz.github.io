// ============================================
// HEADER COMPONENT – CookieClickerz
// ============================================
(function () {
  const headerHTML = `
    <header id="site-header" role="banner">
      <div class="header-inner">
        <a href="/" class="header-logo" aria-label="CookieClicker Home">
          <span class="header-logo-icon" aria-hidden="true">🍪</span>
          <span class="header-logo-text">Cookie Clicker</span>
        </a>

        <nav class="header-nav" id="main-nav" role="navigation" aria-label="Main Navigation">
          <a href="/#game">▶ Play</a>
          <a href="/#how-to-play">How to Play</a>
          <a href="/#buildings-info">Buildings</a>
          <a href="/#upgrades-info">Upgrades</a>
          <a href="/#achievements">Achievements</a>
          <a href="/#faq">FAQ</a>
          <a href="/#game" class="play-link">🍪 Play Now</a>
        </nav>

        <button class="hamburger" id="hamburger-btn" aria-label="Toggle Menu" aria-expanded="false" aria-controls="main-nav">
          <span></span><span></span><span></span>
        </button>
      </div>
    </header>
  `;

  const root = document.getElementById('header-root');
  if (root) {
    root.innerHTML = headerHTML;

    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger-btn');
    const nav = document.getElementById('main-nav');
    if (hamburger && nav) {
      hamburger.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen);
        // Animate hamburger
        const spans = hamburger.querySelectorAll('span');
        if (isOpen) {
          spans[0].style.transform = 'translateY(8px) rotate(45deg)';
          spans[1].style.opacity = '0';
          spans[2].style.transform = 'translateY(-8px) rotate(-45deg)';
        } else {
          spans[0].style.transform = '';
          spans[1].style.opacity = '';
          spans[2].style.transform = '';
        }
      });

      // Close on nav link click
      nav.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          nav.classList.remove('open');
          hamburger.setAttribute('aria-expanded', 'false');
          const spans = hamburger.querySelectorAll('span');
          spans[0].style.transform = '';
          spans[1].style.opacity = '';
          spans[2].style.transform = '';
        });
      });
    }

    // Active link highlight on scroll
    const sections = ['game', 'how-to-play', 'buildings-info', 'upgrades-info', 'achievements', 'idle-guide', 'about-idle', 'faq'];
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          nav.querySelectorAll('a').forEach(a => {
            a.style.color = '';
          });
          const activeLink = nav.querySelector(`a[href="#${entry.target.id}"]`);
          if (activeLink && !activeLink.classList.contains('play-link')) {
            activeLink.style.color = 'var(--cookie-gold)';
          }
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
  }
})();
