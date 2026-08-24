/* Panel del dueño — lee el mismo almacén que la página pública. */
const $  = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const money = n => '$' + Math.round(n).toLocaleString('en-US');
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


/* Los estados se escribían en español antes de pasar el producto a inglés.
   Se traducen al leer para que un registro viejo no desaparezca del panel. */
/* El aviso sale del teléfono del propio host, no de una plataforma de pago.
   `sms:` abre su mensajero con el mensaje escrito; en iOS el separador del
   cuerpo es `&`, en Android `?`, y el `&` funciona en los dos. */
function smsLink(w){
  const texto = `Hi ${w.name.split(' ')[0]}, your table at Tacos and Beer is ready. We will hold it for 10 minutes.`;
  return `sms:${String(w.phone || '').replace(/[^0-9+]/g,'')}&body=${encodeURIComponent(texto)}`;
}

const MIGRA = { esperando:'waiting', avisado:'texted', sentado:'seated',
                cancelado:'left', nuevo:'new', cotizado:'quoted',
                confirmado:'confirmed', descartado:'dropped' };
const read = () => {
  let d;
  try { d = JSON.parse(localStorage.getItem(STORE)) || { wait:[], party:[] }; }
  catch { return { wait:[], party:[] }; }
  for (const k of ['wait','party'])
    (d[k] || []).forEach(r => { if (MIGRA[r.status]) r.status = MIGRA[r.status]; });
  return d;
};
const write = d => { try { localStorage.setItem(STORE, JSON.stringify(d)); } catch {} };

let filter = 'all';
let toastT;
function toast(m){ const t = $('#toast'); t.textContent = m; t.classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 4200); }

const ago = iso => {
  const m = Math.round((Date.now() - new Date(iso)) / 60000);
  return m < 1 ? 'just now' : m < 60 ? `${m} min ago` : `${Math.round(m/60)} h ago`;
};
const where = id => (LOCATIONS[id] || {}).name || id;

function act(kind, id, status){
  const d = read();
  const r = d[kind].find(x => x.id === id);
  if (!r) return;
  r.status = status;
  write(d); render();
  if (status === 'texted')    toast(`Opening your messages to ${r.name}. The text is already written.`);
  if (status === 'seated')    toast(`${r.name} seated. Off the list.`);
  if (status === 'quoted')    toast(`Quote sent to ${r.name} for ${money(r.total)}.`);
  if (status === 'confirmed') toast(`${r.name} confirmed for ${r.date}. Added to the restaurant calendar.`);
}

function render(){
  const d = read();
  const fw = d.wait.filter(w  => filter === 'all' || w.loc === filter);
  const fp = d.party.filter(p => filter === 'all' || p.loc === filter);
  const activeWait  = fw.filter(w => w.status === 'waiting' || w.status === 'texted');
  const liveParty   = fp.filter(p => p.status !== 'dropped');

  $('#kWait').textContent   = activeWait.length;
  $('#kParty').textContent  = liveParty.length;
  $('#kValue').textContent  = money(liveParty.reduce((s,p) => s + p.total, 0));
  $('#kCovers').textContent = liveParty.reduce((s,p) => s + p.guests, 0)
                            + activeWait.reduce((s,w) => s + w.size, 0);

  $('#waitList').innerHTML = activeWait.length ? activeWait.map(w => `
    <div class="it">
      <div class="main">
        <span class="nm">${w.name}</span>
        ${w.status === 'texted' ? '<span class="badge" style="color:var(--amarillo);margin-inline-start:.4rem">Texted</span>' : ''}
        <div class="meta">${w.size} people · ${where(w.loc)} · ${ago(w.at)}${w.pref ? ' · ' + w.pref : ''}<br>${w.phone}</div>
      </div>
      <div style="display:flex;gap:.4rem;flex-wrap:wrap">
        ${w.status === 'waiting' ? `<a class="mini go" href="${smsLink(w)}" onclick="act('wait','${w.id}','texted')">Text them</a>` : ''}
        <button class="mini" onclick="act('wait','${w.id}','seated')">Seated</button>
        <button class="mini" onclick="act('wait','${w.id}','left')">Left</button>
      </div>
    </div>`).join('') : '<p class="empty">Nobody waiting. Open the public site and join the list to try it.</p>';

  $('#partyList').innerHTML = liveParty.length ? liveParty.map(p => `
    <div class="it">
      <div class="main">
        <span class="nm">${p.name}</span>
        <span class="badge" style="color:${p.status === 'confirmed' ? 'var(--verde)' : p.status === 'quoted' ? 'var(--amarillo)' : 'var(--rojo)'};margin-inline-start:.4rem">${p.status}</span>
        <div class="meta">${p.guests} people · ${p.pkg} · ${p.occasion || 'no occasion given'}<br>
        ${p.date} at ${p.time} · ${where(p.loc)} · ${p.phone}${p.notes ? '<br><em>“' + p.notes + '”</em>' : ''}</div>
      </div>
      <div style="text-align:end">
        <div class="amt">${money(p.total)}</div>
        <div style="display:flex;gap:.4rem;margin-top:.5rem;flex-wrap:wrap;justify-content:end">
          ${p.status === 'new'    ? `<button class="mini go" onclick="act('party','${p.id}','quoted')">Send quote</button>` : ''}
          ${p.status === 'quoted' ? `<button class="mini go" onclick="act('party','${p.id}','confirmed')">Confirm</button>` : ''}
          <button class="mini" onclick="act('party','${p.id}','dropped')">Drop</button>
        </div>
      </div>
    </div>`).join('') : '<p class="empty">No party requests yet. Fill out the party planner on the public site.</p>';
}

