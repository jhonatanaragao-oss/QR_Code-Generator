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

const views = [
  { id: "all", label: "Todas" },
  { id: "active", label: "Ativas" },
  { id: "favorites", label: "Favoritas" },
  { id: "recent", label: "Recentes" }
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

const activeTools = new Set([
  "Diferença entre textos",
  "Gerador de Lorem Ipsum",
  "QR Code avançado",
  "Gerador de paleta de cores",
  ...(window.externalActiveTools || [])
]);
const categoryNav = document.querySelector("#category-nav");
const toolsGrid = document.querySelector("#tools-grid");
const emptyState = document.querySelector("#empty-state");
const searchInput = document.querySelector("#search");
const currentTitle = document.querySelector("#current-title");
const resultCount = document.querySelector("#result-count");
const toolPanel = document.querySelector("#tool-panel");
const contentGrid = document.querySelector(".content-grid");
const viewFilters = document.querySelector("#view-filters");
const clearSearch = document.querySelector("#clear-search");
const totalTools = document.querySelector("#total-tools");
const activeToolsMetric = document.querySelector("#active-tools");
const favoriteToolsMetric = document.querySelector("#favorite-tools");

let activeCategory = "Todas";
let activeView = "all";
let activeToolName = "";
let favorites = readStoredList("flex-tools:favorites");
let recentTools = readStoredList("flex-tools:recent");

function readStoredList(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function writeStoredList(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

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

function renderViewFilters() {
  viewFilters.innerHTML = "";
  views.forEach((view) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "view-button";
    button.dataset.view = view.id;
    button.textContent = view.label;
    button.addEventListener("click", () => {
      activeView = view.id;
      render();
    });
    viewFilters.appendChild(button);
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
    const matchesSearch = !search || searchable.includes(search);
    const matchesView =
      activeView === "all" ||
      (activeView === "active" && activeTools.has(tool.name)) ||
      (activeView === "favorites" && favorites.includes(tool.name)) ||
      (activeView === "recent" && recentTools.includes(tool.name));

    return matchesCategory && matchesSearch && matchesView;
  });
}

function renderToolCard(tool) {
  const card = document.createElement("article");
  const isReady = activeTools.has(tool.name);
  const isFavorite = favorites.includes(tool.name);

  card.className = "tool-card";
  card.dataset.tool = tool.name;
  card.innerHTML = `
    <button class="favorite-button ${isFavorite ? "active" : ""}" type="button" aria-label="${isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}">
      ${isFavorite ? "★" : "☆"}
    </button>
    <button class="tool-card-main" type="button" data-tool-open="${tool.name}">
      <div>
        <div class="tool-card-top">
          <span class="tool-icon" aria-hidden="true">${tool.initials}</span>
        </div>
        <h3>${tool.name}</h3>
        <p>${tool.description}</p>
      </div>
      <div class="card-footer">
        <span class="category-pill">${tool.category}</span>
        <span class="status-pill ${isReady ? "ready" : ""}">${isReady ? "Ativo" : "Planejado"}</span>
      </div>
    </button>
  `;

  card.querySelector(".tool-card-main").addEventListener("click", () => openTool(tool));
  card.querySelector(".favorite-button").addEventListener("click", () => toggleFavorite(tool.name));

  return card;
}

function openTool(tool) {
  activeToolName = tool.name;
  recentTools = [tool.name, ...recentTools.filter((name) => name !== tool.name)].slice(0, 8);
  writeStoredList("flex-tools:recent", recentTools);
  renderPanel(tool);
  render();
}

function toggleFavorite(toolName) {
  if (favorites.includes(toolName)) {
    favorites = favorites.filter((name) => name !== toolName);
  } else {
    favorites = [toolName, ...favorites];
  }

  writeStoredList("flex-tools:favorites", favorites);
  render();
}

function closePanel() {
  activeToolName = "";
  toolPanel.hidden = true;
  toolPanel.innerHTML = "";
  contentGrid.classList.remove("has-panel");
  renderActiveCards();
}

function renderActiveCards() {
  document.querySelectorAll(".tool-card").forEach((card) => {
    card.classList.toggle("active", card.dataset.tool === activeToolName);
  });
}

function renderPanelShell(tool, body) {
  toolPanel.hidden = false;
  contentGrid.classList.add("has-panel");
  toolPanel.innerHTML = `
    <div class="panel-header">
      <div>
        <span class="panel-kicker">${tool.category}</span>
        <h2>${tool.name}</h2>
      </div>
      <button class="close-panel" type="button" aria-label="Fechar painel">×</button>
    </div>
    ${body}
  `;

  toolPanel.querySelector(".close-panel").addEventListener("click", closePanel);
}

function renderPanel(tool) {
  const externalRenderer = window.toolRenderers?.[tool.name];
  if (externalRenderer) {
    externalRenderer(tool, { renderPanelShell, setToolMessage });
    return;
  }

  if (tool.name === "Diferença entre textos") {
    renderTextDiffPanel(tool);
    return;
  }

  if (tool.name === "Gerador de Lorem Ipsum") {
    renderLoremPanel(tool);
    return;
  }

  if (tool.name === "QR Code avançado") {
    renderQrPanel(tool);
    return;
  }

  if (tool.name === "Gerador de paleta de cores") {
    renderPalettePanel(tool);
    return;
  }

  renderPanelShell(tool, `
    <p>${tool.description}</p>
    <div class="panel-placeholder">
      <span>Em desenvolvimento</span>
    </div>
  `);
}

function renderTextDiffPanel(tool) {
  renderPanelShell(tool, `
    <p>Compare dois textos e veja linhas adicionadas, removidas e alteradas.</p>

    <form class="tool-form" id="diff-form" novalidate>
      <label for="diff-original">
        Texto original
        <textarea class="tool-textarea tall-textarea" id="diff-original" rows="7" placeholder="Cole aqui o texto original"></textarea>
      </label>

      <label for="diff-updated">
        Texto atualizado
        <textarea class="tool-textarea tall-textarea" id="diff-updated" rows="7" placeholder="Cole aqui o texto novo"></textarea>
      </label>

      <div class="split-actions">
        <button class="primary-action" type="submit">Comparar textos</button>
        <button class="secondary-action" id="clear-diff" type="button">Limpar</button>
      </div>

      <p class="tool-message" id="diff-message" aria-live="polite"></p>
    </form>

    <div class="diff-summary" id="diff-summary" hidden></div>
    <div class="diff-output" id="diff-output" hidden></div>
  `);

  setupTextDiffTool();
}

function renderLoremPanel(tool) {
  renderPanelShell(tool, `
    <p>Gere texto de preenchimento em parágrafos, frases ou palavras.</p>

    <form class="tool-form" id="lorem-form" novalidate>
      <label for="lorem-type">
        Formato
        <select class="tool-input" id="lorem-type">
          <option value="paragraphs">Parágrafos</option>
          <option value="sentences">Frases</option>
          <option value="words">Palavras</option>
        </select>
      </label>

      <label for="lorem-amount">
        Quantidade
        <input class="tool-input" id="lorem-amount" type="number" min="1" max="20" value="3">
      </label>

      <label class="checkbox-row" for="lorem-start">
        <input id="lorem-start" type="checkbox" checked>
        Começar com "Lorem ipsum"
      </label>

      <div class="split-actions">
        <button class="primary-action" type="submit">Gerar texto</button>
        <button class="secondary-action" id="copy-lorem" type="button" disabled>Copiar</button>
      </div>

      <p class="tool-message" id="lorem-message" aria-live="polite"></p>
    </form>

    <div class="text-result" id="lorem-output" hidden></div>
  `);

  setupLoremTool();
}

function escapeHtml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setupTextDiffTool() {
  const form = document.querySelector("#diff-form");
  const original = document.querySelector("#diff-original");
  const updated = document.querySelector("#diff-updated");
  const clear = document.querySelector("#clear-diff");
  const message = document.querySelector("#diff-message");
  const summary = document.querySelector("#diff-summary");
  const output = document.querySelector("#diff-output");

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const originalText = original.value;
    const updatedText = updated.value;

    if (!originalText.trim() && !updatedText.trim()) {
      setToolMessage(message, "Cole os dois textos para comparar.", true);
      original.focus();
      return;
    }

    const result = compareLines(originalText, updatedText);
    renderDiffResult(result, summary, output);
    setToolMessage(message, result.changed === 0 ? "Nenhuma diferença encontrada." : "Comparação concluída.");
  });

  clear.addEventListener("click", () => {
    original.value = "";
    updated.value = "";
    summary.hidden = true;
    output.hidden = true;
    setToolMessage(message, "");
    original.focus();
  });
}

