const categories = [
  "Todas",
  "Texto",
  "Conversores",
  "Imagem",
  "Gerar",
  "Ferramentas",
  "Calculadoras",
  "Tempo e Data"
];

const tools = [
  {
    name: "Diferença entre textos",
    category: "Texto",
    description: "Compara dois textos e destaca exatamente o que mudou.",
    initials: "DT"
  },
  {
    name: "Gerador de Lorem Ipsum",
    category: "Texto",
    description: "Cria textos fictícios em tamanhos rápidos para layouts.",
    initials: "LI"
  },
  {
    name: "Contador de Caracteres",
    category: "Texto",
    description: "Conta caracteres, espaços e limites de texto.",
    initials: "CC"
  },
  {
    name: "Contador de Palavras",
    category: "Texto",
    description: "Conta palavras e ajuda a revisar textos curtos ou longos.",
    initials: "CP"
  },
  {
    name: "Conversor de unidade",
    category: "Conversores",
    description: "Converte medidas como mm, cm, m e polegadas.",
    initials: "UN"
  },
  {
    name: "Conversor de valor por extenso",
    category: "Conversores",
    description: "Transforma números e valores monetários em texto.",
    initials: "VE"
  },
  {
    name: "Conversor de arquivos",
    category: "Conversores",
    description: "Planejado para PDF, PNG, JPG, WEBP e SVG.",
    initials: "AR"
  },
  {
    name: "Redimensionador de imagem",
    category: "Imagem",
    description: "Tamanhos personalizados e formatos para redes sociais.",
    initials: "RI"
  },
  {
    name: "Removedor de fundo com IA",
    category: "Imagem",
    description: "Remoção de fundo planejada para integração com IA.",
    initials: "IA"
  },
  {
    name: "Compressor de imagem",
    category: "Imagem",
    description: "Reduz o peso de imagens mantendo boa qualidade visual.",
    initials: "CI"
  },
  {
    name: "Imagem para vetor simples",
    category: "Imagem",
    description: "Conversão futura para vetor com integração externa.",
    initials: "VS"
  },
  {
    name: "Gerador de paleta de cores",
    category: "Gerar",
    description: "Cria paletas a partir de imagem ou código HEX.",
    initials: "PC"
  },
  {
    name: "QR Code avançado",
    category: "Gerar",
    description: "Link, WhatsApp, e-mail, localização, Wi-Fi, Pix, vCard e texto livre.",
    initials: "QR"
  },
  {
    name: "Conta-gotas de cor",
    category: "Ferramentas",
    description: "Captura cores para uso rápido em projetos visuais.",
    initials: "CG"
  },
  {
    name: "Consulta rápida de CEP",
    category: "Ferramentas",
    description: "Preenche endereço a partir de um CEP informado.",
    initials: "CE"
  },
  {
    name: "Encurtador de links",
    category: "Ferramentas",
    description: "Transforma URLs longas em links curtos personalizados.",
    initials: "EL"
  },
  {
    name: "Sorteador",
    category: "Ferramentas",
    description: "Sorteia nomes, brindes, funcionários e listas diversas.",
    initials: "SO"
  },
  {
    name: "Gerador de Senhas",
    category: "Ferramentas",
    description: "Senhas fortes, fáceis, numéricas ou personalizadas.",
    initials: "GS"
  },
  {
    name: "Calculadora de salário líquido",
    category: "Calculadoras",
    description: "Estima salário líquido com descontos principais.",
    initials: "SL"
  },
  {
    name: "Calculadora de tinta",
    category: "Calculadoras",
    description: "Calcula quantidade aproximada de tinta por área.",
    initials: "TI"
  },
  {
    name: "Calculadora de m²",
    category: "Calculadoras",
    description: "Piso, parede, terreno, pintura e áreas gerais.",
    initials: "M2"
  },
  {
    name: "Calculadora de papel de parede",
    category: "Calculadoras",
    description: "Estima quantidade de rolos para um ambiente.",
    initials: "PP"
  },
  {
    name: "Calculadora de iluminação",
    category: "Calculadoras",
    description: "Estima lâmpadas necessárias por ambiente.",
    initials: "IL"
  },
  {
    name: "Calculadora de ar-condicionado BTU",
    category: "Calculadoras",
    description: "Sugere tamanho ideal por ambiente.",
    initials: "BT"
  },
  {
    name: "Calculadora de volume",
    category: "Calculadoras",
    description: "Caixa d'água, reservatórios e caixas.",
    initials: "VO"
  },
  {
    name: "Consumo de combustível",
    category: "Calculadoras",
    description: "Calcula Km/L e custo por quilômetro.",
    initials: "KM"
  },
  {
    name: "Calculadora de IMC",
    category: "Calculadoras",
    description: "Relaciona peso e altura para estimativa de IMC.",
    initials: "IM"
  },
  {
    name: "Cronômetro",
    category: "Tempo e Data",
    description: "Marca tempo com início, pausa e reinício.",
    initials: "CR"
  },
  {
    name: "Timer",
    category: "Tempo e Data",
    description: "Contagem regressiva para tarefas e lembretes rápidos.",
    initials: "TM"
  },
  {
    name: "Contador de dias",
    category: "Tempo e Data",
    description: "Calcula dias entre duas datas.",
    initials: "CD"
  }
];

