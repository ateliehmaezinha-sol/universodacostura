// Motor local de costura — 100% offline, sem API externa

interface FabricCalc {
  minMetros: number;
  maxMetros: number;
  detalhes: string;
}

const PECAS: Record<string, { nome: string; calc: (comp?: number) => FabricCalc; tecidos: string[]; dicas: string[] }> = {
  "saia reta": {
    nome: "Saia Reta/Lápis",
    calc: (comp = 60) => ({
      minMetros: +(((comp + 20) / 100) * 0.9).toFixed(2),
      maxMetros: +((comp + 20) / 100 * 1.1).toFixed(2),
      detalhes: `Comprimento ${comp}cm + 20cm (costura/cós) = ${comp + 20}cm`,
    }),
    tecidos: ["Crepe", "Sarja", "Gabardine"],
    dicas: ["Use forro se o tecido for claro ou fino", "Costure o zíper invisível antes de fechar a lateral", "Faça bainha italiana para acabamento premium"],
  },
  "saia evasê": {
    nome: "Saia Evasê (Leve Godê)",
    calc: (comp = 60) => ({
      minMetros: +((comp * 1.5 + 20) / 100).toFixed(2),
      maxMetros: +((comp * 1.5 + 20) / 100 * 1.2).toFixed(2),
      detalhes: `Comprimento ${comp}cm × 1,5 + 20cm = ${Math.round(comp * 1.5 + 20)}cm. Tecido extra +30-50% pelo godê leve.`,
    }),
    tecidos: ["Crepe", "Viscose", "Tricoline"],
    dicas: ["O corte evasê favorece todos os biotipos", "Marque bem o fio do tecido para caimento uniforme", "Use pesos nas pontas ao cortar para não deslocar"],
  },
  "saia meio godê": {
    nome: "Saia Meio Godê",
    calc: (comp = 60) => ({
      minMetros: +((comp * 2 + 20) / 100).toFixed(2),
      maxMetros: +((comp * 2 + 20) / 100 * 1.15).toFixed(2),
      detalhes: `Comprimento ${comp}cm × 2 + 20cm = ${Math.round(comp * 2 + 20)}cm. Balanço moderado com +100% de tecido.`,
    }),
    tecidos: ["Crepe", "Musseline", "Chiffon"],
    dicas: ["Deixe a saia pendurada 24h antes de fazer a bainha para o tecido ceder", "Use elástico embutido no cós para maior conforto", "Ótima para looks evangélicos e elegantes"],
  },
  "saia godê": {
    nome: "Saia Godê Total (Circular)",
    calc: (comp = 60) => ({
      minMetros: +((comp * 3 + 30) / 100).toFixed(2),
      maxMetros: +((comp * 3 + 30) / 100 * 1.2).toFixed(2),
      detalhes: `Comprimento ${comp}cm × 3 + 30cm = ${Math.round(comp * 3 + 30)}cm. Muito rodado, +200-300% de tecido.`,
    }),
    tecidos: ["Musseline", "Chiffon", "Crepe leve"],
    dicas: ["Corte em círculo completo para máximo caimento", "Faça bainha rolotê para tecidos finos", "Ideal para vestidos de festa e saias de dança"],
  },
  "vestido tubinho": {
    nome: "Vestido Tubinho",
    calc: (comp = 100) => ({
      minMetros: +((comp + 30) / 100).toFixed(2),
      maxMetros: +((comp + 30) / 100 * 1.15).toFixed(2),
      detalhes: `Comprimento total ${comp}cm + 30cm (costura/acabamento) = ${comp + 30}cm`,
    }),
    tecidos: ["Crepe", "Neoprene", "Scuba"],
    dicas: ["Use forro inteiro para conforto", "Costure o zíper invisível nas costas", "Faça prova antes de finalizar a bainha"],
  },
  "vestido evasê": {
    nome: "Vestido Evasê",
    calc: (comp = 100) => ({
      minMetros: +((comp * 1.5 + 40) / 100).toFixed(2),
      maxMetros: +((comp * 1.5 + 40) / 100 * 1.15).toFixed(2),
      detalhes: `Corpo + saia evasê. Comprimento ${comp}cm × 1,5 + 40cm = ${Math.round(comp * 1.5 + 40)}cm`,
    }),
    tecidos: ["Crepe", "Viscose", "Linho"],
    dicas: ["Corte o corpo separado da saia para melhor caimento", "Marque a cintura com precisão", "Forre apenas o corpo se o tecido for firme"],
  },
  "vestido godê": {
    nome: "Vestido Godê Total",
    calc: (comp = 100) => ({
      minMetros: +((comp * 2.5 + 50) / 100).toFixed(2),
      maxMetros: +((comp * 2.5 + 50) / 100 * 1.2).toFixed(2),
      detalhes: `Corpo + saia godê total. ~${((comp * 2.5 + 50) / 100).toFixed(1)}m a ${((comp * 2.5 + 50) / 100 * 1.2).toFixed(1)}m`,
    }),
    tecidos: ["Musseline", "Chiffon", "Crepe georgette"],
    dicas: ["Use anágua ou forro na saia", "Ideal para festas e eventos", "Considere 2 camadas de tecido para mais volume"],
  },
  "vestido longo": {
    nome: "Vestido Longo Godê",
    calc: () => ({
      minMetros: 4.5,
      maxMetros: 6.0,
      detalhes: "Vestido longo com saia godê total: 4,5m a 6,0m de tecido (largura 1,50m)",
    }),
    tecidos: ["Musseline", "Cetim", "Crepe de seda"],
    dicas: ["Planeje o caimento antes de cortar", "Use 2 camadas na saia para evitar transparência", "Faça a prova com o sapato que será usado"],
  },
  "blusa": {
    nome: "Blusa",
    calc: () => ({
      minMetros: 1.2,
      maxMetros: 1.8,
      detalhes: "Blusa manga curta: 1,20m a 1,50m. Manga longa: 1,50m a 1,80m",
    }),
    tecidos: ["Viscose", "Crepe", "Tricoline"],
    dicas: ["Reforce as costuras dos ombros", "Use entretela na gola e carcela", "Para tecidos escorregadios, use papel de seda ao cortar"],
  },
  "cropped": {
    nome: "Cropped",
    calc: () => ({
      minMetros: 0.6,
      maxMetros: 0.8,
      detalhes: "Cropped: 0,60m a 0,80m de tecido",
    }),
    tecidos: ["Malha", "Viscose", "Laise"],
    dicas: ["Use elástico na barra para efeito bufante", "Ótimo para tecidos estampados", "Combine com saia de cintura alta"],
  },
  "calça reta": {
    nome: "Calça Reta/Skinny",
    calc: (comp = 100) => ({
      minMetros: +((comp * 2 + 30) / 100).toFixed(2),
      maxMetros: +((comp * 2 + 30) / 100 * 1.1).toFixed(2),
      detalhes: `Comprimento ${comp}cm × 2 + 30cm = ${Math.round(comp * 2 + 30)}cm`,
    }),
    tecidos: ["Jeans", "Sarja", "Bengaline"],
    dicas: ["Reforce o gancho com costura dupla", "Use zíper YKK para durabilidade", "Faça a bainha original se for jeans"],
  },
  "calça pantalona": {
    nome: "Calça Pantalona",
    calc: (comp = 100) => ({
      minMetros: +((comp * 2 + 50) / 100).toFixed(2),
      maxMetros: +((comp * 2 + 50) / 100 * 1.15).toFixed(2),
      detalhes: `Comprimento ${comp}cm × 2 + 50cm = ${Math.round(comp * 2 + 50)}cm. Boca larga requer mais tecido.`,
    }),
    tecidos: ["Crepe", "Linho", "Alfaiataria"],
    dicas: ["Use tecido com bom caimento", "Cós alto valoriza a silhueta", "Ideal com pregas na frente para elegância"],
  },
  "blazer": {
    nome: "Blazer",
    calc: () => ({
      minMetros: 1.5,
      maxMetros: 2.5,
      detalhes: "Blazer curto: 1,50m a 1,80m. Blazer longo: 2,00m a 2,50m. Adicione mesma metragem para forro.",
    }),
    tecidos: ["Gabardine", "Oxford", "Linho estruturado"],
    dicas: ["Use entretela termocolante nas frentes, gola e punhos", "Forre inteiramente com cetim ou bemberg", "Faça os bolsos antes de montar as peças"],
  },
};

