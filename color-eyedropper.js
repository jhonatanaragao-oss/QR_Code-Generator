(function registerColorEyedropper() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Conta-gotas de cor"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Conta-gotas de cor": renderColorEyedropperPanel
  };

  function renderColorEyedropperPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Capture uma cor da tela, informe um HEX manualmente ou selecione uma cor a partir de uma imagem.</p>

      <form class="tool-form" id="eyedropper-form" novalidate>
        <div class="split-actions">
          <button class="primary-action" id="pick-screen-color" type="button">Pegar cor da tela</button>
          <button class="secondary-action" id="copy-color-values" type="button" disabled>Copiar formatos</button>
        </div>

        <div class="unit-row">
          <label for="manual-color">
            Cor manual
            <input class="tool-input" id="manual-color" type="color" value="#087a70">
          </label>

          <span></span>

          <label for="manual-hex">
            Código HEX
            <input class="tool-input" id="manual-hex" type="text" value="#087A70" maxlength="7" placeholder="#087A70">
          </label>
        </div>

        <button class="secondary-action" id="apply-manual-color" type="submit">Aplicar cor</button>

        <label class="drop-zone" for="eyedropper-image-input" id="eyedropper-drop">
          <strong>Selecionar imagem</strong>
          <span>PNG, JPG ou WEBP para capturar uma cor clicando na imagem</span>
          <input id="eyedropper-image-input" type="file" accept="image/png,image/jpeg,image/webp">
        </label>

        <p class="tool-message" id="eyedropper-message" aria-live="polite"></p>
      </form>

      <div class="eyedropper-result" id="eyedropper-result" hidden>
        <div class="eyedropper-swatch" id="eyedropper-swatch"></div>
        <div>
          <span>Cor selecionada</span>
          <strong id="eyedropper-main">#087A70</strong>
        </div>
      </div>

      <div class="breakdown-grid" id="eyedropper-values" hidden></div>

      <div class="eyedropper-canvas-wrap" id="eyedropper-canvas-wrap" hidden>
        <canvas id="eyedropper-canvas"></canvas>
      </div>

      <div class="eyedropper-history" id="eyedropper-history" hidden></div>
    `);

    setupColorEyedropper(setToolMessage);
  }

  function setupColorEyedropper(setToolMessage) {
    const form = document.querySelector("#eyedropper-form");
    const pickButton = document.querySelector("#pick-screen-color");
    const copyButton = document.querySelector("#copy-color-values");
    const colorInput = document.querySelector("#manual-color");
    const hexInput = document.querySelector("#manual-hex");
    const imageInput = document.querySelector("#eyedropper-image-input");
    const drop = document.querySelector("#eyedropper-drop");
    const message = document.querySelector("#eyedropper-message");
    const result = document.querySelector("#eyedropper-result");
    const swatch = document.querySelector("#eyedropper-swatch");
    const main = document.querySelector("#eyedropper-main");
    const values = document.querySelector("#eyedropper-values");
    const canvasWrap = document.querySelector("#eyedropper-canvas-wrap");
    const canvas = document.querySelector("#eyedropper-canvas");
    const history = document.querySelector("#eyedropper-history");
    const context = canvas.getContext("2d", { willReadFrequently: true });
    let currentColor = "";
    let currentFormats = null;
    let colorHistory = [];

    if (!("EyeDropper" in window)) {
      pickButton.disabled = true;
      pickButton.title = "Conta-gotas nativo indisponível neste navegador.";
    }

    pickButton.addEventListener("click", async () => {
      if (!("EyeDropper" in window)) {
        setToolMessage(message, "Seu navegador não liberou o conta-gotas nativo. Use HEX manual ou imagem.", true);
        return;
      }

      try {
        setToolMessage(message, "Clique em qualquer ponto da tela para capturar a cor.");
        const picker = new EyeDropper();
        const resultColor = await picker.open();
        setColor(resultColor.sRGBHex, "Conta-gotas da tela");
      } catch {
        setToolMessage(message, "Captura cancelada.");
      }
    });

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const normalized = normalizeHex(hexInput.value);

      if (!normalized) {
        setToolMessage(message, "Informe um HEX válido, como #087A70.", true);
        hexInput.focus();
        return;
      }

      setColor(normalized, "Entrada manual");
    });

    colorInput.addEventListener("input", () => {
      hexInput.value = colorInput.value.toUpperCase();
    });

    hexInput.addEventListener("input", () => {
      const normalized = normalizeHex(hexInput.value);
      if (normalized) colorInput.value = normalized;
    });

    copyButton.addEventListener("click", async () => {
      if (!currentFormats) return;

      const text = [
        `HEX: ${currentFormats.hex}`,
        `RGB: ${currentFormats.rgb}`,
        `HSL: ${currentFormats.hsl}`,
        `CMYK: ${currentFormats.cmyk}`
      ].join("\n");

      try {
        await navigator.clipboard.writeText(text);
        setToolMessage(message, "Formatos copiados.");
      } catch {
        setToolMessage(message, "Formatos prontos para copiar manualmente.");
      }
    });

    imageInput.addEventListener("change", async () => {
      const file = imageInput.files?.[0];
      if (file) await loadImage(file);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      drop.addEventListener(eventName, (event) => {
        event.preventDefault();
        drop.classList.add("dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      drop.addEventListener(eventName, (event) => {
        event.preventDefault();
        drop.classList.remove("dragging");
      });
    });

    drop.addEventListener("drop", async (event) => {
      const file = event.dataTransfer.files?.[0];
      if (file) await loadImage(file);
    });

    canvas.addEventListener("click", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = Math.floor((event.clientX - rect.left) * (canvas.width / rect.width));
      const y = Math.floor((event.clientY - rect.top) * (canvas.height / rect.height));
      const pixel = context.getImageData(x, y, 1, 1).data;
      setColor(rgbToHex(pixel[0], pixel[1], pixel[2]), "Imagem");
    });

    setColor("#087A70", "Cor inicial");

    async function loadImage(file) {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        setToolMessage(message, "Envie uma imagem PNG, JPG ou WEBP.", true);
        return;
      }

      try {
        const image = await readImage(file);
        const maxSide = 900;
        const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        canvas.width = Math.round(image.naturalWidth * scale);
        canvas.height = Math.round(image.naturalHeight * scale);
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        canvasWrap.hidden = false;
        setToolMessage(message, "Imagem carregada. Clique em um ponto da imagem para capturar a cor.");
      } catch {
        setToolMessage(message, "Não foi possível carregar essa imagem.", true);
      }
    }

    function setColor(hex, source) {
      const normalized = normalizeHex(hex);
      if (!normalized) return;

      currentColor = normalized;
      currentFormats = getColorFormats(normalized);
      colorInput.value = normalized;
      hexInput.value = normalized.toUpperCase();
      result.hidden = false;
      values.hidden = false;
      copyButton.disabled = false;
      swatch.style.background = normalized;
      main.textContent = normalized.toUpperCase();
      values.innerHTML = renderBreakdown([
        ["HEX", currentFormats.hex],
        ["RGB", currentFormats.rgb],
        ["HSL", currentFormats.hsl],
        ["CMYK", currentFormats.cmyk]
      ]);
      pushHistory(normalized);
      setToolMessage(message, `${source}: ${normalized.toUpperCase()}`);
    }

    function pushHistory(hex) {
      colorHistory = [hex, ...colorHistory.filter((item) => item !== hex)].slice(0, 10);
      history.hidden = colorHistory.length === 0;
      history.innerHTML = colorHistory
        .map((item) => `<button type="button" style="background:${item}" data-color="${item}" aria-label="Usar cor ${item}"><span>${item.toUpperCase()}</span></button>`)
        .join("");

      history.querySelectorAll("[data-color]").forEach((button) => {
        button.addEventListener("click", () => setColor(button.dataset.color, "Histórico"));
      });
    }
  }

  function readImage(file) {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.src = url;

    return new Promise((resolve, reject) => {
      image.onload = () => {
        URL.revokeObjectURL(url);
        resolve(image);
      };
      image.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Imagem inválida."));
      };
    });
  }

  function renderBreakdown(items) {
    return items.map(([label, value]) => `
      <div class="breakdown-item">
        <strong>${value}</strong>
        <span>${label}</span>
      </div>
    `).join("");
  }

  function normalizeHex(value) {
    const clean = String(value || "").trim().replace(/^#/, "");
    if (/^[0-9a-f]{3}$/i.test(clean)) {
      return `#${clean.split("").map((char) => char + char).join("")}`.toUpperCase();
    }

    if (/^[0-9a-f]{6}$/i.test(clean)) return `#${clean}`.toUpperCase();
    return "";
  }

  function getColorFormats(hex) {
    const rgb = hexToRgb(hex);
    return {
      hex: hex.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
      cmyk: rgbToCmyk(rgb.r, rgb.g, rgb.b)
    };
  }

  function hexToRgb(hex) {
    const value = hex.replace("#", "");
    return {
      r: parseInt(value.slice(0, 2), 16),
      g: parseInt(value.slice(2, 4), 16),
      b: parseInt(value.slice(4, 6), 16)
    };
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
  }

  function rgbToHsl(r, g, b) {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let hue = 0;
    let saturation = 0;
    const lightness = (max + min) / 2;

    if (max !== min) {
      const delta = max - min;
      saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
      if (max === red) hue = (green - blue) / delta + (green < blue ? 6 : 0);
      if (max === green) hue = (blue - red) / delta + 2;
      if (max === blue) hue = (red - green) / delta + 4;
      hue /= 6;
    }

    return `hsl(${Math.round(hue * 360)}, ${Math.round(saturation * 100)}%, ${Math.round(lightness * 100)}%)`;
  }

  function rgbToCmyk(r, g, b) {
    if (r === 0 && g === 0 && b === 0) return "cmyk(0%, 0%, 0%, 100%)";

    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const key = 1 - Math.max(red, green, blue);
    const cyan = (1 - red - key) / (1 - key);
    const magenta = (1 - green - key) / (1 - key);
    const yellow = (1 - blue - key) / (1 - key);

    return `cmyk(${Math.round(cyan * 100)}%, ${Math.round(magenta * 100)}%, ${Math.round(yellow * 100)}%, ${Math.round(key * 100)}%)`;
  }
})();
