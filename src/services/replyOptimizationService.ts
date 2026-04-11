import { HybridReply } from "../types.js";

type CacheEntry = {
  body: string;
  expiresAt: number;
};

const faqCache = new Map<string, CacheEntry>();
const faqCacheTtlMs = 1000 * 60 * 60 * 6;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function buildCacheKey(message: string) {
  return normalize(message);
}

function readCache(message: string): HybridReply | undefined {
  const key = buildCacheKey(message);
  const entry = faqCache.get(key);

  if (!entry) {
    return undefined;
  }

  if (entry.expiresAt <= Date.now()) {
    faqCache.delete(key);
    return undefined;
  }

  return {
    body: entry.body,
    source: "cache",
  };
}

function writeCache(message: string, body: string) {
  faqCache.set(buildCacheKey(message), {
    body,
    expiresAt: Date.now() + faqCacheTtlMs,
  });
}

function buildFaqReply(message: string): string | undefined {
  const normalized = normalize(message);

  if (
    /\b(preco|precos|valor|valores|quanto custa|orcamento|mensalidade|plano|planos)\b/.test(
      normalized,
    )
  ) {
    return [
      "Os valores dependem do volume, do fluxo e do nivel de integracao da operacao.",
      "Normalmente fechamos isso depois de entender atendimento, qualificacao, repasse e metas comerciais.",
      "Se quiser, eu posso te dizer agora qual formato de plano faz mais sentido para o seu caso.",
    ].join(" ");
  }

  if (
    /\b(horario|horarios|funcionamento|atendimento|expediente|abre|fecha)\b/.test(
      normalized,
    )
  ) {
    return [
      "A automacao pode atender 24 horas por dia e repassar para sua equipe nos horarios definidos pela operacao.",
      "Se voce ja tiver janela comercial, o bot informa isso e organiza o retorno sem perder contexto.",
      "Quer que eu te mostre como isso ficaria no seu atendimento?",
    ].join(" ");
  }

  if (/\b(faq|duvidas frequentes|perguntas frequentes)\b/.test(normalized)) {
    return [
      "Sim. O bot pode responder FAQ, qualificar contato, filtrar urgencia, registrar dados e encaminhar quando entrar decisao humana.",
      "A ideia e tirar repeticao do time sem perder contexto comercial.",
      "Se quiser, eu posso montar um exemplo com as duvidas mais comuns do seu negocio.",
    ].join(" ");
  }

  return undefined;
}

export function getHybridReply(message: string): HybridReply | undefined {
  const cached = readCache(message);

  if (cached) {
    return cached;
  }

  const body = buildFaqReply(message);

  if (!body) {
    return undefined;
  }

  writeCache(message, body);

  return {
    body,
    source: "rule",
  };
}

export function summarizeTopics(
  previousTopics: string[] | undefined,
  customerMessage: string,
): string[] {
  const nextTopic = customerMessage
    .split(/[.?!;\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 2)
    .join(" | ")
    .slice(0, 140);

  const merged = [...(previousTopics ?? []), nextTopic].filter(Boolean);
  return merged.slice(-4);
}

export function buildConversationSummary(input: {
  automationGoal: string;
  serviceToAutomate: string;
  implementationSummary?: string;
  previousSummary?: string;
  recentTopics?: string[];
}) {
  const parts = [
    `Objetivo: ${input.automationGoal}.`,
    `Processo: ${input.serviceToAutomate}.`,
  ];

  if (input.implementationSummary) {
    parts.push(`Fluxo base: ${input.implementationSummary.slice(0, 220)}.`);
  }

  if (input.previousSummary) {
    parts.push(`Resumo anterior: ${input.previousSummary.slice(0, 220)}.`);
  }

  if (input.recentTopics && input.recentTopics.length > 0) {
    parts.push(`Topicos recentes: ${input.recentTopics.join("; ")}.`);
  }

  return parts.join(" ");
}
