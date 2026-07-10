(function registerRaffleTool() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Sorteador"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Sorteador": renderRafflePanel
  };

  function renderRafflePanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Sorteie nomes, funcionários, brindes ou qualquer lista de participantes.</p>

      <form class="tool-form" id="raffle-form" novalidate>
        <label for="raffle-items">
          Participantes ou itens
          <textarea class="tool-textarea tall-textarea" id="raffle-items" rows="9" placeholder="Um nome por linha, ou separados por vírgula"></textarea>
        </label>

        <div class="unit-row">
          <label for="raffle-count">
            Quantidade
            <input class="tool-input" id="raffle-count" type="number" min="1" step="1" value="1">
          </label>

          <span></span>

          <label for="raffle-seed">
            Código opcional
            <input class="tool-input" id="raffle-seed" type="text" placeholder="Ex.: campanha-2026">
          </label>
        </div>

        <label class="checkbox-row" for="raffle-unique">
          <input id="raffle-unique" type="checkbox" checked>
          Não repetir vencedores
        </label>

        <div class="split-actions">
          <button class="primary-action" type="submit">Sortear</button>
          <button class="secondary-action" id="copy-raffle" type="button" disabled>Copiar resultado</button>
        </div>

        <p class="tool-message" id="raffle-message" aria-live="polite"></p>
      </form>

      <div class="raffle-result" id="raffle-result" hidden></div>
    `);

    setupRaffle(setToolMessage);
  }

  function setupRaffle(setToolMessage) {
    const form = document.querySelector("#raffle-form");
    const itemsInput = document.querySelector("#raffle-items");
    const countInput = document.querySelector("#raffle-count");
    const seedInput = document.querySelector("#raffle-seed");
    const uniqueInput = document.querySelector("#raffle-unique");
    const copyButton = document.querySelector("#copy-raffle");
    const message = document.querySelector("#raffle-message");
    const result = document.querySelector("#raffle-result");
    let currentWinners = [];

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const items = parseItems(itemsInput.value);

      if (items.length === 0) {
        setToolMessage(message, "Adicione pelo menos um participante.", true);
        itemsInput.focus();
        return;
      }

      const count = Math.max(1, Math.floor(Number(countInput.value) || 1));
      const unique = uniqueInput.checked;

      if (unique && count > items.length) {
        setToolMessage(message, "A quantidade não pode ser maior que a lista sem repetição.", true);
        countInput.focus();
        return;
      }

      currentWinners = drawItems(items, count, unique, seedInput.value.trim());
      renderResult(result, currentWinners);
      copyButton.disabled = false;
      setToolMessage(message, `Sorteio concluído com ${currentWinners.length} resultado${currentWinners.length > 1 ? "s" : ""}.`);
    });

    copyButton.addEventListener("click", async () => {
      if (currentWinners.length === 0) return;
      const text = currentWinners.map((winner, index) => `${index + 1}. ${winner}`).join("\n");

      try {
        await navigator.clipboard.writeText(text);
        setToolMessage(message, "Resultado copiado.");
      } catch {
        setToolMessage(message, "Resultado pronto para copiar manualmente.");
      }
    });

    itemsInput.addEventListener("input", () => {
      copyButton.disabled = true;
      result.hidden = true;
      currentWinners = [];
      const total = parseItems(itemsInput.value).length;
      setToolMessage(message, total ? `${total} item${total > 1 ? "s" : ""} na lista.` : "Adicione os participantes para sortear.");
    });

    setToolMessage(message, "Adicione os participantes para sortear.");
  }

  function parseItems(value) {
    return value
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  function drawItems(items, count, unique, seed) {
    const random = seed ? createSeededRandom(seed) : Math.random;
    const pool = [...items];
    const winners = [];

    for (let index = 0; index < count; index++) {
      const chosenIndex = Math.floor(random() * pool.length);
      winners.push(pool[chosenIndex]);

      if (unique) {
        pool.splice(chosenIndex, 1);
      }
    }

    return winners;
  }

  function createSeededRandom(seed) {
    let hash = 2166136261;

    for (let index = 0; index < seed.length; index++) {
      hash ^= seed.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }

    return () => {
      hash += 0x6D2B79F5;
      let value = hash;
      value = Math.imul(value ^ value >>> 15, value | 1);
      value ^= value + Math.imul(value ^ value >>> 7, value | 61);
      return ((value ^ value >>> 14) >>> 0) / 4294967296;
    };
  }

  function renderResult(container, winners) {
    container.hidden = false;
    container.innerHTML = `
      <span>Resultado do sorteio</span>
      <ol>
        ${winners.map((winner) => `<li>${escapeHtml(winner)}</li>`).join("")}
      </ol>
    `;
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
