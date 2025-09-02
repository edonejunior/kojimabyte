/**
 * KojimaByte Carousel
 * Estrutura esperada:
 * <div class="carousel" role="region" aria-label="Carrossel ...">
 *   <button class="nav prev" aria-label="Imagem anterior">‹</button>
 *   <div class="track">
 *     <div class="slide"><img ...></div>
 *     ...
 *   </div>
 *   <button class="nav next" aria-label="Próxima imagem">›</button>
 *   <div class="dots" aria-label="Seleção de slide" aria-live="polite"></div>
 * </div>
 */

(function () {
  const SELECTORS = {
    root: '.carousel',
    track: '.track',
    slide: '.slide',
    prev: '.nav.prev',
    next: '.nav.next',
    dots: '.dots'
  };

  // Utilidades
  const clamp = (v, min, max) => Math.min(Math.max(v, min), max);

  function initCarousel(root) {
    const track = root.querySelector(SELECTORS.track);
    if (!track) return;

    const slides = Array.from(track.querySelectorAll(SELECTORS.slide));
    if (slides.length <= 1) return; // não precisa de nav/dots se só tem 1

    const prevBtn = root.querySelector(SELECTORS.prev);
    const nextBtn = root.querySelector(SELECTORS.next);
    const dotsWrap = root.querySelector(SELECTORS.dots);

    // Estado
    let index = 0;
    let isPointerDown = false;
    let startX = 0;
    let scrollStart = 0;
    let lastKnownLeft = 0;
    let raf = null;

    // ----------------------------------
    // Dots
    // ----------------------------------
    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      slides.forEach((_, i) => {
        const b = document.createElement('button');
        b.type = 'button';
        b.setAttribute('aria-label', `Ir para slide ${i + 1}`);
        b.addEventListener('click', () => goTo(i, true));
        dotsWrap.appendChild(b);
      });
      updateDots();
    }

    function updateDots() {
      if (!dotsWrap) return;
      const dots = dotsWrap.querySelectorAll('button');
      dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
    }

    // ----------------------------------
    // Navegação
    // ----------------------------------
    function width() {
      // Cada coluna ocupa 100% (grid-auto-columns: 100%)
      return track.clientWidth;
    }

    function calcIndexFromScroll() {
      const w = width();
      return clamp(Math.round(track.scrollLeft / w), 0, slides.length - 1);
    }

    function goTo(i, smooth = true) {
      index = clamp(i, 0, slides.length - 1);
      const left = index * width();
      track.scrollTo({ left, behavior: smooth ? 'smooth' : 'auto' });
      updateDots();
      updateButtons();
    }

    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    function updateButtons() {
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === slides.length - 1;
    }

    // ----------------------------------
    // Eventos
    // ----------------------------------
    // Atualiza índice quando usuário “puxa” por scroll (mouse/trackpad)
    function onScroll() {
      // Throttle via rAF
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        const newIndex = calcIndexFromScroll();
        if (newIndex !== index) {
          index = newIndex;
          updateDots();
          updateButtons();
        }
      });
    }

    // Teclado no container: setas e Home/End
    function onKeydown(e) {
      const keys = ['ArrowLeft','ArrowRight','Home','End'];
      if (!keys.includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Home') goTo(0);
      else if (e.key === 'End') goTo(slides.length - 1);
    }

    // Pointer/touch drag para “arrastar”
    function onPointerDown(e) {
      isPointerDown = true;
      startX = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      scrollStart = track.scrollLeft;
      track.style.scrollSnapType = 'none'; // libera snap durante o arrasto
      root.classList.add('dragging');
    }
    function onPointerMove(e) {
      if (!isPointerDown) return;
      const x = e.clientX || (e.touches && e.touches[0]?.clientX) || 0;
      const dx = startX - x;
      track.scrollLeft = scrollStart + dx;
    }
    function onPointerUp() {
      if (!isPointerDown) return;
      isPointerDown = false;
      track.style.scrollSnapType = 'x mandatory';
      root.classList.remove('dragging');
      // snap para o slide mais próximo
      goTo(calcIndexFromScroll());
    }

    // Resizing mantém alinhamento no slide atual
    function onResize() {
      // reposiciona sem animação
      goTo(index, false);
    }

    // ----------------------------------
    // Bindings
    // ----------------------------------
    buildDots();
    updateButtons();

    track.addEventListener('scroll', onScroll, { passive: true });
    root.addEventListener('keydown', onKeydown);

    // mouse
    track.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mousemove', onPointerMove);
    window.addEventListener('mouseup', onPointerUp);

    // touch
    track.addEventListener('touchstart', onPointerDown, { passive: true });
    window.addEventListener('touchmove', onPointerMove, { passive: true });
    window.addEventListener('touchend', onPointerUp);

    // buttons
    prevBtn && prevBtn.addEventListener('click', prev);
    nextBtn && nextBtn.addEventListener('click', next);

    // focus no container para teclado
    root.tabIndex = 0;

    // resize
    window.addEventListener('resize', onResize);

    // Inicializa na posição 0 sem animação
    goTo(0, false);
  }

  // Inicialização para todos os carrosséis da página
  function initAll() {
    document.querySelectorAll(SELECTORS.root).forEach(initCarousel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }
})();
