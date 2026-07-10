(function registerFileConverter() {
  window.externalActiveTools = [
    ...(window.externalActiveTools || []),
    "Conversor de arquivos"
  ];

  window.toolRenderers = {
    ...(window.toolRenderers || {}),
    "Conversor de arquivos": renderFileConverterPanel
  };

  const outputTypes = {
    png: { label: "PNG", mime: "image/png", extension: "png" },
    jpg: { label: "JPG", mime: "image/jpeg", extension: "jpg" },
    webp: { label: "WEBP", mime: "image/webp", extension: "webp" },
    pdf: { label: "PDF", mime: "application/pdf", extension: "pdf" }
  };

  function renderFileConverterPanel(tool, { renderPanelShell, setToolMessage }) {
    renderPanelShell(tool, `
      <p>Converta imagens entre PNG, JPG, WEBP e gere PDF a partir de imagem ou SVG.</p>

      <form class="tool-form" id="file-converter-form" novalidate>
        <label class="drop-zone" for="file-converter-input" id="file-drop-zone">
          <strong>Selecionar arquivo</strong>
          <span>PNG, JPG, WEBP ou SVG</span>
          <input id="file-converter-input" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml">
        </label>

        <label for="file-output-type">
          Converter para
          <select class="tool-input" id="file-output-type">
            <option value="png">PNG</option>
            <option value="jpg">JPG</option>
            <option value="webp">WEBP</option>
            <option value="pdf">PDF</option>
          </select>
        </label>

        <label for="file-quality">
          Qualidade
          <input class="tool-input" id="file-quality" type="range" min="50" max="100" value="92">
        </label>

        <div class="split-actions">
          <button class="primary-action" type="submit" disabled id="convert-file">Converter</button>
          <button class="secondary-action" type="button" disabled id="download-converted-file">Baixar</button>
        </div>

        <p class="tool-message" id="file-converter-message" aria-live="polite"></p>
      </form>

      <div class="file-preview" id="file-preview" hidden>
        <img id="file-preview-image" alt="Prévia do arquivo enviado">
      </div>

      <div class="file-meta" id="file-meta" hidden></div>
    `);

    setupFileConverter(setToolMessage);
  }

  function setupFileConverter(setToolMessage) {
    const form = document.querySelector("#file-converter-form");
    const input = document.querySelector("#file-converter-input");
    const dropZone = document.querySelector("#file-drop-zone");
    const outputType = document.querySelector("#file-output-type");
    const quality = document.querySelector("#file-quality");
    const convertButton = document.querySelector("#convert-file");
    const downloadButton = document.querySelector("#download-converted-file");
    const message = document.querySelector("#file-converter-message");
    const preview = document.querySelector("#file-preview");
    const previewImage = document.querySelector("#file-preview-image");
    const meta = document.querySelector("#file-meta");
    let currentFile = null;
    let convertedBlob = null;
    let convertedFilename = "";

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (file) loadFile(file);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.add("dragging");
      });
    });

    ["dragleave", "drop"].forEach((eventName) => {
      dropZone.addEventListener(eventName, (event) => {
        event.preventDefault();
        dropZone.classList.remove("dragging");
      });
    });

    dropZone.addEventListener("drop", (event) => {
      const file = event.dataTransfer.files?.[0];
      if (file) loadFile(file);
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!currentFile) return;

      convertButton.disabled = true;
      downloadButton.disabled = true;
      setToolMessage(message, "Convertendo arquivo...");

      try {
        const image = await readImage(currentFile);
        convertedBlob = outputType.value === "pdf"
          ? await createPdfFromCanvasImage(image)
          : await convertImage(image, outputTypes[outputType.value].mime, Number(quality.value) / 100);

        convertedFilename = buildFilename(currentFile.name, outputTypes[outputType.value].extension);
        downloadButton.disabled = false;
        setToolMessage(message, `Arquivo convertido para ${outputTypes[outputType.value].label}.`);
        renderMeta(meta, currentFile, convertedBlob, image);
      } catch {
        convertedBlob = null;
        setToolMessage(message, "Não foi possível converter esse arquivo.", true);
      } finally {
        convertButton.disabled = false;
      }
    });

    downloadButton.addEventListener("click", () => {
      if (!convertedBlob) return;
      saveBlob(convertedBlob, convertedFilename);
      setToolMessage(message, "Download iniciado.");
    });

    outputType.addEventListener("change", () => {
      convertedBlob = null;
      downloadButton.disabled = true;
      quality.disabled = outputType.value === "pdf" || outputType.value === "png";
    });

    function loadFile(file) {
      if (!isSupportedFile(file)) {
        setToolMessage(message, "Envie uma imagem PNG, JPG, WEBP ou SVG.", true);
        return;
      }

      currentFile = file;
      convertedBlob = null;
      convertButton.disabled = false;
      downloadButton.disabled = true;
      preview.hidden = false;
      previewImage.src = URL.createObjectURL(file);
      meta.hidden = false;
      meta.innerHTML = `
        <div><strong>${file.name}</strong><span>Arquivo original</span></div>
        <div><strong>${formatBytes(file.size)}</strong><span>Tamanho</span></div>
      `;
      setToolMessage(message, "Arquivo pronto para converter.");
    }
  }

  function isSupportedFile(file) {
    return ["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type);
  }

  async function readImage(file) {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.decoding = "async";
    image.src = url;

    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });

    URL.revokeObjectURL(url);
    return image;
  }

  async function convertImage(image, mimeType, quality) {
    const canvas = drawImageToCanvas(image, mimeType === "image/jpeg");

    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Conversion failed"));
      }, mimeType, quality);
    });
  }

  function drawImageToCanvas(image, fillWhite = false) {
    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext("2d");
    if (fillWhite) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
    }
    context.drawImage(image, 0, 0);

    return canvas;
  }

  async function createPdfFromCanvasImage(image) {
    const canvas = drawImageToCanvas(image, true);
    const jpegBlob = await new Promise((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });
    const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());
    const encoder = new TextEncoder();
    const pageWidth = 595;
    const pageHeight = 842;
    const maxWidth = 455;
    const maxHeight = 700;
    const scale = Math.min(maxWidth / canvas.width, maxHeight / canvas.height);
    const imageWidth = canvas.width * scale;
    const imageHeight = canvas.height * scale;
    const imageX = (pageWidth - imageWidth) / 2;
    const imageY = (pageHeight - imageHeight) / 2;
    const content = `q\n${imageWidth} 0 0 ${imageHeight} ${imageX} ${imageY} cm\n/Im1 Do\nQ\n`;

    const objects = [
      encoder.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"),
      encoder.encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"),
      encoder.encode(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im1 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n`),
      [
        encoder.encode(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
        jpegBytes,
        encoder.encode("\nendstream\nendobj\n")
      ],
      encoder.encode(`5 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`)
    ];

    const chunks = [encoder.encode("%PDF-1.4\n")];
    const offsets = [0];
    let length = chunks[0].length;

    for (const object of objects) {
      offsets.push(length);
      const parts = Array.isArray(object) ? object : [object];
      for (const part of parts) {
        chunks.push(part);
        length += part.length;
      }
    }

    const xrefOffset = length;
    let xref = "xref\n0 6\n0000000000 65535 f \n";
    for (let index = 1; index < offsets.length; index++) {
      xref += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
    }
    xref += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    chunks.push(encoder.encode(xref));

    return new Blob(chunks, { type: "application/pdf" });
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
    const cleanName = filename.replace(/\.[^.]+$/, "") || "arquivo-convertido";
    return `${cleanName}.${extension}`;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  }

  function renderMeta(container, sourceFile, convertedBlob, image) {
    container.hidden = false;
    container.innerHTML = `
      <div><strong>${image.naturalWidth || image.width} × ${image.naturalHeight || image.height}</strong><span>Dimensões</span></div>
      <div><strong>${formatBytes(sourceFile.size)}</strong><span>Original</span></div>
      <div><strong>${formatBytes(convertedBlob.size)}</strong><span>Convertido</span></div>
    `;
  }
})();
