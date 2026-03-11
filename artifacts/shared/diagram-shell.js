(function () {
  document.querySelectorAll('[data-tab-root]').forEach(function (root) {
    var buttons = Array.from(root.querySelectorAll('[data-tab-button]'));
    var panels = Array.from(root.querySelectorAll('[data-tab-panel]'));
    if (!buttons.length || !panels.length) {
      return;
    }

    function activate(id) {
      buttons.forEach(function (button) {
        button.setAttribute('aria-selected', String(button.dataset.tabButton === id));
      });
      panels.forEach(function (panel) {
        panel.hidden = panel.dataset.tabPanel !== id;
        panel.classList.toggle('is-active', panel.dataset.tabPanel === id);
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activate(button.dataset.tabButton);
      });
    });

    activate(buttons[0].dataset.tabButton);
  });
})();
