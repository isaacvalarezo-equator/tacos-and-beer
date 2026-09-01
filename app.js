/* Tacos and Beer — prototipo funcional.
   El estado vive en localStorage para que la demo sea real durante el pitch.
   El panel del dueño (panel.html) lee exactamente el mismo almacén. */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
/* ---------- envío de reservas ----------
   Cuando ENDPOINT esté puesto, cada reserva viaja a la función sin servidor y
   de ahí al grupo de GroupMe del restaurante. Mientras esté vacío, el sitio
   funciona igual contra `localStorage`, que es lo que permite enseñarlo en una
   reunión sin conexión. La demo nunca deja de funcionar por esto. */
/* ENCENDER AQUÍ. Esta línea la reescribe sola `servidor/encender.sh` al
   desplegar, y también se puede pegar a mano. No borrar el marcador. */
const ENDPOINT = ''; /* encender-aqui */

async function enviar(datos){
  if (!ENDPOINT) return { ok: true, local: true };
  try {
    const r = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos),
    });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok && j.ok !== false, error: j.error };
  } catch (e) {
    // Sin red, la reserva ya quedó guardada en el navegador y el panel la ve.
    return { ok: false, error: 'sin conexión' };
  }
}

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
      : `<span aria-hidden="true">${i[0].split(' ')[0]}</span>`;
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

/* Una foto por local. Salen del sitio archivado del propio restaurante, así
   que son suyas. New Orleans y Hammond tienen fachada; de Slidell no hay
   exterior en el archivo, así que va un plato de la casa hasta que Isaac
   fotografíe el local. */
const FOTO_LOC = {
  nola:    'The yellow storefront on St. Charles Avenue, with the sign and the patio',
  slidell: 'The mint green building in Old Towne, with the patio full',
  hammond: 'The Hammond storefront on Thomas Street, with the sign and the string lights'
};

