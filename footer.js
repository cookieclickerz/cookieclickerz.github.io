// ============================================
// FOOTER COMPONENT – CookieClickerz
// ============================================
(function () {
  const year = new Date().getFullYear();

  const footerHTML = `
    <footer id="site-footer" role="contentinfo">
      <div class="footer-inner">
        <div class="footer-top">
          <div class="footer-brand">
            <h3>🍪 Cookie Clicker </h3>
            <p>The ultimate free online Cookie Clicker idle game. Bake billions of cookies, unlock upgrades, and build your cookie empire — no downloads required!</p>
          </div>

          <div class="footer-col">
            <h4>Play</h4>
            <a href="/#game">Start Clicking</a>
            <a href="/#how-to-play">How to Play</a>
            <a href="/#idle-guide">Strategy Guide</a>
            <a href="/#achievements">Achievements</a>
          </div>

          <div class="footer-col">
            <h4>Learn</h4>
            <a href=/"#buildings-info">Cookie Buildings</a>
            <a href="/#upgrades-info">Upgrades List</a>
            <a href="/#about-idle">About Cookie Clicker</a>
            <a href="/#faq">FAQ</a>
          </div>

          <div class="footer-col">
            <h4>Pages</h4>
            <a href="/privacy">Privacy Policy</a>
            <a href="/terms">Terms of Use</a>
            <a href="/cookies">Cookies Policy</a>
            <a href="/about">About</a>
            <a href="/contact">Contact</a>
          </div>
        </div>

        <div class="footer-bottom">
          <span>© ${year} <a href="https://cookieclickerz.github.io/">Cookie Clicker Unblocked</a>. Free to play online Cookie Clicker Game.</span>
          <span>Made with 🍪 &amp; ❤️ | Cookie Clicker Online | Idle Clicker Game</span>
        </div>
      </div>
    </footer>
  `;

  const root = document.getElementById('footer-root');
  if (root) root.innerHTML = footerHTML;
})();
