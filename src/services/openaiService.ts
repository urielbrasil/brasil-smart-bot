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
                "Voce representa a Brasil Smart Service em uma conversa comercial no WhatsApp.",
                "Toda resposta deve ser em portugues do Brasil, com tom consultivo, comercial, claro e objetivo.",
                "Explique como a automacao funciona na pratica depois da contratacao.",
                "Mostre implantacao, configuracao, atendimento automatizado, qualificacao e repasse para humano quando fizer sentido.",
                "Nunca diga que nao sabe. Se faltar dado, assuma um contexto plausivel e avance com orientacao util.",
                "Evite metacomentarios sobre IA e nao fale como simulador.",
                "Prefira respostas curtas, praticas e acionaveis."
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
        "Explique como a Brasil Smart Service prestaria esse servico depois da contratacao.",
        "A resposta deve:",
        "1. explicar de forma objetiva como sera feita a implantacao no WhatsApp do cliente;",
        "2. dizer quais informacoes e etapas precisam ser configuradas para esse tipo de automacao;",
        "3. mostrar como o bot atendera, qualificara ou encaminhara o contato no dia a dia;",
        "4. indicar quando entra suporte humano ou time comercial;",
        "5. terminar com um convite curto para o cliente detalhar sua operacao ou pedir proposta;",
        "5. ter no maximo 900 caracteres."
      ].join("\n")
    );
  } catch {
    return [
      `Para automatizar ${input.serviceToAutomate} com foco em ${input.automationGoal}, a Brasil Smart primeiro conecta o WhatsApp do seu negocio e organiza o fluxo de atendimento.`,
      "Depois configuramos perguntas, respostas, qualificacao, regras de encaminhamento e mensagens-chave para sua operacao.",
      "No dia a dia, o bot atende os primeiros contatos, coleta as informacoes certas e aciona sua equipe quando a conversa precisa de confirmacao, fechamento ou suporte humano.",
      "Se quiser, me diga como esse atendimento funciona hoje que eu explico como montar esse fluxo no seu caso."
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
        "Explique como a automacao operaria nesse contexto, quais etapas podem ser automatizadas e onde entra a equipe humana.",
        "Se houver objecoes, responda com clareza comercial e foco em implantacao pratica, beneficios e processo.",
        "Quando fizer sentido, sugira proximos passos como mapear fluxo, cadastrar servicos, definir perguntas, integrar equipe ou pedir proposta.",
        "Nao diga que faltam informacoes; assuma detalhes plausiveis e avance com orientacao concreta.",
        "No final, deixe uma pergunta curta para aprofundar a necessidade do cliente.",
        "Limite maximo: 900 caracteres."
      ].join("\n")
    );
  } catch {
    return [
      `Nesse formato de ${input.automationGoal}, o bot pode assumir a etapa inicial de ${input.serviceToAutomate}, responder o basico, coletar dados importantes e organizar o atendimento.`,
      "Quando surgir uma oportunidade de venda, analise ou suporte mais sensivel, a conversa pode ser encaminhada para sua equipe com mais contexto e menos trabalho manual.",
      "Se voce quiser, descreva seu fluxo atual e eu mostro como essa automacao pode ser estruturada no seu negocio."
    ].join(" ");
  }
}
