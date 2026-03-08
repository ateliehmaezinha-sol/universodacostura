export interface MedidasSobMedida {
  busto: string;
  cintura: string;
  quadril: string;
  ombroAOmbro: string;
  comprimentoFrente: string;
  comprimentoCostas: string;
  larguraCostas: string;
  alturaBusto: string;
  distanciaBustos: string;
  circunferenciaBraco: string;
  comprimentoBraco: string;
  circunferenciaPunho: string;
  comprimentoSaia: string;
  comprimentoCalca: string;
  circunferenciaCoxa: string;
  comprimentoTotal: string;
}

export interface Cliente {
  id: string;
  nome: string;
  telefone: string;
  cidade: string;
  tipoMedida: "sob_medida" | "industrial";
  tamanhoIndustrial: string;
  medidas: MedidasSobMedida;
  historico: string[];
}

export const medidasVazias: MedidasSobMedida = {
  busto: "",
  cintura: "",
  quadril: "",
  ombroAOmbro: "",
  comprimentoFrente: "",
  comprimentoCostas: "",
  larguraCostas: "",
  alturaBusto: "",
  distanciaBustos: "",
  circunferenciaBraco: "",
  comprimentoBraco: "",
  circunferenciaPunho: "",
  comprimentoSaia: "",
  comprimentoCalca: "",
  circunferenciaCoxa: "",
  comprimentoTotal: "",
};

export const labelsMedidas: Record<keyof MedidasSobMedida, string> = {
  busto: "Busto",
  cintura: "Cintura",
  quadril: "Quadril",
  ombroAOmbro: "Ombro a Ombro",
  comprimentoFrente: "Comp. Frente",
  comprimentoCostas: "Comp. Costas",
  larguraCostas: "Larg. Costas",
  alturaBusto: "Altura do Busto",
  distanciaBustos: "Dist. Bustos",
  circunferenciaBraco: "Circ. Braço",
  comprimentoBraco: "Comp. Braço",
  circunferenciaPunho: "Circ. Punho",
  comprimentoSaia: "Comp. Saia",
  comprimentoCalca: "Comp. Calça",
  circunferenciaCoxa: "Circ. Coxa",
  comprimentoTotal: "Altura Total",
};

export const tamanhosIndustriais = [
  "34", "36", "38", "40", "42", "44", "46", "48", "50", "52",
];

// Tabela de medidas padrão industriais (cm)
export const medidasIndustriais: Record<string, MedidasSobMedida> = {
  "34": { busto: "78", cintura: "60", quadril: "84", ombroAOmbro: "36", comprimentoFrente: "42", comprimentoCostas: "40", larguraCostas: "34", alturaBusto: "24", distanciaBustos: "17", circunferenciaBraco: "24", comprimentoBraco: "56", circunferenciaPunho: "15", comprimentoSaia: "58", comprimentoCalca: "100", circunferenciaCoxa: "50", comprimentoTotal: "155" },
  "36": { busto: "82", cintura: "64", quadril: "88", ombroAOmbro: "37", comprimentoFrente: "42.5", comprimentoCostas: "40.5", larguraCostas: "35", alturaBusto: "25", distanciaBustos: "18", circunferenciaBraco: "25", comprimentoBraco: "57", circunferenciaPunho: "15.5", comprimentoSaia: "59", comprimentoCalca: "101", circunferenciaCoxa: "52", comprimentoTotal: "157" },
  "38": { busto: "86", cintura: "68", quadril: "92", ombroAOmbro: "38", comprimentoFrente: "43", comprimentoCostas: "41", larguraCostas: "36", alturaBusto: "26", distanciaBustos: "19", circunferenciaBraco: "26", comprimentoBraco: "58", circunferenciaPunho: "16", comprimentoSaia: "60", comprimentoCalca: "102", circunferenciaCoxa: "54", comprimentoTotal: "160" },
  "40": { busto: "90", cintura: "72", quadril: "96", ombroAOmbro: "39", comprimentoFrente: "43.5", comprimentoCostas: "41.5", larguraCostas: "37", alturaBusto: "27", distanciaBustos: "19.5", circunferenciaBraco: "27", comprimentoBraco: "59", circunferenciaPunho: "16.5", comprimentoSaia: "61", comprimentoCalca: "103", circunferenciaCoxa: "56", comprimentoTotal: "162" },
  "42": { busto: "94", cintura: "76", quadril: "100", ombroAOmbro: "40", comprimentoFrente: "44", comprimentoCostas: "42", larguraCostas: "38", alturaBusto: "28", distanciaBustos: "20", circunferenciaBraco: "28", comprimentoBraco: "59.5", circunferenciaPunho: "17", comprimentoSaia: "62", comprimentoCalca: "104", circunferenciaCoxa: "58", comprimentoTotal: "164" },
  "44": { busto: "98", cintura: "80", quadril: "104", ombroAOmbro: "41", comprimentoFrente: "44.5", comprimentoCostas: "42.5", larguraCostas: "39", alturaBusto: "29", distanciaBustos: "20.5", circunferenciaBraco: "29", comprimentoBraco: "60", circunferenciaPunho: "17.5", comprimentoSaia: "63", comprimentoCalca: "105", circunferenciaCoxa: "60", comprimentoTotal: "165" },
  "46": { busto: "102", cintura: "84", quadril: "108", ombroAOmbro: "42", comprimentoFrente: "45", comprimentoCostas: "43", larguraCostas: "40", alturaBusto: "30", distanciaBustos: "21", circunferenciaBraco: "30", comprimentoBraco: "60.5", circunferenciaPunho: "18", comprimentoSaia: "64", comprimentoCalca: "106", circunferenciaCoxa: "62", comprimentoTotal: "166" },
  "48": { busto: "106", cintura: "88", quadril: "112", ombroAOmbro: "43", comprimentoFrente: "45.5", comprimentoCostas: "43.5", larguraCostas: "41", alturaBusto: "31", distanciaBustos: "21.5", circunferenciaBraco: "31", comprimentoBraco: "61", circunferenciaPunho: "18.5", comprimentoSaia: "65", comprimentoCalca: "107", circunferenciaCoxa: "64", comprimentoTotal: "167" },
  "50": { busto: "110", cintura: "92", quadril: "116", ombroAOmbro: "44", comprimentoFrente: "46", comprimentoCostas: "44", larguraCostas: "42", alturaBusto: "32", distanciaBustos: "22", circunferenciaBraco: "32", comprimentoBraco: "61.5", circunferenciaPunho: "19", comprimentoSaia: "66", comprimentoCalca: "108", circunferenciaCoxa: "66", comprimentoTotal: "168" },
  "52": { busto: "114", cintura: "96", quadril: "120", ombroAOmbro: "45", comprimentoFrente: "46.5", comprimentoCostas: "44.5", larguraCostas: "43", alturaBusto: "33", distanciaBustos: "22.5", circunferenciaBraco: "33", comprimentoBraco: "62", circunferenciaPunho: "19.5", comprimentoSaia: "67", comprimentoCalca: "109", circunferenciaCoxa: "68", comprimentoTotal: "169" },
};
