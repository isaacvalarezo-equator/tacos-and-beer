/* Tacos and Beer — prototipo funcional.
   El estado vive en localStorage para que la demo sea real durante el pitch.
   El panel del dueño (panel.html) lee exactamente el mismo almacén. */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '$' + n.toFixed(n % 1 ? 2 : 0);
const STORE = 'tb_demo_v1';

/* Safari bloquea localStorage sobre file://. Sin él, la demo se ve bien pero
   no guarda nada, y eso se descubriría en plena reunión. Que falle fuerte. */
function storageOK(){
  try { localStorage.setItem('__t','1'); localStorage.removeItem('__t'); return true; }
  catch { return false; }
}
if (!storageOK()){
  addEventListener('DOMContentLoaded', () => {
    const b = document.createElement('div');
    b.setAttribute('role','alert');
    b.style.cssText = 'position:fixed;inset:auto 0 0 0;z-index:200;background:#CE3226;color:#fff;padding:.9rem 1.2rem;font:600 .85rem/1.4 Archivo,Arial,sans-serif;text-align:center';
    b.innerHTML = 'This browser blocks storage when the file is opened directly, so the waitlist will not save anything. Serve the folder with <code style="background:rgba(0,0,0,.25);padding:.1rem .35rem">python3 -m http.server</code> and open <code style="background:rgba(0,0,0,.25);padding:.1rem .35rem">localhost:8000/sitio/</code>, or use Chrome.';
    document.body.appendChild(b);
  });
}


const db = {
  read(){
    try { return JSON.parse(localStorage.getItem(STORE)) || { wait:[], party:[] }; }
    catch { return { wait:[], party:[] }; }
  },
  write(d){ try { localStorage.setItem(STORE, JSON.stringify(d)); } catch {} },
  add(kind, rec){
    const d = this.read();
    rec.id = Date.now().toString(36) + Math.random().toString(36).slice(2,6);
    rec.at = new Date().toISOString();
    rec.status = kind === 'wait' ? 'waiting' : 'new';
    d[kind].unshift(rec);
    this.write(d);
    return rec;
  }
};

let loc = localStorage.getItem('tb_loc') || 'nola';
if (!LOCATIONS[loc]) loc = 'nola';

/* ---------- estado abierto / cerrado ---------- */
/* Las horas viven como decimales (20.75 = 8:45 PM) y los cierres después de
   medianoche como 24+ (26 = 2 AM). Un solo formateador para todo el sitio: la
   banda late night traía su propia versión y escupía "10.75 PM" en pantalla. */
function fmtHour(v){
  const H = v >= 24 ? v - 24 : v;
  const hh = Math.floor(H), mm = Math.round((H - hh) * 60);
  const ap = hh >= 12 && hh < 24 ? 'PM' : 'AM';
  const d = hh % 12 || 12;
  return d + (mm ? ':' + String(mm).padStart(2,'0') : '') + ' ' + ap;
}

function openState(L){
  const now = new Date();
  const [o, c] = L.hours[now.getDay()];
  const h = now.getHours() + now.getMinutes() / 60;
  // los cierres después de medianoche se expresan como 24+ en los datos
  const open = h >= o && h < c || (c > 24 && h < c - 24);
  return { open, text: open ? 'Open until ' + fmtHour(c) : 'Closed right now' };
}

/* ---------- render ---------- */
function renderRail(L){
  const tops = [];
  MENU[loc].forEach(c => c.items.forEach(i => { if (i[3] === 'top') tops.push(i); }));
  // Las fotos reales van primero; lo que no está fotografiado cae al bloque de color.
  tops.sort((a, b) => (FOTOS[b[0]] ? 1 : 0) - (FOTOS[a[0]] ? 1 : 0));
  $('#rail').innerHTML = tops.slice(0,8).map((i, n) => {
    const src = FOTOS[i[0]];
    const art = src
      ? `<img src="${src}" alt="${i[0]}" width="800" height="600" loading="lazy">`
      : `<span>${i[0].split(' ')[0]}</span>`;
    return `
    <article class="card">
      <div class="card-art${src ? ' has-photo' : ' c' + ((n % 4) + 1)}">${art}</div>
      <div class="card-body">
        <h3>${i[0]}</h3>
        <p>${i[1] || ''}</p>
        <span class="price">${money(i[2])}</span>
      </div>
    </article>`;
  }).join('');
}