const categoryNav = document.querySelector("#category-nav");
const toolsGrid = document.querySelector("#tools-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search");
const currentTitle = document.querySelector("#current-title");
const resultCount = document.querySelector("#result-count");
const toolPanel = document.querySelector("#tool-panel");
const contentGrid = document.querySelector(".content-grid");
const activeTools = new Set(["QR Code avançado", "Gerador de paleta de cores"]);

let activeCategory = "Todas";
let activeToolName = "";

function countByCategory(category) {
  if (category === "Todas") return tools.length;
  return tools.filter((tool) => tool.category === category).length;
}

function createCategoryButton(category) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "category-button";
  button.dataset.category = category;
  button.innerHTML = `<strong>${category}</strong><span>${countByCategory(category)}</span>`;

  button.addEventListener("click", () => {
    activeCategory = category;
    render();
  });

  return button;
}

function renderCategories() {
  categoryNav.innerHTML = "";

  categories.forEach((category) => {
    categoryNav.appendChild(createCategoryButton(category));
  });
}

function normalizeText(value) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getVisibleTools() {
  const search = normalizeText(searchInput.value.trim());

  return tools.filter((tool) => {
    const matchesCategory = activeCategory === "Todas" || tool.category === activeCategory;
    const searchable = normalizeText(`${tool.name} ${tool.category} ${tool.description}`);
    return matchesCategory && (!search || searchable.includes(search));
  });
}

function renderToolCard(tool) {
  const card = document.createElement("button");
  card.type = "button";
  card.className = "tool-card";
  card.dataset.tool = tool.name;
  const isActive = activeTools.has(tool.name);
  card.innerHTML = `
    <div>
      <span class="tool-icon">${tool.initials}</span>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
    </div>
    <div class="card-footer">
      <span class="category-pill">${tool.category}</span>
      <span class="status-pill ${isActive ? "ready" : ""}">${isActive ? "Ativo" : "Em breve"}</span>
    </div>
  `;

  card.addEventListener("click", () => {
    activeToolName = tool.name;
    renderPanel(tool);
    renderActiveCards();
  });

  return card;
}

function renderActiveCards() {
  document.querySelectorAll(".tool-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.tool === activeToolName);
  });
}

function renderPanel(tool) {
  toolPanel.hidden = false;
  contentGrid.classList.add("has-panel");

  if (tool.name === "QR Code avançado") {
    renderQrPanel(tool);
    return;
  }

  if (tool.name === "Gerador de paleta de cores") {
    renderPalettePanel(tool);
    return;
  }

  toolPanel.innerHTML = `
    <span class="panel-kicker">${tool.category}</span>
    <h2>${tool.name}</h2>
    <p>${tool.description}</p>
    <div class="panel-placeholder">
      <span>Em desenvolvimento</span>
    </div>
  `;
}

function renderQrPanel(tool) {
  toolPanel.innerHTML = `
    <span class="panel-kicker">${tool.category}</span>
    <h2>${tool.name}</h2>
    <p>Gere um QR Code funcional para link ou texto livre.</p>

    <form class="qr-form" id="qr-form" novalidate>
      <label for="qr-content">
        Conteúdo do QR Code
        <textarea id="qr-content" rows="4" placeholder="https://exemplo.com ou qualquer texto"></textarea>
      </label>

      <button type="submit">Gerar QR Code</button>
      <div class="qr-actions">
        <button id="download-qr-png" class="secondary-action" type="button" hidden>Baixar PNG</button>
        <button id="download-qr-pdf" class="secondary-action" type="button" hidden>Baixar PDF</button>
      </div>

      <p class="qr-message" id="qr-message" aria-live="polite"></p>
    </form>

    <div class="qr-preview" id="qr-preview">
      <span>O QR Code aparece aqui</span>
      <img id="qr-image" alt="QR Code gerado">
    </div>
  `;

  setupQrTool();
}

