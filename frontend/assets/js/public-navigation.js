/* Shared document navigation: native links, immediate feedback, accessible disclosures. */
(function () {
  'use strict';
  function menus() { return document.querySelectorAll('[data-public-menu], header:not([data-shared-header]) details'); }
  function close(menu, restoreFocus) {
    menu.open = false;
    if (restoreFocus) menu.querySelector('summary')?.focus();
  }
  document.addEventListener('toggle', function (event) {
    var menu = event.target;
    if (!(menu instanceof HTMLDetailsElement) || !menu.open || !menu.matches('[data-public-menu], header:not([data-shared-header]) details')) return;
    menus().forEach(function (other) {
      if (other !== menu && !other.contains(menu) && !menu.contains(other)) close(other, false);
    });
  }, true);
  document.addEventListener('pointerdown', function (event) {
    menus().forEach(function (menu) { if (menu.open && !menu.contains(event.target)) close(menu, false); });
  });
  document.addEventListener('keydown', function (event) {
    if (event.key !== 'Escape') return;
    var open = Array.from(menus()).filter(function (menu) { return menu.open; });
    if (open.length) { event.preventDefault(); close(open[open.length - 1], true); }
  });
  var resetTimer;
  function reset() {
    clearTimeout(resetTimer);
    document.documentElement.removeAttribute('data-navigating');
  }
  window.addEventListener('pageshow', reset);
  document.addEventListener('click', function (event) {
    var link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.download || (link.target && link.target !== '_self')) return;
    var next = new URL(link.href, location.href);
    if (!/^https?:$/.test(next.protocol)) return;
    if (next.origin === location.origin && next.pathname === location.pathname && next.search === location.search) {
      if (next.hash === location.hash && (link.hasAttribute('hreflang') || link.hasAttribute('lang'))) {
        event.preventDefault();
        menus().forEach(function (menu) { if (menu.contains(link)) close(menu, true); });
      }
      // A chosen anchor should be visible after leaving a mobile disclosure.
      if (next.hash && !next.hash.startsWith('#/')) {
        var parents = [];
        for (var parent = link.parentElement; parent; parent = parent.parentElement) {
          if (parent instanceof HTMLDetailsElement && parent.open) parents.push(parent);
        }
        parents.forEach(function (menu) { close(menu, false); });
      }
      return;
    }
    document.documentElement.setAttribute('data-navigating', '');
    // Restore the control if the browser cancels navigation or a download response occurs.
    resetTimer = setTimeout(reset, 12000);
  });
}());
