(function registerPasswordGenerator() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Gerador de Senhas"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Gerador de Senhas": renderPasswordPanel
  };

  const charsets = {
    lower: "abcdefghijklmnopqrstuvwxyz",
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    numbers: "0123456789",
    symbols: "!@#$%&*?_-+=."
  };

  const ambiguous = "0O1Il|`'\"{}[]()/\\";

  const modeDefaults = {
    strong: { length: 16, lower: true, upper: true, numbers: true, symbols: true, excludeAmbiguous: true },
    easy: { length: 14, lower: true, upper: true, numbers: true, symbols: false, excludeAmbiguous: true },
    numeric: { length: 6, lower: false, upper: false, numbers: true, symbols: false, excludeAmbiguous: false },
    custom: { length: 12, lower: true, upper: true, numbers: true, symbols: false, excludeAmbiguous: true }
  };

  function renderPasswordPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Gere senhas fortes, fáceis, numéricas ou personalizadas em poucos cliques.</p>

      <form class="tool-form" id="password-form" novalidate>
        <label for="password-mode">
          Tipo de senha
          <select class="tool-input" id="password-mode">
            <option value="strong">Forte</option>
            <option value="easy">Fácil</option>
            <option value="numeric">Apenas números</option>
            <option value="custom">Personalizada</option>
          </select>
        </label>

        <div class="unit-row">
          <label for="password-length">
            Tamanho
            <input class="tool-input" id="password-length" type="number" min="4" max="128" step="1" value="16">
          </label>

          <span></span>

          <label for="password-quantity">
            Quantidade
            <input class="tool-input" id="password-quantity" type="number" min="1" max="20" step="1" value="5">
          </label>
        </div>

        <div class="password-options" id="password-options">
          <label class="checkbox-row" for="password-lower">
            <input id="password-lower" type="checkbox" checked>
            Letras minúsculas
          </label>

          <label class="checkbox-row" for="password-upper">
            <input id="password-upper" type="checkbox" checked>
            Letras maiúsculas
          </label>

          <label class="checkbox-row" for="password-numbers">
            <input id="password-numbers" type="checkbox" checked>
            Números
          </label>

          <label class="checkbox-row" for="password-symbols">
            <input id="password-symbols" type="checkbox" checked>
            Símbolos
          </label>

          <label class="checkbox-row" for="password-ambiguous">
            <input id="password-ambiguous" type="checkbox" checked>
            Evitar caracteres confusos
          </label>
        </div>

        <div class="split-actions">
          <button class="primary-action" type="submit">Gerar senhas</button>
          <button class="secondary-action" id="copy-passwords" type="button" disabled>Copiar</button>
        </div>

        <p class="tool-message" id="password-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="password-strength" hidden>
        <span>Força estimada</span>
        <strong id="password-strength-label">-</strong>
      </div>

      <div class="password-list" id="password-list" hidden></div>

      <p class="tool-note">As senhas são geradas localmente no navegador. Para contas importantes, prefira senhas longas e únicas.</p>
    `);

    setupPasswordGenerator(setToolMessage);
  }

  function setupPasswordGenerator(setToolMessage) {
    const form = document.querySelector("#password-form");
    const mode = document.querySelector("#password-mode");
    const length = document.querySelector("#password-length");
    const quantity = document.querySelector("#password-quantity");
    const lower = document.querySelector("#password-lower");
    const upper = document.querySelector("#password-upper");
    const numbers = document.querySelector("#password-numbers");
    const symbols = document.querySelector("#password-symbols");
    const excludeAmbiguous = document.querySelector("#password-ambiguous");
    const options = document.querySelector("#password-options");
    const copyButton = document.querySelector("#copy-passwords");
    const message = document.querySelector("#password-message");
    const strength = document.querySelector("#password-strength");
    const strengthLabel = document.querySelector("#password-strength-label");
    const list = document.querySelector("#password-list");
    let currentPasswords = [];

    mode.addEventListener("change", () => {
      applyModeDefaults();
      setToolMessage(message, "Configuração atualizada.");
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const config = getConfig();
      const pool = buildPool(config);

      if (!pool) {
        setToolMessage(message, "Selecione pelo menos um tipo de caractere.", true);
        return;
      }

      currentPasswords = Array.from({ length: config.quantity }, () => generatePassword(config, pool));
      renderPasswords(currentPasswords);
      renderStrength(config, pool);
      copyButton.disabled = false;
      setToolMessage(message, `${currentPasswords.length} senha${currentPasswords.length > 1 ? "s" : ""} gerada${currentPasswords.length > 1 ? "s" : ""}.`);
    });

    copyButton.addEventListener("click", async () => {
      if (currentPasswords.length === 0) return;

      try {
        await navigator.clipboard.writeText(currentPasswords.join("\n"));
        setToolMessage(message, "Senhas copiadas.");
      } catch {
        setToolMessage(message, "Senhas prontas para copiar manualmente.");
      }
    });

    [length, quantity, lower, upper, numbers, symbols, excludeAmbiguous].forEach((field) => {
      field.addEventListener("input", () => {
        copyButton.disabled = true;
        list.hidden = true;
        strength.hidden = true;
      });
    });

    applyModeDefaults();
    setToolMessage(message, "Escolha o tipo e gere as senhas.");

    function applyModeDefaults() {
      const defaults = modeDefaults[mode.value];
      length.value = defaults.length;
      lower.checked = defaults.lower;
      upper.checked = defaults.upper;
      numbers.checked = defaults.numbers;
      symbols.checked = defaults.symbols;
      excludeAmbiguous.checked = defaults.excludeAmbiguous;
      options.hidden = mode.value !== "custom";
      copyButton.disabled = true;
      list.hidden = true;
      strength.hidden = true;
      currentPasswords = [];
    }

    function getConfig() {
      return {
        mode: mode.value,
        length: clamp(Math.floor(Number(length.value) || 12), 4, 128),
        quantity: clamp(Math.floor(Number(quantity.value) || 1), 1, 20),
        lower: lower.checked,
        upper: upper.checked,
        numbers: numbers.checked,
        symbols: symbols.checked,
        excludeAmbiguous: excludeAmbiguous.checked
      };
    }

    function renderPasswords(passwords) {
      list.hidden = false;
      list.innerHTML = passwords
        .map((password, index) => `
          <div class="password-item">
            <code>${escapeHtml(password)}</code>
            <button class="secondary-action" type="button" data-copy-password="${index}">Copiar</button>
          </div>
        `)
        .join("");

      list.querySelectorAll("[data-copy-password]").forEach((button) => {
        button.addEventListener("click", async () => {
          const password = currentPasswords[Number(button.dataset.copyPassword)];
          try {
            await navigator.clipboard.writeText(password);
            setToolMessage(message, "Senha copiada.");
          } catch {
            setToolMessage(message, "Senha pronta para copiar manualmente.");
          }
        });
      });
    }

    function renderStrength(config, pool) {
      const entropy = Math.log2(pool.length) * config.length;
      const label = entropy >= 90 ? "Muito forte" : entropy >= 70 ? "Forte" : entropy >= 45 ? "Boa" : "Fraca";
      strength.hidden = false;
      strengthLabel.textContent = `${label} · ${Math.round(entropy)} bits`;
    }
  }

  function buildPool(config) {
    let pool = "";
    if (config.lower) pool += charsets.lower;
    if (config.upper) pool += charsets.upper;
    if (config.numbers) pool += charsets.numbers;
    if (config.symbols) pool += charsets.symbols;

    if (config.excludeAmbiguous) {
      pool = [...pool].filter((char) => !ambiguous.includes(char)).join("");
    }

    return pool;
  }

  function generatePassword(config, pool) {
    const required = [];
    if (config.lower) required.push(pickOne(filterCharset(charsets.lower, config.excludeAmbiguous)));
    if (config.upper) required.push(pickOne(filterCharset(charsets.upper, config.excludeAmbiguous)));
    if (config.numbers) required.push(pickOne(filterCharset(charsets.numbers, config.excludeAmbiguous)));
    if (config.symbols) required.push(pickOne(filterCharset(charsets.symbols, config.excludeAmbiguous)));

    const password = [...required.slice(0, config.length)];
    while (password.length < config.length) {
      password.push(pickOne(pool));
    }

    return shuffle(password).join("");
  }

  function filterCharset(value, shouldExclude) {
    if (!shouldExclude) return value;
    return [...value].filter((char) => !ambiguous.includes(char)).join("");
  }

  function pickOne(value) {
    return value[getSecureIndex(value.length)];
  }

  function shuffle(items) {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index--) {
      const swapIndex = getSecureIndex(index + 1);
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }

  function getSecureIndex(max) {
    const random = new Uint32Array(1);
    crypto.getRandomValues(random);
    return random[0] % max;
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function escapeHtml(value) {
    return value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
})();
