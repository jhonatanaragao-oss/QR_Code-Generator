(function registerTextCounters() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Contador de Caracteres",
    "Contador de Palavras"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Contador de Caracteres": renderCharacterCounterPanel,
    "Contador de Palavras": renderWordCounterPanel
  };

  function renderCharacterCounterPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Conte caracteres, linhas e espaços em tempo real.</p>

      <form class="tool-form" id="character-counter-form" novalidate>
        <label for="character-counter-text">
          Texto
          <textarea class="tool-textarea tall-textarea" id="character-counter-text" rows="9" placeholder="Digite ou cole seu texto aqui"></textarea>
        </label>

        <div class="split-actions">
          <button class="primary-action" id="copy-character-text" type="button" disabled>Copiar texto</button>
          <button class="secondary-action" id="clear-character-text" type="button">Limpar</button>
        </div>

        <p class="tool-message" id="character-counter-message" aria-live="polite"></p>
      </form>

      <div class="counter-grid" id="character-counter-results" aria-label="Resultado da contagem de caracteres"></div>
    `);

    setupCharacterCounter(setToolMessage);
  }

  function renderWordCounterPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Conte palavras, frases, parágrafos e estime o tempo de leitura.</p>

      <form class="tool-form" id="word-counter-form" novalidate>
        <label for="word-counter-text">
          Texto
          <textarea class="tool-textarea tall-textarea" id="word-counter-text" rows="9" placeholder="Digite ou cole seu texto aqui"></textarea>
        </label>

        <div class="split-actions">
          <button class="primary-action" id="copy-word-text" type="button" disabled>Copiar texto</button>
          <button class="secondary-action" id="clear-word-text" type="button">Limpar</button>
        </div>

        <p class="tool-message" id="word-counter-message" aria-live="polite"></p>
      </form>

      <div class="counter-grid" id="word-counter-results" aria-label="Resultado da contagem de palavras"></div>
    `);

    setupWordCounter(setToolMessage);
  }

  function setupCharacterCounter(setToolMessage) {
    const text = document.querySelector("#character-counter-text");
    const copy = document.querySelector("#copy-character-text");
    const clear = document.querySelector("#clear-character-text");
    const message = document.querySelector("#character-counter-message");
    const results = document.querySelector("#character-counter-results");

    const update = () => {
      const value = text.value;
      const noSpaces = value.replace(/\s/g, "");
      const lines = value.length ? value.split(/\r?\n/).length : 0;
      const digits = (value.match(/\d/g) || []).length;
      const punctuation = (value.match(/[.,;:!?()[\]{}"'`´~^°ºª@#$%&*_+=\\/|-]/g) || []).length;

      renderCounterStats(results, [
        ["Caracteres", value.length],
        ["Sem espaços", noSpaces.length],
        ["Espaços", value.length - noSpaces.length],
        ["Linhas", lines],
        ["Números", digits],
        ["Pontuação", punctuation]
      ]);

      copy.disabled = value.length === 0;
      setToolMessage(message, value.length ? "Contagem atualizada." : "Digite ou cole um texto para contar.");
    };

    text.addEventListener("input", update);
    clear.addEventListener("click", () => {
      text.value = "";
      update();
      text.focus();
    });
    copy.addEventListener("click", async () => copyText(text.value, message, setToolMessage));
    update();
  }

  function setupWordCounter(setToolMessage) {
    const text = document.querySelector("#word-counter-text");
    const copy = document.querySelector("#copy-word-text");
    const clear = document.querySelector("#clear-word-text");
    const message = document.querySelector("#word-counter-message");
    const results = document.querySelector("#word-counter-results");

    const update = () => {
      const value = text.value.trim();
      const words = value ? value.match(/\b[\p{L}\p{N}'’-]+\b/gu) || [] : [];
      const uniqueWords = new Set(words.map((word) => word.toLowerCase()));
      const sentences = value ? value.split(/[.!?]+/).filter((item) => item.trim()).length : 0;
      const paragraphs = value ? value.split(/\n\s*\n/).filter((item) => item.trim()).length : 0;
      const readingMinutes = words.length ? Math.max(1, Math.ceil(words.length / 200)) : 0;

      renderCounterStats(results, [
        ["Palavras", words.length],
        ["Únicas", uniqueWords.size],
        ["Frases", sentences],
        ["Parágrafos", paragraphs],
        ["Tempo leitura", readingMinutes ? `${readingMinutes} min` : "0 min"],
        ["Média/frase", sentences ? Math.round(words.length / sentences) : 0]
      ]);

      copy.disabled = text.value.length === 0;
      setToolMessage(message, words.length ? "Contagem atualizada." : "Digite ou cole um texto para contar.");
    };

    text.addEventListener("input", update);
    clear.addEventListener("click", () => {
      text.value = "";
      update();
      text.focus();
    });
    copy.addEventListener("click", async () => copyText(text.value, message, setToolMessage));
    update();
  }

  function renderCounterStats(container, stats) {
    container.innerHTML = stats.map(([label, value]) => `
      <div class="counter-stat">
        <strong>${value}</strong>
        <span>${label}</span>
      </div>
    `).join("");
  }

  async function copyText(value, message, setToolMessage) {
    if (!value) return;

    try {
      await navigator.clipboard.writeText(value);
      setToolMessage(message, "Texto copiado.");
    } catch {
      setToolMessage(message, "Texto pronto para copiar manualmente.");
    }
  }
})();
