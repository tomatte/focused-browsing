const hint = document.getElementById("domain-hint");
const backBtn = document.getElementById("back-btn");

// Tenta exibir o domínio bloqueado a partir do referrer (quando disponível)
try {
  if (document.referrer) {
    const host = new URL(document.referrer).hostname;
    if (host) {
      hint.textContent = host;
      hint.classList.remove("hidden");
    }
  }
} catch {
  /* referrer indisponível ou inválido */
}

backBtn.addEventListener("click", () => {
  if (history.length > 1) {
    history.back();
  } else {
    window.close();
  }
});
