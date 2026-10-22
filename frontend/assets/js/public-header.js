/* Interactions only; head.html owns all navigation markup and destinations. */
(() => {
  const header = document.querySelector('[data-shared-header]');
  if (!header) return;
  const menus = [...header.querySelectorAll('[data-header-menu]')];
  const navigation = header.querySelector('.fv-head-navigation');
  const desktop = window.matchMedia('(min-width:1101px)');
  function close(menu, focus = false) {
    menu.open = false;
    if (focus) menu.querySelector('summary').focus();
  }
  header.addEventListener('toggle', event => {
    if (menus.includes(event.target) && event.target.open) {
      menus.forEach(menu => { if (menu !== event.target) close(menu); });
    }
    if (event.target === navigation && !navigation.open && !desktop.matches) menus.forEach(menu => close(menu));
  }, true);
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) {
      menus.forEach(menu => close(menu));
      close(navigation);
    }
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const active = menus.find(menu => menu.open);
    if (active) { event.preventDefault(); close(active, true); }
    else if (!desktop.matches && navigation.open) { event.preventDefault(); close(navigation, true); }
  });
  header.addEventListener('focusout', event => {
    if (event.relatedTarget && !header.contains(event.relatedTarget)) {
      menus.forEach(menu => close(menu));
      if (!desktop.matches) close(navigation);
    }
  });
  header.addEventListener('click', event => {
    if (event.target.closest('a[href]') && !desktop.matches) {
      menus.forEach(menu => close(menu));
      close(navigation);
    }
  });
  desktop.addEventListener('change', () => {
    menus.forEach(menu => close(menu));
    close(navigation);
  });
})();
