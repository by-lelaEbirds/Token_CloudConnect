// app.js - CloudConnect (Create + Read + Delete) using Airtable API
// Modern UI Version

/* -------------------- Helpers -------------------- */
const qs = sel => document.querySelector(sel);
const qsa = sel => Array.from(document.querySelectorAll(sel));
function ucFirst(text){ if(!text) return ''; return text.charAt(0).toUpperCase() + text.slice(1); }

/* -------------------- Credentials -------------------- */
function getCreds(){
  return {
    token: localStorage.getItem('airtable_token') || '',
    base: localStorage.getItem('airtable_base') || '',
    table: localStorage.getItem('airtable_table') || 'Clientes'
  };
}
function saveCreds(token, base, table){
  localStorage.setItem('airtable_token', token);
  localStorage.setItem('airtable_base', base);
  localStorage.setItem('airtable_table', table);
}

/* -------------------- UI -------------------- */
const statusEl = qs('#status');
const listaEl = qs('#lista');
function setStatus(text){ statusEl.textContent = text; }

/* -------------------- Airtable calls -------------------- */
async function airtableFetchRecords(){
  const { token, base, table } = getCreds();
  if(!token || !base || !table){ throw { type:'NO_CREDENTIALS' }; }
  const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;
  const res = await fetch(url, { headers: { Authorization:`Bearer ${token}` } });
  if(!res.ok){ const j = await res.json().catch(()=>({})); throw { type:'API_ERROR', status: res.status, body: j }; }
  const json = await res.json();
  return json.records.map(r => ({ id: r.id, fields: r.fields }));
}

async function airtableCreateRecord({ nome, telefone, email }){
  const { token, base, table } = getCreds();
  const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`;
  const body = { fields: { nome: String(nome).toLowerCase(), telefone, email } };
  const res = await fetch(url, {
    method: 'POST', headers: { Authorization:`Bearer ${token}`, 'Content-Type':'application/json' }, body: JSON.stringify(body)
  });
  if(!res.ok){ const j = await res.json().catch(()=>({})); throw { type:'API_ERROR', status: res.status, body: j }; }
  return await res.json();
}

async function airtableDeleteRecord(id){
  const { token, base, table } = getCreds();
  const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}/${id}`;
  const res = await fetch(url, { method:'DELETE', headers: { Authorization:`Bearer ${token}` } });
  if(!res.ok){ const j = await res.json().catch(()=>({})); throw { type:'API_ERROR', status: res.status, body: j }; }
  return await res.json();
}

/* -------------------- Render -------------------- */
async function renderAll(filter = '') {
  listaEl.innerHTML = '';
  setStatus('');
  
  listaEl.innerHTML = Array(3).fill('').map(renderSkeletonItem).join('\n');

  try {
    const records = await airtableFetchRecords();
    listaEl.innerHTML = '';
    if (records.length === 0) { setStatus('Nenhum cliente cadastrado ainda.'); return; }
    
    const filtered = records.filter(r => String(r.fields.nome || '').toLowerCase().includes(filter.toLowerCase()));
    if (filtered.length === 0) { setStatus('Nenhum cliente encontrado com esse nome.'); return; }
    
    setStatus('');
    listaEl.innerHTML = filtered.map(r => renderItem(r)).join('\n');

    // Staggered animation
    qsa('#lista li').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.07}s`;
    });
    
    qsa('.btn-delete').forEach(btn => btn.addEventListener('click', async (e) => {
      const id = e.currentTarget.dataset.id; 
      if (!confirm('Excluir este cliente?')) return;
      try { setStatus('Excluindo...'); await airtableDeleteRecord(id); await refresh(); } catch(err) { handleError(err); }
    }));
  } catch(err) {
    listaEl.innerHTML = '';
    handleError(err);
  }
}

function renderItem(r){
  const nome = ucFirst(String(r.fields.nome || ''));
  const telefone = r.fields.telefone || '';
  const email = r.fields.email || '';
  return `
  <li data-id="${r.id}">
    <div class="info">
      <div class="name">${nome}</div>
      <div class="meta">${telefone} &middot; ${email}</div>
    </div>
    <div class="controls">
      <button class="btn ghost btn-delete" data-id="${r.id}" title="Excluir">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  </li>`;
}

function renderSkeletonItem(){
  return `
  <li class="skeleton">
    <div class="info">
      <div class="name"></div>
      <div class="meta"></div>
    </div>
  </li>`;
}

/* -------------------- Helpers & lifecycle -------------------- */
async function refresh(filter=''){ try{ await renderAll(filter); }catch(e){ console.error(e); } }

function handleError(err){
  console.error('Erro:', err);
  if(err && err.type === 'NO_CREDENTIALS'){ setStatus('Configure suas credenciais do Airtable no botão ⚙️.'); return; }
  if(err && err.type === 'API_ERROR'){
    const msg = err.body && err.body.error ? (err.body.error.message || JSON.stringify(err.body)) : JSON.stringify(err.body || err);
    setStatus(`Erro da API (${err.status}): ${msg}`);
    return;
  }
  setStatus('Ocorreu um erro. Veja o console para detalhes.');
}

/* -------------------- Wiring UI -------------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  const form = qs('#formCliente'); const busca = qs('#busca'); const btnCred = qs('#btnCred'); const modal = qs('#modal'); const saveCred = qs('#saveCred'); const closeModal = qs('#closeModal'); const tokenInput = qs('#tokenInput'); const baseInput = qs('#baseInput'); const tableInput = qs('#tableInput'); const limparBtn = qs('#limparBtn'); const themeToggle = qs('#themeToggle');

  const creds = getCreds();
  tokenInput.value = creds.token;
  baseInput.value = creds.base;
  tableInput.value = creds.table;

  btnCred.addEventListener('click', ()=> modal.classList.remove('hidden'));
  closeModal.addEventListener('click', ()=> modal.classList.add('hidden'));

  saveCred.addEventListener('click', ()=>{
    saveCreds(tokenInput.value.trim(), baseInput.value.trim(), tableInput.value.trim() || 'Clientes');
    modal.classList.add('hidden');
    setStatus('Credenciais salvas. Carregando...');
    refresh();
  });

  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const nome = qs('#nome').value.trim();
    const telefone = qs('#telefone').value.trim();
    const email = qs('#email').value.trim();
    if(!nome || !telefone || !email){ alert('Preencha todos os campos'); return; }
    try {
      setStatus('Enviando...');
      await airtableCreateRecord({nome, telefone, email});
      form.reset();
      qs('#nome').focus();
      await refresh();
    } catch(err) {
      handleError(err);
    }
  });

  limparBtn.addEventListener('click', ()=> form.reset());

  let searchTimeout;
  busca.addEventListener('input', (e)=> {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
          refresh(e.target.value);
      }, 300); // Debounce para evitar buscas a cada tecla digitada
  });

  themeToggle.addEventListener('click', ()=>{
    document.documentElement.classList.toggle('dark');
  });

  refresh();
});
