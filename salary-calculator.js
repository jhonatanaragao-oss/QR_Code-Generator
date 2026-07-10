(function registerSalaryCalculator() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Calculadora de salário líquido"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Calculadora de salário líquido": renderSalaryCalculatorPanel
  };

  const dependentDeduction = 189.59;
  const simplifiedIrrfDeduction = 607.20;
  const inssRanges = [
    { limit: 1518.00, rate: 0.075 },
    { limit: 2793.88, rate: 0.09 },
    { limit: 4190.83, rate: 0.12 },
    { limit: 8157.41, rate: 0.14 }
  ];
  const irrfRanges = [
    { limit: 2428.80, rate: 0, deduction: 0 },
    { limit: 2826.65, rate: 0.075, deduction: 182.16 },
    { limit: 3751.05, rate: 0.15, deduction: 394.16 },
    { limit: 4664.68, rate: 0.225, deduction: 675.49 },
    { limit: Infinity, rate: 0.275, deduction: 908.73 }
  ];

  function renderSalaryCalculatorPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Estime o salário líquido mensal considerando INSS, IRRF, dependentes, benefícios e descontos.</p>

      <form class="tool-form" id="salary-form" novalidate>
        <label for="salary-gross">
          Salário bruto
          <input class="tool-input" id="salary-gross" type="text" inputmode="decimal" placeholder="Ex.: 5000,00">
        </label>

        <div class="unit-row">
          <label for="salary-dependents">
            Dependentes
            <input class="tool-input" id="salary-dependents" type="number" min="0" step="1" value="0">
          </label>

          <span></span>

          <label for="salary-benefits">
            Benefícios
            <input class="tool-input" id="salary-benefits" type="text" inputmode="decimal" placeholder="Ex.: 500,00">
          </label>
        </div>

        <label for="salary-other-discounts">
          Outros descontos
          <input class="tool-input" id="salary-other-discounts" type="text" inputmode="decimal" placeholder="Plano de saúde, VT, VR...">
        </label>

        <label class="checkbox-row" for="salary-simplified-irrf">
          <input id="salary-simplified-irrf" type="checkbox" checked>
          Usar desconto simplificado do IRRF quando for vantajoso
        </label>

        <button class="primary-action" type="submit">Calcular salário líquido</button>
        <p class="tool-message" id="salary-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="salary-result" hidden>
        <span>Salário líquido estimado</span>
        <strong id="salary-net">R$ 0,00</strong>
      </div>

      <div class="breakdown-grid" id="salary-breakdown" hidden></div>

      <p class="tool-note">Estimativa para simulação. Regras, benefícios, acordos e descontos internos podem alterar o valor real em folha.</p>
    `);

    setupSalaryCalculator(setToolMessage);
  }

  function setupSalaryCalculator(setToolMessage) {
    const form = document.querySelector("#salary-form");
    const gross = document.querySelector("#salary-gross");
    const dependents = document.querySelector("#salary-dependents");
    const benefits = document.querySelector("#salary-benefits");
    const otherDiscounts = document.querySelector("#salary-other-discounts");
    const simplified = document.querySelector("#salary-simplified-irrf");
    const message = document.querySelector("#salary-message");
    const result = document.querySelector("#salary-result");
    const net = document.querySelector("#salary-net");
    const breakdown = document.querySelector("#salary-breakdown");

    form.addEventListener("submit", (event) => {
      event.preventDefault();

      const grossValue = parseMoney(gross.value);
      if (grossValue <= 0) {
        setToolMessage(message, "Digite um salário bruto válido.", true);
        gross.focus();
        return;
      }

      const dependentCount = Math.max(0, Math.floor(Number(dependents.value) || 0));
      const benefitsValue = parseMoney(benefits.value);
      const otherDiscountsValue = parseMoney(otherDiscounts.value);
      const inss = calculateInss(grossValue);
      const legalIrrfDeduction = inss + dependentCount * dependentDeduction;
      const irrfDeduction = simplified.checked
        ? Math.max(legalIrrfDeduction, simplifiedIrrfDeduction)
        : legalIrrfDeduction;
      const irrfBase = Math.max(0, grossValue - irrfDeduction);
      const irrf = calculateIrrf(irrfBase);
      const fgts = grossValue * 0.08;
      const netSalary = grossValue - inss - irrf - otherDiscountsValue + benefitsValue;

      result.hidden = false;
      breakdown.hidden = false;
      net.textContent = formatCurrency(netSalary);
      breakdown.innerHTML = renderBreakdown([
        ["Salário bruto", grossValue],
        ["INSS", -inss],
        ["Base IRRF", irrfBase],
        ["IRRF", -irrf],
        ["Benefícios", benefitsValue],
        ["Outros descontos", -otherDiscountsValue],
        ["FGTS informativo", fgts]
      ]);
      setToolMessage(message, "Cálculo concluído.");
    });

    [gross, dependents, benefits, otherDiscounts, simplified].forEach((field) => {
      field.addEventListener("input", () => {
        if (result.hidden || !gross.value.trim()) return;
        form.requestSubmit();
      });
    });

    setToolMessage(message, "Digite o salário bruto para começar.");
  }

  function calculateInss(gross) {
    let previousLimit = 0;
    let contribution = 0;

    for (const range of inssRanges) {
      if (gross <= previousLimit) break;

      const taxable = Math.min(gross, range.limit) - previousLimit;
      contribution += taxable * range.rate;
      previousLimit = range.limit;
    }

    return contribution;
  }

  function calculateIrrf(base) {
    const range = irrfRanges.find((item) => base <= item.limit);
    return Math.max(0, base * range.rate - range.deduction);
  }

  function renderBreakdown(items) {
    return items.map(([label, value]) => {
      const negative = value < 0;
      return `
        <div class="breakdown-item ${negative ? "negative" : ""}">
          <strong>${formatCurrency(Math.abs(value))}</strong>
          <span>${negative ? "- " : ""}${label}</span>
        </div>
      `;
    }).join("");
  }

  function parseMoney(value) {
    if (!value) return 0;

    const normalized = value
      .trim()
      .replace(/[R$\s]/gi, "")
      .replace(/\./g, "")
      .replace(",", ".");

    const number = Number(normalized);
    return Number.isFinite(number) ? Math.max(0, number) : 0;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }
})();