function renderPalettePanel(tool) {
  toolPanel.innerHTML = `
    <span class="panel-kicker">${tool.category}</span>
    <h2>${tool.name}</h2>
    <p>Gere uma paleta a partir de um HEX ou extraia cores principais de uma imagem.</p>

    <form class="palette-form" id="palette-form" novalidate>
      <label for="palette-hex">
        Código HEX
        <input id="palette-hex" type="text" placeholder="#0f766e" maxlength="7">
      </label>

      <button type="submit">Gerar por HEX</button>

      <label class="file-picker" for="palette-image">
        <span>Selecionar imagem</span>
        <input id="palette-image" type="file" accept="image/*">
      </label>

      <p class="palette-message" id="palette-message" aria-live="polite"></p>
    </form>

    <div class="image-preview" id="palette-image-preview" hidden>
      <img id="palette-preview-img" alt="Imagem usada para extrair paleta">
    </div>

    <div class="palette-grid" id="palette-grid"></div>
  `;

  setupPaletteTool();
}

function normalizeHex(value) {
  const cleaned = value.trim().replace(/^#/, "");

  if (/^[0-9a-f]{3}$/i.test(cleaned)) {
    return `#${cleaned.split("").map((char) => char + char).join("").toUpperCase()}`;
  }

  if (/^[0-9a-f]{6}$/i.test(cleaned)) {
    return `#${cleaned.toUpperCase()}`;
  }

  return "";
}

function hexToRgb(hex) {
  const value = normalizeHex(hex).slice(1);
  return {
    r: parseInt(value.slice(0, 2), 16),
    g: parseInt(value.slice(2, 4), 16),
    b: parseInt(value.slice(4, 6), 16)
  };
}

function rgbToHex({ r, g, b }) {
  return `#${[r, g, b].map((value) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0")).join("").toUpperCase()}`;
}

function rgbToHsl({ r, g, b }) {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const delta = max - min;
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    if (max === red) h = (green - blue) / delta + (green < blue ? 6 : 0);
    if (max === green) h = (blue - red) / delta + 2;
    if (max === blue) h = (red - green) / delta + 4;
    h /= 6;
  }

  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function hslToRgb({ h, s, l }) {
  const hue = h / 360;
  const saturation = s / 100;
  const lightness = l / 100;

  if (saturation === 0) {
    const value = lightness * 255;
    return { r: value, g: value, b: value };
  }

  const hueToRgb = (p, q, t) => {
    let localT = t;
    if (localT < 0) localT += 1;
    if (localT > 1) localT -= 1;
    if (localT < 1 / 6) return p + (q - p) * 6 * localT;
    if (localT < 1 / 2) return q;
    if (localT < 2 / 3) return p + (q - p) * (2 / 3 - localT) * 6;
    return p;
  };

  const q = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation;
  const p = 2 * lightness - q;

  return {
    r: hueToRgb(p, q, hue + 1 / 3) * 255,
    g: hueToRgb(p, q, hue) * 255,
    b: hueToRgb(p, q, hue - 1 / 3) * 255
  };
}

function getContrastColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 150 ? "#151922" : "#FFFFFF";
}

function createPaletteFromHex(hex) {
  const rgb = hexToRgb(hex);
  const hsl = rgbToHsl(rgb);
  const hue = hsl.h;

  return [
    { label: "Base", hex: normalizeHex(hex) },
    { label: "Claro", hex: rgbToHex(hslToRgb({ h: hue, s: Math.max(28, hsl.s - 8), l: Math.min(92, hsl.l + 30) })) },
    { label: "Suave", hex: rgbToHex(hslToRgb({ h: hue, s: Math.max(22, hsl.s - 18), l: Math.min(78, hsl.l + 16) })) },
    { label: "Profundo", hex: rgbToHex(hslToRgb({ h: hue, s: Math.min(88, hsl.s + 12), l: Math.max(20, hsl.l - 20) })) },
    { label: "Complementar", hex: rgbToHex(hslToRgb({ h: (hue + 180) % 360, s: Math.max(35, hsl.s), l: Math.max(32, Math.min(68, hsl.l)) })) }
  ];
}

