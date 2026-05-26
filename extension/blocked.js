const messageEl = document.getElementById("message");
const detailEl = document.getElementById("detail");
const backBtn = document.getElementById("back-btn");

const params = new URLSearchParams(window.location.search);
const reason = params.get("reason");
const term = params.get("term");

if (reason === "keyword" && term) {
  messageEl.innerHTML =
    "Esta página foi bloqueada porque o conteúdo contém uma palavra-chave da sua blacklist do <strong>Focused Browsing</strong>.";
  detailEl.textContent = `Palavra-chave detectada: “${term}”`;
  detailEl.classList.remove("hidden");
} else if (reason === "domain") {
  messageEl.innerHTML =
    "O acesso a este site foi bloqueado porque o domínio está na sua blacklist do <strong>Focused Browsing</strong>.";
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host) {
        detailEl.textContent = host;
        detailEl.classList.remove("hidden");
      }
    }
  } catch {
    /* referrer indisponível */
  }
} else {
  try {
    if (document.referrer) {
      const host = new URL(document.referrer).hostname;
      if (host) {
        detailEl.textContent = host;
        detailEl.classList.remove("hidden");
      }
    }
  } catch {
    /* referrer indisponível */
  }
}

backBtn.addEventListener("click", () => {
  if (history.length > 1) {
    history.back();
  } else {
    window.close();
  }
});
