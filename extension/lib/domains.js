/**
 * Normaliza entradas do usuário para hostname (ex.: "https://www.foo.com/path" → "foo.com").
 */
function normalizeDomain(input) {
  if (!input || typeof input !== "string") {
    return null;
  }

  let value = input.trim().toLowerCase();
  if (!value) {
    return null;
  }

  if (!value.includes("://") && !value.startsWith("//")) {
    value = "https://" + value;
  }

  try {
    const hostname = new URL(value).hostname.replace(/\.$/, "");
    if (!hostname || hostname === "localhost" || !hostname.includes(".")) {
      if (hostname === "localhost") {
        return "localhost";
      }
      return null;
    }
    return hostname;
  } catch {
    const cleaned = value
      .replace(/^https?:\/\//, "")
      .replace(/^\/\//, "")
      .split("/")[0]
      .split("?")[0]
      .split("#")[0]
      .replace(/\.$/, "");

    if (!cleaned || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/i.test(cleaned)) {
      return null;
    }
    return cleaned.toLowerCase();
  }
}

function dedupeDomains(domains) {
  return [...new Set(domains.filter(Boolean))].sort();
}