// Los martes, en las ubicaciones donde el precio está confirmado, los tacos
// sueltos se muestran tachados a $1. Donde no está confirmado no se toca.
function tuesdayPrice(name, price){
  const cfg = TUESDAY[loc];
  if (!cfg || !cfg.confirmed || !cfg.price || !isTuesdayNow()) return null;
  const esTaco = /^taco$/i.test(name) || /^tacos dorados$/i.test(name);
  return esTaco && price > cfg.price ? cfg.price : null;
}

function renderMenu(){
  $('#menuGrid').innerHTML = MENU[loc].map(c => `
    <div class="menu-cat">
      <h3 class="display" data-n="${c.items.length}">${c.cat}</h3>
      ${c.items.map(i => `
        <div class="menu-item">
          <p class="line">
            <span class="nm">${i[0]}</span>${i[3] ? `<span class="tag ${i[3]}">${i[3] === 'top' ? 'Popular' : 'For groups'}</span>` : ''}
            <span class="leader"></span>
            ${(() => {
              // Dos precios quedaron tapados por el reflejo de la carta
              // plastificada. Hasta que el restaurante los confirme, el sitio
              // invita a preguntar en vez de inventar una cifra.
              if (i[2] == null) return '<span class="price ask">Ask us</span>';
              const t = tuesdayPrice(i[0], i[2]);
              return t
                ? `<span class="price tuesday"><span class="was">${money(i[2])}</span>${money(t)}</span>`
                : `<span class="price">${money(i[2])}</span>`; })()}
          </p>
          ${i[1] ? `<p class="dsc">${i[1]}</p>` : ''}
        </div>`).join('')}
    </div>`).join('');
}

function renderBar(){
  const row = (n, d, ...p) => `
    <div class="menu-item">
      <p class="line">
        <span class="nm">${n}</span>
        <span class="leader"></span>
        <span class="price">${p.map(x => money(x)).join(' · ')}</span>
      </p>
      ${d ? `<p class="dsc">${d}</p>` : ''}
    </div>`;
  $('#draft').innerHTML    = BAR.draft.map(b => row(b[0], b[1], b[2], b[3], b[4])).join('');
  $('#margs').innerHTML    = BAR.margs.map(b => row(b[0], b[1], b[2], b[3], b[4])).join('');
  $('#specials').innerHTML = BAR.specials.map(b => row(b[0], b[1], b[2])).join('');
}

function renderEvents(){
  const list = EVENTS.filter(e => e.where.includes(loc)).slice(0,3);
  $('#events').innerHTML = list.map(e => {
    const d = new Date(e.date + 'T12:00:00');
    const when = d.toLocaleDateString('en-US', { month:'long', day:'numeric' });
    return `<article class="event">
      <span class="when">${when}</span>
      <h3>${e.title}</h3>
      <p>${e.copy}</p>
      <a href="#parties">${e.cta} →</a>
    </article>`;
  }).join('');
}

function renderLate(){
  $('#lateHours').innerHTML = Object.values(LOCATIONS).map(L => {
    const t = fmtHour(L.hours[5][1]);
    return `<div><span class="d">${L.name} · Fri</span><span class="h">${t}</span></div>`;
  }).join('');
}

function renderLocs(){
  $('#locs').innerHTML = Object.values(LOCATIONS).map(L => {
    const st = openState(L);
    return `<article class="loc ${L.id === loc ? 'on' : ''}">
      ${L.id === 'nola' ? '<img class="loc-shot" src="img/fachada.jpg" alt="The Tacos and Beer storefront on St. Charles Ave" width="1000" height="753" loading="lazy">' : ''}
      <span class="hood">${L.hood}</span>
      <h3>${L.name}</h3>
      <address>${L.address}<br>${L.city}</address>
      <div class="hrs">${L.hoursText.map(h => `<span>${h[0]} · ${h[1]}</span>`).join('')}</div>
      <p style="margin:.4rem 0 0;font-size:.8rem;color:${L.id === loc ? 'var(--amarillo)' : 'var(--verde)'}">${st.text}</p>
      <div class="acts">
        <a href="tel:${L.tel}">Call</a>
        <a href="${L.maps}" target="_blank" rel="noopener">Directions</a>
        ${L.id === loc ? '' : `<a href="#" data-go="${L.id}">See this menu</a>`}
      </div>
    </article>`;
  }).join('');
  $$('[data-go]').forEach(a => a.onclick = e => { e.preventDefault(); setLoc(a.dataset.go); });
  $('#footLocs').innerHTML = Object.values(LOCATIONS)
    .map(L => `<a href="tel:${L.tel}">${L.name} · ${L.phone}</a>`).join('');
}

