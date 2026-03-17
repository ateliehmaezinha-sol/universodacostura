export interface FabricInfo {
  nome: string;
  composicao: string;
  caimento: string;
  elasticidade: string;
  dificuldade: string;
  roupas: string;
  forro: string;
  agulha: string;
  linha: string;
  confianca?: string;
  observacoes?: string;
}

export interface HistoryItem {
  id: string;
  data: string;
  thumbnail: string;
  info: FabricInfo;
}
