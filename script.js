document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);
  const desktop = window.matchMedia('(min-width: 768px)');

  /* ---------- Sidebar menu (mobile open / close) ---------- */
  const sidebar = $('sidebarMenu');
  const toggle  = $('menuToggle');

  const setMenu = (open) => {
    sidebar.classList.toggle('open', open);
    document.body.classList.toggle('no-scroll', open && !desktop.matches);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  toggle.addEventListener('click', () => setMenu(!sidebar.classList.contains('open')));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) { setMenu(false); toggle.focus(); }
  });
  desktop.addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  // Close the menu after choosing a link on the same page
  sidebar.querySelectorAll('a[href]').forEach((a) =>
    a.addEventListener('click', () => { if (sidebar.classList.contains('open')) setMenu(false); })
  );

  /* ---------- "+" sub-menus ---------- */
  sidebar.querySelectorAll('.nav-toggle').forEach((btn) => {
    const panel = $(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
  });

  /* ---------- Category filter (home page only) ---------- */
  const filter = $('categoryFilter');
  if (filter) {
    const boxes   = [...filter.querySelectorAll('input[type="checkbox"]')];
    const cards   = [...document.querySelectorAll('#productGrid .card')];
    const countEl = $('resultCount');
    const emptyEl = $('emptyState');

    const apply = () => {
      const active = new Set(boxes.filter((b) => b.checked).map((b) => b.value));
      let shown = 0;
      cards.forEach((card) => {
        const visible = active.has(card.dataset.category);
        card.hidden = !visible;
        if (visible) shown++;
      });
      countEl.textContent = `Showing ${shown} of ${cards.length} products`;
      emptyEl.hidden = shown !== 0;
    };

    // Deep link from the sidebar, e.g. index.html?category=lighting
    const wanted = new URLSearchParams(location.search).get('category');
    if (wanted && boxes.some((b) => b.value === wanted)) {
      boxes.forEach((b) => { b.checked = b.value === wanted; });
    }
    boxes.forEach((b) => b.addEventListener('change', apply));
    apply();

    // If the image fails to load, keep the grey tile instead of a broken icon
    document.querySelectorAll('.media img').forEach((img) =>
      img.addEventListener('error', () => { img.style.visibility = 'hidden'; })
    );
  }

  /* ---------- Video modal (home page only) ---------- */
  const modal   = $('videoModal');
  const trigger = $('videoTrigger');
  if (modal && trigger) {
    const video = $('modalVideo');

    trigger.addEventListener('click', () => {
      modal.showModal();
      video.play().catch(() => { /* autoplay blocked: press play */ });
    });
    $('modalClose').addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); }); // backdrop click
    // Fires for the ✕ button, backdrop click and Escape: the video always stops
    modal.addEventListener('close', () => {
      video.pause();
      video.currentTime = 0;
      trigger.focus({ preventScroll: true });
    });
  }

  /* ---------- Forms ---------- */
  const handleForm = (form, status, successMessage) => {
    if (!form) return;
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      status.className = 'form-status';
      const fields = [...form.elements].filter((el) => el.name);
      fields.forEach((el) => el.removeAttribute('aria-invalid'));
      const bad = fields.find((el) => !el.checkValidity());

      if (bad) {
        bad.setAttribute('aria-invalid', 'true');
        status.textContent = bad.validity.valueMissing
          ? `Please fill in the ${bad.name} field.`
          : 'Please enter a valid email address.';
        status.classList.add('error');
        bad.focus();
        return;
      }
      // Demo only: send with fetch('/your-endpoint', { method: 'POST', body: new FormData(form) })
      form.reset();
      status.textContent = successMessage;
      status.classList.add('ok');
    });
  };
  handleForm($('contactForm'), $('formStatus'), 'Thank you. Your message has been sent.');
  handleForm($('newsletterForm'), $('newsletterStatus'), 'You are subscribed. Thank you.');
});
