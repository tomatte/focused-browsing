const statusEl = document.getElementById("status");
const tabButtons = document.querySelectorAll(".tab");
const panels = document.querySelectorAll(".panel");

const domainForm = document.getElementById("add-domain-form");
const domainInput = document.getElementById("domain-input");
const domainListEl = document.getElementById("domain-list");
const domainEmptyEl = document.getElementById("domain-empty");
const clearDomainsBtn = document.getElementById("clear-domains-btn");

const keywordForm = document.getElementById("add-keyword-form");
const keywordInput = document.getElementById("keyword-input");
const keywordListEl = document.getElementById("keyword-list");
const keywordEmptyEl = document.getElementById("keyword-empty");
const clearKeywordsBtn = document.getElementById("clear-keywords-btn");

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

function renderItemList(listEl, emptyEl, items, onRemove) {
  listEl.innerHTML = "";
  emptyEl.classList.toggle("hidden", items.length > 0);

  for (const item of items) {
    const li = document.createElement("li");

    const label = document.createElement("span");
    label.textContent = item;
    label.title = item;

    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remover";
    removeBtn.addEventListener("click", () => onRemove(item));

    li.append(label, removeBtn);
    listEl.appendChild(li);
  }
}

function switchTab(name) {
  tabButtons.forEach((btn) => {
    const active = btn.dataset.tab === name;
    btn.classList.toggle("active", active);
    btn.setAttribute("aria-selected", String(active));
  });

  panels.forEach((panel) => {
    const active = panel.id === `panel-${name}`;
    panel.classList.toggle("active", active);
    panel.hidden = !active;
  });

  setStatus("");
}

tabButtons.forEach((btn) => {
  btn.addEventListener("click", () => switchTab(btn.dataset.tab));
});

async function loadDomains() {
  const response = await sendMessage({ type: "GET_BLACKLIST" });
  if (!response?.ok) {
    setStatus(response?.error || "Erro ao carregar domínios.", "error");
    return;
  }
  renderItemList(domainListEl, domainEmptyEl, response.domains, removeDomain);
}

async function loadKeywords() {
  const response = await sendMessage({ type: "GET_KEYWORDS" });
  if (!response?.ok) {
    setStatus(response?.error || "Erro ao carregar palavras-chave.", "error");
    return;
  }
  renderItemList(keywordListEl, keywordEmptyEl, response.keywords, removeKeyword);
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

  domainInput.value = "";
  renderItemList(domainListEl, domainEmptyEl, response.domains, removeDomain);
  setStatus(`${preview} adicionado à blacklist de domínios.`, "success");
}

async function removeDomain(domain) {
  const response = await sendMessage({ type: "REMOVE_DOMAIN", domain });
  if (!response?.ok) {
    setStatus(response?.error || "Não foi possível remover.", "error");
    return;
  }
  renderItemList(domainListEl, domainEmptyEl, response.domains, removeDomain);
  setStatus(`${domain} removido.`, "success");
}

async function clearDomains() {
  if (!confirm("Remover todos os domínios da blacklist?")) {
    return;
  }
  const response = await sendMessage({ type: "CLEAR_BLACKLIST" });
  if (!response?.ok) {
    setStatus(response?.error || "Não foi possível limpar.", "error");
    return;
  }
  renderItemList(domainListEl, domainEmptyEl, response.domains, removeDomain);
  setStatus("Blacklist de domínios limpa.", "success");
}

async function addKeyword(raw) {
  const preview = normalizeKeyword(raw);
  if (!preview) {
    setStatus("Informe uma palavra-chave válida (mínimo 2 caracteres).", "error");
    return;
  }

  const response = await sendMessage({ type: "ADD_KEYWORD", keyword: raw });
  if (!response?.ok) {
    setStatus(response?.error || "Não foi possível adicionar.", "error");
    return;
  }

  keywordInput.value = "";
  renderItemList(keywordListEl, keywordEmptyEl, response.keywords, removeKeyword);
  setStatus(`"${preview}" adicionada à blacklist.`, "success");
}

async function removeKeyword(keyword) {
  const response = await sendMessage({ type: "REMOVE_KEYWORD", keyword });
  if (!response?.ok) {
    setStatus(response?.error || "Não foi possível remover.", "error");
    return;
  }
  renderItemList(keywordListEl, keywordEmptyEl, response.keywords, removeKeyword);
  setStatus(`"${keyword}" removida.`, "success");
}

async function clearKeywords() {
  if (!confirm("Remover todas as palavras-chave da blacklist?")) {
    return;
  }
  const response = await sendMessage({ type: "CLEAR_KEYWORDS" });
  if (!response?.ok) {
    setStatus(response?.error || "Não foi possível limpar.", "error");
    return;
  }
  renderItemList(keywordListEl, keywordEmptyEl, response.keywords, removeKeyword);
  setStatus("Blacklist de palavras-chave limpa.", "success");
}

domainForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addDomain(domainInput.value);
});

keywordForm.addEventListener("submit", (e) => {
  e.preventDefault();
  addKeyword(keywordInput.value);
});

clearDomainsBtn.addEventListener("click", clearDomains);
clearKeywordsBtn.addEventListener("click", clearKeywords);

Promise.all([loadDomains(), loadKeywords()]).catch((err) =>
  setStatus(err.message, "error")
);
