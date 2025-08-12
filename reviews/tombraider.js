(function () {
  const track = document.getElementById('carouselTrack');
  const dotsWrap = document.getElementById('carouselDots');
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.querySelectorAll('.slide'));
  const prev = document.querySelector('.carousel .prev');
  const next = document.querySelector('.carousel .next');

  // criar dots
  slides.forEach((_, i) => {
    const b = document.createElement('button');
    b.setAttribute('aria-label', `Ir para slide ${i + 1}`);
    b.addEventListener('click', () => {
      track.scrollTo({ left: i * track.clientWidth, behavior: 'smooth' });
    });
    dotsWrap.appendChild(b);
  });

  const dots = Array.from(dotsWrap.querySelectorAll('button'));

  function updateDots() {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    dots.forEach((d, i) => d.setAttribute('aria-current', i === index ? 'true' : 'false'));
  }
  updateDots();

  // botões
  prev?.addEventListener('click', () => {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    const target = Math.max(0, index - 1);
    track.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
  });

  next?.addEventListener('click', () => {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    const target = Math.min(slides.length - 1, index + 1);
    track.scrollTo({ left: target * track.clientWidth, behavior: 'smooth' });
  });

  // atualizar ao rolar/redimensionar
  track.addEventListener('scroll', () => {
    // throttle leve
    window.requestAnimationFrame(updateDots);
  });
  window.addEventListener('resize', updateDots);
})();
