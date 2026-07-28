(function registerVolumeCalculator() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Calculadora de volume"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Calculadora de volume": renderVolumePanel
  };

  const modes = {
    box: {
      label: "Caixa / reservatório retangular",
      first: "Largura (m)",
      second: "Comprimento (m)",
      third: "Altura (m)",
      help: "Use para caixas, reservatórios, piscinas e volumes retangulares."
    },
    cylinder: {
      label: "Cilindro / caixa d'água redonda",
      first: "Diâmetro (m)",
      second: "Altura (m)",
      third: "Campo extra",
      help: "Use para caixas d'água redondas, tambores e reservatórios cilíndricos."
    },
    package: {
      label: "Embalagem / caixa em centímetros",
      first: "Largura (cm)",
      second: "Comprimento (cm)",
      third: "Altura (cm)",
      help: "Use para calcular volume de caixas pequenas em cm³, litros e m³."
    }
  };

  function renderVolumePanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Calcule volume de caixas, reservatórios, caixas d'água e embalagens.</p>

      <form class="tool-form" id="volume-form" novalidate>
        <label for="volume-mode">
          Tipo de cálculo
          <select class="tool-input" id="volume-mode"></select>
        </label>

        <div class="unit-row">
          <label for="volume-first">
            <span id="volume-first-label">Largura (m)</span>
            <input class="tool-input" id="volume-first" type="number" min="0.01" step="0.01" placeholder="Ex.: 2">
          </label>

          <span></span>

          <label for="volume-second">
            <span id="volume-second-label">Comprimento (m)</span>
            <input class="tool-input" id="volume-second" type="number" min="0.01" step="0.01" placeholder="Ex.: 3">
          </label>
        </div>

        <label for="volume-third" id="volume-third-wrap">
          <span id="volume-third-label">Altura (m)</span>
          <input class="tool-input" id="volume-third" type="number" min="0.01" step="0.01" placeholder="Ex.: 1.5">
        </label>

        <button class="primary-action" type="submit">Calcular volume</button>
        <p class="tool-message" id="volume-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="volume-result" hidden>
        <span>Volume estimado</span>
        <strong id="volume-total">0 L</strong>
      </div>

      <div class="breakdown-grid" id="volume-breakdown" hidden></div>

      <p class="tool-note" id="volume-note">Use as medidas internas quando estiver calculando capacidade útil.</p>
    `);

    setupVolumeCalculator(setToolMessage);
  }

  function setupVolumeCalculator(setToolMessage) {
    const form = document.querySelector("#volume-form");
    const mode = document.querySelector("#volume-mode");
    const first = document.querySelector("#volume-first");
    const second = document.querySelector("#volume-second");
    const third = document.querySelector("#volume-third");
    const thirdWrap = document.querySelector("#volume-third-wrap");
    const firstLabel = document.querySelector("#volume-first-label");
    const secondLabel = document.querySelector("#volume-second-label");
    const thirdLabel = document.querySelector("#volume-third-label");
    const message = document.querySelector("#volume-message");
    const result = document.querySelector("#volume-result");
    const total = document.querySelector("#volume-total");
    const breakdown = document.querySelector("#volume-breakdown");
    const note = document.querySelector("#volume-note");

    mode.innerHTML = Object.entries(modes)
      .map(([key, item]) => `<option value="${key}">${item.label}</option>`)
      .join("");

    mode.addEventListener("change", () => {
      updateMode();
      if (result.hidden || !first.value || !second.value) return;
      calculate();
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculate();
    });

    [first, second, third].forEach((field) => {
      field.addEventListener("input", () => {
        if (result.hidden || !first.value || !second.value) return;
        calculate();
      });
    });

    updateMode();
    setToolMessage(message, "Informe as medidas para começar.");

    function updateMode() {
      const selected = modes[mode.value];
      firstLabel.textContent = selected.first;
      secondLabel.textContent = selected.second;
      thirdLabel.textContent = selected.third;
      thirdWrap.hidden = mode.value === "cylinder";
      note.textContent = selected.help;
    }

    function calculate() {
      const firstValue = Number(first.value);
      const secondValue = Number(second.value);
      const thirdValue = Number(third.value);

      if (!Number.isFinite(firstValue) || firstValue <= 0 || !Number.isFinite(secondValue) || secondValue <= 0) {
        setToolMessage(message, "Informe medidas válidas.", true);
        first.focus();
        return;
      }

      if (mode.value !== "cylinder" && (!Number.isFinite(thirdValue) || thirdValue <= 0)) {
        setToolMessage(message, "Informe a altura para calcular o volume.", true);
        third.focus();
        return;
      }

      let cubicMeters = 0;
      let formula = "";

      if (mode.value === "cylinder") {
        const diameter = firstValue;
        const height = secondValue;
        const radius = diameter / 2;
        cubicMeters = Math.PI * radius * radius * height;
        formula = `π × ${formatNumber(radius, 2)}² × ${formatNumber(height, 2)} m`;
      } else if (mode.value === "package") {
        const cubicCentimeters = firstValue * secondValue * thirdValue;
        cubicMeters = cubicCentimeters / 1000000;
        formula = `${formatNumber(firstValue, 2)} × ${formatNumber(secondValue, 2)} × ${formatNumber(thirdValue, 2)} cm`;
      } else {
        cubicMeters = firstValue * secondValue * thirdValue;
        formula = `${formatNumber(firstValue, 2)} × ${formatNumber(secondValue, 2)} × ${formatNumber(thirdValue, 2)} m`;
      }

      const liters = cubicMeters * 1000;
      const cubicCentimeters = cubicMeters * 1000000;

      result.hidden = false;
      breakdown.hidden = false;
      total.textContent = `${formatNumber(liters, 1)} L`;
      breakdown.innerHTML = renderBreakdown([
        ["Metros cúbicos", `${formatNumber(cubicMeters, 3)} m³`],
        ["Litros", `${formatNumber(liters, 1)} L`],
        ["Centímetros cúbicos", `${formatNumber(cubicCentimeters, 0)} cm³`],
        ["Capacidade em água", `${formatNumber(liters, 1)} kg aprox.`],
        ["Fórmula", formula],
        ["Tipo", modes[mode.value].label]
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
