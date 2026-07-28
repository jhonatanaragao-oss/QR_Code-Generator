(function registerImcCalculator() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Calculadora de IMC"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Calculadora de IMC": renderImcPanel
  };

  function renderImcPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Calcule o IMC a partir do peso e altura, com classificação e faixa de referência.</p>

      <form class="tool-form" id="imc-form" novalidate>
        <div class="unit-row">
          <label for="imc-weight">
            Peso (kg)
            <input class="tool-input" id="imc-weight" type="number" min="1" step="0.1" placeholder="Ex.: 72">
          </label>

          <span></span>

          <label for="imc-height">
            Altura
            <input class="tool-input" id="imc-height" type="number" min="0.3" step="0.01" placeholder="Ex.: 1.75 ou 175">
          </label>
        </div>

        <button class="primary-action" type="submit">Calcular IMC</button>
        <p class="tool-message" id="imc-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="imc-result" hidden>
        <span>Resultado do IMC</span>
        <strong id="imc-value">0</strong>
      </div>

      <div class="breakdown-grid" id="imc-breakdown" hidden></div>

      <p class="tool-note">O IMC é uma referência geral e não substitui avaliação profissional. Atletas, idosos, gestantes e crianças exigem critérios específicos.</p>
    `);

    setupImcCalculator(setToolMessage);
  }

  function setupImcCalculator(setToolMessage) {
    const form = document.querySelector("#imc-form");
    const weight = document.querySelector("#imc-weight");
    const height = document.querySelector("#imc-height");
    const message = document.querySelector("#imc-message");
    const result = document.querySelector("#imc-result");
    const imcValue = document.querySelector("#imc-value");
    const breakdown = document.querySelector("#imc-breakdown");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculate();
    });

    [weight, height].forEach((field) => {
      field.addEventListener("input", () => {
        if (result.hidden || !weight.value || !height.value) return;
        calculate();
      });
    });

    setToolMessage(message, "Informe peso e altura para começar.");

    function calculate() {
      const weightValue = Number(weight.value);
      const heightValue = normalizeHeight(Number(height.value));

      if (!Number.isFinite(weightValue) || weightValue <= 0) {
        setToolMessage(message, "Informe um peso válido em kg.", true);
        weight.focus();
        return;
      }

      if (!Number.isFinite(heightValue) || heightValue <= 0) {
        setToolMessage(message, "Informe uma altura válida.", true);
        height.focus();
        return;
      }

      const imc = weightValue / (heightValue * heightValue);
      const classification = classifyImc(imc);
      const minHealthyWeight = 18.5 * heightValue * heightValue;
      const maxHealthyWeight = 24.9 * heightValue * heightValue;
      const difference = getWeightDifference(weightValue, minHealthyWeight, maxHealthyWeight);

      result.hidden = false;
      breakdown.hidden = false;
      imcValue.textContent = formatNumber(imc, 1);
      breakdown.innerHTML = renderBreakdown([
        ["Classificação", classification],
        ["Altura usada", `${formatNumber(heightValue, 2)} m`],
        ["Peso informado", `${formatNumber(weightValue, 1)} kg`],
        ["Faixa saudável", `${formatNumber(minHealthyWeight, 1)} a ${formatNumber(maxHealthyWeight, 1)} kg`],
        ["Diferença aprox.", difference],
        ["Fórmula", "peso ÷ altura²"]
      ]);
      setToolMessage(message, "Cálculo concluído.");
    }
  }

  function normalizeHeight(value) {
    if (!Number.isFinite(value) || value <= 0) return 0;
    return value > 3 ? value / 100 : value;
  }

  function classifyImc(imc) {
    if (imc < 18.5) return "Abaixo do peso";
    if (imc < 25) return "Peso adequado";
    if (imc < 30) return "Sobrepeso";
    if (imc < 35) return "Obesidade grau I";
    if (imc < 40) return "Obesidade grau II";
    return "Obesidade grau III";
  }

  function getWeightDifference(weight, min, max) {
    if (weight < min) return `+${formatNumber(min - weight, 1)} kg até a faixa`;
    if (weight > max) return `-${formatNumber(weight - max, 1)} kg até a faixa`;
    return "Dentro da faixa";
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
