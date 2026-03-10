import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Scissors, AlertTriangle, Calculator, Camera, Palette, BookOpen,
  CheckCircle2, Clock, Sparkles, ChevronRight, Star, Zap, Shield
} from "lucide-react";
import heroImg from "@/assets/costureira-hero.jpg";
import appMockup from "@/assets/app-mockup.jpg";
import logoImg from "@/assets/logo-atelieh-marca.png";

const QUIZ_QUESTIONS = [
  {
    question: "Qual sua maior dificuldade hoje?",
    options: ["Calcular preço da costura", "Criar novos modelos", "Escolher tecidos", "Organizar o trabalho"],
  },
  {
    question: "Quando você recebe um tecido novo:",
    options: ["Não sei qual modelo fazer", "Demoro para decidir", "Fico com medo de cortar", "Preciso pesquisar ideias"],
  },
  {
    question: "Você sente que poderia ganhar mais com costura?",
    options: ["Sim", "Muito mais", "Com certeza", "Preciso melhorar"],
  },
  {
    question: "Quanto tempo você leva para planejar uma peça?",
    options: ["Mais de 1 hora", "Cerca de 30 minutos", "Muito tempo testando ideias", "Às vezes desisto"],
  },
  {
    question: "Se existisse um app que ajudasse você a resolver tudo isso, você usaria?",
    options: ["Sim, com certeza", "Provavelmente", "Quero conhecer primeiro"],
  },
];

const APP_URL = "https://universodacostura.lovable.app";

