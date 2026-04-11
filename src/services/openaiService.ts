import OpenAI from "openai";
import { config, requireSecret } from "../config.js";
import { ConsultationReplyInput } from "../types.js";
import {
  buildConversationSummary,
  getHybridReply,
  summarizeTopics,
} from "./replyOptimizationService.js";
import {
  hasReachedDailyUserTokenLimit,
  recordBotTokenUsage,
} from "./tokenUsageService.js";

const client = new OpenAI({
  apiKey: requireSecret("OPENAI_API_KEY"),
});

function buildPromptEnvelope(input: {
  businessContext: string;
  currentQuestion: string;
  responseGoal: string;
}) {
  return [
    "Voce e consultor comercial da Brasil Smart Service no WhatsApp.",
    "Responda em pt-BR, com objetividade, sem floreio e sem repetir saudacao.",
    "Use no maximo 3 blocos curtos ou 4 bullets curtos quando houver varias perguntas.",
    "Responda somente ao que ajuda a avancar a conversa comercial agora.",
    "Nao cite IA, prompt, sistema ou limitacoes.",
    `Contexto relevante: ${input.businessContext}`,
    `Pedido atual: ${input.currentQuestion}`,
    `Objetivo da resposta: ${input.responseGoal}`,
  ].join("\n");
}

async function runPrompt(input: {
  prompt: string;
  userMessage: string;
  customerPhone: string;
  customerName: string;
}) {
  const hybridReply = getHybridReply(input.userMessage);

  if (hybridReply) {
    await recordBotTokenUsage({
      status: hybridReply.source,
      customerPhone: input.customerPhone,
      customerName: input.customerName,
    });

    return hybridReply.body;
  }

  if (await hasReachedDailyUserTokenLimit(input.customerPhone)) {
    const body =
      "Hoje eu ja atingi o limite de consultas automatizadas deste numero. Posso retomar no proximo ciclo ou seguir com um encaminhamento comercial mais direto.";

    await recordBotTokenUsage({
      status: "limit_exceeded",
      customerPhone: input.customerPhone,
      customerName: input.customerName,
    });

    return body;
  }

  try {
    const response = await client.responses.create({
      model: config.OPENAI_MODEL,
      input: input.prompt,
    });

    await recordBotTokenUsage({
      totalTokens: response.usage?.total_tokens,
      inputTokens: response.usage?.input_tokens,
      outputTokens: response.usage?.output_tokens,
      status: "success",
      customerPhone: input.customerPhone,
      customerName: input.customerName,
    });

    return response.output_text.trim();
  } catch (error) {
    await recordBotTokenUsage({
      status: "error",
      customerPhone: input.customerPhone,
      customerName: input.customerName,
    });
    console.error("OpenAI consultation generation failed", error);
    throw error;
  }
}

export async function createScenarioIntroduction(input: {
  customerName: string;
  customerPhone: string;
  automationGoal: string;
  serviceToAutomate: string;
}): Promise<{
  reply: string;
  summary: string;
  recentTopics: string[];
}> {
  const recentTopics = summarizeTopics(undefined, input.serviceToAutomate);
  const summary = buildConversationSummary({
    automationGoal: input.automationGoal,
    serviceToAutomate: input.serviceToAutomate,
    recentTopics,
  });

  try {
    const reply = await runPrompt({
      customerPhone: input.customerPhone,
      customerName: input.customerName,
      userMessage: input.serviceToAutomate,
      prompt: buildPromptEnvelope({
        businessContext: summary,
        currentQuestion: `Primeiro desenho do fluxo para ${input.serviceToAutomate}.`,
        responseGoal:
          "Explicar implantacao, triagem, dados coletados, repasse humano e terminar com uma pergunta curta. Limite de 700 caracteres.",
      }),
    });

    return {
      reply,
      summary,
      recentTopics,
    };
  } catch {
    return {
      reply: [
        `Para automatizar ${input.serviceToAutomate}, primeiro desenhamos o fluxo real desse processo no seu WhatsApp.`,
        "Depois configuramos perguntas, triagem, respostas e repasse para sua equipe no ponto certo.",
        "Se quiser, me diga como isso funciona hoje no seu negocio.",
      ].join(" "),
      summary,
      recentTopics,
    };
  }
}

export async function generateScenarioReply(input: ConsultationReplyInput): Promise<{
  reply: string;
  summary: string;
  recentTopics: string[];
}> {
  const recentTopics = summarizeTopics(input.recentTopics, input.customerMessage);
  const summary = buildConversationSummary({
    automationGoal: input.automationGoal,
    serviceToAutomate: input.serviceToAutomate,
    implementationSummary: input.implementationSummary,
    previousSummary: input.conversationSummary,
    recentTopics,
  });

  try {
    const reply = await runPrompt({
      customerPhone: input.customerPhone,
      customerName: input.customerName,
      userMessage: input.customerMessage,
      prompt: buildPromptEnvelope({
        businessContext: summary,
        currentQuestion: input.customerMessage,
        responseGoal:
          "Responder todas as perguntas relevantes do usuario em uma unica mensagem curta, com foco operacional e proximo passo concreto. Limite de 700 caracteres.",
      }),
    });

    return {
      reply,
      summary,
      recentTopics,
    };
  } catch {
    return {
      reply: [
        `Nesse caso, o bot pode assumir a etapa inicial de ${input.serviceToAutomate}, organizar as informacoes e repassar no ponto certo.`,
        "Sua equipe entra com contexto, menos retrabalho e mais foco em decisao ou fechamento.",
        "Se quiser, me diga a principal duvida comercial que aparece hoje nesse fluxo.",
      ].join(" "),
      summary,
      recentTopics,
    };
  }
}