function renderLocs(){
  $('#locs').innerHTML = Object.values(LOCATIONS).map(L => {
    const st = openState(L);
    return `<article class="loc ${L.id === loc ? 'on' : ''}">
      <img class="loc-shot" src="img/loc-${L.id}.jpg" alt="${FOTO_LOC[L.id]}" width="900" height="600" loading="lazy">
      <span class="hood">${L.hood}</span>
      <h3>${L.name}</h3>
      <address>${L.address}<br>${L.city}</address>
      <div class="hrs">${L.hoursText.map(h => `<span>${h[0]} · ${h[1]}</span>`).join('')}</div>
      <p class="estado"><span class="dot${st.open ? '' : ' shut'}"></span>${st.text}</p>
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

/* La fila en vivo se retiró: inventaba nombres y una espera simulada por hora
   del día. El restaurante gestiona reservas, no un turno, y un dato falso en
   pantalla es exactamente lo que no puede llevar este sitio. */

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

  $('#heroPitch').textContent = L.pitch;
  // El texto del local nuevo entra subiendo, igual que entró el primero. En la
  // carga inicial esto no hace nada: todavía no hay palabras que rehacer.
  subirDeNuevo($('#heroPitch'), .10);
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

  renderRail(L); renderMenu(); renderEvents(); renderLocs(); renderSchema();

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

let toastT;
function toast(msg){
  const t = $('#toast');
  t.textContent = msg; t.classList.add('on');
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('on'), 5200);
}

/* ---------- arranque ---------- */
/* Al cambiar de local cambia la carta entera, la dirección, el horario y el
   teléfono, pero todo eso vive más abajo: desde el hero no se ve nada y parece
   que el botón no hizo nada. El aviso confirma el cambio donde está el dedo. */
$$('.locpick button').forEach(b => b.onclick = () => {
  const antes = loc;
  setLoc(b.dataset.loc);
  if (antes !== loc) {
    const L = LOCATIONS[loc], st = openState(L);
    toast(`Now showing ${L.name} · ${L.address} · ${st.text}`);
  }
});

renderBar(); renderLate();

/* El día y la hora van en un solo campo. `toISOString` da UTC, y en Louisiana
   eso adelanta cinco horas: a las siete de la tarde el campo ya proponía
   mañana. Se arma con la hora local restando el desfase del navegador. */
const enLocal = d => new Date(d.getTime() - d.getTimezoneOffset() * 6e4).toISOString().slice(0,16);

/* Se propone esta noche a las siete, que es la hora a la que más se reserva. Si
   ya pasó, la propuesta es dentro de una hora. `reset()` devuelve el campo al
   valor del marcado, que está vacío, así que hay que reponerlo tras reservar. */
function proponerCuando(){
  const rw = $('#rWhen'); if (!rw) return;
  const ahora = new Date();
  const siete = new Date(ahora); siete.setHours(19,0,0,0);
  rw.value = enLocal(siete > ahora ? siete : new Date(ahora.getTime() + 36e5));
  rw.min   = enLocal(ahora);
}
proponerCuando();

const t = new Date(Date.now() + 6048e5);
$('#pDate').value = t.toISOString().slice(0,10);
$('#pDate').min   = new Date().toISOString().slice(0,10);

/* La versión del texto de permiso. Se sube cada vez que cambie una palabra de
   lo que la persona lee junto a la casilla. */
const PERMISO_VERSION = '2026-08-29';
const PERMISO_TEXTO = 'Also send me Taco Tuesday, events and offers by email or text. You can stop from any message.';

$('#waitForm').addEventListener('submit', e => {
  e.preventDefault();
  const optin = $('#wOptin') ? $('#wOptin').checked : false;
  // El campo entrega '2026-09-15T19:00'. Se parte porque el grupo de GroupMe, la
  // confirmación y el panel siguen leyendo el día y la hora por separado.
  const [dia, hora] = ($('#rWhen').value || '').split('T');
  const rec = db.add('wait', {
    loc, name: $('#wName').value.trim(), phone: $('#wPhone').value.trim(),
    email: $('#wEmail') ? $('#wEmail').value.trim() : '',
    date: dia || '', time: hora || '',
    size: +$('#rSize').value,
    permiso: {
      marketing: optin,
      canales: optin ? ['email', 'sms'] : [],
      version: PERMISO_VERSION,
      texto: PERMISO_TEXTO,
      en: new Date().toISOString()
    }
  });
  e.target.reset(); proponerCuando();
  toast(`Booked, ${rec.name.split(' ')[0]}. Your table for ${rec.size} at ${LOCATIONS[loc].name} is in. See you then.`);
  enviar({ tipo: 'reserva', ...rec }).then(res => {
    if (!res.ok) toast('We saved it, but it did not reach the restaurant. Please call us to be sure.');
  });
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
  enviar({ tipo: 'grupo', ...rec, size: g }).then(res => {
    if (!res.ok) toast('We saved it, but it did not reach the restaurant. Please call us to be sure.');
  });
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
    ['img/m8-slidell-dentro.jpg', 'The dining room in Slidell on a full night'],
    ['img/m10-hammond-fuera.jpg', 'The Hammond storefront on Thomas Street'],
    ['img/m9-hammond-barra.jpg',  'The bar in Hammond'],
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
    ['section.wrap > *, section.band .wrap > *', 0],
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

/* La barra de acciones de abajo también se mide. El hueco que se le reservaba
   era un 64px fijo y la barra mide 61, así que sobraban 3px de fondo crema
   entre el pie y la barra, y se veía una línea clara cruzando el final de la
   página. El hueco lo pone el propio pie, así que aunque la medida baile un
   píxel lo que asoma es marrón sobre marrón. */
(function altoDeAcciones(){
  const acc = document.querySelector('.sticky');
  if (!acc) return;
  const fijar = () => {
    const visible = getComputedStyle(acc).display !== 'none';
    const h = visible ? Math.round(acc.getBoundingClientRect().height) : 0;
    document.documentElement.style.setProperty('--acciones-h', h + 'px');
  };
  fijar();
  if (window.ResizeObserver) new ResizeObserver(fijar).observe(acc);
  addEventListener('orientationchange', fijar);
  addEventListener('resize', fijar);
})();

/* ---------- el texto que sube por palabras ----------
   Se parte solo el texto visible: los `span.sr` que existen para los lectores
   de pantalla se dejan intactos, o el nombre del negocio se perdería.

   Son declaraciones y no constantes porque setLoc, que vive bastante más
   arriba, las llama al cambiar de local. */
function menosMovimiento(){
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function partir(el, retardoBase){
    if (!el || menosMovimiento()) return;
    if (el.dataset.partido) return;
    el.dataset.partido = '1';
    let i = 0;
    [...el.childNodes].forEach(nodo => {
      if (nodo.nodeType !== 3) return;                  // solo nodos de texto
      const frag = document.createDocumentFragment();
      nodo.textContent.split(/(\s+)/).forEach(trozo => {
        if (!trozo.trim()) { frag.appendChild(document.createTextNode(trozo)); return; }
        const w = document.createElement('span');
        w.className = 'palabra';
        const inner = document.createElement('i');
        inner.textContent = trozo;
        inner.style.setProperty('--d', (retardoBase + i * 0.055).toFixed(3) + 's');
        i++;
        w.appendChild(inner);
        frag.appendChild(w);
      });
      nodo.replaceWith(frag);
    });
}

/* Cambiar de local reescribe el eyebrow y el pitch con textContent, y con eso
   se van todos los span.palabra. Aquí el texto nuevo se vuelve a partir desde
   cero y se le manda subir otra vez, así que entra como entró el primero.

   Si todavía no se había partido nada, no hay nada que rehacer: es la carga
   inicial y de eso se encarga el observador, que espera a que el bloque entre
   en pantalla. */
function subirDeNuevo(el, retardoBase){
  if (!el || menosMovimiento()) return;
  if (el.dataset.partido !== '1') return;
  delete el.dataset.partido;
  el.classList.remove('visto');
  partir(el, retardoBase);
  void el.offsetWidth;          // fuerza el reflujo, o la subida no arranca
  el.classList.add('visto');
}

addEventListener('load', function palabrasQueSuben(){
  if (menosMovimiento()) return;

  const objetivos = [['.intro-t', .18], ['.intro-sub', .62]];
  objetivos.forEach(([sel, base]) => { const el = $(sel); if (el) partir(el, base); });

  const bloque = $('.intro-in');
  if (!bloque) return;
  const io = new IntersectionObserver((e, obs) => {
    if (!e[0].isIntersecting) return;
    objetivos.forEach(([sel]) => $(sel)?.classList.add('visto'));
    obs.disconnect();
  }, { threshold: 0, rootMargin: '0px 0px -60px 0px' });
  io.observe(bloque);
});