export default function QuizFunil() {
  const [section, setSection] = useState<"landing" | "quiz" | "result">("landing");
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [vagasRestantes] = useState(19);
  const [counter, setCounter] = useState({ h: 2, m: 47, s: 33 });

  useEffect(() => {
    const timer = setInterval(() => {
      setCounter((prev) => {
        let { h, m, s } = prev;
        s--;
        if (s < 0) { s = 59; m--; }
        if (m < 0) { m = 59; h--; }
        if (h < 0) return { h: 0, m: 0, s: 0 };
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAnswer = (answer: string) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setSection("result");
    }
  };

  const startQuiz = () => {
    setSection("quiz");
    setCurrentQ(0);
    setAnswers([]);
    document.getElementById("quiz-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToOffer = () => {
    document.getElementById("oferta-section")?.scrollIntoView({ behavior: "smooth" });
  };

  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <div className="min-h-screen font-body">
      {/* BARRA FIXA TOPO */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-foreground text-accent text-center py-2 px-4 text-sm font-semibold flex items-center justify-center gap-2">
        <AlertTriangle size={16} />
        <span>⚠️ Promoção termina hoje — Restam apenas {vagasRestantes} acessos promocionais</span>
        <span className="hidden sm:inline ml-2 bg-accent text-foreground px-2 py-0.5 rounded text-xs font-bold">
          {pad(counter.h)}:{pad(counter.m)}:{pad(counter.s)}
        </span>
      </div>

      {/* 1️⃣ HERO */}
      <section className="pt-16 bg-background min-h-[90vh] flex items-center">
        <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center py-12">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 bg-accent/10 text-accent px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
              <AlertTriangle size={14} /> ATENÇÃO COSTUREIRA
            </div>
            <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground leading-tight mb-6">
              Descubra Agora Se Você Está{" "}
              <span className="gold-gradient-text">Perdendo Dinheiro</span> Na Costura
            </h1>
            <p className="text-muted-foreground text-lg mb-4">
              Muitas costureiras têm talento… mas acabam ganhando menos do que poderiam porque:
            </p>
            <ul className="space-y-2 mb-8 text-foreground">
              <li className="flex items-start gap-2"><span className="text-destructive font-bold">❌</span> erram cálculo de tecido</li>
              <li className="flex items-start gap-2"><span className="text-destructive font-bold">❌</span> não sabem precificar corretamente</li>
              <li className="flex items-start gap-2"><span className="text-destructive font-bold">❌</span> ficam sem ideias de modelos</li>
              <li className="flex items-start gap-2"><span className="text-destructive font-bold">❌</span> perdem tempo tentando descobrir tecidos</li>
            </ul>
            <p className="text-accent font-semibold mb-6">💡 Em apenas 2 minutos descubra se está cometendo esses erros.</p>
            <Button onClick={startQuiz} size="lg" className="bg-accent text-accent-foreground hover:bg-gold-dark text-lg px-10 py-6 rounded-full font-bold shadow-lg hover:shadow-xl transition-all shimmer">
              FAZER O TESTE GRATUITO AGORA <ChevronRight className="ml-1" />
            </Button>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7, delay: 0.2 }} className="flex justify-center">
            <img src={heroImg} alt="Costureira feliz no ateliê" className="rounded-3xl shadow-2xl max-w-md w-full object-cover" />
          </motion.div>
        </div>
      </section>

      {/* 2️⃣ DOR */}
      <section className="bg-card py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Seja sincera… <span className="gold-gradient-text">Você já passou por isso?</span>
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12 max-w-4xl mx-auto">
              {[
                { icon: Scissors, text: "Ficou com medo de cortar um tecido caro" },
                { icon: Calculator, text: "Não soube quanto cobrar por uma peça" },
                { icon: AlertTriangle, text: "Perdeu tecido por erro de cálculo" },
                { icon: Sparkles, text: "Ficou sem ideias de modelos" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Card className="p-6 text-center border-accent/20 hover:border-accent/50 transition-colors">
                    <item.icon className="h-10 w-10 mx-auto mb-4 text-accent" />
                    <p className="text-foreground font-medium">{item.text}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
            <p className="mt-10 text-muted-foreground text-lg max-w-2xl mx-auto">
              Isso acontece com milhares de costureiras todos os dias.
              Mas hoje existem <strong className="text-accent">ferramentas inteligentes</strong> que resolvem isso em segundos.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 3️⃣ CURIOSIDADE */}
      <section className="bg-foreground py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-background mb-10">
              E se você tivesse no celular um app que pudesse:
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { emoji: "🧮", label: "Calcular o preço ideal da sua costura" },
                { emoji: "📸", label: "Identificar tecidos apenas com uma foto" },
                { emoji: "🎨", label: "Criar ideias de roupas com seus tecidos" },
                { emoji: "📚", label: "Consultar informações sobre tecidos" },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                  className="bg-background/5 backdrop-blur border border-accent/20 rounded-2xl p-6 text-background">
                  <div className="text-4xl mb-3">{item.emoji}</div>
                  <p className="font-medium">{item.label}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-accent text-xl font-display font-semibold mt-10">Isso já existe. ✨</p>
            <p className="text-background/70 mt-2 mb-6">Mas antes… descubra qual é o seu maior bloqueio na costura.</p>
            <Button onClick={startQuiz} size="lg" className="bg-accent text-accent-foreground hover:bg-gold-dark text-lg px-10 py-6 rounded-full font-bold">
              COMEÇAR O QUIZ <ChevronRight className="ml-1" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* 4️⃣ QUIZ */}
      <section id="quiz-section" className="bg-background py-20">
        <div className="container mx-auto px-4 flex justify-center">
          <AnimatePresence mode="wait">
            {section === "quiz" ? (
              <motion.div key={`q-${currentQ}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="w-full max-w-lg">
                <Card className="p-8 border-2 border-accent/30 shadow-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="text-accent" size={20} />
                    <span className="text-sm text-muted-foreground font-semibold">Pergunta {currentQ + 1} de {QUIZ_QUESTIONS.length}</span>
                  </div>
                  <Progress value={((currentQ + 1) / QUIZ_QUESTIONS.length) * 100} className="mb-6 h-2 [&>div]:bg-accent" />
                  <h3 className="font-display text-xl font-bold mb-6 text-foreground">
                    {QUIZ_QUESTIONS[currentQ].question}
                  </h3>
                  <div className="space-y-3">
                    {QUIZ_QUESTIONS[currentQ].options.map((opt, i) => (
                      <button key={i} onClick={() => handleAnswer(opt)}
                        className="w-full text-left px-5 py-4 rounded-xl border-2 border-border hover:border-accent hover:bg-accent/5 transition-all font-medium text-foreground flex items-center gap-3 group">
                        <span className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-bold group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                          {String.fromCharCode(65 + i)}
                        </span>
                        {opt}
                      </button>
                    ))}
                  </div>
                </Card>
              </motion.div>
            ) : section === "landing" ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center max-w-lg">
                <Card className="p-8 border-2 border-accent/30">
                  <Sparkles className="h-12 w-12 text-accent mx-auto mb-4" />
                  <h3 className="font-display text-2xl font-bold mb-2">Descubra seu perfil de costureira</h3>
                  <p className="text-muted-foreground mb-6">Responda algumas perguntas rápidas. Leva menos de 2 minutos.</p>
                  <Button onClick={startQuiz} size="lg" className="bg-accent text-accent-foreground hover:bg-gold-dark px-8 py-5 rounded-full font-bold text-lg">
                    COMEÇAR AGORA
                  </Button>
                </Card>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>
      </section>

      {/* 5️⃣ RESULTADO (shown after quiz) */}
      {section === "result" && (
        <>
          <section className="bg-card py-20">
            <div className="container mx-auto px-4 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <CheckCircle2 size={16} /> DIAGNÓSTICO PRONTO
                </div>
                <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                  Seu diagnóstico está <span className="gold-gradient-text">pronto</span>
                </h2>
                <div className="max-w-2xl mx-auto">
                  <p className="text-lg text-foreground mb-4">Pelas suas respostas… <strong>você tem grande potencial na costura.</strong></p>
                  <p className="text-muted-foreground mb-8">Mas provavelmente está perdendo tempo e dinheiro porque não possui ferramentas que acelerem o seu trabalho.</p>
                  <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto mb-8">
                    {[
                      { icon: Scissors, label: "Tecido" },
                      { icon: Clock, label: "Tempo" },
                      { icon: Calculator, label: "Dinheiro" },
                    ].map((item, i) => (
                      <div key={i} className="flex flex-col items-center gap-2 p-4 bg-destructive/10 rounded-xl">
                        <item.icon className="text-destructive" size={24} />
                        <span className="text-sm font-bold text-destructive">❌ {item.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-accent font-semibold text-lg">Mas existe uma forma muito mais fácil. ✨</p>
                </div>
              </motion.div>
            </div>
          </section>

          {/* 6️⃣ APRESENTAÇÃO DO APP */}
          <section className="bg-foreground py-20">
            <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex justify-center">
                <img src={appMockup} alt="UniCost IA App" className="max-w-xs w-full rounded-3xl shadow-2xl" />
              </motion.div>
              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <p className="text-accent text-sm font-semibold tracking-widest mb-2">CONHEÇA O</p>
                <h2 className="font-display text-4xl md:text-5xl font-bold text-background mb-2">UniCost IA</h2>
                <p className="text-accent text-xl font-display mb-6">Universo da Costura com a Sol</p>
                <p className="text-background/70 text-lg mb-8">
                  Um aplicativo criado para facilitar a vida de costureiras e alunas. Dentro do app você encontra ferramentas que ajudam você a costurar com mais segurança e rapidez.
                </p>
                <img src={logoImg} alt="Atelieh Mãezinha" className="w-24 h-24 rounded-full object-cover border-2 border-accent/30" />
              </motion.div>
            </div>
          </section>

          {/* 7️⃣ FUNCIONALIDADES */}
          <section className="bg-background py-20">
            <div className="container mx-auto px-4">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-center mb-4">
                O que você recebe no <span className="gold-gradient-text">App</span>
              </h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                {[
                  { icon: Calculator, emoji: "🧮", title: "Calculadora de Preço", desc: "Calcule o valor ideal dos seus serviços de costura e evite cobrar menos do que deveria." },
                  { icon: Camera, emoji: "📸", title: "Identificador de Tecidos", desc: "Envie uma foto e descubra qual é o tecido usando inteligência artificial." },
                  { icon: Palette, emoji: "🎨", title: "Criador de Roupa", desc: "Envie uma foto do tecido e descreva o que deseja criar. A IA gera ideias de modelos." },
                  { icon: BookOpen, emoji: "📚", title: "Biblioteca de Tecidos", desc: "Consulte características, caimento, onde usar e qual forro combinar." },
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                    <Card className="p-6 h-full border-accent/20 card-hover">
                      <div className="text-4xl mb-4">{item.emoji}</div>
                      <h3 className="font-display text-lg font-bold mb-2 text-foreground">{item.title}</h3>
                      <p className="text-muted-foreground text-sm">{item.desc}</p>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* 8️⃣ BENEFÍCIOS */}
          <section className="bg-card py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="font-display text-3xl md:text-4xl font-bold mb-10">
                Com o UniCost IA você pode:
              </h2>
              <div className="max-w-md mx-auto space-y-4">
                {[
                  "Economizar tecido",
                  "Cobrar melhor pelos seus serviços",
                  "Criar modelos mais rápido",
                  "Ter ideias de looks em segundos",
                  "Trabalhar com mais segurança",
                ].map((item, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                    className="flex items-center gap-3 bg-background rounded-xl px-5 py-4 shadow-sm">
                    <CheckCircle2 className="text-accent shrink-0" size={22} />
                    <span className="font-medium text-foreground">{item}</span>
                  </motion.div>
                ))}
              </div>
              <p className="text-accent font-display text-lg font-semibold mt-10">
                É como ter uma assistente de costura no celular. 📱
              </p>
            </div>
          </section>

          {/* 9️⃣ OFERTA */}
          <section id="oferta-section" className="bg-foreground py-20">
            <div className="container mx-auto px-4 text-center">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
                <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <Zap size={16} /> OFERTA POR TEMPO LIMITADO
                </div>
                <p className="text-background/50 text-lg mb-2">Valor normal do app:</p>
                <p className="text-background/40 text-3xl font-bold line-through mb-4">R$ 628,00</p>
                <p className="text-background text-lg mb-2">Hoje você pode acessar por:</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 my-8">
                  <div className="bg-accent/10 border-2 border-accent rounded-2xl px-8 py-6">
                    <p className="text-accent text-5xl font-display font-bold">R$10</p>
                    <p className="text-background/70 text-sm mt-1">por mês</p>
                  </div>
                  <span className="text-background/40 text-xl font-bold">ou</span>
                  <div className="bg-accent/10 border-2 border-accent rounded-2xl px-8 py-6">
                    <p className="text-accent text-5xl font-display font-bold">R$97</p>
                    <p className="text-background/70 text-sm mt-1">no PIX</p>
                    <p className="text-accent text-xs font-bold mt-1">🔥 Acesso Vitalício</p>
                  </div>
                </div>
                <p className="text-accent/80 text-sm">Promoção especial de lançamento</p>
              </motion.div>
            </div>
          </section>

          {/* 🔟 ESCASSEZ */}
          <section className="bg-background py-20">
            <div className="container mx-auto px-4 text-center">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-8">
                Vagas promocionais de <span className="gold-gradient-text">hoje</span>
              </h2>
              <div className="max-w-md mx-auto">
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="bg-card rounded-xl p-4">
                    <p className="text-3xl font-bold font-display text-foreground">50</p>
                    <p className="text-xs text-muted-foreground">acessos</p>
                  </div>
                  <div className="bg-accent/10 rounded-xl p-4">
                    <p className="text-3xl font-bold font-display text-accent">31</p>
                    <p className="text-xs text-muted-foreground">já entraram</p>
                  </div>
                  <div className="bg-destructive/10 rounded-xl p-4">
                    <p className="text-3xl font-bold font-display text-destructive">{vagasRestantes}</p>
                    <p className="text-xs text-muted-foreground">restantes</p>
                  </div>
                </div>
                <div className="mb-4">
                  <Progress value={62} className="h-4 [&>div]:bg-accent rounded-full" />
                </div>
                <p className="text-accent font-bold">62% das vagas preenchidas</p>
              </div>
            </div>
          </section>

          {/* 11️⃣ GATILHO FINAL */}
          <section className="bg-card py-12">
            <div className="container mx-auto px-4 text-center">
              <div className="flex items-center justify-center gap-2 text-destructive mb-4">
                <AlertTriangle size={20} />
                <span className="font-bold">ATENÇÃO</span>
              </div>
              <p className="text-foreground text-lg max-w-xl mx-auto">
                Quando os 50 acessos promocionais forem preenchidos… o valor volta para <strong className="text-destructive text-2xl">R$628</strong>
              </p>
            </div>
          </section>

          {/* 12️⃣ CTA FINAL */}
          <section className="bg-accent py-20">
            <div className="container mx-auto px-4 text-center">
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-accent-foreground mb-6">
                  Garanta agora seu acesso ao UniCost IA
                </h2>
                <div className="flex flex-wrap justify-center gap-3 mb-8">
                  {["Calcular preço", "Identificar tecidos", "Criar modelos", "Evoluir na costura"].map((t, i) => (
                    <span key={i} className="bg-accent-foreground/10 text-accent-foreground px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> {t}
                    </span>
                  ))}
                </div>
                <Button asChild size="lg" className="bg-foreground text-background hover:bg-foreground/90 text-xl px-12 py-7 rounded-full font-bold shadow-2xl">
                  <a href={APP_URL} target="_blank" rel="noopener noreferrer">
                    QUERO ACESSAR O APP AGORA 🚀
                  </a>
                </Button>
                <p className="text-accent-foreground/70 mt-8 text-sm">
                  Mais de uma costureira garante acesso a cada poucos minutos.<br />
                  Se ainda houver vagas disponíveis… <strong>aproveite agora.</strong>
                </p>
              </motion.div>
            </div>
          </section>

          {/* PROVA SOCIAL */}
          <section className="bg-background py-16">
            <div className="container mx-auto px-4 text-center">
              <div className="flex justify-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => <Star key={i} className="text-accent fill-accent" size={24} />)}
              </div>
              <p className="text-foreground text-lg font-display font-semibold max-w-lg mx-auto">
                Mais de 3.200 costureiras já fazem parte do Universo da Costura com a Sol.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground text-sm">
                <Shield size={16} /> Acesso seguro e imediato
              </div>
            </div>
          </section>
        </>
      )}

      {/* FLOATING CTA (after result) */}
      {section === "result" && (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-foreground/95 backdrop-blur border-t border-accent/30 p-3 flex items-center justify-center gap-4">
          <span className="text-accent text-sm font-semibold hidden sm:block">🔥 {vagasRestantes} vagas restantes</span>
          <Button asChild size="lg" className="bg-accent text-accent-foreground hover:bg-gold-dark rounded-full font-bold px-8">
            <a href={APP_URL} target="_blank" rel="noopener noreferrer">
              ACESSAR O APP AGORA
            </a>
          </Button>
        </div>
      )}
    </div>
  );
}
