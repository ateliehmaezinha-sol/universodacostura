import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/AppLayout";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Scissors, Droplets, Ruler } from "lucide-react";

type Tecido = {
  nome: string;
  composicao: string;
  gramatura: string;
  elasticidade: string;
  caimento: string;
  roupas: string;
  forro: string;
  dificuldade: string;
  emoji: string;
  categoria?: string;
  modelosIndicados?: string;
  dicasCostura?: string;
  lavagem?: string;
  comoCortar?: string;
};

const dicasBase: Record<string, { dicasCostura: string; lavagem: string; comoCortar: string }> = {
  "Chiffon": {
    dicasCostura: "Use agulha fina (nº 9/70). Costure com papel de seda por baixo para evitar que o tecido seja puxado. Prefira costuras francesas para acabamento limpo. Use linha de poliéster fina.",
    lavagem: "Lavar à mão com sabão neutro. Não torcer. Secar à sombra estendido. Passar com ferro morno no avesso com pano protetor.",
    comoCortar: "Prenda o tecido em papel de seda com alfinetes finos. Corte com tesoura bem afiada ou cortador rotativo. Use pesos em vez de alfinetes para não marcar."
  },
  "Musseline": {
    dicasCostura: "Agulha fina nº 9/70, ponto pequeno. Costure com papel de seda. Acabamento com costura francesa ou overlock fino. Evite alfinetes grossos.",
    lavagem: "Lavar à mão delicadamente. Não usar alvejante. Secar à sombra. Passar com ferro em temperatura baixa no avesso.",
    comoCortar: "Estenda sobre papel de seda e corte ambos juntos. Use pesos para segurar. Cortador rotativo dá melhor resultado que tesoura."
  },
  "Organza": {
    dicasCostura: "Agulha fina nº 9/70 e linha fina. Costura francesa obrigatória. Cuidado com desfiamento — aplique selante nas bordas. Teste tensão em retalho antes.",
    lavagem: "Lavar à mão com água fria. Não torcer nem esfregar. Secar na horizontal. Passar com ferro morno, sempre com pano protetor.",
    comoCortar: "Corte sobre papel de seda com cortador rotativo. Marque com giz de alfaiate suave. Adicione margem extra pois desfia facilmente."
  },
  "Tule": {
    dicasCostura: "Use agulha universal fina. Ponto largo para não enrugar. Para volume, corte várias camadas. Acabamento simples pois não desfia. Pode queimar bordas levemente.",
    lavagem: "Lavar à mão ou saco de proteção na máquina (ciclo delicado). Não torcer. Secar pendurado. Passar com vapor a distância.",
    comoCortar: "Fácil de cortar — use tesoura afiada. Pode cortar várias camadas de uma vez. Não precisa de margem extra pois não desfia."
  },
  "Crepe Georgette": {
    dicasCostura: "Agulha fina nº 9/70. Costura francesa recomendada. Use papel de seda como base. Ponto médio (2-2.5mm). Pressão leve no calcador.",
    lavagem: "Lavar à mão com sabão neutro ou lavagem a seco. Secar à sombra. Passar com ferro morno no avesso.",
    comoCortar: "Prenda em papel de seda. Corte com cortador rotativo para precisão. Use pesos leves para não distorcer o tecido."
  },
  "Seda Pura": {
    dicasCostura: "Agulha de seda nº 8/60 ou 9/70. Linha de seda ou poliéster fina. Costura francesa obrigatória. Teste sempre em retalho. Não use alfinetes que marcam.",
    lavagem: "Lavagem a seco recomendada. Se lavar à mão: água fria, sabão neutro, não torcer. Secar à sombra na horizontal. Ferro em temperatura seda.",
    comoCortar: "Estenda sobre papel de seda em superfície lisa. Corte com lâmina nova e afiada. Evite puxar o tecido. Marque com giz suave."
  },
  "Jersey de Seda": {
    dicasCostura: "Use agulha de ponta bola (jersey) nº 70/80. Ponto elástico ou overlock. Estabilize ombros e decotes com fita de viés. Não esticar ao costurar.",
    lavagem: "Lavar à mão ou ciclo delicado. Não torcer. Secar na horizontal para não deformar. Passar com ferro morno.",
    comoCortar: "Cortar em camada única. Usar pesos, não alfinetes. Deixar descansar o tecido antes de cortar. Cortador rotativo ideal."
  },
  "Mikado": {
    dicasCostura: "Agulha universal nº 80/90. Ponto médio. Prense as costuras abertas com ferro. Use entretela nos detalhes estruturais. Acabamento com viés ou overlock.",
    lavagem: "Lavagem a seco recomendada. Se necessário, ferro morno no avesso com pano protetor. Não borrifar água diretamente.",
    comoCortar: "Corte em camada única seguindo o fio do tecido. Marque com giz. Tesoura afiada. Cuidado com o brilho — corte sempre no mesmo sentido."
  },
  "Zibeline": {
    dicasCostura: "Agulha nº 90/100. Ponto médio-longo. Prense costuras com ferro quente. Use entretela em áreas estruturais. Acabamento interno com viés de seda.",
    lavagem: "Apenas lavagem a seco. Guardar pendurado em cabide acolchoado. Ferro quente no avesso com pano úmido.",
    comoCortar: "Camada única, seguindo o fio. Tesoura de alfaiate bem afiada. Marque com giz de alfaiate. Respeite o sentido do brilho."
  },
  "Tafetá": {
    dicasCostura: "Agulha fina nº 70/80. Ponto médio. Cuidado: furo de agulha é permanente. Prense costuras abertas. Use fita de viés no acabamento.",
    lavagem: "Lavagem a seco ou à mão com cuidado. Não torcer. Ferro morno no avesso. O tafetá amassa facilmente, guarde pendurado.",
    comoCortar: "Cortar com tesoura afiada em camada única. Marcar com giz suave (furos de alfinete são permanentes). Seguir o fio do tecido."
  },
  "Jacquard": {
    dicasCostura: "Agulha nº 80/90. Ponto médio. Alinhe os padrões nas costuras. Use overlock ou zigzag nas bordas. Prense costuras abertas.",
    lavagem: "Lavagem a seco recomendada. Se lavar, usar ciclo delicado com água fria. Ferro morno no avesso.",
    comoCortar: "Planeje o corte para alinhar os padrões. Corte em camada única. Marque o sentido do desenho. Tesoura afiada."
  },
  "Brocado": {
    dicasCostura: "Agulha nº 90. Ponto médio. Não passar alfinetes na área visível. Use forro obrigatoriamente. Acabamento com viés de seda. Cuidado com os fios metálicos.",
    lavagem: "Apenas lavagem a seco. Guardar enrolado (não dobrar para não quebrar fios metálicos). Não passar ferro diretamente nos fios.",
    comoCortar: "Camada única, sentido único do desenho. Use pesos em vez de alfinetes. Tesoura para tecidos pesados. Marque no avesso."
  },
  "Duchess (Duquesa)": {
    dicasCostura: "Agulha nº 90/100. Ponto médio. Prense costuras com ferro quente e paninho. Estruturar com entretela pesada. Acabamento com viés de cetim.",
    lavagem: "Apenas lavagem a seco. Guardar pendurado em cabide largo acolchoado. Ferro quente no avesso com pano úmido.",
    comoCortar: "Camada única no sentido do fio. Tesoura de alfaiate pesada. Marque com giz no avesso. Atenção ao caimento e ao brilho."
  },
  "Neoprene": {
    dicasCostura: "Agulha nº 90. Ponto longo (3mm+). Não precisa de acabamento nas bordas (não desfia). Use cola têxtil para bainhas invisíveis. Agulha de ponta bola.",
    lavagem: "Lavar à mão com água fria e sabão neutro. Não usar secadora. Secar à sombra. Não passar ferro (pode derreter).",
    comoCortar: "Fácil de cortar com tesoura ou cortador rotativo. Não precisa de margem de acabamento. Marque com caneta lavável."
  },
  "Cetim": {
    dicasCostura: "Agulha fina nº 70/80. Costura francesa ou overlock fino. Furos de agulha são permanentes — cuidado ao alinhavar. Use presilhas em vez de alfinetes.",
    lavagem: "Lavar à mão com água fria ou lavagem a seco. Não torcer. Secar à sombra. Ferro morno no avesso.",
    comoCortar: "Cortar no avesso com tecido bem esticado. Usar pesos. Cortador rotativo recomendado. Atenção ao sentido do brilho — sempre cortar no mesmo sentido."
  },
  "Renda": {
    dicasCostura: "Agulha fina nº 70/80. Alinhe os desenhos nas costuras. Use costura aberta e aplique à mão quando possível. Não corte os motivos — aproveite os desenhos.",
    lavagem: "Lavar à mão com sabão neutro. Secar na horizontal. Não torcer. Ferro morno com pano protetor. Rendas delicadas: lavagem a seco.",
    comoCortar: "Planeje o corte respeitando os motivos da renda. Corte em camada única. Use tesoura de ponta fina para recortar motivos. Marque no forro, não na renda."
  },
  "Crepe": {
    dicasCostura: "Agulha universal nº 70/80. Ponto médio. Tecido fácil de trabalhar. Overlock ou zigzag para acabamento. Prense costuras com ferro morno.",
    lavagem: "Lavar à máquina em ciclo delicado ou à mão. Secar à sombra. Ferro morno. Tecido resistente e prático.",
    comoCortar: "Fácil de cortar. Tesoura comum bem afiada. Pode cortar em duas camadas. Seguir o fio do tecido."
  },
  "Veludo": {
    dicasCostura: "Agulha nº 80/90. Costurar no sentido do pelo. Use calcador de veludo ou teflon. Alfinetes apenas na margem de costura. Não passar ferro diretamente.",
    lavagem: "Lavagem a seco recomendada. Se lavar: à mão, água fria. Secar pendurado ao avesso. Vapor a distância para alinhar o pelo.",
    comoCortar: "Cortar em camada única, todas as peças no mesmo sentido do pelo. Marcar no avesso. Usar pesos. Tesoura afiada ou cortador rotativo."
  },
  "Lurex/Glitter": {
    dicasCostura: "Agulha nº 80. Ponto médio. Cuidado: fios metálicos podem quebrar agulha — tenha reservas. Acabamento com overlock. Use forro para conforto.",
    lavagem: "Lavar à mão com água fria, do avesso. Não torcer. Secar à sombra. Ferro morno no avesso com pano protetor.",
    comoCortar: "Cortar com tesoura afiada (pode cegar a lâmina). Marcar no avesso. Usar pesos. Atenção ao brilho — corte no mesmo sentido."
  },
  "Paetê/Lantejoula": {
    dicasCostura: "Retire os paetês da margem de costura antes de costurar. Agulha nº 90 resistente. Use forro obrigatoriamente. Acabamento manual nas bordas.",
    lavagem: "Apenas lavagem a seco ou à mão com muito cuidado. Guardar do avesso. Não passar ferro nos paetês. Vapor a distância se necessário.",
    comoCortar: "Marque no avesso. Retire paetês da linha de corte com alicate antes de cortar. Tesoura velha (danifica a lâmina). Corte em camada única."
  },
  "Viscose": {
    dicasCostura: "Agulha universal nº 70/80. Ponto médio. Pré-lavar antes de cortar (encolhe). Overlock ou costura francesa. Não esticar ao costurar.",
    lavagem: "Lavar à mão ou ciclo delicado com água fria. Encolhe se lavada em água quente. Secar à sombra na horizontal. Ferro morno.",
    comoCortar: "Pré-lavar obrigatoriamente. Cortar sobre papel de seda. Usar pesos. Cortador rotativo recomendado pois o tecido escorrega."
  },
  "Linho": {
    dicasCostura: "Agulha nº 80/90. Ponto médio. Pré-lavar (encolhe bastante). Prense costuras abertas com ferro quente. Overlock nas bordas.",
    lavagem: "Pode lavar à máquina em ciclo normal. Ferro quente com vapor. Amassa naturalmente — é charme do linho. Amaciante opcional.",
    comoCortar: "Pré-lavar e passar antes de cortar. Cortar seguindo o fio. Tesoura afiada. Pode cortar em duas camadas."
  },
  "Tricoline": {
    dicasCostura: "Agulha universal nº 70/80. Tecido mais fácil para iniciantes. Ponto médio. Qualquer acabamento funciona. Pré-lavar recomendado.",
    lavagem: "Lavar à máquina normalmente. Pode usar secadora. Ferro quente. Tecido muito resistente e prático.",
    comoCortar: "O mais fácil de cortar. Pode cortar em várias camadas. Qualquer tesoura afiada. Seguir o fio do tecido. Ideal para praticar."
  },
  "Malha": {
    dicasCostura: "Agulha de ponta bola obrigatória. Ponto elástico, zigzag ou overlock. Não esticar ao costurar. Estabilizar ombros e decotes com entretela.",
    lavagem: "Lavar à máquina em ciclo delicado. Secar na horizontal (não pendurar). Ferro morno. Algumas malhas não precisam de ferro.",
    comoCortar: "Usar cortador rotativo (tesoura puxa o tecido). Pesos em vez de alfinetes. Cortar em camada única. Deixar descansar antes de cortar."
  },
  "Gabardine": {
    dicasCostura: "Agulha nº 90. Ponto médio. Prense costuras abertas com ferro quente. Use entretela no cós. Acabamento com overlock.",
    lavagem: "Lavar à máquina em ciclo normal ou lavagem a seco. Ferro quente com vapor. Tecido resistente.",
    comoCortar: "Fácil de cortar. Tesoura de alfaiate. Pode cortar em duas camadas. Seguir o fio. Marcar com giz."
  },
  "Oxford": {
    dicasCostura: "Agulha nº 80/90. Ponto médio. Tecido fácil e estável. Qualquer acabamento. Bom para iniciantes praticarem camisas.",
    lavagem: "Lavar à máquina normalmente. Ferro quente. Muito resistente. Seca rápido.",
    comoCortar: "Muito fácil de cortar. Qualquer método. Pode cortar em várias camadas. Não escorrega."
  },
  "Moletom": {
    dicasCostura: "Agulha de ponta bola nº 90. Ponto elástico ou overlock. Linha de poliéster. Estabilizar costuras dos ombros. Calcador de transporte ajuda.",
    lavagem: "Lavar à máquina do avesso em água fria/morna. Secar à sombra ou secadora em temperatura baixa. Não usar ferro quente no felpado.",
    comoCortar: "Cortador rotativo recomendado. Cortar em camada única (é grosso). Pesos para segurar. Cuidado com o felpado — cortar pelo lado liso."
  },
  "Jeans/Denim": {
    dicasCostura: "Agulha de jeans nº 90/100. Ponto longo (3mm). Use linha resistente. Agulha dupla para bainhas. Martele costuras grossas antes de costurar.",
    lavagem: "Lavar à máquina do avesso em água fria (preserva cor). Primeira lavagem separada. Ferro quente com vapor.",
    comoCortar: "Tesoura de alfaiate pesada ou cortador rotativo com lâmina nova. Cortar em camada única para jeans pesado. Marcar com giz."
  },
  "Suede": {
    dicasCostura: "Agulha nº 80/90. Costurar no sentido do pelo. Use calcador de teflon. Não desmanchar costuras (ficam marcas). Teste antes em retalho.",
    lavagem: "Lavagem a seco recomendada. Limpar manchas com escova macia. Não molhar. Vapor a distância para alinhar o pelo.",
    comoCortar: "Cortar em camada única, mesmo sentido do pelo. Usar pesos. Marcar no avesso com caneta. Tesoura afiada."
  },
  "Alfaiataria": {
    dicasCostura: "Agulha nº 80/90. Ponto médio. Usar entretela em lapelas, golas e cós. Prense cada costura aberta. Forro recomendado. Acabamento profissional com viés.",
    lavagem: "Lavagem a seco recomendada para manter estrutura. Ferro quente com vapor e pano protetor. Guardar em cabide.",
    comoCortar: "Cortar seguindo o fio com precisão. Marcar com giz de alfaiate. Tesoura afiada. Pode cortar em duas camadas. Respeitar margens de costura."
  },
};