function renderPalette(colors) {
  const paletteGrid = document.querySelector("#palette-grid");

  paletteGrid.innerHTML = colors.map((color) => `
    <button class="color-swatch" type="button" data-hex="${color.hex}" style="background:${color.hex}; color:${getContrastColor(color.hex)}">
      <span>${color.label}</span>
      <strong>${color.hex}</strong>
    </button>
  `).join("");

  paletteGrid.querySelectorAll(".color-swatch").forEach((swatch) => {
    swatch.addEventListener("click", async () => {
      const hex = swatch.dataset.hex;
      try {
        await navigator.clipboard.writeText(hex);
        setPaletteMessage(`Cor ${hex} copiada.`);
      } catch {
        setPaletteMessage(`Cor selecionada: ${hex}`);
      }
    });
  });
}

function setPaletteMessage(text, isError = false) {
  const message = document.querySelector("#palette-message");
  message.textContent = text;
  message.classList.toggle("error", isError);
}

function setupPaletteTool() {
  const form = document.querySelector("#palette-form");
  const hexInput = document.querySelector("#palette-hex");
  const imageInput = document.querySelector("#palette-image");
  const imagePreview = document.querySelector("#palette-image-preview");
  const previewImg = document.querySelector("#palette-preview-img");

  renderPalette(createPaletteFromHex("#0F766E"));

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const hex = normalizeHex(hexInput.value);
    if (!hex) {
      setPaletteMessage("Digite um HEX válido, como #0F766E.", true);
      hexInput.focus();
      return;
    }

    hexInput.value = hex;
    imagePreview.hidden = true;
    renderPalette(createPaletteFromHex(hex));
    setPaletteMessage("Paleta gerada a partir do HEX.");
  });

  imageInput.addEventListener("change", async () => {
    const file = imageInput.files?.[0];
    if (!file) return;

    try {
      const imageUrl = URL.createObjectURL(file);
      previewImg.src = imageUrl;
      imagePreview.hidden = false;
      const colors = await extractPaletteFromImage(imageUrl);
      renderPalette(colors);
      setPaletteMessage("Paleta extraída da imagem.");
    } catch {
      setPaletteMessage("Não foi possível ler essa imagem.", true);
    }
  });
}

async function extractPaletteFromImage(imageUrl) {
  const image = new Image();
  image.src = imageUrl;

  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  const maxSize = 180;
  const scale = Math.min(1, maxSize / Math.max(image.naturalWidth, image.naturalHeight));
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));

  const context = canvas.getContext("2d", { willReadFrequently: true });
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  const buckets = new Map();

  for (let index = 0; index < data.length; index += 16) {
    const alpha = data[index + 3];
    if (alpha < 128) continue;

    const r = Math.round(data[index] / 32) * 32;
    const g = Math.round(data[index + 1] / 32) * 32;
    const b = Math.round(data[index + 2] / 32) * 32;
    const key = `${r},${g},${b}`;
    const current = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };

    current.r += data[index];
    current.g += data[index + 1];
    current.b += data[index + 2];
    current.count += 1;
    buckets.set(key, current);
  }

  const colors = [...buckets.values()]
    .map((bucket) => ({
      r: bucket.r / bucket.count,
      g: bucket.g / bucket.count,
      b: bucket.b / bucket.count,
      count: bucket.count
    }))
    .filter((color) => {
      const hsl = rgbToHsl(color);
      return hsl.l > 8 && hsl.l < 94;
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)
    .map((color, index) => ({
      label: index === 0 ? "Principal" : `Cor ${index + 1}`,
      hex: rgbToHex(color)
    }));

  if (colors.length === 0) return createPaletteFromHex("#0F766E");
  return colors;
}

