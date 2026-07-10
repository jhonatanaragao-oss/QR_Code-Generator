(function registerUnitConverter() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Conversor de unidade"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Conversor de unidade": renderUnitConverterPanel
  };

  const unitGroups = {
    length: {
      label: "Comprimento",
      base: "m",
      units: {
        mm: { label: "Milímetro", factor: 0.001 },
        cm: { label: "Centímetro", factor: 0.01 },
        m: { label: "Metro", factor: 1 },
        km: { label: "Quilômetro", factor: 1000 },
        in: { label: "Polegada", factor: 0.0254 },
        ft: { label: "Pé", factor: 0.3048 },
        yd: { label: "Jarda", factor: 0.9144 },
        mi: { label: "Milha", factor: 1609.344 }
      }
    },
    weight: {
      label: "Peso / Massa",
      base: "g",
      units: {
        mg: { label: "Miligrama", factor: 0.001 },
        g: { label: "Grama", factor: 1 },
        kg: { label: "Quilograma", factor: 1000 },
        t: { label: "Tonelada", factor: 1000000 },
        oz: { label: "Onça", factor: 28.349523125 },
        lb: { label: "Libra", factor: 453.59237 }
      }
    },
    volume: {
      label: "Volume",
      base: "l",
      units: {
        ml: { label: "Mililitro", factor: 0.001 },
        l: { label: "Litro", factor: 1 },
        m3: { label: "Metro cúbico", factor: 1000 },
        tsp: { label: "Colher chá", factor: 0.0049289216 },
        tbsp: { label: "Colher sopa", factor: 0.0147867648 },
        cup: { label: "Xícara", factor: 0.24 },
        gal: { label: "Galão", factor: 3.785411784 }
      }
    },
    temperature: {
      label: "Temperatura",
      base: "c",
      units: {
        c: { label: "Celsius" },
        f: { label: "Fahrenheit" },
        k: { label: "Kelvin" }
      }
    }
  };

  function renderUnitConverterPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Converta rapidamente medidas comuns entre sistemas métrico e imperial.</p>

      <form class="tool-form" id="unit-converter-form" novalidate>
        <label for="unit-group">
          Categoria
          <select class="tool-input" id="unit-group"></select>
        </label>

        <label for="unit-value">
          Valor
          <input class="tool-input" id="unit-value" type="number" step="any" placeholder="Digite um valor">
        </label>

        <div class="unit-row">
          <label for="unit-from">
            De
            <select class="tool-input" id="unit-from"></select>
          </label>

          <button class="swap-button" id="swap-units" type="button" aria-label="Inverter unidades">⇄</button>

          <label for="unit-to">
            Para
            <select class="tool-input" id="unit-to"></select>
          </label>
        </div>

        <p class="tool-message" id="unit-message" aria-live="polite"></p>
      </form>

      <div class="converter-result" id="unit-result">
        <span>Resultado</span>
        <strong>—</strong>
      </div>

      <div class="quick-conversions" id="quick-conversions"></div>
    `);

    setupUnitConverter(setToolMessage);
  }

  function setupUnitConverter(setToolMessage) {
    const group = document.querySelector("#unit-group");
    const value = document.querySelector("#unit-value");
    const from = document.querySelector("#unit-from");
    const to = document.querySelector("#unit-to");
    const swap = document.querySelector("#swap-units");
    const message = document.querySelector("#unit-message");
    const result = document.querySelector("#unit-result strong");
    const quick = document.querySelector("#quick-conversions");

    group.innerHTML = Object.entries(unitGroups)
      .map(([key, item]) => `<option value="${key}">${item.label}</option>`)
      .join("");

    function updateUnitOptions() {
      const selectedGroup = unitGroups[group.value];
      const options = Object.entries(selectedGroup.units)
        .map(([key, item]) => `<option value="${key}">${item.label} (${key})</option>`)
        .join("");

      from.innerHTML = options;
      to.innerHTML = options;

      const unitKeys = Object.keys(selectedGroup.units);
      from.value = unitKeys[0];
      to.value = unitKeys[1] || unitKeys[0];

      if (group.value === "length") {
        from.value = "m";
        to.value = "cm";
      }

      if (group.value === "temperature") {
        from.value = "c";
        to.value = "f";
      }

      convert();
    }

    function convert() {
      const numericValue = Number(value.value);

      if (value.value === "" || Number.isNaN(numericValue)) {
        result.textContent = "—";
        quick.innerHTML = "";
        setToolMessage(message, "Digite um valor para converter.");
        return;
      }

      const converted = convertValue(numericValue, from.value, to.value, group.value);
      const formatted = formatNumber(converted);
      const toLabel = unitGroups[group.value].units[to.value].label;

      result.textContent = `${formatted} ${toLabel}`;
      setToolMessage(message, "Conversão atualizada.");
      renderQuickConversions(numericValue, from.value, group.value, quick);
    }

    group.addEventListener("change", updateUnitOptions);
    value.addEventListener("input", convert);
    from.addEventListener("change", convert);
    to.addEventListener("change", convert);
    swap.addEventListener("click", () => {
      const currentFrom = from.value;
      from.value = to.value;
      to.value = currentFrom;
      convert();
    });

    updateUnitOptions();
  }

  function convertValue(value, from, to, groupKey) {
    if (groupKey === "temperature") {
      return convertTemperature(value, from, to);
    }

    const units = unitGroups[groupKey].units;
    const baseValue = value * units[from].factor;
    return baseValue / units[to].factor;
  }

  function convertTemperature(value, from, to) {
    let celsius = value;

    if (from === "f") celsius = (value - 32) * 5 / 9;
    if (from === "k") celsius = value - 273.15;
    if (to === "f") return celsius * 9 / 5 + 32;
    if (to === "k") return celsius + 273.15;
    return celsius;
  }

  function renderQuickConversions(value, from, groupKey, container) {
    const units = unitGroups[groupKey].units;

    container.innerHTML = Object.keys(units)
      .filter((unit) => unit !== from)
      .slice(0, 6)
      .map((unit) => {
        const converted = convertValue(value, from, unit, groupKey);
        return `
          <div class="quick-conversion">
            <strong>${formatNumber(converted)}</strong>
            <span>${units[unit].label}</span>
          </div>
        `;
      })
      .join("");
  }

  function formatNumber(value) {
    return new Intl.NumberFormat("pt-BR", {
      maximumFractionDigits: 6
    }).format(value);
  }
})();
