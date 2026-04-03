import OpenAI from "openai";
import { config, requireSecret } from "../config.js";
import { ScenarioReplyInput } from "../types.js";

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
                "Voce e um simulador brasileiro de vendas no WhatsApp.",
                "Toda resposta deve ser em portugues do Brasil, com tom comercial, claro e objetivo.",
                "Nunca diga que nao sabe. Se faltar dado, assuma um contexto hipotetico plausivel e siga a simulacao.",
                "Sempre direcione a conversa para vender o produto ou servico informado pelo usuario.",
                "Evite metacomentarios sobre IA, limite-se ao papel de simulacao.",
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
    console.error("OpenAI scenario generation failed", error);
    throw error;
  }
}

export async function createScenarioIntroduction(input: {
  customerName: string;
  businessType: string;
  productToSell: string;
}): Promise<string> {
  try {
    return await runPrompt(
      [
        `Cliente: ${input.customerName}`,
        `Tipo de negocio escolhido: ${input.businessType}`,
        `Produto ou servico que sera vendido: ${input.productToSell}`,
        "Crie um cenario hipotetico de um local imaginario semelhante ao negocio escolhido.",
        "A resposta deve:",
        "1. apresentar o local imaginario e o perfil dos compradores;",
        "2. mostrar uma oportunidade concreta de venda ligada ao produto;",
        "3. terminar convidando o usuario a responder como vendedor;",
        "4. soar como se a simulacao tivesse acabado de comecar no WhatsApp;",
        "5. ter no maximo 900 caracteres."
      ].join("\n")
    );
  } catch {
    return [
      `Cenario iniciado: voce esta atendendo um negocio imaginario de ${input.businessType} chamado Espaco Horizonte.`,
      `Hoje o time quer aumentar as vendas de ${input.productToSell} para clientes que ja demonstraram interesse, mas ainda nao fecharam.`,
      "Chegou um contato no WhatsApp pedindo detalhes, prazo e diferencial antes de decidir a compra.",
      "Responda agora como vendedor para conduzir essa oportunidade."
    ].join(" ");
  }
}

export async function generateScenarioReply(input: ScenarioReplyInput): Promise<string> {
  try {
    return await runPrompt(
      [
        `Cliente: ${input.customerName}`,
        `Tipo de negocio: ${input.businessType}`,
        `Produto ou servico a vender: ${input.productToSell}`,
        `Resumo do cenario atual: ${input.scenarioSummary}`,
        `Ultima mensagem do usuario: ${input.customerMessage}`,
        "Continue a simulacao como um ambiente comercial vivo.",
        "Pode responder como cliente, gerente, comprador ou contexto da loja, mas sempre mantendo a conversa orientada para a venda do produto.",
        "Se houver objecoes, gere objecoes realistas e comercialmente uteis.",
        "Nao diga que faltam informacoes; assuma detalhes plausiveis e avance.",
        "No final, deixe um gancho curto para a proxima resposta do usuario.",
        "Limite maximo: 900 caracteres."
      ].join("\n")
    );
  } catch {
    return [
      `O cliente do cenario de ${input.businessType} respondeu com interesse em ${input.productToSell},`,
      "mas quer uma justificativa direta para comprar agora, alem de entender valor, prazo e diferencial.",
      "Conduza a proxima mensagem reforcando beneficios concretos e fechando com uma chamada para decisao."
    ].join(" ");
  }
}