function normalizeQrValue(value) {
  const trimmed = value.trim();
  if (!trimmed) return "";

  const hasSpaces = /\s/.test(trimmed);
  const looksLikeDomain = /^[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(trimmed);

  if (!hasSpaces && looksLikeDomain && !/^https?:\/\//i.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return trimmed;
}

function saveBlob(blob, filename) {
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = fileUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(fileUrl);
}

function setQrMessage(messageElement, text, isError = false) {
  messageElement.textContent = text;
  messageElement.classList.toggle("error", isError);
}

function setupQrTool() {
  const form = document.querySelector("#qr-form");
  const content = document.querySelector("#qr-content");
  const image = document.querySelector("#qr-image");
  const preview = document.querySelector("#qr-preview");
  const message = document.querySelector("#qr-message");
  const downloadPng = document.querySelector("#download-qr-png");
  const downloadPdf = document.querySelector("#download-qr-pdf");
  let currentQrUrl = "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const value = normalizeQrValue(content.value);
    content.value = value;

    if (!value) {
      setQrMessage(message, "Digite um link ou texto para gerar o QR Code.", true);
      content.focus();
      return;
    }

    const qrUrl = new URL("https://api.qrserver.com/v1/create-qr-code/");
    qrUrl.searchParams.set("size", "600x600");
    qrUrl.searchParams.set("margin", "20");
    qrUrl.searchParams.set("format", "png");
    qrUrl.searchParams.set("data", value);

    currentQrUrl = qrUrl.toString();
    image.src = currentQrUrl;
    preview.classList.add("has-code");
    downloadPng.hidden = false;
    downloadPdf.hidden = false;
    setQrMessage(message, "QR Code gerado.");
  });

  downloadPng.addEventListener("click", async () => {
    if (!currentQrUrl) return;

    downloadPng.disabled = true;
    setQrMessage(message, "Preparando PNG...");

    try {
      const response = await fetch(currentQrUrl);
      if (!response.ok) throw new Error("Falha ao baixar imagem.");

      const blob = await response.blob();
      saveBlob(blob, "qr-code.png");
      setQrMessage(message, "Download do PNG iniciado.");
    } catch {
      setQrMessage(message, "Não foi possível baixar o PNG. Tente gerar novamente.", true);
    } finally {
      downloadPng.disabled = false;
    }
  });

  downloadPdf.addEventListener("click", async () => {
    if (!currentQrUrl) return;

    downloadPdf.disabled = true;
    setQrMessage(message, "Preparando PDF...");

    try {
      const pdfBlob = await createPdfFromQr(currentQrUrl);
      saveBlob(pdfBlob, "qr-code.pdf");
      setQrMessage(message, "Download do PDF iniciado.");
    } catch {
      setQrMessage(message, "Não foi possível gerar o PDF. Tente gerar novamente.", true);
    } finally {
      downloadPdf.disabled = false;
    }
  });
}

async function createPdfFromQr(qrUrl) {
  const response = await fetch(qrUrl);
  if (!response.ok) throw new Error("Falha ao baixar imagem.");

  const imageBlob = await response.blob();
  const bitmap = await createImageBitmap(imageBlob);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const context = canvas.getContext("2d");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0);

  const jpegBlob = await new Promise((resolve) => {
    canvas.toBlob(resolve, "image/jpeg", 0.95);
  });
  const jpegBytes = new Uint8Array(await jpegBlob.arrayBuffer());

  const encoder = new TextEncoder();
  const objects = [];
  const pageWidth = 595;
  const pageHeight = 842;
  const qrSize = 360;
  const qrX = (pageWidth - qrSize) / 2;
  const qrY = (pageHeight - qrSize) / 2;
  const content = `q\n${qrSize} 0 0 ${qrSize} ${qrX} ${qrY} cm\n/Im1 Do\nQ\n`;

  objects.push(encoder.encode("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n"));
  objects.push(encoder.encode("2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n"));
  objects.push(encoder.encode(`3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /XObject << /Im1 4 0 R >> /ProcSet [/PDF /ImageC] >> /Contents 5 0 R >>\nendobj\n`));
  objects.push([
    encoder.encode(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegBytes.length} >>\nstream\n`),
    jpegBytes,
    encoder.encode("\nendstream\nendobj\n")
  ]);
  objects.push(encoder.encode(`5 0 obj\n<< /Length ${encoder.encode(content).length} >>\nstream\n${content}endstream\nendobj\n`));

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

function render() {
  const visibleTools = getVisibleTools();
  const resultLabel = visibleTools.length === 1 ? "1 resultado" : `${visibleTools.length} resultados`;

  currentTitle.textContent = activeCategory === "Todas" ? "Todas as ferramentas" : activeCategory;
  resultCount.textContent = resultLabel;
  emptyState.hidden = visibleTools.length > 0;

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === activeCategory);
  });

  toolsGrid.innerHTML = "";
  visibleTools.forEach((tool) => {
    toolsGrid.appendChild(renderToolCard(tool));
  });

  renderActiveCards();
}

searchInput.addEventListener("input", render);

renderCategories();
render();
