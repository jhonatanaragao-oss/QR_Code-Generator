(function registerLightingCalculator() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Calculadora de iluminação"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Calculadora de iluminação": renderLightingPanel
  };

  const roomPresets = {
    living: { label: "Sala", lux: 150 },
    bedroom: { label: "Quarto", lux: 120 },
    kitchen: { label: "Cozinha", lux: 300 },
    bathroom: { label: "Banheiro", lux: 200 },
    office: { label: "Escritório", lux: 500 },
    hallway: { label: "Corredor", lux: 100 },
    store: { label: "Loja/atendimento", lux: 400 }
  };

  function renderLightingPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Estime a quantidade de lâmpadas por ambiente com base em área, nível de iluminação e lúmens.</p>

      <form class="tool-form" id="lighting-form" novalidate>
        <div class="unit-row">
          <label for="lighting-area">
            Área do ambiente (m²)
            <input class="tool-input" id="lighting-area" type="number" min="0.1" step="0.01" placeholder="Ex.: 16">
          </label>

          <span></span>

          <label for="lighting-room">
            Tipo de ambiente
            <select class="tool-input" id="lighting-room"></select>
          </label>
        </div>

        <div class="unit-row">
          <label for="lighting-lux">
            Iluminância desejada (lux)
            <input class="tool-input" id="lighting-lux" type="number" min="50" step="10" value="150">
          </label>

          <span></span>

          <label for="lighting-lumens">
            Lúmens por lâmpada
            <input class="tool-input" id="lighting-lumens" type="number" min="100" step="50" value="800">
          </label>
        </div>

        <div class="unit-row">
          <label for="lighting-height">
            Pé-direito
            <select class="tool-input" id="lighting-height">
              <option value="1" selected>Até 2,80 m</option>
              <option value="1.15">2,80 m a 3,50 m</option>
              <option value="1.3">Acima de 3,50 m</option>
            </select>
          </label>

          <span></span>

          <label for="lighting-loss">
            Perdas/sombra (%)
            <input class="tool-input" id="lighting-loss" type="number" min="0" max="50" step="1" value="10">
          </label>
        </div>

        <button class="primary-action" type="submit">Calcular iluminação</button>
        <p class="tool-message" id="lighting-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="lighting-result" hidden>
        <span>Quantidade recomendada</span>
        <strong id="lighting-lamps">0 lâmpadas</strong>
      </div>

      <div class="breakdown-grid" id="lighting-breakdown" hidden></div>

      <p class="tool-note">Estimativa geral. Distribuição dos pontos, cor das paredes, altura real, luminária e normas do projeto podem alterar o resultado ideal.</p>
    `);

    setupLightingCalculator(setToolMessage);
  }

  function setupLightingCalculator(setToolMessage) {
    const form = document.querySelector("#lighting-form");
    const area = document.querySelector("#lighting-area");
    const room = document.querySelector("#lighting-room");
    const lux = document.querySelector("#lighting-lux");
    const lumens = document.querySelector("#lighting-lumens");
    const height = document.querySelector("#lighting-height");
    const loss = document.querySelector("#lighting-loss");
    const message = document.querySelector("#lighting-message");
    const result = document.querySelector("#lighting-result");
    const lamps = document.querySelector("#lighting-lamps");
    const breakdown = document.querySelector("#lighting-breakdown");

    room.innerHTML = Object.entries(roomPresets)
      .map(([key, item]) => `<option value="${key}">${item.label} (${item.lux} lux)</option>`)
      .join("");

    room.addEventListener("change", () => {
      lux.value = roomPresets[room.value].lux;
      if (result.hidden || !area.value) return;
      calculate();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculate();
    });

    [area, lux, lumens, height, loss].forEach((field) => {
      field.addEventListener("input", () => {
        if (result.hidden || !area.value) return;
        calculate();
      });
    });

    lux.value = roomPresets[room.value].lux;
    setToolMessage(message, "Informe a área do ambiente para começar.");

    function calculate() {
      const areaValue = Number(area.value);
      const luxValue = Number(lux.value);
      const lumensValue = Number(lumens.value);

      if (!Number.isFinite(areaValue) || areaValue <= 0) {
        setToolMessage(message, "Informe uma área válida em m².", true);
        area.focus();
        return;
      }

      if (!Number.isFinite(luxValue) || luxValue <= 0) {
        setToolMessage(message, "Informe uma iluminância válida em lux.", true);
        lux.focus();
        return;
      }

      if (!Number.isFinite(lumensValue) || lumensValue <= 0) {
        setToolMessage(message, "Informe os lúmens da lâmpada.", true);
        lumens.focus();
        return;
      }

      const heightMultiplier = Number(height.value) || 1;
      const lossRate = Math.max(0, Math.min(50, Number(loss.value) || 0)) / 100;
      const baseLumens = areaValue * luxValue;
      const adjustedLumens = baseLumens * heightMultiplier * (1 + lossRate);
      const lampCount = Math.max(1, Math.ceil(adjustedLumens / lumensValue));
      const installedLumens = lampCount * lumensValue;
      const approximateWatts = installedLumens / 100;

      result.hidden = false;
      breakdown.hidden = false;
      lamps.textContent = `${lampCount} ${lampCount === 1 ? "lâmpada" : "lâmpadas"}`;
      breakdown.innerHTML = renderBreakdown([
        ["Fluxo necessário", `${formatNumber(adjustedLumens, 0)} lm`],
        ["Fluxo instalado", `${formatNumber(installedLumens, 0)} lm`],
        ["Iluminância usada", `${formatNumber(luxValue, 0)} lux`],
        ["Lúmens por lâmpada", `${formatNumber(lumensValue, 0)} lm`],
        ["Fator de altura", `${formatNumber(heightMultiplier, 2)}x`],
        ["Potência LED aprox.", `${formatNumber(approximateWatts, 1)} W`]
      ]);
      setToolMessage(message, "Cálculo concluído.");
    }
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
