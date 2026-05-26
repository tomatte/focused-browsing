const form = document.getElementById("add-form");
const input = document.getElementById("domain-input");
const listEl = document.getElementById("domain-list");
const emptyEl = document.getElementById("empty-state");
const statusEl = document.getElementById("status");
const clearBtn = document.getElementById("clear-btn");

function setStatus(message, type = "") {
  statusEl.textContent = message;
  statusEl.className = "status" + (type ? ` ${type}` : "");
}

function sendMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      const err = chrome.runtime.lastError;
      if (err) {
        reject(new Error(err.message));
        return;
      }
      resolve(response);
    });
  });
}

function renderList(domains) {
  listEl.innerHTML = "";
  emptyEl.classList.toggle("hidden", domains.length > 0);

  for (const domain of domains) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = domain;
    label.title = domain;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remover";
    removeBtn.addEventListener("click", () => removeDomain(domain));

    li.append(label, removeBtn);
    listEl.appendChild(li);
  }
}

async function loadBlacklist() {
  const response = await sendMessage({ type: "GET_BLACKLIST" });
  if (!response?.ok) {
    setStatus(response?.error || "Erro ao carregar blacklist.", "error");
    return;
  }
  renderList(response.domains);
}

async function addDomain(raw) {
  const preview = normalizeDomain(raw);
  if (!preview) {
    setStatus("Informe um domínio válido (ex.: exemplo.com).", "error");
    return;
  }

  const response = await sendMessage({ type: "ADD_DOMAIN", domain: raw });
  if (!response?.ok) {
    setStatus(response?.error || "Não foi possível adicionar.", "error");
    return;
  }

  input.value = "";
  renderList(response.domains);
  setStatus(`${preview} adicionado à blacklist.`, "success");
}

async function removeDomain(domain) {
  const response = await sendMessage({ type: "REMOVE_DOMAIN", domain });
  if (!response?.ok) {
    setStatus(response?.error || "Não foi possível remover.", "error");
    return;
  }
  renderList(response.domains);
  setStatus(`${domain} removido.`, "success");
}

async function clearAll() {
  if (!confirm("Remover todos os domínios da blacklist?")) {
    return;
  }
  const response = await sendMessage({ type: "CLEAR_BLACKLIST" });
  if (!response?.ok) {
    setStatus(response?.error || "Não foi possível limpar.", "error");
    return;
  }
  renderList(response.domains);
  setStatus("Blacklist limpa.", "success");
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  addDomain(input.value);
});

clearBtn.addEventListener("click", clearAll);

loadBlacklist().catch((err) => setStatus(err.message, "error"));
