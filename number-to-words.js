(function registerNumberToWords() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Conversor de valor por extenso"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Conversor de valor por extenso": renderNumberToWordsPanel
  };

  const units = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const teens = ["dez", "onze", "doze", "treze", "quatorze", "quinze", "dezesseis", "dezessete", "dezoito", "dezenove"];
  const tens = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const hundreds = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];
  const scales = [
    { singular: "", plural: "" },
    { singular: "mil", plural: "mil" },
    { singular: "milhão", plural: "milhões" },
    { singular: "bilhão", plural: "bilhões" },
    { singular: "trilhão", plural: "trilhões" }
  ];

  function renderNumberToWordsPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Converta números e valores monetários para texto por extenso em português.</p>

      <form class="tool-form" id="number-words-form" novalidate>
        <label for="number-words-value">
          Valor
          <input class="tool-input" id="number-words-value" type="text" inputmode="decimal" placeholder="Ex.: 1234,56">
        </label>

        <label for="number-words-mode">
          Tipo
          <select class="tool-input" id="number-words-mode">
            <option value="currency">Valor em reais</option>
            <option value="number">Número simples</option>
          </select>
        </label>

        <div class="split-actions">
          <button class="primary-action" type="submit">Converter</button>
          <button class="secondary-action" id="copy-number-words" type="button" disabled>Copiar</button>
        </div>

        <p class="tool-message" id="number-words-message" aria-live="polite"></p>
      </form>

      <div class="text-result featured-result" id="number-words-output" hidden></div>
    `);

    setupNumberToWords(setToolMessage);
  }

  function setupNumberToWords(setToolMessage) {
    const form = document.querySelector("#number-words-form");
    const input = document.querySelector("#number-words-value");
    const mode = document.querySelector("#number-words-mode");
    const copy = document.querySelector("#copy-number-words");
    const message = document.querySelector("#number-words-message");
    const output = document.querySelector("#number-words-output");
    let currentText = "";

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const parsed = parseBrazilianNumber(input.value);

      if (!parsed) {
        setToolMessage(message, "Digite um número válido.", true);
        input.focus();
        return;
      }

      currentText = mode.value === "currency"
        ? currencyToWords(parsed)
        : simpleNumberToWords(parsed.integer);

      output.hidden = false;
      output.textContent = capitalize(currentText);
      copy.disabled = false;
      setToolMessage(message, "Conversão concluída.");
    });

    input.addEventListener("input", () => {
      copy.disabled = true;
      output.hidden = true;
      currentText = "";
      setToolMessage(message, "Digite um valor e clique em converter.");
    });

    mode.addEventListener("change", () => {
      if (input.value.trim()) form.requestSubmit();
    });

    copy.addEventListener("click", async () => {
      if (!currentText) return;

      try {
        await navigator.clipboard.writeText(capitalize(currentText));
        setToolMessage(message, "Texto copiado.");
      } catch {
        setToolMessage(message, "Texto pronto para copiar manualmente.");
      }
    });

    setToolMessage(message, "Digite um valor e clique em converter.");
  }

  function parseBrazilianNumber(value) {
    const cleaned = value.trim().replace(/\s/g, "");
    if (!cleaned) return null;

    const normalized = cleaned
      .replace(/[R$]/gi, "")
      .replace(/\./g, "")
      .replace(",", ".");

    if (!/^-?\d+(\.\d+)?$/.test(normalized)) return null;

    const numeric = Number(normalized);
    if (!Number.isFinite(numeric) || numeric < 0) return null;

    const fixed = numeric.toFixed(2);
    const [integerPart, decimalPart] = fixed.split(".");
    const integer = Number(integerPart);
    const cents = Number(decimalPart);

    if (!Number.isSafeInteger(integer) || integer > 999999999999999) return null;

    return { integer, cents };
  }

  function currencyToWords({ integer, cents }) {
    const parts = [];

    if (integer > 0) {
      parts.push(`${simpleNumberToWords(integer)} ${integer === 1 ? "real" : "reais"}`);
    }

    if (cents > 0) {
      parts.push(`${simpleNumberToWords(cents)} ${cents === 1 ? "centavo" : "centavos"}`);
    }

    if (parts.length === 0) return "zero real";
    return joinWithE(parts);
  }

  function simpleNumberToWords(number) {
    if (number === 0) return "zero";

    const groups = [];
    let remaining = number;

    while (remaining > 0) {
      groups.push(remaining % 1000);
      remaining = Math.floor(remaining / 1000);
    }

    const parts = [];

    for (let index = groups.length - 1; index >= 0; index--) {
      const groupValue = groups[index];
      if (groupValue === 0) continue;

      const scale = scales[index];
      let groupText = convertHundreds(groupValue);

      if (index === 1 && groupValue === 1) {
        groupText = "mil";
      } else if (index > 0) {
        groupText += ` ${groupValue === 1 ? scale.singular : scale.plural}`;
      }

      parts.push(groupText);
    }

    return joinNumberParts(parts, groups);
  }

  function convertHundreds(number) {
    if (number === 100) return "cem";

    const hundred = Math.floor(number / 100);
    const rest = number % 100;
    const parts = [];

    if (hundred > 0) parts.push(hundreds[hundred]);
    if (rest > 0) parts.push(convertTens(rest));

    return joinWithE(parts);
  }

  function convertTens(number) {
    if (number < 10) return units[number];
    if (number < 20) return teens[number - 10];

    const ten = Math.floor(number / 10);
    const unit = number % 10;

    if (unit === 0) return tens[ten];
    return `${tens[ten]} e ${units[unit]}`;
  }

  function joinWithE(parts) {
    if (parts.length <= 1) return parts[0] || "";
    return `${parts.slice(0, -1).join(", ")} e ${parts.at(-1)}`;
  }

  function joinNumberParts(parts, groups) {
    if (parts.length <= 1) return parts[0] || "";

    const lastGroup = groups.find((group) => group > 0);
    const separator = lastGroup < 100 || lastGroup % 100 === 0 ? " e " : ", ";
    return `${parts.slice(0, -1).join(", ")}${separator}${parts.at(-1)}`;
  }

  function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
})();
