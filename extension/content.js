(function () {
  const OBSERVER_DEBOUNCE_MS = 400;
  let keywords = [];
  let blocked = false;
  let observer = null;
  let debounceTimer = null;

  function getPageText() {
    const root = document.body || document.documentElement;
    if (!root) {
      return "";
    }
    return (root.innerText || "").toLowerCase().replace(/\s+/g, " ");
  }

  function findMatch() {
    const text = getPageText();
    if (!text) {
      return null;
    }

    for (const keyword of keywords) {
      if (matchKeywordInText(keyword, text)) {
        return keyword;
      }
    }
    return null;
  }

  function blockPage(matchedKeyword) {
    if (blocked) {
      return;
    }
    blocked = true;

    if (observer) {
      observer.disconnect();
      observer = null;
    }

    const url =
      chrome.runtime.getURL("blocked.html") +
      "?reason=keyword" +
      "&term=" +
      encodeURIComponent(matchedKeyword);

    try {
      window.stop();
    } catch {
      /* ignorar em alguns contextos */
    }

    window.location.replace(url);
  }

  function scan() {
    if (blocked || keywords.length === 0) {
      return;
    }

    const match = findMatch();
    if (match) {
      blockPage(match);
    }
  }

  function scheduleScan() {
    if (blocked) {
      return;
    }
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(scan, OBSERVER_DEBOUNCE_MS);
  }

  function watchDynamicContent() {
    if (!document.body || observer) {
      return;
    }

    observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });
  }

  function applyKeywordList(list) {
    keywords = Array.isArray(list) ? list : [];
    if (keywords.length === 0) {
      if (observer) {
        observer.disconnect();
        observer = null;
      }
      return;
    }
    scan();
    watchDynamicContent();
  }

  chrome.storage.local.get(KEYWORD_STORAGE_KEY, (data) => {
    applyKeywordList(data[KEYWORD_STORAGE_KEY]);
  });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[KEYWORD_STORAGE_KEY]) {
      return;
    }
    applyKeywordList(changes[KEYWORD_STORAGE_KEY].newValue);
  });
})();
