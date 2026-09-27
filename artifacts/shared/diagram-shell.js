/* Documents and diagrams: tabs, plus Mermaid colors that follow the light or dark theme. */
(function () {
  'use strict';
  var d = document;

  // Generic tabs (data-tab-root), kept from the original shell.
  d.querySelectorAll('[data-tab-root]').forEach(function (root) {
    var buttons = Array.from(root.querySelectorAll('[data-tab-button]'));
    var panels = Array.from(root.querySelectorAll('[data-tab-panel]'));
    if (!buttons.length || !panels.length) return;
    function activate(id) {
      buttons.forEach(function (button) { button.setAttribute('aria-selected', String(button.dataset.tabButton === id)); });
      panels.forEach(function (panel) {
        panel.hidden = panel.dataset.tabPanel !== id;
        panel.classList.toggle('is-active', panel.dataset.tabPanel === id);
      });
    }
    buttons.forEach(function (button) { button.addEventListener('click', function () { activate(button.dataset.tabButton); }); });
    activate(buttons[0].dataset.tabButton);
  });

  // Diagram palettes built from the site tokens.
  var FONT = 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  var LIGHT = {
    darkMode: false, background: '#FFFFFF', fontFamily: FONT, fontSize: '14px',
    primaryColor: '#E6F2EF', primaryTextColor: '#15212B', primaryBorderColor: '#17645D',
    secondaryColor: '#EFEDE6', secondaryTextColor: '#15212B', secondaryBorderColor: '#8A939B',
    tertiaryColor: '#F7F6F2', tertiaryTextColor: '#15212B', tertiaryBorderColor: '#DDD9CF',
    mainBkg: '#E6F2EF', nodeBorder: '#17645D', textColor: '#15212B', titleColor: '#15212B',
    lineColor: '#5A6570', edgeLabelBackground: '#FFFFFF', clusterBkg: '#F7F6F2', clusterBorder: '#DDD9CF',
    noteBkgColor: '#FBF3E4', noteTextColor: '#15212B', noteBorderColor: '#8A5A12',
    actorBkg: '#E6F2EF', actorBorder: '#17645D', actorTextColor: '#15212B', actorLineColor: '#8A939B',
    signalColor: '#15212B', signalTextColor: '#15212B', labelBoxBkgColor: '#EFEDE6', labelBoxBorderColor: '#8A939B',
    labelTextColor: '#15212B', loopTextColor: '#15212B', activationBkgColor: '#DDEEEA', activationBorderColor: '#17645D',
    sequenceNumberColor: '#FFFFFF', attributeBackgroundColorOdd: '#FFFFFF', attributeBackgroundColorEven: '#F7F6F2'
  };
  var DARK = {
    darkMode: true, background: '#151C20', fontFamily: FONT, fontSize: '14px',
    primaryColor: '#15302C', primaryTextColor: '#E7ECEF', primaryBorderColor: '#6CCABE',
    secondaryColor: '#1B2429', secondaryTextColor: '#E7ECEF', secondaryBorderColor: '#6B7780',
    tertiaryColor: '#0E1316', tertiaryTextColor: '#E7ECEF', tertiaryBorderColor: '#28333A',
    mainBkg: '#15302C', nodeBorder: '#6CCABE', textColor: '#E7ECEF', titleColor: '#E7ECEF',
    lineColor: '#8C99A5', edgeLabelBackground: '#151C20', clusterBkg: '#1B2429', clusterBorder: '#28333A',
    noteBkgColor: '#2A2416', noteTextColor: '#E7ECEF', noteBorderColor: '#E0B061',
    actorBkg: '#15302C', actorBorder: '#6CCABE', actorTextColor: '#E7ECEF', actorLineColor: '#6B7780',
    signalColor: '#E7ECEF', signalTextColor: '#E7ECEF', labelBoxBkgColor: '#1B2429', labelBoxBorderColor: '#6B7780',
    labelTextColor: '#E7ECEF', loopTextColor: '#E7ECEF', activationBkgColor: '#1B2429', activationBorderColor: '#6CCABE',
    sequenceNumberColor: '#0B1917', attributeBackgroundColorOdd: '#151C20', attributeBackgroundColorEven: '#1B2429'
  };

  function isDark() {
    var t = d.documentElement.getAttribute('data-theme');
    if (t === 'dark' || t === 'light') return t === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Used by each diagram page: mermaid.initialize(Object.assign({ startOnLoad: true }, diagramTheme())).
  window.diagramTheme = function () {
    var dark = isDark();
    return { theme: 'base', darkMode: dark, fontFamily: FONT, themeVariables: dark ? DARK : LIGHT };
  };

  // Keep each diagram's source so it can be drawn again when the theme changes.
  var sources = new Map();
  d.querySelectorAll('.mermaid').forEach(function (el) {
    sources.set(el, Array.from(el.childNodes).map(function (n) { return n.cloneNode(true); }));
  });

  var drawnTheme = isDark() ? 'dark' : 'light';
  d.addEventListener('themechange', function (e) {
    var theme = e.detail && e.detail.theme;
    if (!theme || theme === drawnTheme || !window.mermaid) return;
    var drawn = [];
    sources.forEach(function (src, el) { if (el.getAttribute('data-processed') === 'true') drawn.push(el); });
    drawnTheme = theme;
    if (!drawn.length) return;
    window.mermaid.initialize(Object.assign({ startOnLoad: false }, window.diagramTheme()));
    var visible = [];
    drawn.forEach(function (el) {
      el.removeAttribute('data-processed');
      el.replaceChildren.apply(el, sources.get(el).map(function (n) { return n.cloneNode(true); }));
      if (el.getClientRects().length) visible.push(el);
    });
    if (visible.length) window.mermaid.run({ nodes: visible });
  });
})();
