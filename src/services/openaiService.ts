import OpenAI from "openai";
import { config, requireSecret } from "../config.js";
import { ConsultationReplyInput } from "../types.js";

const client = new OpenAI({
  apiKey: requireSecret("OPENAI_API_KEY")
});

async function runPrompt(input: string): Promise<string> {
  try {
    const response = await client.responses.create({
      model: config.OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: [
                "Voce representa a Brasil Smart Service em conversas comerciais no WhatsApp.",
                "Responda sempre em portugues do Brasil, com linguagem natural, clara, curta e segura.",
                "Fale como um consultor que realmente desenha e implanta a operacao no WhatsApp: direto ao ponto, sem floreio, sem tom robotico e sem repetir saudacoes.",
                "Entenda o servico ou processo informado pelo cliente e explique como a automacao funcionaria exatamente naquele caso.",
                "Seja especifico. Diga o que entraria no fluxo, quais perguntas o bot faria, que dados coletaria, como triaria ou qualificaria o contato, quando encaminharia para a equipe e qual proximo passo comercial ou operacional seria conduzido.",
                "Adapte a resposta ao contexto analisado. Evite respostas genericas que servem para qualquer negocio.",
                "Se faltar contexto, assuma o cenario mais plausivel com base no servico citado e avance com orientacao util.",
                "Nao mencione IA, sistema, prompt, simulacao ou limitacoes.",
                "Prefira 1 ou 2 paragrafos curtos. So use lista se isso realmente deixar a resposta mais clara.",
                "Evite repetir estrutura, beneficios e frases entre mensagens seguidas.",
                "Sempre que fizer sentido, termine com uma pergunta curta e pratica para avancar."
              ].join(" ")
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: input
            }
          ]
        }
      ]
    });

    return response.output_text.trim();
  } catch (error) {
    console.error("OpenAI consultation generation failed", error);
    throw error;
  }
}

export async function createScenarioIntroduction(input: {
  customerName: string;
  automationGoal: string;
  serviceToAutomate: string;
}): Promise<string> {
  try {
    return await runPrompt(
      [
        `Cliente: ${input.customerName}`,
        `Objetivo principal da automacao: ${input.automationGoal}`,
        `Servico ou processo a ser automatizado: ${input.serviceToAutomate}`,
        "Explique como a Brasil Smart Service colocaria essa operacao para rodar no WhatsApp depois da contratacao.",
        "A resposta deve:",
        "1. mostrar que entendeu o servico ou processo citado;",
        "2. explicar de forma objetiva como seria a implantacao no WhatsApp;",
        "3. dizer o que seria configurado nesse caso especifico, como etapas, perguntas, respostas, filtros e encaminhamentos;",
        "4. mostrar como a conversa andaria do primeiro contato ate triagem, agendamento, proposta, atendimento ou repasse para humano, conforme o caso;",
        "5. indicar com clareza onde a equipe humana entra;",
        "6. terminar com uma pergunta curta e util para aprofundar a necessidade;",
        "7. ter no maximo 700 caracteres."
      ].join("\n")
    );
  } catch {
    return [
      `Para automatizar ${input.serviceToAutomate}, primeiro desenhamos o fluxo real desse processo no seu WhatsApp.`,
      "Depois configuramos perguntas, respostas, triagem e regras de encaminhamento de acordo com a sua operacao.",
      "O bot assume a etapa inicial, organiza as informacoes e passa para sua equipe quando entrar confirmacao, analise ou fechamento.",
      "Se quiser, me diga como esse processo funciona hoje no seu negocio."
    ].join(" ");
  }
}

export async function generateScenarioReply(input: ConsultationReplyInput): Promise<string> {
  try {
    return await runPrompt(
      [
        `Cliente: ${input.customerName}`,
        `Objetivo da automacao: ${input.automationGoal}`,
        `Servico ou processo a automatizar: ${input.serviceToAutomate}`,
        `Resumo da implantacao proposta: ${input.implementationSummary}`,
        `Ultima mensagem do usuario: ${input.customerMessage}`,
        "Continue a conversa como consultor comercial da Brasil Smart Service.",
        "Responda de forma especifica para esse servico ou processo, sem repetir a mesma abertura ou uma explicacao genérica.",
        "Explique quais etapas fazem sentido automatizar, como o fluxo funcionaria na pratica e onde a equipe humana entra.",
        "Se houver duvida ou objecao, responda com clareza, logica operacional e foco no resultado esperado pelo cliente.",
        "Quando fizer sentido, proponha um proximo passo concreto para avancar no projeto.",
        "Nao diga que faltam informacoes; assuma detalhes plausiveis e avance com orientacao concreta.",
        "Evite repetir saudacoes, introducoes, slogans e beneficios ja citados.",
        "No final, deixe uma pergunta curta para aprofundar a necessidade do cliente.",
        "Limite maximo: 700 caracteres."
      ].join("\n")
    );
  } catch {
    return [
      `Nesse caso, o bot pode assumir a etapa inicial de ${input.serviceToAutomate}, organizar as informacoes e conduzir o contato ate o ponto certo de repasse.`,
      "Quando a conversa exigir decisao, analise ou fechamento, sua equipe entra com mais contexto e menos retrabalho.",
      "Se quiser, descreva como esse fluxo funciona hoje e eu te mostro como estruturar a automacao."
    ].join(" ");
  }
}