function renderQueue(){
  const L = LOCATIONS[loc];
  // sigue en la fila mientras no lo sienten, aunque ya se le haya avisado
  const mine = db.read().wait.filter(w => w.loc === loc && (w.status === 'waiting' || w.status === 'texted'));
  // espera base simulada por hora del día, para que la demo se sienta viva
  const hour = new Date().getHours();
  const base = hour >= 18 && hour <= 21 ? 4 : hour >= 11 && hour <= 14 ? 3 : 1;
  const ahead = base + mine.length;
  $('#waitMin').innerHTML = (ahead * 7) + '<span style="font-size:1.2rem"> min</span>';
  $('#waitSub').textContent = ahead === 1 ? '1 party ahead of you' : ahead + ' parties ahead of you';
  $('#wLoc').textContent = L.name;

  const fake = [['Rodríguez',4],['Boudreaux',2],['Nguyen',6],['Landry',3]].slice(0, base);
  const rows = fake.map(f => `<div><span>${f[0]}</span><span>${f[1]} people</span></div>`);
  mine.forEach(m => rows.push(
    `<div class="me"><span>${m.name} — you</span><span>${m.size} people</span></div>`));
  $('#queue').innerHTML = rows.join('');
}

function renderSchema(){
  const L = LOCATIONS[loc];
  $('#schema').textContent = JSON.stringify({
    '@context':'https://schema.org','@type':'Restaurant',
    name:'Tacos and Beer — ' + L.name,
    // Google usa el logo en el panel de conocimiento y en los resultados
    // enriquecidos. Absoluto a partir de donde se esté sirviendo.
    logo:new URL('img/logo.png', location.href).href,
    image:new URL('img/logo.png', location.href).href,
    servesCuisine:['Mexican','Tex-Mex'],
    priceRange:'$$',
    address:{'@type':'PostalAddress',streetAddress:L.address,
      addressLocality:L.city.split(',')[0],addressRegion:'LA',addressCountry:'US'},
    telephone:L.phone,
    acceptsReservations:'True',
    hasMenu:{'@type':'Menu',hasMenuSection:MENU[loc].map(c => ({
      '@type':'MenuSection',name:c.cat,
      hasMenuItem:c.items.map(i => ({'@type':'MenuItem',name:i[0],description:i[1] || undefined,
        offers: i[2] == null ? undefined
          : {'@type':'Offer',price:i[2].toFixed(2),priceCurrency:'USD'}}))
    }))}
  }, null, 2);
}

function setLoc(id){
  loc = id;
  localStorage.setItem('tb_loc', id);
  const L = LOCATIONS[id];
  document.documentElement.dataset.loc = id;

  $$('.locpick button').forEach(b => b.setAttribute('aria-pressed', b.dataset.loc === id));
  const st = openState(L);
  $('#livetext').textContent = st.text;
  $('#dot').className = 'dot' + (st.open ? '' : ' shut');

  $('#heroBrow').textContent  = (L.since ? 'Since ' + L.since + ' · ' : '') + L.hood;
  $('#heroPitch').textContent = L.pitch;
  $('#heroAddr').textContent  = L.address;
  $('#heroHours').textContent = L.hoursText[0][1];
  $('#menuLoc').textContent   = L.name;
  $('#evLoc').textContent     = L.name;
  $('#stickyCall').href       = 'tel:' + L.tel;
  const sm = $('#stickyMaps'); if (sm) sm.href = L.maps;
  const hc = $('#heroCall'); if (hc) hc.href = 'tel:' + L.tel;

  // Cada ciudad tiene una carta de distinto largo: New Orleans son 41 platos y
  // Hammond 26. Sin anclar el scroll, quien esté leyendo a media página sale
  // disparado más de mil píxeles al cambiar de local — y eso pasa justo en el
  // momento de la demostración en que se enseña el selector.
  const ref = $$('section').find(sec => sec.getBoundingClientRect().bottom > 0);
  const antes = ref ? ref.getBoundingClientRect().top : 0;

  renderRail(L); renderMenu(); renderEvents(); renderLocs(); renderQueue(); renderSchema();

  // El contenido cambia de golpe al elegir otra ciudad. Un fundido corto evita
  // que el menú y los precios se teletransporten.
  if (typeof renderTuesday === 'function') { renderTuesday(); tickTuesday(); }

  ['#rail','#menuGrid','#events','#locs'].forEach(q => {
    const el = $(q); if (!el) return;
    el.classList.remove('swap'); void el.offsetWidth; el.classList.add('swap');
  });

  if (ref){
    const desplazo = ref.getBoundingClientRect().top - antes;
    // 'instant' porque html tiene scroll-behavior:smooth y una corrección
    // animada se vería como un salto en cámara lenta.
    if (Math.abs(desplazo) > 1) window.scrollBy({ top: desplazo, behavior: 'instant' });
  }
}

