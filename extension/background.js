importScripts("lib/browser.js", "lib/domains.js", "lib/keywords.js");

const BLOCK_RULE_ID = 1;
const STORAGE_KEY = "blacklist";

async function getBlacklist() {
  const data = await ext.storage.get(STORAGE_KEY);
  const list = data[STORAGE_KEY];
  return Array.isArray(list) ? list : [];
}

async function saveBlacklist(domains) {
  const normalized = dedupeDomains(domains.map(normalizeDomain));
  await ext.storage.set({ [STORAGE_KEY]: normalized });
  await syncBlockingRules(normalized);
  return normalized;
}

async function getKeywordBlacklist() {
  const data = await ext.storage.get(KEYWORD_STORAGE_KEY);
  const list = data[KEYWORD_STORAGE_KEY];
  return Array.isArray(list) ? list : [];
}

async function saveKeywordBlacklist(keywords) {
  const normalized = dedupeKeywords(keywords.map(normalizeKeyword));
  await ext.storage.set({ [KEYWORD_STORAGE_KEY]: normalized });
  return normalized;
}

async function syncBlockingRules(domains) {
  const rules = [];

  if (domains.length > 0) {
    rules.push({
      id: BLOCK_RULE_ID,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          extensionPath: "/blocked.html",
        },
      },
      condition: {
        requestDomains: domains,
        resourceTypes: ["main_frame"],
      },
    });
  }

  await ext.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: [BLOCK_RULE_ID],
    addRules: rules,
  });
}

ext.runtime.onInstalled.addListener(async () => {
  const domains = await getBlacklist();
  await syncBlockingRules(domains);
});

if (ext.runtime.onStartup) {
  ext.runtime.onStartup.addListener(async () => {
    const domains = await getBlacklist();
    await syncBlockingRules(domains);
  });
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    try {
      if (message.type === "GET_BLACKLIST") {
        sendResponse({ ok: true, domains: await getBlacklist() });
        return;
      }

      if (message.type === "ADD_DOMAIN") {
        const domain = normalizeDomain(message.domain);
        if (!domain) {
          sendResponse({ ok: false, error: "Domínio inválido." });
          return;
        }
        const current = await getBlacklist();
        if (current.includes(domain)) {
          sendResponse({ ok: false, error: "Este domínio já está na blacklist." });
          return;
        }
        const updated = await saveBlacklist([...current, domain]);
        sendResponse({ ok: true, domains: updated });
        return;
      }

      if (message.type === "REMOVE_DOMAIN") {
        const domain = normalizeDomain(message.domain);
        const current = await getBlacklist();
        const updated = await saveBlacklist(current.filter((d) => d !== domain));
        sendResponse({ ok: true, domains: updated });
        return;
      }

      if (message.type === "CLEAR_BLACKLIST") {
        const updated = await saveBlacklist([]);
        sendResponse({ ok: true, domains: updated });
        return;
      }

      if (message.type === "GET_KEYWORDS") {
        sendResponse({ ok: true, keywords: await getKeywordBlacklist() });
        return;
      }

      if (message.type === "ADD_KEYWORD") {
        const keyword = normalizeKeyword(message.keyword);
        if (!keyword) {
          sendResponse({
            ok: false,
            error: "Palavra-chave inválida (mínimo 2 caracteres).",
          });
          return;
        }
        const current = await getKeywordBlacklist();
        if (current.includes(keyword)) {
          sendResponse({ ok: false, error: "Esta palavra-chave já está na lista." });
          return;
        }
        const updated = await saveKeywordBlacklist([...current, keyword]);
        sendResponse({ ok: true, keywords: updated });
        return;
      }

      if (message.type === "REMOVE_KEYWORD") {
        const keyword = normalizeKeyword(message.keyword);
        const current = await getKeywordBlacklist();
        const updated = await saveKeywordBlacklist(
          current.filter((k) => k !== keyword)
        );
        sendResponse({ ok: true, keywords: updated });
        return;
      }

      if (message.type === "CLEAR_KEYWORDS") {
        const updated = await saveKeywordBlacklist([]);
        sendResponse({ ok: true, keywords: updated });
        return;
      }

      sendResponse({ ok: false, error: "Ação desconhecida." });
    } catch (err) {
      sendResponse({ ok: false, error: err.message || String(err) });
    }
  })();

  return true;
});

getBlacklist()
  .then(syncBlockingRules)
  .catch((err) => console.error("[Focused Browsing]", err));
