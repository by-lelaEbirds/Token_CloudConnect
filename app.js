const tableBody = document.querySelector("#clientesTable tbody");
const statusDiv = document.getElementById("status");
const searchInput = document.getElementById("search");

function getCreds() {
  return {
    pat: localStorage.getItem("pat") || "",
    baseId: localStorage.getItem("baseId") || "",
    tableName: localStorage.getItem("tableName") || ""
  };
}

async function fetchClientes() {
  const { pat, baseId, tableName } = getCreds();
  if (!pat || !baseId || !tableName) {
    statusDiv.textContent = "⚠️ Configure as credenciais primeiro.";
    return;
  }
  statusDiv.textContent = "⏳ Carregando...";
  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      headers: { Authorization: `Bearer ${pat}` }
    });
    if (!res.ok) throw new Error("Erro ao buscar dados.");
    const data = await res.json();
    renderTable(data.records);
  } catch (err) {
    statusDiv.textContent = "❌ " + err.message;
  }
}

function renderTable(records) {
  tableBody.innerHTML = "";
  if (!records.length) {
    statusDiv.textContent = "Nenhum registro encontrado.";
    return;
  }
  statusDiv.textContent = "";
  records.forEach(rec => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${rec.fields.nome || ""}</td>
      <td>${rec.fields.email || ""}</td>
      <td>${rec.fields.telefone || ""}</td>
      <td class="actions">
        <button onclick="editCliente('${rec.id}', '${rec.fields.nome || ""}', '${rec.fields.email || ""}', '${rec.fields.telefone || ""}')">✎</button>
        <button onclick="deleteCliente('${rec.id}')">🗑</button>
      </td>`;
    tableBody.appendChild(tr);
  });
}

document.getElementById("createForm").addEventListener("submit", async e => {
  e.preventDefault();
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("email").value;
  const telefone = document.getElementById("telefone").value;
  const { pat, baseId, tableName } = getCreds();
  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: { nome, email, telefone } })
    });
    if (!res.ok) throw new Error("Erro ao criar registro.");
    fetchClientes();
    e.target.reset();
  } catch (err) {
    alert(err.message);
  }
});

async function deleteCliente(id) {
  const { pat, baseId, tableName } = getCreds();
  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${pat}` }
    });
    if (!res.ok) throw new Error("Erro ao excluir.");
    fetchClientes();
  } catch (err) {
    alert(err.message);
  }
}

async function editCliente(id, nome, email, telefone) {
  const newNome = prompt("Novo nome:", nome);
  const newEmail = prompt("Novo email:", email);
  const newTelefone = prompt("Novo telefone:", telefone);
  const { pat, baseId, tableName } = getCreds();
  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}/${id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${pat}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fields: { nome: newNome, email: newEmail, telefone: newTelefone } })
    });
    if (!res.ok) throw new Error("Erro ao editar.");
    fetchClientes();
  } catch (err) {
    alert(err.message);
  }
}

// Modal credenciais
const modal = document.getElementById("credModal");
document.getElementById("credBtn").onclick = () => modal.style.display = "block";
document.querySelector(".close").onclick = () => modal.style.display = "none";
document.getElementById("saveCreds").onclick = () => {
  localStorage.setItem("pat", document.getElementById("pat").value);
  localStorage.setItem("baseId", document.getElementById("baseId").value);
  localStorage.setItem("tableName", document.getElementById("tableName").value);
  modal.style.display = "none";
  fetchClientes();
};

searchInput.addEventListener("input", async () => {
  const term = searchInput.value.toLowerCase();
  const { pat, baseId, tableName } = getCreds();
  try {
    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${tableName}?filterByFormula=SEARCH('${term}', nome)`, {
      headers: { Authorization: `Bearer ${pat}` }
    });
    const data = await res.json();
    renderTable(data.records);
  } catch (err) {
    console.error(err);
  }
});

window.onload = fetchClientes;
