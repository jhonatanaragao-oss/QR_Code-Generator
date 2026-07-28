(function registerAreaCalculator() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Calculadora de m²"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Calculadora de m²": renderAreaPanel
  };

  const modes = {
    floor: {
      label: "Piso / área retangular",
      primary: "Largura (m)",
      secondary: "Comprimento (m)",
      needsHeight: false,
      description: "Área de pisos, placas, tapetes, forros e superfícies retangulares."
    },
    wall: {
      label: "Parede individual",
      primary: "Largura da parede (m)",
      secondary: "Altura da parede (m)",
      needsHeight: false,
      description: "Área de uma parede, com desconto opcional de portas e janelas."
    },
    painting: {
      label: "Ambiente para pintura",
      primary: "Largura do ambiente (m)",
      secondary: "Comprimento do ambiente (m)",
      needsHeight: true,
      description: "Área aproximada das quatro paredes de um ambiente."
    },
    land: {
      label: "Terreno retangular",
      primary: "Frente do terreno (m)",
      secondary: "Profundidade (m)",
      needsHeight: false,
      description: "Área e perímetro de terrenos ou áreas externas retangulares."
    }
  };

  function renderAreaPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Calcule m² para piso, parede, terreno, pintura e áreas retangulares.</p>

      <form class="tool-form" id="area-form" novalidate>
        <label for="area-mode">
          Tipo de cálculo
          <select class="tool-input" id="area-mode"></select>
        </label>

        <div class="unit-row">
          <label for="area-primary">
            <span id="area-primary-label">Largura (m)</span>
            <input class="tool-input" id="area-primary" type="number" min="0.01" step="0.01" placeholder="Ex.: 4">
          </label>

          <span></span>

          <label for="area-secondary">
            <span id="area-secondary-label">Comprimento (m)</span>
            <input class="tool-input" id="area-secondary" type="number" min="0.01" step="0.01" placeholder="Ex.: 5">
          </label>
        </div>

        <div class="unit-row" id="area-height-row" hidden>
          <label for="area-height">
            Altura do ambiente (m)
            <input class="tool-input" id="area-height" type="number" min="0.01" step="0.01" value="2.7">
          </label>

          <span></span>

          <label for="area-openings">
            Portas/janelas (m²)
            <input class="tool-input" id="area-openings" type="number" min="0" step="0.01" placeholder="Opcional">
          </label>
        </div>

        <div class="unit-row" id="area-adjust-row">
          <label for="area-discount" id="area-discount-wrap">
            <span id="area-discount-label">Descontos (m²)</span>
            <input class="tool-input" id="area-discount" type="number" min="0" step="0.01" placeholder="Opcional">
          </label>

          <span></span>

          <label for="area-waste">
            Margem/perda (%)
            <input class="tool-input" id="area-waste" type="number" min="0" max="100" step="1" value="10">
          </label>
        </div>

        <button class="primary-action" type="submit">Calcular m²</button>
        <p class="tool-message" id="area-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="area-result" hidden>
        <span>Área recomendada</span>
        <strong id="area-total">0 m²</strong>
      </div>

      <div class="breakdown-grid" id="area-breakdown" hidden></div>

      <p class="tool-note" id="area-note">Use medidas em metros. Para pisos e revestimentos, mantenha uma margem para recortes e perdas.</p>
    `);

    setupAreaCalculator(setToolMessage);
  }

  function setupAreaCalculator(setToolMessage) {
    const form = document.querySelector("#area-form");
    const mode = document.querySelector("#area-mode");
    const primary = document.querySelector("#area-primary");
    const secondary = document.querySelector("#area-secondary");
    const height = document.querySelector("#area-height");
    const openings = document.querySelector("#area-openings");
    const discount = document.querySelector("#area-discount");
    const waste = document.querySelector("#area-waste");
    const heightRow = document.querySelector("#area-height-row");
    const discountWrap = document.querySelector("#area-discount-wrap");
    const discountLabel = document.querySelector("#area-discount-label");
    const primaryLabel = document.querySelector("#area-primary-label");
    const secondaryLabel = document.querySelector("#area-secondary-label");
    const message = document.querySelector("#area-message");
    const result = document.querySelector("#area-result");
    const total = document.querySelector("#area-total");
    const breakdown = document.querySelector("#area-breakdown");
    const note = document.querySelector("#area-note");

    mode.innerHTML = Object.entries(modes)
      .map(([key, item]) => `<option value="${key}">${item.label}</option>`)
      .join("");

    mode.addEventListener("change", () => {
      updateMode();
      if (result.hidden || !primary.value || !secondary.value) return;
      calculate();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculate();
    });

    [primary, secondary, height, openings, discount, waste].forEach((field) => {
      field.addEventListener("input", () => {
        if (result.hidden || !primary.value || !secondary.value) return;
        calculate();
      });
    });

    updateMode();
    setToolMessage(message, "Informe as medidas para começar.");

    function updateMode() {
      const selected = modes[mode.value];
      primaryLabel.textContent = selected.primary;
      secondaryLabel.textContent = selected.secondary;
      heightRow.hidden = !selected.needsHeight;
      discountWrap.hidden = selected.needsHeight;
      note.textContent = selected.description;

      if (mode.value === "wall") {
        discountLabel.textContent = "Portas/janelas (m²)";
      } else {
        discountLabel.textContent = "Descontos (m²)";
      }
    }

    function calculate() {
      const primaryValue = Number(primary.value);
      const secondaryValue = Number(secondary.value);

      if (!Number.isFinite(primaryValue) || primaryValue <= 0 || !Number.isFinite(secondaryValue) || secondaryValue <= 0) {
        setToolMessage(message, "Informe medidas válidas em metros.", true);
        primary.focus();
        return;
      }

      const wasteRate = Math.max(0, Math.min(100, Number(waste.value) || 0)) / 100;
      const selectedMode = mode.value;
      let grossArea = 0;
      let discountArea = 0;
      let perimeter = 0;
      let calculationLabel = "";

      if (selectedMode === "painting") {
        const heightValue = Number(height.value);

        if (!Number.isFinite(heightValue) || heightValue <= 0) {
          setToolMessage(message, "Informe uma altura válida para o ambiente.", true);
          height.focus();
          return;
        }

        perimeter = 2 * (primaryValue + secondaryValue);
        grossArea = perimeter * heightValue;
        discountArea = Math.max(0, Number(openings.value) || 0);
        calculationLabel = `${formatNumber(perimeter, 2)} m de perímetro × ${formatNumber(heightValue, 2)} m de altura`;
      } else if (selectedMode === "wall") {
        grossArea = primaryValue * secondaryValue;
        perimeter = 2 * (primaryValue + secondaryValue);
        discountArea = Math.max(0, Number(discount.value) || 0);
        calculationLabel = `${formatNumber(primaryValue, 2)} m × ${formatNumber(secondaryValue, 2)} m`;
      } else {
        grossArea = primaryValue * secondaryValue;
        perimeter = 2 * (primaryValue + secondaryValue);
        discountArea = Math.max(0, Number(discount.value) || 0);
        calculationLabel = `${formatNumber(primaryValue, 2)} m × ${formatNumber(secondaryValue, 2)} m`;
      }

      const netArea = Math.max(0, grossArea - discountArea);
      const adjustedArea = netArea * (1 + wasteRate);

      result.hidden = false;
      breakdown.hidden = false;
      total.textContent = `${formatNumber(adjustedArea, 2)} m²`;
      breakdown.innerHTML = renderBreakdown([
        ["Área bruta", `${formatNumber(grossArea, 2)} m²`],
        ["Descontos", `${formatNumber(discountArea, 2)} m²`],
        ["Área líquida", `${formatNumber(netArea, 2)} m²`],
        ["Margem aplicada", `${formatNumber(wasteRate * 100, 0)}%`],
        ["Perímetro", `${formatNumber(perimeter, 2)} m`],
        ["Cálculo", calculationLabel]
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