function compareLines(originalText, updatedText) {
  const originalLines = originalText.split(/\r?\n/);
  const updatedLines = updatedText.split(/\r?\n/);
  const maxLength = Math.max(originalLines.length, updatedLines.length);
  const rows = [];
  let added = 0;
  let removed = 0;
  let changed = 0;
  let unchanged = 0;

  for (let index = 0; index < maxLength; index++) {
    const before = originalLines[index];
    const after = updatedLines[index];

    if (before === after) {
      unchanged += 1;
      rows.push({ type: "same", line: index + 1, before, after });
    } else if (before === undefined) {
      added += 1;
      changed += 1;
      rows.push({ type: "added", line: index + 1, before: "", after });
    } else if (after === undefined) {
      removed += 1;
      changed += 1;
      rows.push({ type: "removed", line: index + 1, before, after: "" });
    } else {
      changed += 1;
      rows.push({ type: "changed", line: index + 1, before, after });
    }
  }

  return { added, removed, changed, unchanged, rows };
}

function renderDiffResult(result, summary, output) {
  summary.hidden = false;
  output.hidden = false;
  summary.innerHTML = `
    <div><strong>${result.changed}</strong><span>alteradas</span></div>
    <div><strong>${result.added}</strong><span>adicionadas</span></div>
    <div><strong>${result.removed}</strong><span>removidas</span></div>
    <div><strong>${result.unchanged}</strong><span>iguais</span></div>
  `;

  output.innerHTML = result.rows.map((row) => {
    const before = escapeHtml(row.before || "");
    const after = escapeHtml(row.after || "");
    const label = {
      same: "Igual",
      added: "Adicionada",
      removed: "Removida",
      changed: "Alterada"
    }[row.type];

    return `
      <article class="diff-row ${row.type}">
        <header><span>Linha ${row.line}</span><strong>${label}</strong></header>
        <div class="diff-columns">
          <div><span>Original</span><p>${before || "—"}</p></div>
          <div><span>Novo</span><p>${after || "—"}</p></div>
        </div>
      </article>
    `;
  }).join("");
}