const tecidos: Tecido[] = [
  // === TECIDOS LEVES - VESTIDOS DE FESTA ===
  { nome: "Chiffon", composicao: "Poliéster/Seda", gramatura: "Muito leve", elasticidade: "Nenhuma", caimento: "Aéreo e fluido", roupas: "Vestidos de festa fluidos, sobreposições", forro: "Obrigatório: forro de toque de seda, jersey fino ou charmeuse", dificuldade: "Avançado", emoji: "🤍", categoria: "Leve", modelosIndicados: "Vestidos esvoaçantes, modelos império, vestidos gregos, saias godê longas" },
  { nome: "Musseline", composicao: "Poliéster/Seda", gramatura: "Muito leve", elasticidade: "Nenhuma", caimento: "Aéreo e delicado", roupas: "Vestidos de festa, sobreposições elegantes", forro: "Obrigatório: forro de toque de seda ou charmeuse", dificuldade: "Avançado", emoji: "🕊️", categoria: "Leve", modelosIndicados: "Vestidos com camadas, modelos românticos, mangas fluidas, capas" },
  { nome: "Organza", composicao: "Poliéster/Seda", gramatura: "Muito leve", elasticidade: "Nenhuma", caimento: "Aéreo e transparente", roupas: "Detalhes, sobreposições, véus, vestidos de festa", forro: "Obrigatório: forro de toque de seda ou charmeuse", dificuldade: "Avançado", emoji: "🦋", categoria: "Leve", modelosIndicados: "Saias volumosas com camadas, mangas bufantes, detalhes de festa, vestidos princesa" },
  { nome: "Tule", composicao: "Poliéster/Nylon", gramatura: "Muito leve", elasticidade: "Baixa", caimento: "Aéreo e volumoso", roupas: "Saias, vestidos de festa, detalhes", forro: "Obrigatório: forro de toque de seda ou cetim", dificuldade: "Médio", emoji: "🩰", categoria: "Leve", modelosIndicados: "Saias bailarina, vestidos de noiva, underskirts, vestidos princesa volumosos" },
  { nome: "Crepe Georgette", composicao: "Poliéster/Seda", gramatura: "Leve", elasticidade: "Nenhuma", caimento: "Fluido com textura", roupas: "Vestidos de festa, blusas elegantes", forro: "Recomendado: forro de toque de seda ou musseline", dificuldade: "Avançado", emoji: "🌬️", categoria: "Leve", modelosIndicados: "Vestidos longos retos, modelos com drapeado, blusas de festa" },
  { nome: "Seda Pura", composicao: "Fibra natural (casulo)", gramatura: "Leve", elasticidade: "Nenhuma", caimento: "Ultra fluido e luxuoso", roupas: "Vestidos de festa de alta costura", forro: "Recomendado: organza de seda, musseline ou charmeuse de seda", dificuldade: "Avançado", emoji: "✨", categoria: "Leve", modelosIndicados: "Vestidos slip dress, modelos minimalistas, vestidos com cauda, alta costura" },
  { nome: "Jersey de Seda", composicao: "Seda/Elastano", gramatura: "Leve", elasticidade: "Alta", caimento: "Fluido e justo", roupas: "Vestidos de festa ajustados", forro: "Opcional: forro de malha fria ou jersey fino", dificuldade: "Médio", emoji: "💃", categoria: "Leve", modelosIndicados: "Vestidos sereia, modelos colados ao corpo, vestidos com fenda" },

  // === TECIDOS ESTRUTURADOS - VESTIDOS DE FESTA ===
  { nome: "Mikado", composicao: "Seda/Poliéster", gramatura: "Média a pesada", elasticidade: "Nenhuma", caimento: "Estruturado com brilho nobre", roupas: "Vestidos de festa e noiva estruturados", forro: "Recomendado: forro de bemberg, toque de seda ou acetato", dificuldade: "Avançado", emoji: "👑", categoria: "Estruturado", modelosIndicados: "Vestidos princesa, modelos A-line, vestidos tomara-que-caia, saias amplas" },
  { nome: "Zibeline", composicao: "Poliéster/Seda", gramatura: "Pesada", elasticidade: "Nenhuma", caimento: "Muito estruturado e elegante", roupas: "Vestidos de noiva e festa luxuosos", forro: "Recomendado: forro de bemberg ou acetato pesado", dificuldade: "Avançado", emoji: "🏛️", categoria: "Estruturado", modelosIndicados: "Vestidos ball gown, modelos com pregas, vestidos esculturais" },
  { nome: "Tafetá", composicao: "Poliéster/Seda", gramatura: "Leve a média", elasticidade: "Nenhuma", caimento: "Estruturado com brilho", roupas: "Vestidos de festa, saias volumosas", forro: "Opcional: forro de toque de seda", dificuldade: "Médio", emoji: "💎", categoria: "Estruturado", modelosIndicados: "Saias rodadas, vestidos de debutante, vestidos com volume, laços" },
  { nome: "Jacquard", composicao: "Poliéster/Algodão", gramatura: "Pesada", elasticidade: "Baixa", caimento: "Estruturado texturizado", roupas: "Vestidos de festa, saias, decoração", forro: "Recomendado: forro de tafetá ou acetato para estrutura", dificuldade: "Avançado", emoji: "🌟", categoria: "Estruturado", modelosIndicados: "Vestidos tubinho, modelos A-line, conjuntos de festa, saias midi" },
  { nome: "Brocado", composicao: "Seda/Poliéster/Fios metálicos", gramatura: "Pesada", elasticidade: "Nenhuma", caimento: "Muito estruturado com relevo", roupas: "Vestidos de gala, casacos de festa", forro: "Obrigatório: forro de bemberg ou acetato (proteger a pele)", dificuldade: "Avançado", emoji: "🪙", categoria: "Estruturado", modelosIndicados: "Vestidos tubinho curtos, casacos estruturados, saias midi, modelos vintage" },
  { nome: "Duchess (Duquesa)", composicao: "Seda/Poliéster", gramatura: "Pesada", elasticidade: "Nenhuma", caimento: "Ultra estruturado e luxuoso", roupas: "Vestidos de noiva e gala", forro: "Obrigatório: forro de bemberg ou toque de seda pesado", dificuldade: "Avançado", emoji: "💍", categoria: "Estruturado", modelosIndicados: "Vestidos ball gown, modelos com cauda, vestidos esculturais de alta costura" },
  { nome: "Neoprene", composicao: "Borracha sintética", gramatura: "Pesada", elasticidade: "Alta", caimento: "Estruturado moderno", roupas: "Vestidos de festa modernos", forro: "Dispensável (já possui camadas internas)", dificuldade: "Médio", emoji: "🟣", categoria: "Estruturado", modelosIndicados: "Vestidos tubinho, modelos geométricos, saias A-line, looks contemporâneos" },

  // === TECIDOS MÉDIOS/VERSÁTEIS - VESTIDOS DE FESTA ===
  { nome: "Cetim", composicao: "Poliéster/Seda", gramatura: "Média", elasticidade: "Baixa", caimento: "Fluido e brilhante", roupas: "Vestidos de festa, lingerie", forro: "Dispensável para peças curtas. Para longos: forro de toque de seda", dificuldade: "Avançado", emoji: "💫", categoria: "Versátil", modelosIndicados: "Vestidos slip dress, modelos com drapeado, vestidos sereia, saias longas" },
  { nome: "Renda", composicao: "Poliéster/Algodão/Nylon", gramatura: "Leve a média", elasticidade: "Baixa", caimento: "Delicado e vazado", roupas: "Vestidos de festa, blusas, detalhes", forro: "Obrigatório: forro de toque de seda (nude/contrastante), cetim ou jersey", dificuldade: "Avançado", emoji: "🌸", categoria: "Versátil", modelosIndicados: "Vestidos sereia, modelos com transparência, mangas longas, sobreposições" },
  { nome: "Crepe", composicao: "Poliéster", gramatura: "Média", elasticidade: "Baixa", caimento: "Fluido", roupas: "Vestidos de festa, blusas, saias", forro: "Dispensável (opcional: forro de malha fria ou viscose)", dificuldade: "Fácil", emoji: "🟤", categoria: "Versátil", modelosIndicados: "Vestidos retos elegantes, modelos com fenda, conjuntos de festa" },
  { nome: "Veludo", composicao: "Seda/Poliéster/Algodão", gramatura: "Média a pesada", elasticidade: "Baixa", caimento: "Rico e sofisticado", roupas: "Vestidos de festa de inverno, casacos", forro: "Recomendado: forro de toque de seda ou bemberg", dificuldade: "Avançado", emoji: "🍷", categoria: "Versátil", modelosIndicados: "Vestidos longos retos, modelos com decote nas costas, blazer-dress" },
  { nome: "Lurex/Glitter", composicao: "Poliéster/Fios metálicos", gramatura: "Leve a média", elasticidade: "Média", caimento: "Versátil com brilho", roupas: "Vestidos de festa, blusas de réveillon", forro: "Recomendado: forro de malha fria ou jersey (proteger a pele do brilho)", dificuldade: "Médio", emoji: "✨", categoria: "Versátil", modelosIndicados: "Vestidos justos, modelos de réveillon, tops de festa, saias midi" },
  { nome: "Paetê/Lantejoula", composicao: "Poliéster com aplicações", gramatura: "Média a pesada", elasticidade: "Baixa", caimento: "Semi-estruturado com muito brilho", roupas: "Vestidos de gala, tops de festa", forro: "Obrigatório: forro de jersey ou malha fria (proteger a pele)", dificuldade: "Avançado", emoji: "🪩", categoria: "Versátil", modelosIndicados: "Vestidos tubinho curtos, modelos sereia, tops cropped, saias lápis" },

  // === TECIDOS DO DIA A DIA ===
  { nome: "Viscose", composicao: "Fibra natural regenerada", gramatura: "Leve", elasticidade: "Baixa", caimento: "Muito fluido", roupas: "Vestidos, camisas, blusas", forro: "Opcional (sugestão: forro de toque de seda ou musseline)", dificuldade: "Médio", emoji: "🟡" },
  { nome: "Linho", composicao: "Fibra natural (linho)", gramatura: "Média", elasticidade: "Nenhuma", caimento: "Estruturado", roupas: "Calças, blazers, camisas", forro: "Opcional (sugestão: forro de bemberg ou viscose leve)", dificuldade: "Médio", emoji: "🟢" },
  { nome: "Tricoline", composicao: "Algodão", gramatura: "Leve", elasticidade: "Nenhuma", caimento: "Levemente estruturado", roupas: "Camisas, vestidos casuais", forro: "Dispensável (opcional: entretela leve para colarinhos)", dificuldade: "Fácil", emoji: "🔵" },
  { nome: "Malha", composicao: "Algodão/Poliéster", gramatura: "Média", elasticidade: "Alta", caimento: "Justo ao corpo", roupas: "Camisetas, vestidos casuais", forro: "Dispensável (para transparência: forro de malha fria)", dificuldade: "Fácil", emoji: "🟠" },
  { nome: "Gabardine", composicao: "Algodão/Poliéster", gramatura: "Pesada", elasticidade: "Nenhuma", caimento: "Estruturado", roupas: "Calças, blazers, alfaiataria", forro: "Recomendado: forro de bemberg, acetato ou tafetá", dificuldade: "Médio", emoji: "⬛" },
  { nome: "Oxford", composicao: "Poliéster", gramatura: "Média", elasticidade: "Nenhuma", caimento: "Estruturado", roupas: "Camisas, toalhas", forro: "Dispensável", dificuldade: "Fácil", emoji: "🔷" },
  { nome: "Moletom", composicao: "Algodão/Poliéster", gramatura: "Pesada", elasticidade: "Média", caimento: "Casual e confortável", roupas: "Moletons, calças jogger, conjuntos", forro: "Dispensável (já possui felpado interno)", dificuldade: "Fácil", emoji: "🧸" },
  { nome: "Jeans/Denim", composicao: "Algodão", gramatura: "Pesada", elasticidade: "Baixa a média", caimento: "Estruturado e firme", roupas: "Calças, jaquetas, saias", forro: "Opcional: forro de algodão para jaquetas", dificuldade: "Médio", emoji: "👖" },
  { nome: "Suede", composicao: "Poliéster", gramatura: "Média", elasticidade: "Baixa", caimento: "Levemente estruturado", roupas: "Saias, jaquetas, vestidos", forro: "Recomendado: forro de bemberg ou viscose", dificuldade: "Médio", emoji: "🍂" },
  { nome: "Alfaiataria", composicao: "Poliéster/Lã/Elastano", gramatura: "Média a pesada", elasticidade: "Baixa", caimento: "Estruturado e elegante", roupas: "Calças sociais, blazers, coletes", forro: "Recomendado: forro de bemberg, acetato ou tafetá fino", dificuldade: "Médio", emoji: "🎩" },
];

