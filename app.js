/* ══════════════════════════════════════════════════════════════
   Welcome Home ♡  —  app logic
   No frameworks, no build step, no backend. Just localStorage.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var STORAGE_KEY = 'welcome-home-v1';
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ───────────────────────  the starting list  ─────────────────────── */

  var SECTIONS = [
    { id: 'bedroom', emoji: '🛏️', name: 'Bedroom & Sleep',       note: 'soft landings' },
    { id: 'bath',    emoji: '🧴', name: 'Bath & Self-Care',       note: 'little routines' },
    { id: 'kitchen', emoji: '🍳', name: 'Kitchen & Dining',       note: 'first home dinner' },
    { id: 'clean',   emoji: '🧺', name: 'Cleaning & Laundry',     note: 'keeping it lovely' },
    { id: 'tech',    emoji: '🔌', name: 'Home & Everyday',        note: 'the useful bits' },
    { id: 'safety',  emoji: '🩹', name: 'Safety & Important',     note: 'just in case' },
    { id: 'cozy',    emoji: '🌸', name: 'Cozy Little Touches',    note: 'the heart of it' },
    { id: 'mine',    emoji: '💗', name: 'Your Own Little List',   note: 'anything you add' }
  ];

  var DEFAULT_ITEMS = [
    ['bedroom', 'Bed'],
    ['bedroom', 'Mattress'],
    ['bedroom', 'Pillows'],
    ['bedroom', 'Bedsheets'],
    ['bedroom', 'Blanket / Duvet'],
    ['bedroom', 'Curtains / Blinds'],
    ['bedroom', 'Mirror'],
    ['bedroom', 'Hangers'],
    ['bedroom', 'Clothes Storage'],

    ['bath', 'Towels'],
    ['bath', 'Toothbrush'],
    ['bath', 'Toothpaste'],
    ['bath', 'Shampoo'],
    ['bath', 'Conditioner'],
    ['bath', 'Body Wash / Soap'],
    ['bath', 'Deodorant'],
    ['bath', 'Skincare Essentials'],
    ['bath', 'Sunscreen'],
    ['bath', 'Personal Hygiene Essentials'],
    ['bath', 'Hair Essentials'],
    ['bath', 'Cosmetics'],
    ['bath', 'Cosmetic Organizer'],

    ['kitchen', 'Plates'],
    ['kitchen', 'Bowls'],
    ['kitchen', 'Cups / Mugs'],
    ['kitchen', 'Glasses'],
    ['kitchen', 'Cutlery'],
    ['kitchen', 'Kitchen Knives'],
    ['kitchen', 'Cutting Board'],
    ['kitchen', 'Frying Pan'],
    ['kitchen', 'Pot'],
    ['kitchen', 'Cooking Utensils'],
    ['kitchen', 'Food Storage Containers'],
    ['kitchen', 'Water Bottles'],
    ['kitchen', 'Kettle'],
    ['kitchen', 'Microwave'],
    ['kitchen', 'Food Essentials'],
    ['kitchen', 'Grocery Essentials'],

    ['clean', 'Laundry Basket'],
    ['clean', 'Laundry Detergent'],
    ['clean', 'Drying Rack'],
    ['clean', 'Iron / Steamer'],
    ['clean', 'Dish Soap'],
    ['clean', 'Sponges'],
    ['clean', 'Kitchen Towels'],
    ['clean', 'Trash Bags'],
    ['clean', 'Cleaning Supplies'],
    ['clean', 'Broom'],
    ['clean', 'Mop'],
    ['clean', 'Vacuum'],
    ['clean', 'Toilet Paper'],
    ['clean', 'Toilet Cleaner'],
    ['clean', 'Toilet Brush'],
    ['clean', 'Hand Soap'],

    ['tech', 'Chargers'],
    ['tech', 'Extension Board'],
    ['tech', 'Wi-Fi / Router'],
    ['tech', 'Basic Tool Kit'],
    ['tech', 'Scissors'],
    ['tech', 'Tape'],
    ['tech', 'Batteries'],
    ['tech', 'Umbrella'],
    ['tech', 'Storage Organizers'],
    ['tech', 'Jewelry Organizer'],

    ['safety', 'First Aid Kit'],
    ['safety', 'Medicines'],
    ['safety', 'Thermometer'],
    ['safety', 'Important Documents'],
    ['safety', 'Spare Keys'],
    ['safety', 'Emergency Contacts'],
    ['safety', 'Fire Extinguisher'],

    ['cozy', 'Pajamas'],
    ['cozy', 'Slippers'],
    ['cozy', 'Cozy Blanket'],
    ['cozy', 'Room Decorations']
  ];

  function freshItems() {
    return DEFAULT_ITEMS.map(function (pair) {
      return {
        id: 'd-' + pair[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
        text: pair[1],
        section: pair[0],
        done: false,
        custom: false
      };
    });
  }

  /* ───────────────────────  state + storage  ─────────────────────── */

  var state = { items: [], collapsed: {}, filter: 'all', cheered: false };
  var storageOK = true;

  function load() {
    var raw = null;
    try { raw = localStorage.getItem(STORAGE_KEY); }
    catch (e) { storageOK = false; }

    if (!raw) { state.items = freshItems(); return; }

    try {
      var saved = JSON.parse(raw);
      if (!saved || !Array.isArray(saved.items)) throw new Error('bad shape');

      var known = {};
      SECTIONS.forEach(function (s) { known[s.id] = true; });

      state.items = saved.items
        .filter(function (it) { return it && typeof it.text === 'string' && it.text.trim(); })
        .map(function (it, i) {
          return {
            id: typeof it.id === 'string' && it.id ? it.id : 'r-' + i + '-' + Date.now(),
            text: String(it.text).slice(0, 80),
            section: known[it.section] ? it.section : 'mine',
            done: !!it.done,
            custom: !!it.custom
          };
        });

      state.collapsed = (saved.collapsed && typeof saved.collapsed === 'object') ? saved.collapsed : {};
      state.filter = ['all', 'todo', 'done'].indexOf(saved.filter) > -1 ? saved.filter : 'all';
      state.cheered = !!saved.cheered;

      if (!state.items.length) state.items = freshItems();
    } catch (e) {
      state.items = freshItems();
    }
  }

  var saveTimer = null;
  function save() {
    if (!storageOK) return;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(function () {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } catch (e) {
        storageOK = false;
        toast('Couldn’t save on this browser 🌷');
      }
    }, 90);
  }

  function findItem(id) {
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return state.items[i];
    return null;
  }
  function indexOfItem(id) {
    for (var i = 0; i < state.items.length; i++) if (state.items[i].id === id) return i;
    return -1;
  }

  /* ───────────────────────  rendering  ─────────────────────── */

  var elSections = $('#sections');
  var elEmpty    = $('#emptyNote');
  var nodes      = {}; // item id -> <li>

  function icon(name) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true"><use href="#' + name + '"></use></svg>';
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function itemNode(item) {
    var li = document.createElement('li');
    li.className = 'item' + (item.done ? ' is-done' : '');
    li.dataset.id = item.id;
    li.innerHTML =
      '<label class="tap">' +
        '<input class="cb" type="checkbox"' + (item.done ? ' checked' : '') + '>' +
        '<span class="box">' + icon('i-check') + '</span>' +
        '<span class="txt">' + esc(item.text) + '</span>' +
      '</label>' +
      '<div class="acts">' +
        '<button class="ico" type="button" data-act="edit" aria-label="Rename ' + esc(item.text) + '">' + icon('i-pencil') + '</button>' +
        '<button class="ico" type="button" data-act="del" aria-label="Remove ' + esc(item.text) + '">' + icon('i-trash') + '</button>' +
      '</div>';
    nodes[item.id] = li;
    return li;
  }

  function render() {
    nodes = {};
    var frag = document.createDocumentFragment();

    SECTIONS.forEach(function (sec) {
      var items = state.items.filter(function (it) { return it.section === sec.id; });
      if (!items.length) return;

      var wrap = document.createElement('section');
      wrap.className = 'sec' + (state.collapsed[sec.id] ? ' collapsed' : '');
      wrap.dataset.sec = sec.id;

      var headId = 'body-' + sec.id;
      wrap.innerHTML =
        '<button class="sec-head" type="button" aria-expanded="' + (state.collapsed[sec.id] ? 'false' : 'true') + '" aria-controls="' + headId + '">' +
          '<span class="sec-emoji" aria-hidden="true">' + sec.emoji + '</span>' +
          '<span class="sec-name"><strong>' + esc(sec.name) + '</strong><small>' + esc(sec.note) + '</small></span>' +
          '<span class="sec-count"><b>0</b>/0</span>' +
          '<svg class="sec-chevron" viewBox="0 0 24 24" aria-hidden="true"><use href="#i-chevron"></use></svg>' +
        '</button>' +
        '<div class="sec-body" id="' + headId + '"><ul class="sec-list"></ul></div>';

      var ul = $('.sec-list', wrap);
      items.forEach(function (it) { ul.appendChild(itemNode(it)); });
      frag.appendChild(wrap);
    });

    elSections.innerHTML = '';
    elSections.appendChild(frag);
    elEmpty.hidden = state.items.length > 0;
    applyFilter();
    updateProgress();
  }

  /* ───────────────────────  filtering  ─────────────────────── */

  // section tallies only — safe to run mid-animation
  function updateCounts() {
    $$('.sec', elSections).forEach(function (sec) {
      var total = 0, done = 0;
      $$('.item', sec).forEach(function (li) {
        total++; if (li.classList.contains('is-done')) done++;
      });
      var count = $('.sec-count', sec);
      count.innerHTML = '<b>' + done + '</b>/' + total;
      count.classList.toggle('full', total > 0 && done === total);
    });
  }

  function applyFilter() {
    var f = state.filter;

    $$('.sec', elSections).forEach(function (sec) {
      var visible = 0;
      $$('.item', sec).forEach(function (li) {
        var isDone = li.classList.contains('is-done');
        var hide = (f === 'todo' && isDone) || (f === 'done' && !isDone);
        li.classList.toggle('is-hidden', hide);
        if (!hide) visible++;
      });
      sec.classList.toggle('is-hidden', visible === 0);
    });
    updateCounts();

    var anyVisible = $$('.sec:not(.is-hidden)', elSections).length > 0;
    elEmpty.hidden = anyVisible && state.items.length > 0;
    if (!anyVisible && state.items.length) {
      elEmpty.textContent = f === 'done' ? 'Nothing checked off yet — soon 🌷' : 'All done here! Every single thing ✨';
    } else if (!state.items.length) {
      elEmpty.textContent = 'Your list is empty — add your first little thing 🌸';
    }
  }

  /* ───────────────────────  progress  ─────────────────────── */

  var elPct = $('#progPct'), elCount = $('#progCount'), elMsg = $('#progMsg');
  var elBar = $('#bar'), elBarFill = $('#barFill'), elTopFill = $('#topbarFill'), elBadge = $('#progBadge');
  var lastPct = -1;

  function milestone(pct, done, total) {
    if (total && done === total) return { msg: 'Everything is ready! Welcome home! 💕', badge: '💕' };
    if (pct >= 75) return { msg: 'Almost there! ✨',        badge: '✨' };
    if (pct >= 50) return { msg: 'Halfway home! 🎀',        badge: '🎀' };
    if (pct >= 25) return { msg: 'We’re getting there 🌸',  badge: '🌸' };
    if (pct > 0)   return { msg: 'A lovely little start 🌷', badge: '🌷' };
    return { msg: 'Let’s begin, one little thing at a time 🌷', badge: '🌷' };
  }

  function updateProgress() {
    var total = state.items.length;
    var done = state.items.filter(function (it) { return it.done; }).length;
    var pct = total ? Math.round((done / total) * 100) : 0;
    if (pct === 100 && done < total) pct = 99;

    var m = milestone(pct, done, total);

    elPct.textContent = pct + '%';
    elCount.textContent = done + ' / ' + total + ' things ready ♡';
    elMsg.textContent = m.msg;
    elBarFill.style.width = pct + '%';
    elTopFill.style.width = pct + '%';
    elBar.setAttribute('aria-valuenow', String(pct));
    elBar.setAttribute('aria-valuetext', done + ' of ' + total + ' things ready');

    if (elBadge.textContent !== m.badge) {
      elBadge.textContent = m.badge;
      if (!reduceMotion && lastPct >= 0) {
        elBadge.classList.remove('bump');
        void elBadge.offsetWidth;
        elBadge.classList.add('bump');
      }
    }

    $$('.milestones span').forEach(function (s) {
      s.classList.toggle('hit', pct >= Number(s.dataset.at));
    });

    var complete = total > 0 && done === total;
    if (complete && !state.cheered) {
      state.cheered = true;
      celebrate();
      save();
    } else if (!complete && state.cheered) {
      state.cheered = false;
      save();
    }

    lastPct = pct;
  }

  /* ───────────────────────  item interactions  ─────────────────────── */

  elSections.addEventListener('change', function (e) {
    var cb = e.target.closest('.cb');
    if (!cb) return;
    var li = cb.closest('.item');
    var item = findItem(li.dataset.id);
    if (!item) return;

    item.done = cb.checked;
    li.classList.toggle('is-done', item.done);
    if (item.done) heartBurst($('.box', li));
    save();
    updateProgress();
    updateCounts();

    // let the tick animation finish before a filter sweeps the row away
    if (state.filter !== 'all') setTimeout(applyFilter, 420);
  });

  elSections.addEventListener('click', function (e) {
    var head = e.target.closest('.sec-head');
    if (head) {
      var sec = head.closest('.sec');
      var id = sec.dataset.sec;
      var collapsed = sec.classList.toggle('collapsed');
      head.setAttribute('aria-expanded', collapsed ? 'false' : 'true');
      state.collapsed[id] = collapsed;
      save();
      return;
    }

    var btn = e.target.closest('.ico');
    if (!btn) return;
    var li = btn.closest('.item');
    if (!li) return;

    if (btn.dataset.act === 'edit') startEdit(li);
    if (btn.dataset.act === 'del') removeItem(li);
    if (btn.dataset.act === 'save') commitEdit(li, true);
    if (btn.dataset.act === 'cancel') commitEdit(li, false);
  });

  /* rename in place */
  function startEdit(li) {
    if (li.classList.contains('editing')) return;
    var item = findItem(li.dataset.id);
    if (!item) return;

    var form = document.createElement('form');
    form.className = 'editrow';
    form.innerHTML =
      '<input type="text" maxlength="80" enterkeyhint="done" aria-label="Rename item">' +
      '<button class="ico ok" type="submit" data-act="save" aria-label="Save name">' + icon('i-check') + '</button>' +
      '<button class="ico" type="button" data-act="cancel" aria-label="Cancel rename">' + icon('i-close') + '</button>';

    li.classList.add('editing');
    li.insertBefore(form, $('.acts', li));

    var input = $('input', form);
    input.value = item.text;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);

    form.addEventListener('submit', function (ev) { ev.preventDefault(); commitEdit(li, true); });
    input.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape') { ev.preventDefault(); commitEdit(li, false); }
    });
  }

  function commitEdit(li, keep) {
    var form = $('.editrow', li);
    if (!form) return;
    var item = findItem(li.dataset.id);
    var value = $('input', form).value.trim().slice(0, 80);

    if (keep && item && value) {
      item.text = value;
      $('.txt', li).textContent = value;
      $('[data-act="edit"]', li).setAttribute('aria-label', 'Rename ' + value);
      $('[data-act="del"]', li).setAttribute('aria-label', 'Remove ' + value);
      save();
      toast('Renamed to “' + value + '” ♡');
    }

    form.remove();
    li.classList.remove('editing');
    var editBtn = $('[data-act="edit"]', li);
    if (editBtn) editBtn.focus();
  }

  /* delete with undo */
  function removeItem(li) {
    var id = li.dataset.id;
    var idx = indexOfItem(id);
    if (idx < 0) return;
    var item = state.items[idx];

    li.classList.add('leaving');
    setTimeout(function () {
      state.items.splice(idx, 1);
      save();
      render();
    }, reduceMotion ? 0 : 240);

    toast('Removed “' + item.text + '”', 'Undo', function () {
      state.items.splice(Math.min(idx, state.items.length), 0, item);
      save();
      render();
      flash(item.id);
    });
  }

  /* little hearts popping out of a ticked box */
  function heartBurst(box) {
    if (reduceMotion || !box) return;
    var r = box.getBoundingClientRect();
    var layer = document.createElement('div');
    layer.className = 'burst';
    layer.style.left = (r.left + r.width / 2) + 'px';
    layer.style.top  = (r.top + r.height / 2) + 'px';

    var glyphs = ['♡', '✿', '♡', '✧', '♡'];
    for (var i = 0; i < 5; i++) {
      var s = document.createElement('i');
      var a = (-70 - Math.random() * 40) * (Math.PI / 180) + (i - 2) * 0.42;
      var d = 22 + Math.random() * 20;
      s.textContent = glyphs[i];
      s.style.setProperty('--bx', (Math.cos(a) * d).toFixed(1) + 'px');
      s.style.setProperty('--by', (Math.sin(a) * d).toFixed(1) + 'px');
      s.style.animationDelay = (i * 22) + 'ms';
      s.style.fontSize = (10 + Math.random() * 6).toFixed(0) + 'px';
      layer.appendChild(s);
    }
    document.body.appendChild(layer);
    setTimeout(function () { layer.remove(); }, 950);
  }

  function flash(id) {
    var li = nodes[id];
    if (!li) return;
    li.classList.add('just-added');
    li.scrollIntoView({ block: 'center', behavior: reduceMotion ? 'auto' : 'smooth' });
    setTimeout(function () { li.classList.remove('just-added'); }, 1400);
  }

  /* ───────────────────────  filters UI  ─────────────────────── */

  function syncChips() {
    $$('.chip').forEach(function (c) {
      var on = c.dataset.filter === state.filter;
      c.classList.toggle('is-on', on);
      c.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
  }

  $$('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      state.filter = chip.dataset.filter;
      syncChips();
      applyFilter();
      save();
    });
  });

  /* ───────────────────────  dialogs  ─────────────────────── */

  function openDlg(dlg) {
    if (typeof dlg.showModal !== 'function') return false;
    dlg.showModal();
    requestAnimationFrame(function () { dlg.classList.add('is-open'); });
    return true;
  }
  function closeDlg(dlg) {
    dlg.classList.remove('is-open');
    setTimeout(function () { if (dlg.open) dlg.close(); }, reduceMotion ? 0 : 180);
  }

  $$('dialog.sheet').forEach(function (dlg) {
    dlg.addEventListener('cancel', function (e) { e.preventDefault(); closeDlg(dlg); });
    dlg.addEventListener('click', function (e) {
      if (e.target.closest('[data-close]')) { e.preventDefault(); closeDlg(dlg); return; }
      if (e.target === dlg) closeDlg(dlg); // tap the backdrop
    });
  });

  /* add item */
  var addDlg = $('#addDlg'), addForm = $('#addForm'), addInput = $('#addInput');
  var addSelect = $('#addSection'), addError = $('#addError');

  SECTIONS.forEach(function (s) {
    var o = document.createElement('option');
    o.value = s.id;
    o.textContent = s.emoji + '  ' + s.name;
    addSelect.appendChild(o);
  });
  addSelect.value = 'mine';

  $$('[data-open-add]').forEach(function (b) {
    b.addEventListener('click', function () {
      addError.hidden = true;
      addForm.reset();
      addSelect.value = 'mine';
      if (!openDlg(addDlg)) {
        var t = window.prompt('What are we missing? ♡');
        if (t && t.trim()) addItem(t.trim(), 'mine');
        return;
      }
      setTimeout(function () { addInput.focus(); }, 120);
    });
  });

  addInput.addEventListener('input', function () { addError.hidden = true; });

  addForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var text = addInput.value.trim().slice(0, 80);
    if (!text) {
      addError.hidden = false;
      addInput.focus();
      return;
    }
    addItem(text, addSelect.value);
    closeDlg(addDlg);
  });

  function addItem(text, section) {
    var item = {
      id: 'c-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7),
      text: text,
      section: section || 'mine',
      done: false,
      custom: true
    };
    state.items.push(item);
    if (state.collapsed[item.section]) state.collapsed[item.section] = false;
    save();
    render();
    setTimeout(function () { flash(item.id); }, 60);
    toast('“' + text + '” added ♡');
  }

  /* reset */
  var resetDlg = $('#resetDlg');
  $$('[data-open-reset]').forEach(function (b) {
    b.addEventListener('click', function () { openDlg(resetDlg); });
  });

  function snapshot() {
    return JSON.parse(JSON.stringify({ items: state.items, collapsed: state.collapsed }));
  }
  function restore(snap) {
    state.items = snap.items;
    state.collapsed = snap.collapsed;
    save();
    render();
  }

  $('#resetChecks').addEventListener('click', function () {
    var before = snapshot();
    state.items.forEach(function (it) { it.done = false; });
    state.cheered = false;
    save();
    render();
    closeDlg(resetDlg);
    toast('Fresh start — everything unchecked 🌸', 'Undo', function () { restore(before); });
  });

  $('#resetAll').addEventListener('click', function () {
    var before = snapshot();
    state.items = freshItems();
    state.collapsed = {};
    state.cheered = false;
    save();
    render();
    closeDlg(resetDlg);
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    toast('Back to the original list 🌱', 'Undo', function () { restore(before); });
  });

  /* ───────────────────────  toast  ─────────────────────── */

  var toastWrap = $('#toastWrap');
  var toastTimer = null;

  function toast(msg, actionLabel, onAction) {
    toastWrap.innerHTML = '';
    clearTimeout(toastTimer);

    var el = document.createElement('div');
    el.className = 'toast';
    var span = document.createElement('span');
    span.textContent = msg;
    el.appendChild(span);

    if (actionLabel) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = actionLabel;
      btn.addEventListener('click', function () {
        clearTimeout(toastTimer);
        el.remove();
        if (onAction) onAction();
      });
      el.appendChild(btn);
    }

    toastWrap.appendChild(el);
    toastTimer = setTimeout(function () {
      el.classList.add('out');
      setTimeout(function () { el.remove(); }, 260);
    }, actionLabel ? 6000 : 2600);
  }

  /* ───────────────────────  celebration  ─────────────────────── */

  var confetti = $('#confetti'), cheer = $('#cheer');

  function celebrate() {
    cheer.hidden = false;
    var closeBtn = $('#cheerClose');
    closeBtn.focus();

    var hide = function () {
      cheer.hidden = true;
      closeBtn.removeEventListener('click', hide);
    };
    closeBtn.addEventListener('click', hide);
    setTimeout(function () { if (!cheer.hidden) hide(); }, 8000);

    if (reduceMotion) return;

    var glyphs = ['💕', '🌸', '🎀', '✨', '🌷', '💗', '🦋', '☁️', '🌿'];
    for (var i = 0; i < 26; i++) {
      (function (i) {
        setTimeout(function () {
          var b = document.createElement('b');
          b.textContent = glyphs[i % glyphs.length];
          b.style.left = (Math.random() * 96) + 'vw';
          b.style.fontSize = (16 + Math.random() * 18).toFixed(0) + 'px';
          b.style.setProperty('--drift', ((Math.random() - 0.5) * 130).toFixed(0) + 'px');
          b.style.setProperty('--spin', ((Math.random() - 0.5) * 220).toFixed(0) + 'deg');
          b.style.animationDuration = (4.2 + Math.random() * 2.6).toFixed(2) + 's';
          confetti.appendChild(b);
          setTimeout(function () { b.remove(); }, 7200);
        }, i * 110);
      })(i);
    }
  }

  /* ───────────────────────  floating compliments  ───────────────────────
     Little notes that drift in at random spots. They live in a fixed layer
     with pointer-events:none, stay out of the top bar and the add button's
     corner, and pause while a dialog is open or the tab is hidden.       */

  var COMPLIMENTS = [
    ['you are beautiful ♡', '💗'],
    ['you’re gorgeous', '🌸'],
    ['you’re amazing', '✨'],
    ['you’re so pretty', '🎀'],
    ['you’re adorable', '🌷'],
    ['you’re absolutely stunning', '💕'],
    ['you’re cute', '🌸'],
    ['you’re perfect ♡', ''],
    ['you’re lovely', '🦋'],
    ['you’re special', '✨'],
    ['you’re my favorite', '💗'],
    ['you look so good', '🌟'],
    ['pretty girl ♡', '🎀'],
    ['babygirl ♡', '💕'],
    ['you’re incredible', '🌸']
  ];

  var noteLayer = $('#compliments');
  var noteQueue = [];
  var noteTimer = null;

  // shuffled bag, so the same line never repeats back to back
  function nextCompliment() {
    if (!noteQueue.length) {
      noteQueue = COMPLIMENTS.slice();
      for (var i = noteQueue.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = noteQueue[i]; noteQueue[i] = noteQueue[j]; noteQueue[j] = t;
      }
    }
    return noteQueue.pop();
  }

  function noteLimit() { return window.innerWidth < 700 ? 2 : 3; }

  function placeNote(el) {
    var vw = window.innerWidth, vh = window.innerHeight;
    var w = el.offsetWidth, h = el.offsetHeight;
    var topSafe = 78;              // under the sticky bar
    var botSafe = 104;             // above the toast / add button
    var band = Math.max(60, vh - topSafe - botSafe - h);
    var y = topSafe + Math.random() * band;
    var x;

    // on wide screens there is empty space either side of the column —
    // drop the notes in there so they never sit over the checklist
    var col = $('main').getBoundingClientRect();
    var gutter = Math.min(col.left, vw - col.right);

    if (gutter >= w + 26) {
      x = Math.random() < 0.5
        ? 14 + Math.random() * (gutter - w - 14)
        : col.right + 14 + Math.random() * (gutter - w - 14);
    } else {
      // no gutters on a phone — hug one edge instead of sitting dead centre
      // over a paragraph, so at most half the text underneath is covered
      var pad = 8;
      var far = Math.max(pad, vw - w - pad);
      x = Math.random() < 0.5 ? pad + Math.random() * 16 : far - Math.random() * 16;
      // steer clear of the floating add button's corner
      if (x + w > vw - 92 && y + h > vh - 168) y = Math.max(topSafe, vh - 168 - h);
    }

    el.style.left = Math.round(x) + 'px';
    el.style.top = Math.round(y) + 'px';
  }

  function spawnNote() {
    if (!noteLayer) return;
    if (document.hidden) return;
    if (document.querySelector('dialog[open]')) return;      // not mid-task
    if (!$('#cheer').hidden) return;                          // not over the celebration
    if (noteLayer.children.length >= noteLimit()) return;

    var pick = nextCompliment();
    var el = document.createElement('div');
    el.className = 'note';
    el.style.visibility = 'hidden';

    var span = document.createElement('span');
    span.textContent = pick[0];
    el.appendChild(span);

    if (pick[1]) {
      var deco = document.createElement('i');
      deco.textContent = pick[1];
      el.appendChild(deco);
    }

    el.style.setProperty('--dur', (6.5 + Math.random() * 2.5).toFixed(2) + 's');
    el.style.setProperty('--rot', ((Math.random() - 0.5) * 7).toFixed(1) + 'deg');

    noteLayer.appendChild(el);
    placeNote(el);                 // measure once it's in the DOM
    el.style.visibility = '';

    el.addEventListener('animationend', function () { el.remove(); });
    setTimeout(function () { if (el.parentNode) el.remove(); }, 12000); // safety net
  }

  function scheduleNote() {
    clearTimeout(noteTimer);
    var small = window.innerWidth < 700;
    var min = reduceMotion ? 9000 : (small ? 4600 : 3200);
    var span = reduceMotion ? 7000 : (small ? 4400 : 3000);
    noteTimer = setTimeout(function () {
      spawnNote();
      scheduleNote();
    }, min + Math.random() * span);
  }

  function startCompliments() {
    if (!noteLayer) return;
    setTimeout(spawnNote, reduceMotion ? 2600 : 1600);
    scheduleNote();
  }

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) clearTimeout(noteTimer);
    else scheduleNote();
  });

  /* ───────────────────────  boot  ─────────────────────── */

  load();
  syncChips();
  render();
  startCompliments();

  if (!storageOK) {
    setTimeout(function () {
      toast('Private mode? Progress won’t be remembered 🌷');
    }, 900);
  }

  // keep the tab in sync if the list is open twice
  window.addEventListener('storage', function (e) {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    load();
    syncChips();
    render();
  });

  // offline support
  if ('serviceWorker' in navigator && location.protocol.indexOf('http') === 0) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('./sw.js').catch(function () { /* offline is a bonus */ });
    });
  }
})();
