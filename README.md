# Focused Browsing

Extensão de navegador (Chrome e Firefox) que bloqueia o acesso a sites cujo domínio está em uma **blacklist** gerenciada pelo próprio usuário.

## Funcionalidades

- Bloqueio automático de domínios na blacklist (inclui subdomínios)
- Popup para adicionar, remover e limpar domínios
- Página personalizada quando um site bloqueado é acessado
- Sincronização das regras ao instalar ou atualizar a extensão
- Compatível com **Manifest V3** no Chrome e no Firefox 113+

## Instalação (modo desenvolvedor)

### Google Chrome / Chromium / Edge

1. Abra `chrome://extensions` (ou equivalente).
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione a pasta `extension/` deste repositório.

### Mozilla Firefox

1. Abra `about:debugging#/runtime/this-firefox`.
2. Clique em **Carregar extensão temporária…**
3. Selecione o arquivo `extension/manifest.json`.

Para instalação permanente no Firefox, é necessário assinar a extensão na [Mozilla Add-ons](https://addons.mozilla.org/) ou usar Firefox Developer Edition / ESR com políticas corporativas.

## Uso

1. Clique no ícone da extensão na barra do navegador.
2. Digite um domínio (ex.: `twitter.com` ou `https://www.reddit.com`) e clique em **Adicionar**.
3. Ao tentar visitar esse site (ou qualquer subdomínio), você verá a página **Site bloqueado**.

## Estrutura do projeto

```
extension/
  manifest.json      # Manifest V3
  background.js      # Regras de bloqueio e persistência
  popup.html/js/css  # Interface de gerenciamento
  blocked.html       # Página exibida ao bloquear
  lib/               # Utilitários (API cross-browser, domínios)
  icons/             # Ícones da extensão
```

## Permissões

- `storage` — salvar a blacklist localmente
- `declarativeNetRequest` — aplicar regras de bloqueio/redirecionamento
- `<all_urls>` — necessário para interceptar navegação em qualquer site

## Licença

MIT (ajuste conforme necessário).