/* ---------- grupos y fiestas ----------
   Sin estimado en pantalla: los paquetes y sus precios eran una propuesta de
   ECG, no una oferta del restaurante. Una fiesta de veinte personas se cierra
   hablando, así que el formulario recoge lo mínimo y el restaurante llama. */

function toast(msg){
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), 5200);
}

/* ---------- arranque ---------- */
$$('.locpick button').forEach(b => b.onclick = () => setLoc(b.dataset.loc));

renderBar(); renderLate();

const t = new Date(Date.now() + 6048e5);
$('#pDate').value = t.toISOString().slice(0,10);
$('#pDate').min   = new Date().toISOString().slice(0,10);

$('#waitForm').addEventListener('submit', e => {
  e.preventDefault();
  const rec = db.add('wait', {
    loc, name: $('#wName').value.trim(), phone: $('#wPhone').value.trim(),
    size: partySize, pref: $('#wNotes').value
  });
  e.target.reset(); partySize = 2; renderQueue();
  toast(`You are on the list, ${rec.name.split(' ')[0]}. We will text ${rec.phone} when you are two tables away.`);
});

$('#partyForm').addEventListener('submit', e => {
  e.preventDefault();
  const g = +$('#pGuests').value;
  const rec = db.add('party', {
    loc, name: $('#pName').value.trim(), phone: $('#pPhone').value.trim(),
    date: $('#pDate').value, time: $('#pTime').value, guests: g,
    occasion: $('#pOcc').value.trim(),
    notes: $('#pNotes').value.trim()
  });
  e.target.reset();
  toast(`Got it, ${rec.name.split(' ')[0]}. ${LOCATIONS[loc].name} will call you back about your table for ${g}.`);
});

function daypart(){
  const h = new Date().getHours();
  const late = h >= 21 || h < 4;
  document.documentElement.dataset.daypart = late ? 'late' : 'day';
}
daypart(); setInterval(daypart, 60000);

setLoc(loc);
setInterval(() => { const st = openState(LOCATIONS[loc]);
  $('#livetext').textContent = st.text;
  $('#dot').className = 'dot' + (st.open ? '' : ' shut'); }, 60000);

