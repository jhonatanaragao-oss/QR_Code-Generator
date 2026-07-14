(function registerWallpaperCalculator() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Calculadora de papel de parede"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Calculadora de papel de parede": renderWallpaperPanel
  };

  function renderWallpaperPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Calcule a quantidade aproximada de rolos para cobrir uma parede.</p>

      <form class="tool-form" id="wallpaper-form" novalidate>
        <div class="unit-row">
          <label for="wallpaper-wall-width">
            Largura da parede (m)
            <input class="tool-input" id="wallpaper-wall-width" type="number" min="0.1" step="0.01" placeholder="Ex.: 4">
          </label>

          <span></span>

          <label for="wallpaper-wall-height">
            Altura da parede (m)
            <input class="tool-input" id="wallpaper-wall-height" type="number" min="0.1" step="0.01" placeholder="Ex.: 2.7">
          </label>
        </div>

        <div class="unit-row">
          <label for="wallpaper-roll-width">
            Largura do rolo (m)
            <input class="tool-input" id="wallpaper-roll-width" type="number" min="0.1" step="0.01" value="0.53">
          </label>

          <span></span>

          <label for="wallpaper-roll-length">
            Comprimento do rolo (m)
            <input class="tool-input" id="wallpaper-roll-length" type="number" min="0.1" step="0.01" value="10">
          </label>
        </div>

        <div class="unit-row">
          <label for="wallpaper-openings">
            Portas/janelas (m²)
            <input class="tool-input" id="wallpaper-openings" type="number" min="0" step="0.01" placeholder="Opcional">
          </label>

          <span></span>

          <label for="wallpaper-waste">
            Perda (%)
            <input class="tool-input" id="wallpaper-waste" type="number" min="0" max="50" step="1" value="10">
          </label>
        </div>

        <label class="checkbox-row" for="wallpaper-pattern">
          <input id="wallpaper-pattern" type="checkbox">
          Papel com estampa/casamento de desenho
        </label>

        <button class="primary-action" type="submit">Calcular rolos</button>
        <p class="tool-message" id="wallpaper-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="wallpaper-result" hidden>
        <span>Quantidade recomendada</span>
        <strong id="wallpaper-rolls">0 rolos</strong>
      </div>

      <div class="breakdown-grid" id="wallpaper-breakdown" hidden></div>

      <p class="tool-note">Estimativa geral. Sempre confirme o lote do papel e considere sobras para recortes, emendas e manutenção futura.</p>
    `);

    setupWallpaperCalculator(setToolMessage);
  }

  function setupWallpaperCalculator(setToolMessage) {
    const form = document.querySelector("#wallpaper-form");
    const wallWidth = document.querySelector("#wallpaper-wall-width");
    const wallHeight = document.querySelector("#wallpaper-wall-height");
    const rollWidth = document.querySelector("#wallpaper-roll-width");
    const rollLength = document.querySelector("#wallpaper-roll-length");
    const openings = document.querySelector("#wallpaper-openings");
    const waste = document.querySelector("#wallpaper-waste");
    const pattern = document.querySelector("#wallpaper-pattern");
    const message = document.querySelector("#wallpaper-message");
    const result = document.querySelector("#wallpaper-result");
    const rolls = document.querySelector("#wallpaper-rolls");
    const breakdown = document.querySelector("#wallpaper-breakdown");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const wallWidthValue = Number(wallWidth.value);
      const wallHeightValue = Number(wallHeight.value);
      const rollWidthValue = Number(rollWidth.value);
      const rollLengthValue = Number(rollLength.value);

      if (![wallWidthValue, wallHeightValue, rollWidthValue, rollLengthValue].every((value) => Number.isFinite(value) && value > 0)) {
        setToolMessage(message, "Preencha as medidas da parede e do rolo.", true);
        wallWidth.focus();
        return;
      }

      const openingsValue = Math.max(0, Number(openings.value) || 0);
      const wasteRate = Math.max(0, Math.min(50, Number(waste.value) || 0)) / 100;
      const patternRate = pattern.checked ? 0.15 : 0;
      const grossArea = wallWidthValue * wallHeightValue;
      const netArea = Math.max(0, grossArea - openingsValue);
      const adjustedArea = netArea * (1 + wasteRate + patternRate);
      const rollArea = rollWidthValue * rollLengthValue;
      const rollCountByArea = Math.ceil(adjustedArea / rollArea);

      const stripsNeeded = Math.ceil(wallWidthValue / rollWidthValue);
      const stripsPerRoll = Math.max(1, Math.floor(rollLengthValue / wallHeightValue));
      const rollCountByStrips = Math.ceil(stripsNeeded / stripsPerRoll);
      const recommended = Math.max(rollCountByArea, rollCountByStrips);

      result.hidden = false;
      breakdown.hidden = false;
      rolls.textContent = `${recommended} ${recommended === 1 ? "rolo" : "rolos"}`;
      breakdown.innerHTML = renderBreakdown([
        ["Área bruta", `${formatNumber(grossArea)} m²`],
        ["Área útil", `${formatNumber(netArea)} m²`],
        ["Área com perda", `${formatNumber(adjustedArea)} m²`],
        ["Área por rolo", `${formatNumber(rollArea)} m²`],
        ["Faixas necessárias", stripsNeeded],
        ["Faixas por rolo", stripsPerRoll]
      ]);
      setToolMessage(message, "Cálculo concluído.");
    });

    [wallWidth, wallHeight, rollWidth, rollLength, openings, waste, pattern].forEach((field) => {
      field.addEventListener("input", () => {
        if (result.hidden || !wallWidth.value || !wallHeight.value) return;
        form.requestSubmit();
      });
    });

    setToolMessage(message, "Informe as medidas para começar.");
  }

  function renderBreakdown(items) {
    return items.map(([label, value]) => `
      <div class="breakdown-item">
        <strong>${value}</strong>
        <span>${label}</span>
      </div>
    `).join("");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 2
    }).format(value);
  }
})();
