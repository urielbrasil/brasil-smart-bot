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
                "Seu papel e mostrar como o WhatsApp do negocio se torna um canal inteligente de atendimento, qualificacao e vendas.",
                "Explique como a automacao funciona na pratica depois da contratacao, com implantacao, configuracao, operacao e suporte humano no momento certo.",
                "Mostre como o bot entende perguntas, apresenta solucoes, coleta informacoes, qualifica oportunidades e conduz cada conversa ate o proximo passo comercial.",
                "Nunca diga que nao sabe. Se faltar dado, assuma um contexto plausivel e avance com orientacao util.",
                "Evite metacomentarios sobre IA e nao fale como simulador.",
                "Prefira respostas curtas, praticas, confiantes e acionaveis."
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
        "2. dizer o que sera configurado, como servicos, perguntas, respostas, criterios de qualificacao e etapas do fluxo;",
        "3. mostrar como o bot atendera os contatos, organizara informacoes e conduzira a conversa ate o proximo passo;",
        "4. indicar quando a equipe humana entra para fechar, confirmar ou tratar casos especificos;",
        "5. reforcar beneficios como resposta imediata, reducao de trabalho manual, padronizacao e ganho comercial;",
        "6. terminar com um convite curto para o cliente detalhar a operacao ou pedir proposta;",
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
        "Explique como a automacao operaria nesse contexto, quais etapas podem ser automatizadas e onde entra a equipe humana no momento certo.",
        "Mostre beneficios como atendimento 24 horas, respostas instantaneas, qualificacao automatica, reducao de trabalho manual e mais consistencia comercial quando fizer sentido.",
        "Se houver objecoes, responda com clareza comercial e foco em implantacao pratica, beneficios e processo.",
        "Quando fizer sentido, sugira proximos passos como mapear o fluxo, cadastrar servicos, definir perguntas, organizar o funil e pedir proposta.",
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
