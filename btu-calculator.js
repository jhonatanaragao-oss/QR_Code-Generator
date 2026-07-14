(function registerBtuCalculator() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Calculadora de ar-condicionado BTU"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Calculadora de ar-condicionado BTU": renderBtuPanel
  };

  const standardBtus = [7000, 9000, 12000, 18000, 24000, 30000, 36000, 48000, 60000];

  function renderBtuPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Estime a capacidade ideal de ar-condicionado para um ambiente.</p>

      <form class="tool-form" id="btu-form" novalidate>
        <div class="unit-row">
          <label for="btu-area">
            Área do ambiente (m²)
            <input class="tool-input" id="btu-area" type="number" min="1" step="0.1" placeholder="Ex.: 18">
          </label>

          <span></span>

          <label for="btu-people">
            Pessoas
            <input class="tool-input" id="btu-people" type="number" min="1" step="1" value="1">
          </label>
        </div>

        <div class="unit-row">
          <label for="btu-electronics">
            Eletrônicos
            <input class="tool-input" id="btu-electronics" type="number" min="0" step="1" value="0">
          </label>

          <span></span>

          <label for="btu-sun">
            Incidência de sol
            <select class="tool-input" id="btu-sun">
              <option value="low">Baixa</option>
              <option value="medium" selected>Média</option>
              <option value="high">Alta</option>
            </select>
          </label>
        </div>

        <label class="checkbox-row" for="btu-margin">
          <input id="btu-margin" type="checkbox" checked>
          Aplicar margem de segurança de 10%
        </label>

        <button class="primary-action" type="submit">Calcular BTU</button>
        <p class="tool-message" id="btu-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="btu-result" hidden>
        <span>Capacidade recomendada</span>
        <strong id="btu-recommended">0 BTU/h</strong>
      </div>

      <div class="breakdown-grid" id="btu-breakdown" hidden></div>

      <p class="tool-note">Estimativa geral. Pé-direito alto, isolamento ruim, grandes janelas, cozinha e regiões muito quentes podem exigir ajuste profissional.</p>
    `);

    setupBtuCalculator(setToolMessage);
  }

  function setupBtuCalculator(setToolMessage) {
    const form = document.querySelector("#btu-form");
    const area = document.querySelector("#btu-area");
    const people = document.querySelector("#btu-people");
    const electronics = document.querySelector("#btu-electronics");
    const sun = document.querySelector("#btu-sun");
    const margin = document.querySelector("#btu-margin");
    const message = document.querySelector("#btu-message");
    const result = document.querySelector("#btu-result");
    const recommended = document.querySelector("#btu-recommended");
    const breakdown = document.querySelector("#btu-breakdown");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const areaValue = Number(area.value);

      if (!Number.isFinite(areaValue) || areaValue <= 0) {
        setToolMessage(message, "Digite uma área válida em m².", true);
        area.focus();
        return;
      }

      const peopleValue = Math.max(1, Math.floor(Number(people.value) || 1));
      const electronicsValue = Math.max(0, Math.floor(Number(electronics.value) || 0));
      const sunMultiplier = getSunMultiplier(sun.value);
      const areaBtus = areaValue * 600;
      const peopleBtus = Math.max(0, peopleValue - 1) * 600;
      const electronicsBtus = electronicsValue * 600;
      const subtotal = (areaBtus + peopleBtus + electronicsBtus) * sunMultiplier;
      const total = margin.checked ? subtotal * 1.1 : subtotal;
      const commercial = getCommercialBtu(total);

      result.hidden = false;
      breakdown.hidden = false;
      recommended.textContent = `${formatNumber(commercial)} BTU/h`;
      breakdown.innerHTML = renderBreakdown([
        ["Área", areaBtus],
        ["Pessoas extras", peopleBtus],
        ["Eletrônicos", electronicsBtus],
        ["Fator solar", subtotal - areaBtus - peopleBtus - electronicsBtus],
        ["Estimativa", total],
        ["Modelo comercial", commercial]
      ]);
      setToolMessage(message, "Cálculo concluído.");
    });

    [area, people, electronics, sun, margin].forEach((field) => {
      field.addEventListener("input", () => {
        if (result.hidden || !area.value) return;
        form.requestSubmit();
      });
    });

    setToolMessage(message, "Informe a área para começar.");
  }

  function getSunMultiplier(value) {
    if (value === "high") return 1.15;
    if (value === "low") return 0.95;
    return 1;
  }

  function getCommercialBtu(total) {
    return standardBtus.find((btu) => btu >= total) || Math.ceil(total / 1000) * 1000;
  }

  function renderBreakdown(items) {
    return items.map(([label, value]) => `
      <div class="breakdown-item">
        <strong>${formatNumber(Math.max(0, value))}</strong>
        <span>${label}</span>
      </div>
    `).join("");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 0
    }).format(value);
  }
})();
