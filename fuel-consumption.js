(function registerFuelConsumption() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Consumo de combustível"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Consumo de combustível": renderFuelPanel
  };

  function renderFuelPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Calcule Km/L, litros por 100 km, custo por km e gasto aproximado da viagem.</p>

      <form class="tool-form" id="fuel-form" novalidate>
        <div class="unit-row">
          <label for="fuel-distance">
            Distância percorrida (km)
            <input class="tool-input" id="fuel-distance" type="number" min="0.1" step="0.1" placeholder="Ex.: 320">
          </label>

          <span></span>

          <label for="fuel-liters">
            Combustível usado (L)
            <input class="tool-input" id="fuel-liters" type="number" min="0.1" step="0.01" placeholder="Ex.: 28">
          </label>
        </div>

        <div class="unit-row">
          <label for="fuel-price">
            Preço por litro (R$)
            <input class="tool-input" id="fuel-price" type="number" min="0" step="0.01" placeholder="Ex.: 5.89">
          </label>

          <span></span>

          <label for="fuel-tank">
            Tanque cheio (L)
            <input class="tool-input" id="fuel-tank" type="number" min="0" step="0.1" placeholder="Opcional">
          </label>
        </div>

        <button class="primary-action" type="submit">Calcular consumo</button>
        <p class="tool-message" id="fuel-message" aria-live="polite"></p>
      </form>

      <div class="salary-result" id="fuel-result" hidden>
        <span>Consumo médio</span>
        <strong id="fuel-average">0 km/L</strong>
      </div>

      <div class="breakdown-grid" id="fuel-breakdown" hidden></div>

      <p class="tool-note">Para mais precisão, abasteça até completar, zere o odômetro, rode normalmente e complete novamente para saber os litros usados.</p>
    `);

    setupFuelConsumption(setToolMessage);
  }

  function setupFuelConsumption(setToolMessage) {
    const form = document.querySelector("#fuel-form");
    const distance = document.querySelector("#fuel-distance");
    const liters = document.querySelector("#fuel-liters");
    const price = document.querySelector("#fuel-price");
    const tank = document.querySelector("#fuel-tank");
    const message = document.querySelector("#fuel-message");
    const result = document.querySelector("#fuel-result");
    const average = document.querySelector("#fuel-average");
    const breakdown = document.querySelector("#fuel-breakdown");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      calculate();
    });

    [distance, liters, price, tank].forEach((field) => {
      field.addEventListener("input", () => {
        if (result.hidden || !distance.value || !liters.value) return;
        calculate();
      });
    });

    setToolMessage(message, "Informe distância e litros usados para começar.");

    function calculate() {
      const distanceValue = Number(distance.value);
      const litersValue = Number(liters.value);

      if (!Number.isFinite(distanceValue) || distanceValue <= 0) {
        setToolMessage(message, "Informe uma distância válida em km.", true);
        distance.focus();
        return;
      }

      if (!Number.isFinite(litersValue) || litersValue <= 0) {
        setToolMessage(message, "Informe a quantidade de combustível usada.", true);
        liters.focus();
        return;
      }

      const priceValue = Math.max(0, Number(price.value) || 0);
      const tankValue = Math.max(0, Number(tank.value) || 0);
      const kmPerLiter = distanceValue / litersValue;
      const litersPer100Km = (litersValue / distanceValue) * 100;
      const totalCost = litersValue * priceValue;
      const costPerKm = priceValue > 0 ? totalCost / distanceValue : 0;
      const range = tankValue > 0 ? tankValue * kmPerLiter : 0;

      result.hidden = false;
      breakdown.hidden = false;
      average.textContent = `${formatNumber(kmPerLiter, 2)} km/L`;
      breakdown.innerHTML = renderBreakdown([
        ["Litros por 100 km", `${formatNumber(litersPer100Km, 2)} L`],
        ["Custo total", priceValue > 0 ? formatCurrency(totalCost) : "Informe o preço"],
        ["Custo por km", priceValue > 0 ? formatCurrency(costPerKm) : "Informe o preço"],
        ["Autonomia estimada", tankValue > 0 ? `${formatNumber(range, 0)} km` : "Informe o tanque"],
        ["Distância", `${formatNumber(distanceValue, 1)} km`],
        ["Combustível usado", `${formatNumber(litersValue, 2)} L`]
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

  function formatCurrency(value) {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL"
    }).format(value);
  }
})();
