(() => {
  const filters = document.getElementById('pub-filters');
  const timeline = document.getElementById('publication-list');
  const status = document.getElementById('pub-filter-status');

  if (!filters || !timeline) return;

  // Both filters share the same newest-first order, regardless of HTML placement.
  const groupsByYear = [...timeline.querySelectorAll('.pub-year')]
    .sort((a, b) => Number(b.dataset.year) - Number(a.dataset.year));
  timeline.append(...groupsByYear);

  const buttons = [...filters.querySelectorAll('[data-filter]')];
  const publications = [...timeline.querySelectorAll('.publication')];
  const yearGroups = groupsByYear.map((element) => ({
    element,
    label: element.querySelector('.pub-year-label'),
    publications: [...element.querySelectorAll('.publication')],
  }));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function animatePublications(filter) {
    if (typeof timeline.animate !== 'function') return;

    // Cancel pending entrances before a new filter is applied.
    timeline.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    if (reducedMotion.matches) return;

    const visibleElements = yearGroups
      .filter(({ element }) => !element.hidden)
      .flatMap(({ label, publications }) => [
        ...(filter === 'all' && label ? [label] : []),
        ...publications.filter((publication) => !publication.hidden),
      ]);

    visibleElements.forEach((element, index) => {
      element.animate(
        [
          { opacity: 0, transform: 'translateY(6px)' },
          { opacity: 1, transform: 'translateY(0)' },
        ],
        {
          duration: 300,
          delay: Math.min(index * 35, 280),
          easing: 'ease',
          fill: 'backwards',
        },
      );
    });
  }

  function applyFilter(filter, animate = false) {
    timeline.dataset.filter = filter;

    publications.forEach((publication) => {
      publication.hidden = filter === 'selected' && publication.dataset.selected !== 'true';
    });

    yearGroups.forEach(({ element, publications }) => {
      element.hidden = publications.every((publication) => publication.hidden);
    });

    buttons.forEach((button) => {
      button.setAttribute('aria-pressed', String(button.dataset.filter === filter));
    });

    if (status) {
      const visibleCount = publications.filter((publication) => !publication.hidden).length;
      status.textContent = `${visibleCount} publications shown.`;
    }

    if (animate) animatePublications(filter);
  }

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') !== 'true') {
        applyFilter(button.dataset.filter, true);
      }
    });
  });

  applyFilter('all');
  filters.hidden = false;
})();