const GODE_INFO = `
## ✂️ Tipos de Godê

| Tipo | Tecido Extra | Efeito | Ideal Para |
|------|-------------|--------|------------|
| **Evasê** (leve godê) | +30-50% | Levemente soltinho | Dia a dia, escritório |
| **Meio Godê** | +100% | Balanço moderado | Eventos, igreja |
| **Godê Total** (circular) | +200-300% | Muito rodado, roda completa | Festas, dança |

### Como funciona:
- **Evasê**: A saia abre suavemente a partir do quadril. É a mais discreta.
- **Meio Godê**: Forma meio círculo. Tem balanço bonito ao caminhar.
- **Godê Total**: Forma um círculo completo. Máximo volume e movimento.

💡 **Dica**: Quanto mais godê, mais tecido e mais bonito o caimento, mas também mais pesado. Para tecidos leves (musseline, chiffon), o godê total fica lindo!
`;

const TECIDOS_INFO: Record<string, string> = {
  crepe: "**Crepe**: Tecido versátil, com leve textura. Ótimo para vestidos, saias e blusas. Não amassa fácil. Largura: 1,40-1,50m.",
  musseline: "**Musseline**: Tecido fino e transparente, com caimento fluido. Ideal para sobreposições, saias godê e vestidos de festa. Precisa de forro.",
  chiffon: "**Chiffon**: Similar à musseline, levemente mais encorpado. Perfeito para detalhes, mangas e saias rodadas.",
  viscose: "**Viscose**: Tecido macio e confortável, com bom caimento. Ideal para blusas e vestidos de verão. Amassa um pouco.",
  seda: "**Seda**: Tecido nobre, brilhoso e delicado. Para peças especiais e de festa. Exige cuidado no corte e costura.",
  cetim: "**Cetim**: Brilhante de um lado, fosco do outro. Usado em vestidos de festa, forros e detalhes.",
  linho: "**Linho**: Natural, fresco e elegante. Amassa com facilidade (charme do tecido). Ideal para blazers e calças.",
  tricoline: "**Tricoline**: Algodão fino e firme. Ideal para camisas, vestidos estruturados. Fácil de costurar.",
  malha: "**Malha**: Tecido com elasticidade. Para peças confortáveis do dia a dia. Use agulha de ponta bola.",
  neoprene: "**Neoprene**: Encorpado e estruturado. Não amassa. Ideal para vestidos tubinho e saias lápis.",
  gabardine: "**Gabardine**: Tecido firme e resistente. Para blazers, calças e saias retas. Aceita bem vincos.",
  renda: "**Renda**: Tecido decorativo, transparente. Para detalhes, sobreposições e peças de festa. Sempre use com forro.",
};

