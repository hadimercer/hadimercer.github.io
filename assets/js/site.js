/* Hadi Mercer: shared site script (theme, menu, scroll spy, reveal, request form, GA4 events). No dependencies. */
(function () {
'use strict';
var d = document, root = d.documentElement, win = window;
var calm = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
var darkMq = win.matchMedia('(prefers-color-scheme: dark)');
var header = d.querySelector('.site-header');
var $$ = function (sel, el) { return Array.prototype.slice.call((el || d).querySelectorAll(sel)); };
var track = function (name, params) { if (typeof win.gtag === 'function') win.gtag('event', name, params || {}); };

function theme() {
  var t = root.getAttribute('data-theme');
  return t === 'light' || t === 'dark' ? t : (darkMq.matches ? 'dark' : 'light');
}
function syncTheme() {
  var dark = theme() === 'dark';
  var label = dark ? 'Switch to light theme' : 'Switch to dark theme';
  $$('[data-theme-toggle]').forEach(function (btn) {
    var text = btn.querySelector('[data-theme-label]');
    if (text) text.textContent = label; else btn.setAttribute('aria-label', label);
  });
  $$('meta[name="theme-color"]').forEach(function (m) { m.content = dark ? '#0E1316' : '#F7F6F2'; });
  d.dispatchEvent(new CustomEvent('themechange', { detail: { theme: dark ? 'dark' : 'light' } }));
}
$$('[data-theme-toggle]').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var next = theme() === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (e) { /* storage blocked */ }
    syncTheme();
  });
});
if (darkMq.addEventListener) darkMq.addEventListener('change', syncTheme);
syncTheme();

function onScroll() { if (header) header.classList.toggle('is-scrolled', win.scrollY > 8); }
win.addEventListener('scroll', onScroll, { passive: true });
onScroll();

var menuBtn = d.querySelector('.menu-btn');
var nav = d.getElementById('site-nav');
var isOpen = function () { return !!header && header.classList.contains('nav-open'); };
function setMenu(open, refocus) {
  if (!menuBtn || !nav) return;
  header.classList.toggle('nav-open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (open) { var first = nav.querySelector('a'); if (first) first.focus(); }
  else if (refocus) menuBtn.focus();
}
if (menuBtn && nav) {
  menuBtn.addEventListener('click', function () { setMenu(!isOpen()); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) setMenu(false, true); });
  d.addEventListener('click', function (e) { if (isOpen() && !header.contains(e.target)) setMenu(false); });
  header.addEventListener('focusout', function (e) {
    if (isOpen() && e.relatedTarget && !header.contains(e.relatedTarget)) setMenu(false);
  });
  win.addEventListener('resize', function () { if (win.innerWidth >= 900 && isOpen()) setMenu(false); });
}

function scrollSpy(links) {
  var map = {};
  links.forEach(function (a) {
    var href = a.getAttribute('href') || '';
    var target = href.charAt(0) === '#' && d.getElementById(href.slice(1));
    if (target) map[target.id] = a;
  });
  if (!Object.keys(map).length || !('IntersectionObserver' in win)) return;
  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting) return;
      links.forEach(function (a) { a.removeAttribute('aria-current'); });
      if (map[en.target.id]) map[en.target.id].setAttribute('aria-current', 'true');
    });
  }, { rootMargin: '-35% 0px -60% 0px' });
  $$('main section[id]').forEach(function (s) { spy.observe(s); });
}
if (nav) scrollSpy($$('a', nav));
scrollSpy($$('.toc a'));

$$('[data-stagger]').forEach(function (group) {
  $$('.reveal', group).forEach(function (el, i) { el.style.setProperty('--delay', (i * 60) + 'ms'); });
});
var reveals = $$('.reveal');
if (!calm && 'IntersectionObserver' in win) {
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px' });
  reveals.forEach(function (el) { io.observe(el); });
} else {
  reveals.forEach(function (el) { el.classList.add('is-visible'); });
}

