/* Västgöta Fönsterputs – meny, galleri och prisräknare */
(function () {
  'use strict';

  /* ===================== PRISLISTA =====================
     Alla priser i kronor inkl. moms per tillfälle för in- & utsida.
     Justera här – allt annat räknas om automatiskt. */
  var PRICES = {
    windows: [
      { id: 'vanligt',    name: 'Vanligt fönster',            desc: 'En båge, en glasruta',                         price: 69,  icon: 'single' },
      { id: 'kopplat',    name: 'Kopplat fönster – fyrsidigt', desc: 'Två bågar, putsas även mellan glasen',         price: 119, icon: 'double' },
      { id: 'sprojs',     name: 'Fönster med spröjs',          desc: 'Spröjsade rutor, äldre hus & sekelskifte',      price: 109, icon: 'grid' },
      { id: 'stort',      name: 'Stort fönster / panorama',    desc: 'Över ca 1,5 m², fast eller öppningsbart',       price: 129, icon: 'wide' },
      { id: 'dorr',       name: 'Altandörr / glasdörr',        desc: 'Dörrar med glas, skjutdörrar',                  price: 89,  icon: 'door' },
      { id: 'takfonster', name: 'Takfönster',                  desc: 'Velux och liknande',                            price: 109, icon: 'roof' },
      { id: 'parti',      name: 'Glasparti / skyltfönster',    desc: 'Per glassektion – butik, restaurang, kontor',   price: 149, icon: 'shop' },
      { id: 'inglasning', name: 'Inglasad altan / uterum',     desc: 'Per glas i inglasning eller växthus',           price: 49,  icon: 'panel' },
      { id: 'glastak',    name: 'Glastak',                     desc: 'Per glas – tak på uterum eller inglasning',     price: 89,  icon: 'roofglass' }
    ],
    sides: { inut: 1, ut: 0.6, in: 0.5 },
    height: { 1: 0, 2: 0.15, 3: 0.30 },
    // Tillval: perWindow = per fönster (räknas automatiskt), qty = eget antal, pct = påslag på fönsterputs
    addons: [
      { id: 'karmar',   name: 'Karmar & bågar',          desc: 'Avtorkning av karmar och bågar',            perWindow: 25 },
      { id: 'bleck',    name: 'Fönsterbleck',            desc: 'Rengöring av utvändiga fönsterbleck',        perWindow: 15 },
      { id: 'bradda',   name: 'Fönsterbrädor',           desc: 'Avtorkning av invändiga fönsterbrädor',      perWindow: 10 },
      { id: 'bygg',     name: 'Byggdamm & färgstänk',    desc: 'Efter renovering eller nybygge',             pct: 0.6 },
      { id: 'persienn', name: 'Persienner',              desc: 'Rengöring per persienn',                      qty: 79 },
      { id: 'nat',      name: 'Insektsnät',              desc: 'Avtagning, rengöring, montering',             qty: 35 },
      { id: 'racke',    name: 'Glasräcke / balkongglas', desc: 'Per glas',                                     qty: 59 },
      { id: 'hojd',     name: 'Höghöjdsstädning',        desc: 'Lampor, väggar, tak – offereras separat',    quote: true }
    ],
    frequency: {
      1:  { label: 'Engångsputs',  discount: 0 },
      2:  { label: '2 ggr/år',     discount: 0.05 },
      4:  { label: '4 ggr/år',     discount: 0.10 },
      6:  { label: '6 ggr/år',     discount: 0.12 },
      12: { label: 'Varje månad',  discount: 0.15 }
    },
    travel: { gbg: 0, nara: 149, langre: 299 },   // per tillfälle, ej RUT-berättigat
    minimum: 695,                                  // minsta arbetskostnad per tillfälle
    rut: 0.5,
    vat: 0.25
  };

  var ICONS = {
    single:    '<rect x="7" y="4" width="18" height="24" rx="1.5"/><rect x="10" y="7" width="12" height="18"/>',
    double:    '<rect x="4" y="4" width="24" height="24" rx="1.5"/><rect x="7" y="7" width="8" height="18"/><rect x="17" y="7" width="8" height="18"/>',
    grid:      '<rect x="6" y="4" width="20" height="24" rx="1.5"/><path d="M16 4v24M6 12h20M6 20h20"/>',
    wide:      '<rect x="2" y="8" width="28" height="16" rx="1.5"/><rect x="5" y="11" width="22" height="10"/>',
    door:      '<rect x="9" y="2" width="14" height="28" rx="1.5"/><rect x="12" y="5" width="8" height="15"/><path d="M19 24h1"/>',
    roof:      '<path d="M3 24 16 6l13 18z"/><path d="m11 18 3-4h4l3 4z"/>',
    shop:      '<path d="M3 10h26M5 10v18h22V10M3 10l3-6h20l3 6"/><rect x="8" y="14" width="16" height="10"/>',
    panel:     '<path d="M3 27h26M5 27V9h22v18M12 9v18M19 9v18"/><path d="M3 9h26"/>',
    roofglass: '<path d="M3 22 10 8h12l7 14z"/><path d="M13 8l-2 14M19 8l2 14"/>'
  };

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var kr = function (n) { return Math.round(n).toLocaleString('sv-SE'); };

  /* ===================== Meny ===================== */
  var menuBtn = $('#menuBtn');
  var nav = $('#nav');
  menuBtn.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
  });
  $$('#nav a').forEach(function (a) {
    a.addEventListener('click', function () { nav.classList.remove('open'); menuBtn.setAttribute('aria-expanded', 'false'); });
  });
  $('#year').textContent = new Date().getFullYear();

  /* ===================== Reveal ===================== */
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    $$('.service, .facts-grid > div, .about > *, .section-header, .g, .rut-grid > *, .contact-panel, .also').forEach(function (el) {
      if (el.getBoundingClientRect().top < window.innerHeight) return; // synligt direkt vid laddning
      el.classList.add('reveal'); io.observe(el);
    });
  }

  /* ===================== Lightbox ===================== */
  var lb = $('#lightbox');
  var lbImg = $('img', lb);
  var shots = $$('#gallery img');
  var cur = 0;
  function show(i) { cur = (i + shots.length) % shots.length; lbImg.src = shots[cur].src; lbImg.alt = shots[cur].alt; }
  function closeLb() { lb.hidden = true; document.body.style.overflow = ''; }
  shots.forEach(function (img, i) {
    img.parentNode.addEventListener('click', function () { show(i); lb.hidden = false; document.body.style.overflow = 'hidden'; });
  });
  $('.lb-close', lb).addEventListener('click', closeLb);
  $('.prev', lb).addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
  $('.next', lb).addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });

  /* ===================== Prisräknare ===================== */
  var form = $('#quote');
  var winList = $('#winList');
  var addonBox = $('#addons');

  winList.innerHTML = PRICES.windows.map(function (w) {
    return '<div class="win" data-id="' + w.id + '">' +
      '<span class="win-ico"><svg viewBox="0 0 32 32">' + ICONS[w.icon] + '</svg></span>' +
      '<div><strong>' + w.name + '</strong><small>' + w.desc + ' · <span class="from">' + w.price + ' kr/st</span></small></div>' +
      '<div class="stepper">' +
        '<button type="button" data-step="-1" aria-label="Färre ' + w.name + '">−</button>' +
        '<input type="number" min="0" max="999" inputmode="numeric" name="antal_' + w.id + '" value="0" aria-label="Antal ' + w.name + '">' +
        '<button type="button" data-step="1" aria-label="Fler ' + w.name + '">+</button>' +
      '</div></div>';
  }).join('');

  addonBox.innerHTML = PRICES.addons.map(function (a) {
    var price = a.perWindow ? '+' + a.perWindow + ' kr/fönster'
      : a.qty ? a.qty + ' kr/st'
      : a.pct ? '+' + Math.round(a.pct * 100) + ' % på fönsterputs'
      : 'Offert';
    var qty = a.qty ? '<div class="qty"><input type="number" min="1" max="999" value="1" name="antal_' + a.id + '" aria-label="Antal ' + a.name + '"><span>st</span></div>' : '';
    return '<label class="addon"><input type="checkbox" name="tillval_' + a.id + '" value="ja"><span class="box"></span>' +
      '<span><strong>' + a.name + '</strong><small>' + a.desc + ' · ' + price + '</small>' + qty + '</span></label>';
  }).join('');

  winList.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-step]');
    if (!b) return;
    var input = $('input', b.parentNode);
    input.value = Math.max(0, Math.min(999, (parseInt(input.value, 10) || 0) + parseInt(b.dataset.step, 10)));
    calc();
  });
  form.addEventListener('input', calc);
  form.addEventListener('change', calc);

  function val(name) { var el = form.querySelector('[name="' + name + '"]:checked') || form.elements[name]; return el ? el.value : ''; }
  function num(name) { var el = form.elements[name]; return el ? Math.max(0, parseInt(el.value, 10) || 0) : 0; }

  var lastSummary = '';

  function calc() {
    var privat = val('kundtyp') === 'privat';
    var freq = parseInt(val('frekvens'), 10) || 1;
    var sideF = PRICES.sides[val('sidor')] || 1;
    var heightF = PRICES.height[val('hojd')] || 0;
    var lines = [];
    var windowCost = 0;
    var windowCount = 0;

    PRICES.windows.forEach(function (w) {
      var n = num('antal_' + w.id);
      var row = winList.querySelector('[data-id="' + w.id + '"]');
      row.classList.toggle('active', n > 0);
      if (!n) return;
      var c = n * w.price * sideF;
      windowCost += c;
      windowCount += n;
      lines.push([n + ' × ' + w.name, c]);
    });

    if (heightF && windowCost) {
      var h = windowCost * heightF;
      lines.push(['Höjdtillägg (+' + Math.round(heightF * 100) + ' %)', h]);
      windowCost += h;
    }

    var labor = windowCost;
    var quoteOnly = [];
    PRICES.addons.forEach(function (a) {
      var on = form.elements['tillval_' + a.id].checked;
      if (!on) return;
      if (a.quote) { quoteOnly.push(a.name); return; }
      var c = 0, label = a.name;
      if (a.perWindow) { c = a.perWindow * windowCount; label += ' (' + windowCount + ' st)'; }
      else if (a.qty) { var q = num('antal_' + a.id); c = a.qty * q; label = q + ' × ' + a.name; }
      else if (a.pct) { c = windowCost * a.pct; }
      if (c) { labor += c; lines.push([label, c]); }
    });

    var minAdj = 0;
    if (labor > 0 && labor < PRICES.minimum) { minAdj = PRICES.minimum - labor; lines.push(['Minimidebitering (' + PRICES.minimum + ' kr)', minAdj]); labor = PRICES.minimum; }

    var disc = PRICES.frequency[freq].discount;
    var discount = labor * disc;
    labor -= discount;

    var travel = labor > 0 ? PRICES.travel[val('omrade')] || 0 : 0;
    if (travel) lines.push(['Framkörning', travel]);

    var gross = labor + travel;                      // inkl. moms
    var rut = privat ? labor * PRICES.rut : 0;       // RUT gäller endast arbetskostnad
    var pay, totalsHtml;

    if (privat) {
      pay = gross - rut;
      totalsHtml =
        (discount ? row('Abonnemangsrabatt (−' + Math.round(disc * 100) + ' %)', -discount, 'neg') : '') +
        row('Totalt före RUT', gross) +
        row('RUT-avdrag 50 %', -rut, 'neg') +
        row('Att betala / tillfälle', pay, 'grand');
    } else {
      var ex = gross / (1 + PRICES.vat);
      pay = ex;
      totalsHtml =
        (discount ? row('Abonnemangsrabatt (−' + Math.round(disc * 100) + ' %)', -discount / (1 + PRICES.vat), 'neg') : '') +
        row('Summa exkl. moms', ex, 'grand') +
        row('Moms 25 %', gross - ex) +
        row('Totalt inkl. moms', gross);
    }

    var perYear = pay * freq;
    var linesEl = $('#lines');
    linesEl.innerHTML = lines.length
      ? lines.map(function (l) { return '<li><span>' + l[0] + '</span><span>' + kr(privat ? l[1] : l[1] / (1 + PRICES.vat)) + ' kr</span></li>'; }).join('')
      : '<li class="empty">Lägg till fönster för att se priset.</li>';
    $('#totals').innerHTML = windowCount || labor ? totalsHtml : '';
    $('#priceMain').textContent = kr(pay);
    $('#priceSub').textContent = (privat ? 'per tillfälle efter RUT-avdrag' : 'per tillfälle exkl. moms') +
      (freq > 1 && pay ? ' · ' + kr(perYear) + ' kr/år' : '');
    $('#pillFreq').textContent = PRICES.frequency[freq].label;
    var saved = rut + discount;
    $('#fine').textContent = (saved && gross ? 'Du sparar ' + kr(saved) + ' kr per tillfälle. ' : '') +
      'Priset är en indikation. Slutligt pris bekräftas i offerten' +
      (quoteOnly.length ? ' – ' + quoteOnly.join(', ').toLowerCase() + ' offereras separat' : '') + '.';
    $('#mobilePrice').textContent = pay ? kr(pay) + ' kr' : '';

    lastSummary =
      'Kundtyp: ' + (privat ? 'Privat' : 'Företag') + '\n' +
      'Frekvens: ' + PRICES.frequency[freq].label + '\n' +
      'Sidor: ' + $('input[name="sidor"]:checked + span', form).textContent + '\n' +
      'Höjd: ' + $('input[name="hojd"]:checked + span', form).textContent + '\n' +
      'Område: ' + form.elements.omrade.selectedOptions[0].textContent + '\n\n' +
      lines.map(function (l) { return '- ' + l[0] + ': ' + kr(l[1]) + ' kr'; }).join('\n') +
      (discount ? '\n- Abonnemangsrabatt (−' + Math.round(disc * 100) + ' %): −' + kr(discount) + ' kr' : '') +
      (quoteOnly.length ? '\n- Offereras separat: ' + quoteOnly.join(', ') : '') + '\n\n' +
      (privat
        ? 'Före RUT: ' + kr(gross) + ' kr\nRUT-avdrag: ' + kr(rut) + ' kr\nAtt betala per tillfälle: ' + kr(pay) + ' kr'
        : 'Exkl. moms per tillfälle: ' + kr(pay) + ' kr\nInkl. moms: ' + kr(gross) + ' kr') +
      (freq > 1 ? '\nPer år: ' + kr(perYear) + ' kr' : '');
    $('#summaryField').value = lastSummary;
  }

  function row(label, v, cls) {
    return '<div' + (cls ? ' class="' + cls + '"' : '') + '><span>' + label + '</span><span>' + (v < 0 ? '−' : '') + kr(Math.abs(v)) + ' kr</span></div>';
  }

  calc();

  /* ===================== Genvägar till räknaren ===================== */
  function setKund(kund) {
    var r = form.querySelector('input[name="kundtyp"][value="' + kund + '"]');
    if (r) r.checked = true;
    $$('.segments a').forEach(function (a) { a.classList.toggle('is-active', a.dataset.kund === kund); });
  }
  $$('[data-kund]').forEach(function (el) {
    el.addEventListener('click', function () { setKund(el.dataset.kund); calc(); });
  });
  $$('[data-freq]').forEach(function (el) {
    el.addEventListener('click', function () { form.elements.frekvens.value = el.dataset.freq; calc(); });
  });
  $$('input[name="kundtyp"]', form).forEach(function (r) {
    r.addEventListener('change', function () { setKund(r.value); });
  });

  $('#quick').addEventListener('submit', function (e) {
    e.preventDefault();
    var n = Math.max(1, Math.min(999, parseInt($('#quickCount').value, 10) || 1));
    form.elements['antal_' + $('#quickType').value].value = n;
    calc();
    $('#offert').scrollIntoView({ behavior: 'smooth' });
  });

  /* ===================== Skicka ===================== */
  var msg = $('#formMsg');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    calc();
    var bad = [];
    ['namn', 'telefon', 'email'].forEach(function (n) {
      var el = form.elements[n];
      var ok = el.value.trim() && (n !== 'email' || /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value.trim()));
      el.classList.toggle('invalid', !ok);
      if (!ok) bad.push(el);
    });
    var gdpr = form.elements.gdpr;
    gdpr.parentNode.classList.toggle('invalid', !gdpr.checked);
    if (!gdpr.checked) bad.push(gdpr);
    if (bad.length) {
      msg.className = 'form-msg err';
      msg.textContent = 'Fyll i namn, telefon, e-post och godkänn villkoren.';
      bad[0].focus();
      return;
    }

    var btn = $('button[type="submit"]', form);
    if (form.dataset.preview) {
      msg.className = 'form-msg ok';
      msg.textContent = 'Förhandsvisning: formuläret fungerar, men förfrågan skickas inte härifrån.';
      return;
    }
    btn.disabled = true;
    btn.textContent = 'Skickar …';
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (r) { if (!r.ok) throw new Error(r.status); })
      .then(function () {
        msg.className = 'form-msg ok';
        msg.textContent = 'Tack! Vi har tagit emot din förfrågan och återkommer så snart vi kan.';
        btn.textContent = 'Skickat ✓';
      })
      .catch(function () {
        msg.className = 'form-msg err';
        msg.innerHTML = 'Det gick inte att skicka just nu. <a href="' + mailto() + '" style="text-decoration:underline">Skicka via e-post istället</a>.';
        btn.disabled = false;
        btn.textContent = 'Skicka offertförfrågan';
      });
  });

  function mailto() {
    var f = form.elements;
    var body = lastSummary + '\n\nNamn: ' + f.namn.value + '\nTelefon: ' + f.telefon.value + '\nE-post: ' + f.email.value +
      '\nAdress: ' + f.adress.value + '\nÖnskat datum: ' + f.datum.value + '\nBostad: ' + f.bostad.value + '\n\n' + f.meddelande.value;
    return 'mailto:info@vgfonsterputs.se?subject=' + encodeURIComponent('Offertförfrågan fönsterputs') + '&body=' + encodeURIComponent(body);
  }

  /* ===================== Mobil CTA ===================== */
  // Visas först när snabbformuläret i hero har passerats, döljs vid räknaren
  var cta = $('#mobileCta');
  var quoteSec = $('#offert');
  var quickEl = $('#quick');
  function toggleCta() {
    var o = quoteSec.getBoundingClientRect();
    var beforeQuick = quickEl.getBoundingClientRect().bottom > 0;
    var inQuote = o.top < window.innerHeight && o.bottom > 0;
    cta.classList.toggle('hide', beforeQuick || inQuote);
  }
  window.addEventListener('scroll', toggleCta, { passive: true });
  window.addEventListener('resize', toggleCta);
  toggleCta();
})();
