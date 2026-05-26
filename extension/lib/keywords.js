const KEYWORD_STORAGE_KEY = "keywordBlacklist";

function normalizeKeyword(input) {
  if (!input || typeof input !== "string") {
    return null;
  }

  const value = input.trim().replace(/\s+/g, " ").toLowerCase();
  if (!value || value.length < 2) {
    return null;
  }
  return value;
}

function dedupeKeywords(keywords) {
  return [...new Set(keywords.filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Verifica se a palavra-chave aparece no texto da página.
 * Frases com espaço: correspondência por substring.
 * Palavra única: correspondência por limite de palavra (\b).
 */
function matchKeywordInText(keyword, pageText) {
  const normalized = normalizeKeyword(keyword);
  if (!normalized || !pageText) {
    return false;
  }

  const text = pageText.toLowerCase().replace(/\s+/g, " ");

  if (normalized.includes(" ")) {
    return text.includes(normalized);
  }

  const pattern = new RegExp(`\\b${escapeRegex(normalized)}\\b`, "i");
  return pattern.test(text);
}