var form = d.querySelector('[data-request-form]');
if (form) {
  var REQUESTS = {
    resume: 'My resume',
    walkthrough: 'A walkthrough of BA Co-Pilot',
    demo: 'Access to a demo (Meridian or Lens)',
    conversation: 'A conversation about a role',
    other: 'Something else'
  };
  var MESSAGES = {
    name: 'Please add your name.',
    email: 'Please add a valid email address.',
    company: 'Please add your company.',
    role: 'Please tell me the role.'
  };
  var select = form.querySelector('select[name="request"]');
  var statusEl = form.querySelector('.form-status');
  var submitBtn = form.querySelector('[type="submit"]');
  var required = $$('[required]', form);
  var endpoint = form.getAttribute('data-endpoint') || form.action;
  var preselect = function (key) { if (select && REQUESTS[key]) select.value = REQUESTS[key]; };
  preselect(new URLSearchParams(win.location.search).get('request'));

  d.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-request]');
    if (!a) return;
    e.preventDefault();
    setMenu(false);
    preselect(a.getAttribute('data-request'));
    d.getElementById('contact').scrollIntoView({ behavior: calm ? 'auto' : 'smooth' });
    if (win.history.replaceState) win.history.replaceState(null, '', '#contact');
    var first = d.getElementById('f-name');
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, calm ? 0 : 450);
  });

  form.setAttribute('novalidate', '');
  var validate = function (input) {
    var v = input.value.trim();
    var ok = v !== '' && (input.type !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v));
    var err = d.getElementById(input.id + '-error');
    if (err) {
      err.hidden = ok;
      if (ok) { input.removeAttribute('aria-invalid'); input.removeAttribute('aria-describedby'); }
      else {
        err.querySelector('span').textContent = MESSAGES[input.name];
        input.setAttribute('aria-invalid', 'true');
        input.setAttribute('aria-describedby', err.id);
      }
    }
    return ok;
  };
  required.forEach(function (input) {
    input.addEventListener('blur', function () { if (input.value.trim() || input.hasAttribute('aria-invalid')) validate(input); });
    input.addEventListener('input', function () { if (input.hasAttribute('aria-invalid')) validate(input); });
  });

  var setStatus = function (kind, iconId, parts) {
    statusEl.className = 'form-status is-' + kind;
    statusEl.textContent = '';
    if (iconId) {
      var ns = 'http://www.w3.org/2000/svg';
      var svg = d.createElementNS(ns, 'svg');
      var use = d.createElementNS(ns, 'use');
      svg.setAttribute('class', 'icon');
      svg.setAttribute('aria-hidden', 'true');
      use.setAttribute('href', '#' + iconId);
      svg.appendChild(use);
      statusEl.appendChild(svg);
    }
    var span = d.createElement('span');
    parts.forEach(function (p) {
      if (typeof p === 'string') { span.appendChild(d.createTextNode(p)); return; }
      var link = d.createElement('a');
      link.href = p[1];
      link.textContent = p[0];
      span.appendChild(link);
    });
    statusEl.appendChild(span);
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = required.filter(function (input) { return !validate(input); });
    if (bad.length) { bad[0].focus(); return; }
    var trap = form.querySelector('.hp');
    if (trap && trap.checked) return;

    var data = {};
    new FormData(form).forEach(function (value, key) { data[key] = value; });
    delete data.redirect;
    delete data.botcheck;
    data.subject = 'Portfolio request: ' + data.request + ' (' + data.name + ', ' + data.company + ')';

    setStatus('pending', null, ['Sending your request...']);
    submitBtn.disabled = true;
    fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(data)
    })
      .then(function (res) {
        return res.json().then(function (json) { if (!res.ok || !json.success) throw new Error('failed'); });
      })
      .then(function () {
        form.reset();
        setStatus('success', 'i-check', ['Thanks, I have it. You will hear from me at the email you gave, usually within a day.']);
        track('resume_request_submit', { request_type: data.request });
        statusEl.focus();
      })
      .catch(function () {
        setStatus('error', 'i-alert', ['That did not go through. Please email me at ', ['hadibmercer@gmail.com', 'mailto:hadibmercer@gmail.com'], ' instead.']);
        statusEl.focus();
      })
      .then(function () { submitBtn.disabled = false; });
  });
}

d.addEventListener('click', function (e) {
  var a = e.target.closest('a[href]');
  if (!a) return;
  var href = a.href, path = a.pathname, name = null;
  var scope = a.closest('[data-project]');
  if (/\.streamlit\.app/.test(href)) name = 'demo_click';
  else if (/github\.com\/hadimercer\/[^/]+\/?$/i.test(href)) name = 'code_click';
  else if (/linkedin\.com/.test(href)) name = 'linkedin_click';
  else if (/^\/projects\/[a-z-]+\.html$/.test(path) && path !== win.location.pathname) name = 'case_study_open';
  else if (/^\/artifacts\//.test(path) || /hadimercer\/[^/]+\/(blob|main)\//.test(href)) name = 'artifact_click';
  if (name) track(name, scope ? { project: scope.getAttribute('data-project') } : {});
});
})();