/* calculadora de comisiones */
function calc(){
  const n = +$('#ordVol').value, t = +$('#ordTick').value;
  const year = n * 52 * t;
  const comm = year * 0.25;
  const direct = year * 0.033 + n * 52 * 0.30;
  const saved = (comm - direct) * 0.5;
  $('#ordOut').textContent  = n;
  $('#tickOut').textContent = t;
  $('#cComm').textContent   = money(comm);
  $('#cSave').textContent   = money(saved);
  $('#cMonth').textContent  = money(saved / 12);
}
$('#ordVol').addEventListener('input', calc);
$('#ordTick').addEventListener('input', calc);

$$('.locpick button').forEach(b => b.onclick = () => {
  filter = b.dataset.loc;
  $$('.locpick button').forEach(x => x.setAttribute('aria-pressed', x === b));
  render();
});

window.act = act;

/* Turno de ejemplo. Un panel vacío no demuestra nada: en la reunión hay que
   ver la fila llena y el dinero en pantalla desde el primer segundo. */
function seed(){
  const now = Date.now(), min = 60000;
  const d = { wait: [
    { id:'s1', at:new Date(now-4*min).toISOString(),  status:'waiting', loc:'nola',
      name:'Danielle Boudreaux', phone:'(504) 555-0182', size:4, pref:'Patio' },
    { id:'s2', at:new Date(now-11*min).toISOString(), status:'texted',  loc:'nola',
      name:'Marcus Trahan',      phone:'(504) 555-0143', size:2, pref:'At the bar' },
    { id:'s3', at:new Date(now-19*min).toISOString(), status:'waiting', loc:'slidell',
      name:'The Nguyen party',   phone:'(985) 555-0117', size:6, pref:'Inside' },
    { id:'s4', at:new Date(now-26*min).toISOString(), status:'waiting', loc:'hammond',
      name:'Ashley Landry',      phone:'(985) 555-0166', size:3, pref:'Near the screens' }
  ], party: [
    { id:'p1', at:new Date(now-52*min).toISOString(), status:'new', loc:'nola',
      name:'Rebecca Fontenot', phone:'(504) 555-0198', date:'2026-09-12', time:'19:00',
      guests:28, pkg:'La Fiesta', per:26, total:728, occasion:'Rehearsal dinner',
      notes:'Four vegetarians. We are bringing our own cake.' },
    { id:'p2', at:new Date(now-3*60*min).toISOString(), status:'quoted', loc:'hammond',
      name:'SLU Delta Chi', phone:'(985) 555-0134', date:'2026-11-14', time:'18:30',
      guests:45, pkg:'Fiesta + Open Bar', per:38, total:1710, occasion:'Graduation',
      notes:'Family weekend. We need the whole back area.' },
    { id:'p3', at:new Date(now-26*60*min).toISOString(), status:'confirmed', loc:'slidell',
      name:'Guidry family', phone:'(985) 555-0175', date:'2026-08-30', time:'17:00',
      guests:16, pkg:'Taco Bar', per:18, total:288, occasion:'Birthday',
      notes:'Grandma turns 80. Two high chairs please.' }
  ]};
  write(d); render();
  toast('Sample shift loaded. Four parties waiting and $2,726 in open quotes.');
}
$('#seed').addEventListener('click', seed);
$('#clear').addEventListener('click', () => {
  write({ wait:[], party:[] }); render(); toast('Cleared.');
});

// Si nunca se ha usado, arranca con el turno de ejemplo puesto.
const boot = read();
if (!boot.wait.length && !boot.party.length) seed(); else render();
calc();
addEventListener('storage', render);