function findPeca(query: string): typeof PECAS[string] | null {
  const q = query.toLowerCase();
  // Try exact match first
  for (const [key, val] of Object.entries(PECAS)) {
    if (q.includes(key)) return val;
  }
  // Fuzzy matches
  if (q.includes("godê total") || q.includes("gode total") || q.includes("circular")) return PECAS["saia godê"];
  if (q.includes("meio godê") || q.includes("meio gode")) return PECAS["saia meio godê"];
  if (q.includes("evasê") || q.includes("evase")) return PECAS["saia evasê"];
  if (q.includes("saia") && q.includes("reta")) return PECAS["saia reta"];
  if (q.includes("saia") && q.includes("lápis")) return PECAS["saia reta"];
  if (q.includes("saia")) return PECAS["saia evasê"];
  if (q.includes("vestido") && q.includes("longo")) return PECAS["vestido longo"];
  if (q.includes("vestido") && q.includes("tubin")) return PECAS["vestido tubinho"];
  if (q.includes("vestido") && q.includes("godê")) return PECAS["vestido godê"];
  if (q.includes("vestido")) return PECAS["vestido evasê"];
  if (q.includes("pantalona")) return PECAS["calça pantalona"];
  if (q.includes("calça") || q.includes("calca")) return PECAS["calça reta"];
  if (q.includes("cropped") || q.includes("crop")) return PECAS["cropped"];
  if (q.includes("blusa") || q.includes("camisa")) return PECAS["blusa"];
  if (q.includes("blazer") || q.includes("jaqueta")) return PECAS["blazer"];
  return null;
}

function extractComprimento(query: string): number | undefined {
  const match = query.match(/(\d+)\s*cm/i);
  if (match) return parseInt(match[1]);
  return undefined;
}