const loremWords = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "commodo", "consequat",
  "duis", "aute", "irure", "reprehenderit", "voluptate", "velit", "esse", "cillum"
];

function setupLoremTool() {
  const form = document.querySelector("#lorem-form");
  const type = document.querySelector("#lorem-type");
  const amount = document.querySelector("#lorem-amount");
  const start = document.querySelector("#lorem-start");
  const copy = document.querySelector("#copy-lorem");
  const message = document.querySelector("#lorem-message");
  const output = document.querySelector("#lorem-output");
  let currentText = "";

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const count = Math.max(1, Math.min(20, Number(amount.value) || 1));
    amount.value = count;
    currentText = generateLorem(type.value, count, start.checked);
    output.hidden = false;
    output.textContent = currentText;
    copy.disabled = false;
    setToolMessage(message, "Texto gerado.");
  });

  copy.addEventListener("click", async () => {
    if (!currentText) return;

    try {
      await navigator.clipboard.writeText(currentText);
      setToolMessage(message, "Texto copiado.");
    } catch {
      setToolMessage(message, "Texto pronto para copiar manualmente.");
    }
  });
}

function generateLorem(type, amount, startsWithLorem) {
  if (type === "words") {
    return buildWords(amount, startsWithLorem).join(" ");
  }

  if (type === "sentences") {
    return Array.from({ length: amount }, (_, index) => buildSentence(index === 0 && startsWithLorem)).join(" ");
  }

  return Array.from({ length: amount }, (_, index) => buildParagraph(index === 0 && startsWithLorem)).join("\n\n");
}

function buildWords(amount, startsWithLorem) {
  const words = [];

  for (let index = 0; index < amount; index++) {
    words.push(loremWords[index % loremWords.length]);
  }

  if (startsWithLorem && amount >= 2) {
    words[0] = "Lorem";
    words[1] = "ipsum";
  } else if (startsWithLorem && amount === 1) {
    words[0] = "Lorem";
  }

  return words;
}

function buildSentence(startsWithLorem) {
  const length = 10 + Math.floor(Math.random() * 10);
  const words = buildWords(length, startsWithLorem);
  words[0] = words[0][0].toUpperCase() + words[0].slice(1);
  return `${words.join(" ")}.`;
}

function buildParagraph(startsWithLorem) {
  const sentenceCount = 3 + Math.floor(Math.random() * 3);
  return Array.from({ length: sentenceCount }, (_, index) => buildSentence(index === 0 && startsWithLorem)).join(" ");
}

