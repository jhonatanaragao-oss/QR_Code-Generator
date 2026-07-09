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
  card.innerHTML = `
    <div>
      <span class="tool-icon">${tool.initials}</span>
      <h3>${tool.name}</h3>
      <p>${tool.description}</p>
    </div>
    <div class="card-footer">
      <span class="category-pill">${tool.category}</span>
      <span class="status-pill">Em breve</span>
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
  toolPanel.innerHTML = `
    <span class="panel-kicker">${tool.category}</span>
    <h2>${tool.name}</h2>
    <p>${tool.description}</p>
    <div class="panel-placeholder">
      <span>Em desenvolvimento</span>
    </div>
  `;
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
