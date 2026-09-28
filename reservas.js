/* Admin de reservas: pasadas, de hoy y futuras.

   Con ENDPOINT puesto, pide la lista al Worker con la clave del admin. Vacío,
   lee las reservas hechas en este navegador, igual que la demo del sitio. */

/* ENCENDER AQUÍ. La reescribe `servidor/encender.sh`. No borrar el marcador. */
const ENDPOINT = "https://reservas-tacos-and-beer.isaacvalarezo30.workers.dev"; /* encender-aqui */

const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const LUGAR = { nola: 'New Orleans', slidell: 'Slidell', hammond: 'Hammond' };

/* Todo lo que se pinta viene de lo que escribió un cliente. Se escapa siempre. */
const esc = v => String(v ?? '').replace(/[&<>"']/g, c =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/* "Hoy" es hoy en Louisiana, no en el teléfono de quien mira. */
const hoyLA = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' }).format(new Date());

const hora = t => {
  if (!t) return '';
  const [h, m] = t.split(':').map(Number);
  return (h % 12 || 12) + ':' + String(m || 0).padStart(2, '0') + (h >= 12 ? ' PM' : ' AM');
};
const diaLargo = d => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US',
  { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

/* El mensaje que le llegó al grupo, igual letra por letra que el que arma
   `servidor/reserva.js`. Si se cambia allí, se cambia aquí: la prueba
   docs/test-admin-reservas.js compara los dos y falla si se separan. */
const DIRECCION = { nola: 'New Orleans \u00b7 1622 St. Charles Ave',
  slidell: 'Slidell \u00b7 2142 1st St', hammond: 'Hammond \u00b7 201 E Thomas St' };
function mensajeGroupMe(r){
  let cuando = 'no date given';
  if (r.date){
    const [y, m, d] = r.date.split('-').map(Number);
    cuando = new Date(Date.UTC(y, m - 1, d, 12)).toLocaleDateString('en-US',
      { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' }) + ', ' + hora(r.time || '19:00');
  }
  const l = [
    r.tipo === 'grupo' ? 'GROUP REQUEST' : 'NEW RESERVATION',
    r.name + ' \u00b7 ' + r.size + (+r.size === 1 ? ' person' : ' people'),
    cuando,
    DIRECCION[r.loc] || r.loc,
    'Phone: ' + r.phone,
  ];
  if (r.email)    l.push('Email: ' + r.email);
  if (r.occasion) l.push('Occasion: ' + r.occasion);
  if (r.notes)    l.push('Notes: ' + r.notes);
  if (r.ofertas)  l.push('Opted in to offers: yes');
  return l.join('\n');
}

let todas = [], vista = 'hoy';
/* Como la tablet del host en OpenTable o Resy: quien marca "Keep me signed
   in" no vuelve a teclear la clave en ese aparato. Sin marcar, se olvida al
   cerrar la pestaña. "Sign out" la borra de los dos sitios. */
const clave = {
  get(){ try { return sessionStorage.getItem('tb_admin') || localStorage.getItem('tb_admin') || ''; } catch { return ''; } },
  set(v, recordar){ try { (recordar ? localStorage : sessionStorage).setItem('tb_admin', v); } catch {} },
  quitar(){ try { sessionStorage.removeItem('tb_admin'); localStorage.removeItem('tb_admin'); } catch {} },
};

function error(msg){
  const e = $('#error');
  e.hidden = !msg; e.textContent = msg || '';
}

/* La demo guarda reservas en `wait` y grupos en `party`, con nombres de campo
   distintos. Se juntan en la misma forma que entrega el Worker. */
function deEsteNavegador(){
  let d;
  try { d = JSON.parse(localStorage.getItem('tb_demo_v1')) || {}; } catch { d = {}; }
  const r = (d.wait || []).filter(x => x.date).map(x => ({
    id: x.id, tipo: 'reserva', name: x.name, phone: x.phone, email: x.email || '',
    size: x.size, loc: x.loc, date: x.date, time: x.time, notes: '', occasion: '',
    ofertas: !!(x.permiso && x.permiso.marketing), at: x.at }));
  const g = (d.party || []).filter(x => x.date).map(x => ({
    id: x.id, tipo: 'grupo', name: x.name, phone: x.phone, email: '',
    size: x.guests, loc: x.loc, date: x.date, time: x.time, notes: x.notes || '',
    occasion: x.occasion || '', ofertas: false, at: x.at }));
  return r.concat(g);
}

/* El enlace del manager lleva la clave detrás de la almohadilla:
   reservas.html#k=… Lo que va detrás de # nunca viaja al servidor ni queda en
   sus registros. Se guarda en este aparato y se borra de la barra enseguida,
   así el manager entra sin teclear nada y la clave no se queda a la vista. */
(function claveDelEnlace(){
  const m = location.hash.match(/(?:^#|&)k=([^&]+)/);
  if (!m) return;
  clave.set(decodeURIComponent(m[1]), true);
  history.replaceState(null, '', location.pathname + location.search);
})();

async function cargar(){
  error('');
  if (!ENDPOINT){
    $('#demo').hidden = false; $('#login').hidden = true; $('#vista').hidden = false;
    todas = deEsteNavegador(); pintar(); return;
  }
  const k = clave.get();
  if (!k){ $('#login').hidden = false; $('#vista').hidden = true; $('#clave').focus(); return; }
  try {
    const r = await fetch(ENDPOINT.replace(/\/$/, '') + '/reservas',
      { headers: { Authorization: 'Bearer ' + k }, cache: 'no-store' });
    if (r.status === 401){
      clave.quitar(); $('#login').hidden = false; $('#vista').hidden = true;
      error('That password did not work.'); return;
    }
    const j = await r.json();
    if (!r.ok || !j.ok) throw new Error(j.error || r.status);
    todas = j.reservas || [];
    $('#login').hidden = true; $('#vista').hidden = false; $('#salir').hidden = false;
    pintar();
  } catch (e) {
    error('Could not load the reservations. Check the connection and press Refresh.');
    $('#vista').hidden = false;
  }
}

function pintar(){
  const hoy = hoyLA();
  const loc = $('#loc').value;
  const q = $('#buscar').value.trim().toLowerCase();
  const qn = q.replace(/\D/g, '');

  let l = todas.filter(r => (loc === 'all' || r.loc === loc)
    && (!q || (r.name || '').toLowerCase().includes(q)
         || (qn.length >= 3 && String(r.phone || '').replace(/\D/g, '').includes(qn))));

  l = l.filter(r => vista === 'hoy' ? r.date === hoy : vista === 'futuro' ? r.date > hoy : r.date < hoy);
  const clave = r => r.date + 'T' + (r.time || '00:00');
  l.sort((a, b) => vista === 'pasado' ? clave(b).localeCompare(clave(a)) : clave(a).localeCompare(clave(b)));

  const gente = l.reduce((s, r) => s + (+r.size || 0), 0);
  $('#resumen').innerHTML = `<span><b>${l.length}</b>${l.length === 1 ? 'booking' : 'bookings'}</span>`
    + `<span><b>${gente}</b>people</span>`;

  if (!l.length){
    $('#lista').innerHTML = `<p class="vacio">${vista === 'hoy' ? 'No bookings for today yet.'
      : vista === 'futuro' ? 'Nothing booked ahead yet.' : 'No past bookings.'}</p>`;
    return;
  }

  const porDia = {};
  l.forEach(r => (porDia[r.date] = porDia[r.date] || []).push(r));
  $('#lista').innerHTML = Object.keys(porDia).map(d => `
    <section class="dia">
      <h2>${d === hoy ? 'Today · ' : ''}${esc(diaLargo(d))}</h2>
      ${porDia[d].map(r => `
        <div class="fila">
          <span class="h">${esc(hora(r.time))}</span>
          <div>
            <span class="nm">${esc(r.name)}</span>${r.tipo === 'grupo' ? '<span class="etq">Group request</span>' : ''}
            <div class="meta">
              ${esc(LUGAR[r.loc] || r.loc)} · <a href="tel:${esc(String(r.phone || '').replace(/[^0-9+]/g, ''))}">${esc(r.phone)}</a>
              ${r.email ? ` · <a href="mailto:${esc(r.email)}">${esc(r.email)}</a>` : ''}
              ${r.occasion ? `<br>Occasion: ${esc(r.occasion)}` : ''}
              ${r.notes ? `<br>Notes: ${esc(r.notes)}` : ''}
              ${r.grupo === false ? '<br><strong>Did not reach GroupMe. Call them to confirm.</strong>' : ''}
            </div>
            <details class="gm">
              <summary>${!ENDPOINT || r.grupo === null ? 'Message that would go to GroupMe' : r.grupo === false ? 'Message that did not reach GroupMe' : 'Message sent to GroupMe'}${r.evento ? ' · on the calendar' : ''}</summary>
              <pre>${esc(mensajeGroupMe(r))}</pre>
            </details>
          </div>
          <span class="n">${esc(r.size)} ${+r.size === 1 ? 'person' : 'people'}</span>
        </div>`).join('')}
    </section>`).join('');
}

$$('.seg button').forEach(b => b.onclick = () => {
  vista = b.dataset.v;
  $$('.seg button').forEach(x => x.setAttribute('aria-pressed', x === b));
  pintar();
});
$('#loc').onchange = pintar;
$('#buscar').oninput = pintar;
$('#recargar').onclick = cargar;
$('#login').onsubmit = e => {
  e.preventDefault();
  clave.set($('#clave').value, $('#recordar').checked); $('#clave').value = '';
  cargar();
};

$('#salir').onclick = () => {
  clave.quitar(); todas = []; $('#lista').innerHTML = ''; $('#salir').hidden = true;
  $('#vista').hidden = true; $('#login').hidden = false;
};

cargar();
// Una reserva nueva aparece sola, sin tener que recargar a mano.
setInterval(() => { if (!$('#vista').hidden) cargar(); }, 60000);
addEventListener('storage', () => { if (!ENDPOINT) cargar(); });
