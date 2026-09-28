(function () {
  document.documentElement.classList.add('js');

  var header = document.getElementById('header');
  var waFloat = document.getElementById('waFloat');
  var toggle = document.getElementById('menuToggle');
  var nav = document.getElementById('mainNav');

  // Intro 3D: contagem 0→100% que termina quando a página carregou (mín. ~2s, máx. ~5s)
  var root = document.documentElement;
  if (root.classList.contains('is-loading')) {
    var intro = document.getElementById('intro');
    var bar = document.getElementById('introBar');
    var pct = document.getElementById('introPct');
    var start = performance.now();
    var MIN = 2000, MAX = 5000;
    var loaded = false, shown = 0, finished = false;
    window.addEventListener('load', function () { loaded = true; });

    var tick = function (now) {
      var t = now - start;
      // Avança sozinho até 90%; só passa disso quando a página terminou de carregar
      var target = Math.min(t / MIN, 1) * ((loaded || t > MAX) ? 100 : 90);
      shown += (target - shown) * 0.12;
      if (target === 100 && shown > 99.5) shown = 100;
      bar.style.transform = 'scaleX(' + (shown / 100) + ')';
      pct.textContent = Math.round(shown) + '%';
      if (shown === 100) return finish();
      requestAnimationFrame(tick);
    };
    var finish = function () {
      if (finished) return;
      finished = true;
      intro.classList.add('leaving');
      root.classList.remove('is-loading');
      setTimeout(function () { intro.remove(); }, 1100);
    };
    requestAnimationFrame(tick);
    setTimeout(finish, MAX + 1500); // garantia caso a aba fique em segundo plano
  }

  document.addEventListener('DOMContentLoaded', function () {
    var year = document.getElementById('year');
    if (year) year.textContent = new Date().getFullYear();
  });

  // Header compacto + botão flutuante ao rolar (um único listener, via rAF)
  var ticking = false;
  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('scrolled', y > 20);
    waFloat.classList.toggle('show', y > 600);
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });

  // Menu mobile
  function closeMenu() {
    nav.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir menu');
  }
  toggle.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });

  document.addEventListener('DOMContentLoaded', function () {
    onScroll();

    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }

    // Revela elementos ao entrar na tela, com pequeno atraso em cascata dentro de cada grid
    document.querySelectorAll('.grid').forEach(function (grid) {
      Array.prototype.forEach.call(grid.querySelectorAll(':scope > .reveal'), function (el, i) {
        el.style.setProperty('--d', (i % 3) * 0.1 + 's');
      });
    });

    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { revealObs.observe(el); });

    // Destaca o link do menu da seção atual
    var links = {};
    nav.querySelectorAll('a').forEach(function (a) { links[a.getAttribute('href').slice(1)] = a; });
    var navObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (link) link.classList.toggle('active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(links).forEach(function (id) {
      var sec = document.getElementById(id);
      if (sec) navObs.observe(sec);
    });
  });
})();
