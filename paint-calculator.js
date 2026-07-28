(function registerPaintCalculator() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Calculadora de tinta"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Calculadora de tinta": renderPaintPanel
  };

  function renderPaintPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Calcule a quantidade aproximada de tinta para paredes, tetos ou áreas gerais.</p>

      <form class="tool-form" id="paint-form" novalidate>
        <div class="unit-row">
          <label for="paint-area">
            Área total (m²)
            <input class="tool-input" id="paint-area" type="number" min="0.1" step="0.01" placeholder="Ex.: 42">
          </label>

          <span></span>

          <label for="paint-openings">
            Portas/janelas (m²)
            <input class="tool-input" id="paint-openings" type="number" min="0" step="0.01" placeholder="Opcional">
          </label>
        </div>

        <div class="unit-row">
          <label for="paint-coats">
            Demãos
            <input class="tool-input" id="paint-coats" type="number" min="1" max="6" step="1" value="2">
          </label>

          <span></span>

          <label for="paint-yield">
            Rendimento (m²/L)
            <input class="tool-input" id="paint-yield" type="number" min="1" step="0.1" value="10">
          </label>
        </div>

        <div class="unit-row">
          <label for="paint-waste">
            Margem de perda (%)
            <input class="tool-input" id="paint-waste" type="number" min="0" max="50" step="1" value="10">
          </label>

          <span></span>

          <label for="paint-surface">
            Superfície
            <select class="tool-input" id="paint-surface">
              <option value="1" selected>Parede lisa</option>
              <option value="1.15">Parede porosa/texturizada</option>
              <option value="1.25">Reboco novo</option>
              <option value="0.9">Repintura clara</option>
            </select>
          </label>
        </div>

        <button class="primary-action" type="submit">Calcular tinta</button>
        <p class="tool-message" id="paint-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="paint-result" hidden>
        <span>Quantidade estimada</span>
        <strong id="paint-liters">0 L</strong>
      </div>

      <div class="breakdown-grid" id="paint-breakdown" hidden></div>

      <p class="tool-note">Estimativa geral. O rendimento real muda conforme marca, diluição, cor, absorção da superfície e método de aplicação.</p>
    `);

    setupPaintCalculator(setToolMessage);
  }

  function setupPaintCalculator(setToolMessage) {
    const form = document.querySelector("#paint-form");
    const area = document.querySelector("#paint-area");
    const openings = document.querySelector("#paint-openings");
    const coats = document.querySelector("#paint-coats");
    const yieldInput = document.querySelector("#paint-yield");
    const waste = document.querySelector("#paint-waste");
    const surface = document.querySelector("#paint-surface");
    const message = document.querySelector("#paint-message");
    const result = document.querySelector("#paint-result");
    const liters = document.querySelector("#paint-liters");
    const breakdown = document.querySelector("#paint-breakdown");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculate();
    });

    [area, openings, coats, yieldInput, waste, surface].forEach((field) => {
      field.addEventListener("input", () => {
        if (result.hidden || !area.value) return;
        calculate();
      });
    });

    setToolMessage(message, "Informe a área para começar.");

    function calculate() {
      const areaValue = Number(area.value);
      const yieldValue = Number(yieldInput.value);

      if (!Number.isFinite(areaValue) || areaValue <= 0) {
        setToolMessage(message, "Informe uma área válida em m².", true);
        area.focus();
        return;
      }

      if (!Number.isFinite(yieldValue) || yieldValue <= 0) {
        setToolMessage(message, "Informe o rendimento da tinta em m² por litro.", true);
        yieldInput.focus();
        return;
      }

      const openingsValue = Math.max(0, Number(openings.value) || 0);
      const coatsValue = Math.max(1, Math.floor(Number(coats.value) || 1));
      const wasteRate = Math.max(0, Math.min(50, Number(waste.value) || 0)) / 100;
      const surfaceMultiplier = Number(surface.value) || 1;
      const netArea = Math.max(0, areaValue - openingsValue);
      const paintedArea = netArea * coatsValue;
      const adjustedArea = paintedArea * surfaceMultiplier * (1 + wasteRate);
      const neededLiters = adjustedArea / yieldValue;
      const cans = suggestCans(neededLiters);

      result.hidden = false;
      breakdown.hidden = false;
      liters.textContent = `${formatNumber(neededLiters, 1)} L`;
      breakdown.innerHTML = renderBreakdown([
        ["Área útil", `${formatNumber(netArea, 2)} m²`],
        ["Área com demãos", `${formatNumber(paintedArea, 2)} m²`],
        ["Área ajustada", `${formatNumber(adjustedArea, 2)} m²`],
        ["Rendimento usado", `${formatNumber(yieldValue, 1)} m²/L`],
        ["Sugestão de compra", cans.label],
        ["Sobra aproximada", `${formatNumber(Math.max(0, cans.total - neededLiters), 1)} L`]
      ]);
      setToolMessage(message, "Cálculo concluído.");
    }
  }

  function suggestCans(liters) {
    let best = null;

    for (let big = 0; big <= Math.ceil(liters / 18) + 1; big++) {
      for (let medium = 0; medium <= Math.ceil(liters / 3.6) + 1; medium++) {
        for (let small = 0; small <= Math.ceil(liters / 0.9) + 1; small++) {
          const total = big * 18 + medium * 3.6 + small * 0.9;
          if (total < liters) continue;

          const count = big + medium + small;
          const option = { big, medium, small, total, count, surplus: total - liters };
          if (!best || option.surplus < best.surplus || (option.surplus === best.surplus && option.count < best.count)) {
            best = option;
          }
        }
      }
    }

    if (!best) return { total: liters, label: "Comprar por litro" };

    const parts = [
      best.big ? `${best.big} lata${best.big > 1 ? "s" : ""} de 18 L` : "",
      best.medium ? `${best.medium} ${best.medium > 1 ? "galões" : "galão"} de 3,6 L` : "",
      best.small ? `${best.small} lata${best.small > 1 ? "s" : ""} de 0,9 L` : ""
    ].filter(Boolean);

    return {
      total: best.total,
      label: parts.join(" + ") || "1 lata de 0,9 L"
    };
  }

  function renderBreakdown(items) {
    return items.map(([label, value]) => `
      <div class="breakdown-item">
        <strong>${value}</strong>
        <span>${label}</span>
      </div>
    `).join("");
  }

  function formatNumber(value, digits) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: digits
    }).format(value);
  }
})();