export function processQuery(query: string): string {
  const q = query.toLowerCase();

  // About godê types
  if ((q.includes("godê") || q.includes("gode")) && (q.includes("diferença") || q.includes("tipo") || q.includes("diferenca") || q.includes("o que"))) {
    return GODE_INFO;
  }

  // About specific fabric
  for (const [key, info] of Object.entries(TECIDOS_INFO)) {
    if (q.includes(key)) {
      return `🧵 **Informação sobre tecido**\n\n${info}\n\n💡 **Dica**: Sempre compre 10-15% a mais para margem de segurança.`;
    }
  }

  // Best fabric for a piece
  if (q.includes("melhor tecido") || q.includes("qual tecido") || q.includes("tecido ideal") || q.includes("tecido para")) {
    const peca = findPeca(q);
    if (peca) {
      return `🧵 **Tecidos recomendados para ${peca.nome}**:\n\n${peca.tecidos.map((t, i) => `${i + 1}. **${t}**`).join("\n")}\n\n✂️ **Dicas**:\n${peca.dicas.map(d => `• ${d}`).join("\n")}`;
    }
  }

  // Lining
  if (q.includes("forro")) {
    return `🧵 **Forros — Guia Rápido**\n\n| Tipo | Uso Ideal |\n|------|----------|\n| **Cetim** | Vestidos de festa, blazers |\n| **Bemberg** | Blazers de alfaiataria (respira melhor) |\n| **Failete** | Saias e vestidos do dia a dia |\n| **Meia malha** | Peças de malha que precisam de forro |\n\n💡 **Quando usar forro**:\n• Tecidos transparentes (musseline, chiffon, renda)\n• Tecidos claros\n• Blazers e peças de alfaiataria\n• Saias e vestidos para evitar transparência`;
  }

  // Fabric calculation
  const peca = findPeca(q);
  if (peca) {
    const comp = extractComprimento(q);
    const calc = peca.calc(comp);
    return `📐 **Cálculo de Tecido — ${peca.nome}**\n\n**Metragem necessária**: ${calc.minMetros}m a ${calc.maxMetros}m\n(tecido com largura 1,40m a 1,50m)\n\n**Detalhamento**: ${calc.detalhes}\n\n🧵 **Tecidos recomendados**:\n${peca.tecidos.map((t, i) => `${i + 1}. **${t}**`).join("\n")}\n\n✂️ **Dicas de confecção**:\n${peca.dicas.map(d => `• ${d}`).join("\n")}\n\n💡 *Sempre compre 10-15% a mais para margem de segurança.*`;
  }

  // Price tips
  if (q.includes("preço") || q.includes("cobrar") || q.includes("valor") || q.includes("preco")) {
    return `💰 **Precificação — Dicas Profissionais**\n\n**Fórmula básica**: Custo do tecido + Aviamentos + (Horas × Valor/hora) + Lucro (30-50%)\n\n| Peça | Valor Médio (Brasil) |\n|------|---------------------|\n| Bainha simples | R$ 15-30 |\n| Ajuste de cintura | R$ 30-60 |\n| Saia reta | R$ 80-150 |\n| Vestido simples | R$ 150-300 |\n| Vestido de festa | R$ 300-800 |\n| Blazer | R$ 200-500 |\n\n💡 Calcule seu valor/hora: no mínimo R$ 25-40/hora para iniciantes, R$ 50-100/hora para experientes.`;
  }

  // General greeting or unknown
  if (q.includes("olá") || q.includes("oi") || q.includes("bom dia") || q.includes("boa tarde") || q.includes("boa noite")) {
    return "Olá! 👋 Sou a assistente de costura! Posso te ajudar com:\n\n- 📐 **Cálculo de tecido** — pergunte: *\"Quanto de tecido para saia godê total?\"*\n- ✂️ **Tipos de godê** — pergunte: *\"Diferença entre evasê e godê total?\"*\n- 🧵 **Recomendação de tecidos** — pergunte: *\"Melhor tecido para blazer?\"*\n- 💡 **Dicas de costura** e **preços**\n\nO que gostaria de saber?";
  }

  // Default helpful response
  return `🤔 Não encontrei uma resposta exata para sua pergunta, mas posso te ajudar com:\n\n- 📐 **Cálculo de tecido**: *\"Quanto de tecido para [peça]?\"*\n  - Peças: saia reta, saia evasê, saia meio godê, saia godê total, vestido tubinho, vestido evasê, vestido godê, vestido longo, blusa, cropped, calça reta, calça pantalona, blazer\n\n- ✂️ **Tipos de godê**: *\"Diferença entre evasê e godê total?\"*\n\n- 🧵 **Tecidos**: *\"Melhor tecido para vestido?\"* ou *\"O que é crepe?\"*\n\n- 💰 **Preços**: *\"Quanto cobrar por um vestido?\"*\n\n- 🧥 **Forros**: *\"Quando usar forro?\"*\n\nTente reformular sua pergunta! 😊`;
}

// For the fabric calculator page
export function calcularTecido(peca: string, medidas: string): string {
  const pecaObj = findPeca(peca);
  if (!pecaObj) {
    return `📐 Não encontrei cálculo específico para "${peca}". Tente: saia reta, saia evasê, saia godê, vestido tubinho, vestido evasê, vestido godê, blusa, calça, blazer.`;
  }

  const comp = extractComprimento(medidas);
  const calc = pecaObj.calc(comp);

  return `📐 **METRAGEM NECESSÁRIA**\n**${calc.minMetros}m a ${calc.maxMetros}m** de tecido (largura 1,50m)\n${calc.detalhes}\n\n🧵 **TECIDOS RECOMENDADOS**\n${pecaObj.tecidos.map((t, i) => `${i + 1}. **${t}**`).join("\n")}\n\n✂️ **DICAS DE CONFECÇÃO**\n${pecaObj.dicas.map(d => `• ${d}`).join("\n")}`;
}