function renderQrPanel(tool) {
  renderPanelShell(tool, `
    <p>Gere um QR Code funcional para link ou texto livre.</p>

    <form class="tool-form" id="qr-form" novalidate>
      <label for="qr-content">
        Conteúdo do QR Code
        <textarea class="tool-textarea" id="qr-content" rows="4" placeholder="https://exemplo.com ou qualquer texto"></textarea>
      </label>

      <button class="primary-action" type="submit">Gerar QR Code</button>
      <div class="split-actions">
        <button id="download-qr-png" class="secondary-action" type="button" hidden>Baixar PNG</button>
        <button id="download-qr-pdf" class="secondary-action" type="button" hidden>Baixar PDF</button>
      </div>

      <p class="tool-message" id="qr-message" aria-live="polite"></p>
    </form>

    <div class="qr-preview" id="qr-preview">
      <span>O QR Code aparece aqui</span>
      <img id="qr-image" alt="QR Code gerado">
    </div>
  `);

  setupQrTool();
}

function renderPalettePanel(tool) {
  renderPanelShell(tool, `
    <p>Gere uma paleta a partir de um HEX ou extraia cores principais de uma imagem.</p>

    <form class="tool-form" id="palette-form" novalidate>
      <label for="palette-hex">
        Código HEX
        <input class="tool-input" id="palette-hex" type="text" placeholder="#0F766E" maxlength="7">
      </label>

      <button class="primary-action" type="submit">Gerar por HEX</button>

      <label class="file-picker" for="palette-image">
        <span>Selecionar imagem</span>
        <input id="palette-image" type="file" accept="image/*">
      </label>

      <p class="tool-message" id="palette-message" aria-live="polite"></p>
    </form>

    <div class="image-preview" id="palette-image-preview" hidden>
      <img id="palette-preview-img" alt="Imagem usada para extrair paleta">
    </div>

    <div class="palette-grid" id="palette-grid"></div>
  `);

  setupPaletteTool();
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

function setToolMessage(messageElement, text, isError = false) {
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
      setToolMessage(message, "Digite um link ou texto para gerar o QR Code.", true);
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
    setToolMessage(message, "QR Code gerado.");
  });

  downloadPng.addEventListener("click", async () => {
    if (!currentQrUrl) return;

    downloadPng.disabled = true;
    setToolMessage(message, "Preparando PNG...");

    try {
      const response = await fetch(currentQrUrl);
      if (!response.ok) throw new Error("Falha ao baixar imagem.");

      const blob = await response.blob();
      saveBlob(blob, "qr-code.png");
      setToolMessage(message, "Download do PNG iniciado.");
    } catch {
      setToolMessage(message, "Não foi possível baixar o PNG. Tente gerar novamente.", true);
    } finally {
      downloadPng.disabled = false;
    }
  });

  downloadPdf.addEventListener("click", async () => {
    if (!currentQrUrl) return;

    downloadPdf.disabled = true;
    setToolMessage(message, "Preparando PDF...");

    try {
      const pdfBlob = await createPdfFromQr(currentQrUrl);
      saveBlob(pdfBlob, "qr-code.pdf");
      setToolMessage(message, "Download do PDF iniciado.");
    } catch {
      setToolMessage(message, "Não foi possível gerar o PDF. Tente gerar novamente.", true);
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
  return brightness > 150 ? "#0d1321" : "#ffffff";
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

  renderPalette(createPaletteFromHex("#087A70"));

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const hex = normalizeHex(hexInput.value);
    if (!hex) {
      setPaletteMessage("Digite um HEX válido, como #087A70.", true);
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

  if (colors.length === 0) return createPaletteFromHex("#087A70");
  return colors;
}

function renderMetrics() {
  totalTools.textContent = tools.length;
  activeToolsMetric.textContent = activeTools.size;
  favoriteToolsMetric.textContent = favorites.length;
}

function render() {
  const visibleTools = getVisibleTools();
  const resultLabel = visibleTools.length === 1 ? "1 resultado" : `${visibleTools.length} resultados`;
  const categoryTitle = activeCategory === "Todas" ? "Todas as ferramentas" : activeCategory;
  const viewTitle = views.find((view) => view.id === activeView)?.label;

  currentTitle.textContent = activeView === "all" ? categoryTitle : `${categoryTitle} · ${viewTitle}`;
  resultCount.textContent = resultLabel;
  emptyState.hidden = visibleTools.length > 0;
  clearSearch.hidden = searchInput.value.trim().length === 0;

  document.querySelectorAll("[data-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.category === activeCategory);
  });

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === activeView);
  });

  toolsGrid.innerHTML = "";
  visibleTools.forEach((tool) => {
    toolsGrid.appendChild(renderToolCard(tool));
  });

  renderMetrics();
  renderActiveCards();
}

searchInput.addEventListener("input", render);
clearSearch.addEventListener("click", () => {
  searchInput.value = "";
  render();
  searchInput.focus();
});

renderCategories();
renderViewFilters();
render();
