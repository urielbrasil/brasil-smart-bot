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
                "Responda sempre em portugues do Brasil, com linguagem natural, enxuta, segura e humana.",
                "Fale como consultor comercial experiente: direto ao ponto, sem floreio, sem tom robotico e sem repetir saudacoes ou o nome do cliente.",
                "Seu foco e traduzir o servico ou processo informado pelo cliente em uma operacao pratica de WhatsApp: atendimento, triagem, qualificacao, agendamento, acompanhamento, reativacao, pos-venda ou suporte, conforme o caso.",
                "Analise o tipo de servico citado e adapte a resposta ao contexto. Seja especifico sobre como o fluxo funcionaria naquela operacao, em vez de responder de forma generica.",
                "Explique a implantacao de forma concreta: o que sera configurado, quais perguntas o bot faz, que dados coleta, como classifica contatos, quando encaminha para humanos e qual proximo passo comercial ele conduz.",
                "Mostre valor de negocio com clareza: velocidade, padronizacao, ganho operacional, melhor qualificacao e mais conversas convertidas, mas sem virar lista publicitaria.",
                "Nunca diga que nao sabe ou que faltam dados. Se algo estiver em aberto, assuma o cenario mais plausivel e avance com orientacao util.",
                "Nao mencione IA, prompt, sistema, simulacao ou limitacoes.",
                "Prefira respostas curtas ou medias, com 1 a 3 parrafos curtos. So use lista se isso deixar a explicacao mais clara.",
                "Evite repeticao de estrutura, frases e beneficios entre mensagens consecutivas.",
                "Sempre que fizer sentido, termine com uma pergunta curta e relevante para avancar a conversa comercial."
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
        "1. mostrar que entendeu o tipo de servico ou processo citado e responder com exemplos compativeis com esse contexto;",
        "2. explicar de forma objetiva como sera feita a implantacao no WhatsApp do cliente;",
        "3. dizer o que sera configurado na pratica, como etapas do fluxo, perguntas, respostas, filtros, qualificacao e encaminhamentos;",
        "4. mostrar como a conversa avanca do primeiro contato ate agendamento, triagem, proposta, atendimento ou repasse para a equipe, conforme o caso;",
        "5. indicar com clareza quando a equipe humana entra;",
        "6. terminar com uma pergunta curta para aprofundar a operacao ou abrir espaco para proposta;",
        "7. ter no maximo 900 caracteres."
      ].join("\n")
    );
  } catch {
    return [
      `Para automatizar ${input.serviceToAutomate} com foco em ${input.automationGoal}, a Brasil Smart conecta o seu WhatsApp e estrutura um fluxo inteligente para o seu atendimento.`,
      "Nessa implantacao, configuramos perguntas, respostas, criterios de qualificacao, mensagens-chave e regras de encaminhamento de acordo com a sua operacao.",
      "No dia a dia, o bot responde com agilidade, organiza as informacoes do contato e conduz a conversa ate o momento certo de entrar sua equipe.",
      "Isso reduz trabalho manual, padroniza o atendimento e ajuda seu negocio a atender melhor e vender com mais consistencia. Se quiser, me diga como funciona seu fluxo atual."
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
        "Responda de forma alinhada ao servico analisado, com orientacoes especificas para esse contexto e sem repetir a mesma abertura ou os mesmos beneficios.",
        "Explique como a automacao operaria nesse cenario, quais etapas entram no fluxo e onde a equipe humana assume no momento certo.",
        "Se houver duvida ou objecao, responda com clareza comercial, seguranca e foco em operacao pratica.",
        "Quando fizer sentido, sugira proximos passos concretos como mapear fluxo, cadastrar servicos, definir perguntas, regras de triagem, criterios de repasse e proposta.",
        "Nao diga que faltam informacoes; assuma detalhes plausiveis e avance com orientacao concreta.",
        "No final, deixe uma pergunta curta para aprofundar a necessidade do cliente.",
        "Limite maximo: 900 caracteres."
      ].join("\n")
    );
  } catch {
    return [
      `Nesse formato de ${input.automationGoal}, o bot pode assumir a etapa inicial de ${input.serviceToAutomate}, responder com rapidez, coletar os dados certos e organizar o atendimento no WhatsApp.`,
      "Quando a conversa chegar ao ponto de confirmacao, analise, negociacao ou fechamento, sua equipe entra com mais contexto e menos retrabalho.",
      "Esse modelo ajuda a padronizar o atendimento, reduzir trabalho manual e aproveitar melhor as oportunidades comerciais. Se quiser, descreva seu fluxo atual."
    ].join(" ");
  }
}
