(function registerImageResizer() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Redimensionador de imagem"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Redimensionador de imagem": renderImageResizerPanel
  };

  const presets = {
    custom: { label: "Personalizado", width: 1080, height: 1080 },
    instagramPost: { label: "Instagram post", width: 1080, height: 1080 },
    instagramStory: { label: "Instagram story", width: 1080, height: 1920 },
    linkedinPost: { label: "LinkedIn post", width: 1200, height: 627 },
    facebookPost: { label: "Facebook post", width: 1200, height: 630 },
    whatsappStatus: { label: "WhatsApp status", width: 1080, height: 1920 }
  };

  const outputFormats = {
    png: { mime: "image/png", extension: "png" },
    jpg: { mime: "image/jpeg", extension: "jpg" },
    webp: { mime: "image/webp", extension: "webp" }
  };

  function renderImageResizerPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Redimensione imagens para tamanhos personalizados ou formatos comuns de redes sociais.</p>

      <form class="tool-form" id="image-resizer-form" novalidate>
        <label class="drop-zone" for="image-resizer-input" id="image-resizer-drop">
          <strong>Selecionar imagem</strong>
          <span>PNG, JPG ou WEBP</span>
          <input id="image-resizer-input" type="file" accept="image/png,image/jpeg,image/webp">
        </label>

        <label for="image-resizer-preset">
          Tamanho
          <select class="tool-input" id="image-resizer-preset"></select>
        </label>

        <div class="unit-row">
          <label for="image-resizer-width">
            Largura (px)
            <input class="tool-input" id="image-resizer-width" type="number" min="1" step="1" value="1080">
          </label>

          <span></span>

          <label for="image-resizer-height">
            Altura (px)
            <input class="tool-input" id="image-resizer-height" type="number" min="1" step="1" value="1080">
          </label>
        </div>

        <div class="unit-row">
          <label for="image-resizer-fit">
            Ajuste
            <select class="tool-input" id="image-resizer-fit">
              <option value="contain">Conter sem cortar</option>
              <option value="cover">Preencher e cortar</option>
              <option value="stretch">Esticar</option>
            </select>
          </label>

          <span></span>

          <label for="image-resizer-format">
            Formato
            <select class="tool-input" id="image-resizer-format">
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WEBP</option>
            </select>
          </label>
        </div>

        <label for="image-resizer-quality">
          Qualidade
          <input class="tool-input" id="image-resizer-quality" type="range" min="50" max="100" value="92">
        </label>

        <div class="split-actions">
          <button class="primary-action" id="resize-image" type="submit" disabled>Redimensionar</button>
          <button class="secondary-action" id="download-resized-image" type="button" disabled>Baixar</button>
        </div>

        <p class="tool-message" id="image-resizer-message" aria-live="polite"></p>
      </form>

      <div class="file-preview" id="image-resizer-preview" hidden>
        <img id="image-resizer-preview-img" alt="Prévia da imagem redimensionada">
      </div>

      <div class="file-meta" id="image-resizer-meta" hidden></div>
    `);

    setupImageResizer(setToolMessage);
  }

  function setupImageResizer(setToolMessage) {
    const form = document.querySelector("#image-resizer-form");
    const input = document.querySelector("#image-resizer-input");
    const drop = document.querySelector("#image-resizer-drop");
    const preset = document.querySelector("#image-resizer-preset");
    const width = document.querySelector("#image-resizer-width");
    const height = document.querySelector("#image-resizer-height");
    const fit = document.querySelector("#image-resizer-fit");
    const format = document.querySelector("#image-resizer-format");
    const quality = document.querySelector("#image-resizer-quality");
    const resizeButton = document.querySelector("#resize-image");
    const downloadButton = document.querySelector("#download-resized-image");
    const message = document.querySelector("#image-resizer-message");
    const preview = document.querySelector("#image-resizer-preview");
    const previewImage = document.querySelector("#image-resizer-preview-img");
    const meta = document.querySelector("#image-resizer-meta");
    let sourceFile = null;
    let sourceImage = null;
    let outputBlob = null;
    let outputFilename = "";

    preset.innerHTML = Object.entries(presets)
      .map(([key, item]) => `<option value="${key}">${item.label} (${item.width}×${item.height})</option>`)
      .join("");

    preset.addEventListener("change", () => {
      const item = presets[preset.value];
      width.value = item.width;
      height.value = item.height;
      clearOutput();
    });

    [width, height, fit, format, quality].forEach((field) => {
      field.addEventListener("input", clearOutput);
    });

    format.addEventListener("change", () => {
      quality.disabled = format.value === "png";
    });

    input.addEventListener("change", async () => {
      const file = input.files?.[0];
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

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!sourceImage) {
        setToolMessage(message, "Selecione uma imagem para redimensionar.", true);
        return;
      }

      const targetWidth = Number(width.value);
      const targetHeight = Number(height.value);

      if (!Number.isFinite(targetWidth) || !Number.isFinite(targetHeight) || targetWidth <= 0 || targetHeight <= 0) {
        setToolMessage(message, "Informe largura e altura válidas.", true);
        return;
      }

      resizeButton.disabled = true;
      downloadButton.disabled = true;
      setToolMessage(message, "Redimensionando imagem...");

      try {
        const canvas = resizeImage(sourceImage, targetWidth, targetHeight, fit.value, format.value === "jpg");
        outputBlob = await canvasToBlob(canvas, outputFormats[format.value].mime, Number(quality.value) / 100);
        outputFilename = buildFilename(sourceFile.name, outputFormats[format.value].extension);
        preview.hidden = false;
        previewImage.src = URL.createObjectURL(outputBlob);
        downloadButton.disabled = false;
        renderMeta(meta, sourceFile, outputBlob, sourceImage, targetWidth, targetHeight);
        setToolMessage(message, "Imagem redimensionada.");
      } catch {
        setToolMessage(message, "Não foi possível redimensionar essa imagem.", true);
      } finally {
        resizeButton.disabled = false;
      }
    });

    downloadButton.addEventListener("click", () => {
      if (!outputBlob) return;
      saveBlob(outputBlob, outputFilename);
      setToolMessage(message, "Download iniciado.");
    });

    async function loadImage(file) {
      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        setToolMessage(message, "Envie uma imagem PNG, JPG ou WEBP.", true);
        return;
      }

      try {
        sourceFile = file;
        sourceImage = await readImage(file);
        resizeButton.disabled = false;
        clearOutput();
        preview.hidden = false;
        previewImage.src = URL.createObjectURL(file);
        meta.hidden = false;
        meta.innerHTML = `
          <div><strong>${sourceImage.naturalWidth} × ${sourceImage.naturalHeight}</strong><span>Original</span></div>
          <div><strong>${formatBytes(file.size)}</strong><span>Tamanho</span></div>
        `;
        setToolMessage(message, "Imagem pronta para redimensionar.");
      } catch {
        setToolMessage(message, "Não foi possível carregar essa imagem.", true);
      }
    }

    function clearOutput() {
      outputBlob = null;
      outputFilename = "";
      downloadButton.disabled = true;
      if (sourceImage) setToolMessage(message, "Clique em redimensionar para gerar uma nova imagem.");
    }

    quality.disabled = format.value === "png";
  }

  function resizeImage(image, width, height, fit, fillWhite) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");

    if (fillWhite || fit === "contain") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }

    if (fit === "stretch") {
      context.drawImage(image, 0, 0, width, height);
      return canvas;
    }

    const sourceRatio = image.naturalWidth / image.naturalHeight;
    const targetRatio = width / height;
    const scale = fit === "cover"
      ? (sourceRatio > targetRatio ? height / image.naturalHeight : width / image.naturalWidth)
      : (sourceRatio > targetRatio ? width / image.naturalWidth : height / image.naturalHeight);
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;

    context.drawImage(image, x, y, drawWidth, drawHeight);
    return canvas;
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
      image.onerror = reject;
    });
  }

  function canvasToBlob(canvas, mimeType, quality) {
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Falha ao exportar imagem."));
      }, mimeType, quality);
    });
  }

  function saveBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function buildFilename(filename, extension) {
    const cleanName = filename.replace(/\.[^.]+$/, "") || "imagem";
    return `${cleanName}-${Date.now()}.${extension}`;
  }

  function renderMeta(container, sourceFile, outputBlob, sourceImage, width, height) {
    container.hidden = false;
    container.innerHTML = `
      <div><strong>${sourceImage.naturalWidth} × ${sourceImage.naturalHeight}</strong><span>Original</span></div>
      <div><strong>${width} × ${height}</strong><span>Novo tamanho</span></div>
      <div><strong>${formatBytes(outputBlob.size)}</strong><span>Arquivo final</span></div>
      <div><strong>${formatBytes(sourceFile.size)}</strong><span>Arquivo original</span></div>
    `;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }
})();
