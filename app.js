// app.js - CloudConnect (CRUD Completo) usando Airtable API
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

// NOVO: Função para atualizar um registro (PATCH)
async function airtableUpdateRecord(id, fieldsToUpdate) {
    const { token, base, table } = getCreds();
    const url = `https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}/${id}`;
    const body = { fields: fieldsToUpdate };
    const res = await fetch(url, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });
    if (!res.ok) { const j = await res.json().catch(() => ({})); throw { type: 'API_ERROR', status: res.status, body: j }; }
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

    qsa('#lista li').forEach((item, index) => {
        item.style.animationDelay = `${index * 0.07}s`;
    });
    
    // Anexar listeners para os botões de AÇÃO (Editar e Excluir)
    attachActionListeners();

  } catch(err) {
    listaEl.innerHTML = '';
    handleError(err);
  }
}

function renderItem(r){
  const nome = ucFirst(String(r.fields.nome || ''));
  const telefone = r.fields.telefone || '';
  const email = r.fields.email || '';
  // Guarda os dados originais no elemento para fácil acesso
  return `
  <li data-id="${r.id}" data-nome="${nome}" data-telefone="${telefone}" data-email="${email}">
    <div class="info">
      <div class="name">${nome}</div>
      <div class="meta">${telefone} &middot; ${email}</div>
    </div>
    <div class="controls">
      <button class="btn ghost btn-edit" title="Editar">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
      </button>
      <button class="btn ghost btn-delete" title="Excluir">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
      </button>
    </div>
  </li>`;
}

function renderSkeletonItem(){
  return `
  <li class="skeleton">
    <div class="info"><div class="name"></div><div class="meta"></div></div>
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

function attachActionListeners() {
    qsa('.btn-delete').forEach(btn => btn.addEventListener('click', async (e) => {
        const item = e.currentTarget.closest('li');
        const id = item.dataset.id;
        if (!confirm(`Excluir o cliente "${item.dataset.nome}"?`)) return;
        try { setStatus('Excluindo...'); await airtableDeleteRecord(id); await refresh(); } catch(err) { handleError(err); }
    }));

    qsa('.btn-edit').forEach(btn => btn.addEventListener('click', (e) => {
        const item = e.currentTarget.closest('li');
        openEditModal(item.dataset);
    }));
}

/* -------------------- Wiring UI -------------------- */
document.addEventListener('DOMContentLoaded', ()=>{
  // Seletores
  const form = qs('#formCliente');
  const busca = qs('#busca');
  const btnCred = qs('#btnCred');
  const modal = qs('#modal');
  const saveCred = qs('#saveCred');
  const closeModal = qs('#closeModal');
  const tokenInput = qs('#tokenInput');
  const baseInput = qs('#baseInput');
  const tableInput = qs('#tableInput');
  const limparBtn = qs('#limparBtn');
  const themeToggle = qs('#themeToggle');
  
  // Seletores do NOVO Modal de Edição
  const editModal = qs('#editModal');
  const closeEditModalBtn = qs('#closeEditModal');
  const saveEditBtn = qs('#saveEdit');
  const editIdInput = qs('#editId');
  const editNomeInput = qs('#editNome');
  const editTelefoneInput = qs('#editTelefone');
  const editEmailInput = qs('#editEmail');

  // Lógica de Credenciais
  const creds = getCreds();
  tokenInput.value = creds.token; baseInput.value = creds.base; tableInput.value = creds.table;
  btnCred.addEventListener('click', ()=> modal.classList.remove('hidden'));
  closeModal.addEventListener('click', ()=> modal.classList.add('hidden'));
  saveCred.addEventListener('click', ()=>{
    saveCreds(tokenInput.value.trim(), baseInput.value.trim(), tableInput.value.trim() || 'Clientes');
    modal.classList.add('hidden');
    setStatus('Credenciais salvas. Carregando...');
    refresh();
  });

  // Lógica do Formulário Principal
  form.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const nome = qs('#nome').value.trim(); const telefone = qs('#telefone').value.trim(); const email = qs('#email').value.trim();
    if(!nome || !telefone || !email){ alert('Preencha todos os campos'); return; }
    try {
      setStatus('Enviando...'); await airtableCreateRecord({nome, telefone, email});
      form.reset(); qs('#nome').focus(); await refresh();
    } catch(err) { handleError(err); }
  });
  limparBtn.addEventListener('click', ()=> form.reset());

  // Lógica de Busca
  let searchTimeout;
  busca.addEventListener('input', (e)=> {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => { refresh(e.target.value); }, 300);
  });

  // Lógica do Tema
  themeToggle.addEventListener('click', ()=>{ document.documentElement.classList.toggle('dark'); });
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark');
  }

  // ---- LÓGICA DE EDIÇÃO ----
  window.openEditModal = (cliente) => {
    editIdInput.value = cliente.id;
    editNomeInput.value = cliente.nome;
    editTelefoneInput.value = cliente.telefone;
    editEmailInput.value = cliente.email;
    editModal.classList.remove('hidden');
  };

  closeEditModalBtn.addEventListener('click', () => editModal.classList.add('hidden'));

  saveEditBtn.addEventListener('click', async () => {
    const id = editIdInput.value;
    const updatedFields = {
        nome: editNomeInput.value.trim().toLowerCase(),
        telefone: editTelefoneInput.value.trim(),
        email: editEmailInput.value.trim()
    };

    if (!updatedFields.nome || !updatedFields.telefone || !updatedFields.email) {
        alert('Todos os campos devem ser preenchidos.');
        return;
    }

    try {
        saveEditBtn.textContent = 'Salvando...';
        saveEditBtn.disabled = true;
        await airtableUpdateRecord(id, updatedFields);
        editModal.classList.add('hidden');
        await refresh();
    } catch(err) {
        handleError(err);
        alert('Falha ao salvar. Verifique o console para mais detalhes.');
    } finally {
        saveEditBtn.textContent = 'Salvar Alterações';
        saveEditBtn.disabled = false;
    }
  });

  // Renderização Inicial
  refresh();
});