/* ---------- motion ---------- */
// Revelado al entrar en pantalla. Una sola vez por elemento: repetirlo al
// subir y bajar marea y no aporta nada.
(function reveals(){
  const solo = ['#menu > .eyebrow','#menu > h2','#menu > .hero-sub','#menu > .shot',
                '.rail-head','#espera h2','#waitlist h2','.late > div','.wait','.planner'];
  const grupos = ['#menuGrid','#events','#locs','.three','.gal'];
  solo.forEach(q => $$(q).forEach(el => el.classList.add('rv')));
  grupos.forEach(q => $$(q).forEach(el => el.classList.add('rv-stagger')));

  const io = new IntersectionObserver((es, obs) => {
    es.forEach(en => {
      if (!en.isIntersecting) return;
      en.target.classList.add('in');
      obs.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  $$('.rv, .rv-stagger').forEach(el => io.observe(el));
})();

// La barra superior se despega cuando ya no estás arriba del todo.
const bar = $('.locbar');
addEventListener('scroll', () => {
  bar.classList.toggle('stuck', scrollY > 8);
}, { passive: true });

/* ---------- Taco Tuesday ----------
   Es su seña de identidad, así que tiene estado propio: cuenta regresiva el
   resto de la semana y toma el sitio el martes. El precio de $1 solo se
   muestra donde está confirmado; donde no, se invita a preguntar. */
const ttWords = ['Taco Tuesday','$1 Tacos','All day','Every week','No exceptions','Taco Tuesday','🌮'];

function nextTuesday(now){
  const t = new Date(now);
  t.setHours(11, 0, 0, 0);                      // abren a las 11
  const delta = (2 - t.getDay() + 7) % 7;       // 2 = martes
  t.setDate(t.getDate() + delta);
  if (t <= now) t.setDate(t.getDate() + 7);
  return t;
}

function isTuesdayNow(){
  const n = new Date(), L = LOCATIONS[loc];
  if (n.getDay() !== 2) return false;
  const [o, c] = L.hours[2];
  const h = n.getHours() + n.getMinutes() / 60;
  return h >= o && (c > 24 ? true : h < c);
}

function renderTuesday(){
  const cfg = TUESDAY[loc] || {};
  const on  = isTuesdayNow();
  document.documentElement.dataset.tuesday = on ? '1' : '0';

  // El aviso de la barra solo promete el precio donde está confirmado. En la
  // Avenida no lo está, así que ahí el martes se anuncia sin cifra.
  $('#ttBadge').textContent = cfg.confirmed && cfg.price
    ? `🌮 ${money(cfg.price)} Tacos today`
    : '🌮 Taco Tuesday';

  $('#ttLine').textContent = cfg.line || '';
  $('#ttNote').textContent = cfg.confirmed === false && cfg.price
    ? 'Prices and days can differ by location. Call us to be sure.'
    : '';

  if (on){
    $('#ttClockK').textContent = 'It is Tuesday. Right now.';
    $('#ttD').textContent = '$1';
    $$('.tt-dial div').forEach((d, i) => d.style.display = i ? 'none' : '');
    $('#ttD').nextElementSibling.textContent = cfg.price ? 'per taco' : 'ask us';
  } else {
    $('#ttClockK').textContent = 'Next Taco Tuesday in';
    $$('.tt-dial div').forEach(d => d.style.display = '');
    $('#ttD').nextElementSibling.textContent = 'days';
  }
}

function tickTuesday(){
  if (isTuesdayNow()) return;
  const now = new Date(), t = nextTuesday(now);
  let s = Math.max(0, Math.floor((t - now) / 1000));
  const d = Math.floor(s / 86400); s -= d * 86400;
  const h = Math.floor(s / 3600);  s -= h * 3600;
  const m = Math.floor(s / 60);    s -= m * 60;
  $('#ttD').textContent = d;
  $('#ttH').textContent = String(h).padStart(2, '0');
  $('#ttM').textContent = String(m).padStart(2, '0');
  $('#ttS').textContent = String(s).padStart(2, '0');
}

// la cinta se duplica para que el bucle no muestre el corte
(function marquee(){
  const run = ttWords.concat(ttWords).map(w => `<span>${w}</span>`).join('');
  $('#ttRun').innerHTML = run;
  $('#ttRun2').innerHTML = run;
})();

renderTuesday(); tickTuesday();
setInterval(tickTuesday, 1000);
setInterval(renderTuesday, 60000);

/* ---------- montaje del hero ----------
   Los cuadros se inyectan después de `load` para que no compitan con la
   primera pintura. La foto del letrero ya está en el HTML y es el cuadro 1;
   estos son del 2 al 7. Si el visitante pidió menos movimiento, no se cargan. */
/* Si el video del hero no logra reproducirse solo (iOS en ahorro de batería,
   Data Saver, o el navegador simplemente lo bloquea), se marca el documento y
   el CSS lo apaga para que quede el montaje de fotos, que ya está detrás. */
addEventListener('load', function videoHero(){
  const v = document.getElementById('heroVideo');
  if (!v) return;
  const rendirse = () => document.documentElement.classList.add('js-sin-video');
  v.addEventListener('error', rendirse);
  const intento = v.play();
  if (intento && intento.catch) intento.catch(rendirse);
  setTimeout(() => { if (v.paused || v.readyState < 2) rendirse(); }, 2600);
});

addEventListener('load', function montajeHero(){
  const menos = matchMedia('(prefers-reduced-motion: reduce)');
  if (menos.matches) return;
  const foto = $('.hero-foto');
  if (!foto) return;

  const cuadros = [
    ['img/m2-fachada.jpg',  'The yellow storefront on St. Charles Avenue'],
    ['img/m3-comedor.jpg',  'The turquoise dining room'],
    ['img/m4-platon.jpg',   'A platter of assorted tacos'],
    ['img/m5-papel.jpg',    'Tacos served on our house paper'],
    ['img/m6-margarita.jpg','A 64 oz margarita'],
    ['img/m7-mesa.jpg',     'A shared table with chips and guacamole'],
  ];
  const total = cuadros.length + 1;          // el letrero cuenta como uno
  const ciclo = total * 2.6;                 // 2.6 s por foto: el primer cambio
                                             // ocurre antes de que nadie se aburra
  foto.style.setProperty('--ciclo', ciclo + 's');

  cuadros.forEach(([src, alt], i) => {
    const d = document.createElement('div');
    d.className = 'cuadro';
    // cada cuadro entra un turno después que el anterior
    d.style.animationDelay = ((i + 1) * 2.6) + 's';
    const img = new Image();
    img.src = src; img.alt = alt; img.width = 1280; img.height = 720;
    img.decoding = 'async';
    img.style.animationDelay = ((i + 1) * 2.6) + 's';
    d.appendChild(img);
    foto.appendChild(d);
  });
});

/* ---------- revelado al bajar ----------
   Se marcan los hijos directos de cada sección y las tarjetas, y se revelan al
   entrar en pantalla. Una sola vez: nada se vuelve a esconder al subir, que es
   lo que marea. El escalonado hace que un grupo entre en cascada y no de golpe. */
addEventListener('load', function revelado(){
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const grupos = [
    ['section.wrap > *, section.band .wrap > *, .intro-in > *', 0],
    ['.menu-cat', 1], ['.card', 1], ['.event', 1], ['.loc', 1], ['.pkg', 1], ['.stat', 1]
  ];
  const vistos = new Set();
  grupos.forEach(([sel, escalona]) => {
    $$(sel).forEach((el, i) => {
      // El contenedor de la carta no se anima: sus categorías ya lo hacen, y
      // envolverlas en otro elemento con opacidad las apagaría en bloque.
      if (vistos.has(el) || el.closest('.hero') || el.id === 'menuGrid') return;
      vistos.add(el);
      el.classList.add('rev');
      if (escalona) el.classList.add('rev-' + Math.min(6, (i % 6) + 1));
    });
  });

  const io = new IntersectionObserver((entradas, obs) => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('visto');
      obs.unobserve(e.target);            // una vez y se suelta
    });
    // `threshold: 0` y el retardo en el margen. Con un umbral por proporción,
    // un elemento más alto que la pantalla no puede alcanzarlo nunca: la carta
    // de New Orleans mide 7.800 px y en un teléfono de 568 el máximo posible
    // es 7%. Se quedaba invisible para siempre.
  }, { rootMargin: '0px 0px -80px 0px', threshold: 0 });

  vistos.forEach(el => io.observe(el));

  // Lo que ya está en pantalla al cargar se revela sin esperar al scroll.
  requestAnimationFrame(() => vistos.forEach(el => {
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add('visto');
  }));
});

/* La altura real de la barra, medida y no adivinada. De ella dependen el hueco
   del hero, el margen de las anclas y el aviso emergente. Antes era un 104px
   fijo que no coincidía con los 141 o 160 reales, así que las anclas caían
   pegadas al borde de la barra o justo debajo. */
(function altoDeBarra(){
  const bar = document.querySelector('.locbar');
  if (!bar) return;
  const fijar = () => {
    const h = Math.round(bar.getBoundingClientRect().height);
    // OJO: no se escribe en `--bar-h`. Esa variable es la altura mínima de
    // `.locbar-in`, así que realimentarla hace crecer la barra sin parar.
    document.documentElement.style.setProperty('--bar-total', h + 'px');
    document.documentElement.style.setProperty('--anchor-off', (h + 16) + 'px');
  };
  fijar();
  if (window.ResizeObserver) new ResizeObserver(fijar).observe(bar);
  addEventListener('orientationchange', fijar);
})();