const dificuldades = ["Todos", "Fácil", "Médio", "Avançado"] as const;
const categorias = ["Todos", "Leve", "Estruturado", "Versátil"] as const;

export default function Tecidos() {
  const [busca, setBusca] = useState("");
  const [filtroDificuldade, setFiltroDificuldade] = useState<string>("Todos");
  const [filtroCategoria, setFiltroCategoria] = useState<string>("Todos");
  const [expandido, setExpandido] = useState<string | null>(null);

  const normalizeText = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const buscaNormalizada = normalizeText(busca.trim());

  const filtrados = tecidos.filter((t) => {
    if (filtroDificuldade !== "Todos" && t.dificuldade !== filtroDificuldade) return false;
    if (filtroCategoria !== "Todos" && t.categoria !== filtroCategoria) return false;
    if (!buscaNormalizada) return true;
    return (
      normalizeText(t.nome).includes(buscaNormalizada) ||
      normalizeText(t.roupas).includes(buscaNormalizada) ||
      normalizeText(t.composicao).includes(buscaNormalizada) ||
      normalizeText(t.caimento).includes(buscaNormalizada) ||
      normalizeText(t.dificuldade).includes(buscaNormalizada) ||
      normalizeText(t.modelosIndicados || "").includes(buscaNormalizada)
    );
  });

  const getDificuldadeStyle = (d: string) => {
    if (d === "Fácil") return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
    if (d === "Médio") return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
  };

  const getFilterStyle = (d: string, isActive: boolean) => {
    if (isActive) return "bg-primary text-primary-foreground shadow-md";
    return "bg-muted text-muted-foreground hover:bg-accent";
  };

  const getDificuldadeFilterStyle = (d: string) => {
    const isActive = filtroDificuldade === d;
    if (d === "Todos") return getFilterStyle(d, isActive);
    if (d === "Fácil") return isActive ? "bg-green-600 text-white shadow-md" : "bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400";
    if (d === "Médio") return isActive ? "bg-yellow-600 text-white shadow-md" : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400";
    return isActive ? "bg-red-600 text-white shadow-md" : "bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400";
  };

  const getCategoriaStyle = (c: string) => {
    if (c === "Leve") return "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400";
    if (c === "Estruturado") return "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400";
    if (c === "Versátil") return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
    return "";
  };

  const getCategoriaFilterStyle = (c: string) => {
    const isActive = filtroCategoria === c;
    if (c === "Todos") return getFilterStyle(c, isActive);
    if (c === "Leve") return isActive ? "bg-sky-600 text-white shadow-md" : "bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900/30 dark:text-sky-400";
    if (c === "Estruturado") return isActive ? "bg-orange-600 text-white shadow-md" : "bg-orange-100 text-orange-700 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-400";
    return isActive ? "bg-purple-600 text-white shadow-md" : "bg-purple-100 text-purple-700 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400";
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-2">📚 Biblioteca de Tecidos</h1>
        <p className="text-muted-foreground mb-6">Consulte informações sobre diversos tecidos para festa e dia a dia</p>

        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar tecido, tipo de roupa ou modelo..."
            className="pl-11 h-12 rounded-xl bg-card"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>

        {/* Filtro por tipo de tecido */}
        <div className="mb-3">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Tipo de tecido</p>
          <div className="flex flex-wrap gap-2">
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setFiltroCategoria(c)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${getCategoriaFilterStyle(c)}`}
              >
                {c} {c !== "Todos" && `(${tecidos.filter((t) => t.categoria === c).length})`}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por dificuldade */}
        <div className="mb-6">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider">Dificuldade</p>
          <div className="flex flex-wrap gap-2">
            {dificuldades.map((d) => (
              <button
                key={d}
                onClick={() => setFiltroDificuldade(d)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${getDificuldadeFilterStyle(d)}`}
              >
                {d} {d !== "Todos" && `(${tecidos.filter((t) => t.dificuldade === d).length})`}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtrados.length} tecido{filtrados.length !== 1 ? "s" : ""} encontrado{filtrados.length !== 1 ? "s" : ""}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map((t, i) => (
            <motion.div
              key={t.nome}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-card border border-border rounded-2xl p-5 card-hover"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="text-3xl">{t.emoji}</span>
                <div>
                  <h3 className="font-display text-xl font-semibold">{t.nome}</h3>
                  {t.categoria && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getCategoriaStyle(t.categoria)}`}>
                      {t.categoria === "Leve" ? "🪶 Leve" : t.categoria === "Estruturado" ? "🧱 Estruturado" : "🔄 Versátil"}
                    </span>
                  )}
                </div>
              </div>
              <div className="space-y-1.5 text-sm">
                <p><span className="text-muted-foreground">Composição:</span> {t.composicao}</p>
                <p><span className="text-muted-foreground">Gramatura:</span> {t.gramatura}</p>
                <p><span className="text-muted-foreground">Elasticidade:</span> {t.elasticidade}</p>
                <p><span className="text-muted-foreground">Caimento:</span> {t.caimento}</p>
                <p><span className="text-muted-foreground">Roupas ideais:</span> {t.roupas}</p>
                {t.modelosIndicados && (
                  <p><span className="text-muted-foreground">Modelos indicados:</span> <span className="text-primary font-medium">{t.modelosIndicados}</span></p>
                )}
                <div className="pt-1 border-t border-border mt-2">
                  <p className="mt-2"><span className="text-muted-foreground">🧵 Forro:</span> {t.forro}</p>
                </div>
                <div className="pt-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getDificuldadeStyle(t.dificuldade)}`}>
                    {t.dificuldade}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </AppLayout>
  );
}
