import {
  createScenarioIntroduction,
  generateScenarioReply
} from "./openaiService.js";
import {
  getConversationState,
  resetConversationState,
  saveConversationState
} from "./stateService.js";
import { businessOptions } from "../data/businessOptions.js";
import { BusinessOption, ConversationState } from "../types.js";

const restartKeywords = ["menu", "reiniciar", "reset", "comecar", "iniciar", "inicio"];

function buildBusinessMenu(customerName?: string): string {
  const firstName = customerName?.trim().split(/\s+/)[0] ?? "cliente";

  return [
    `Ola, ${firstName}. Vamos simular uma venda no WhatsApp.`,
    "",
    "Escolha o tipo de negocio para montar o cenario:",
    ...businessOptions.map((option) => `${option.menuNumber}. ${option.label}`),
    "",
    "Se quiser recomecar a qualquer momento, envie: menu"
  ].join("\n");
}

function normalizeMessage(message: string): string {
  return message
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function isRestartRequest(message: string): boolean {
  const normalized = normalizeMessage(message);
  return restartKeywords.includes(normalized);
}

function resolveBusinessOption(message: string): BusinessOption | undefined {
  const normalized = normalizeMessage(message);

  return businessOptions.find((option) =>
    option.keywords.some((keyword) => normalized === normalizeMessage(keyword))
  );
}

function createBaseState(input: {
  customerName?: string;
  customerPhone: string;
}): ConversationState {
  return {
    customerName: input.customerName?.trim() || "Cliente",
    customerPhone: input.customerPhone,
    stage: "awaiting_business_choice",
    turns: 0,
    lastUpdatedAt: new Date().toISOString()
  };
}

export async function handleBotMessage(input: {
  customerName?: string;
  customerPhone: string;
  customerMessage: string;
}): Promise<string> {
  const customerMessage = input.customerMessage.trim();

  if (!customerMessage) {
    return buildBusinessMenu(input.customerName);
  }

  if (isRestartRequest(customerMessage)) {
    resetConversationState(input.customerPhone);
    const freshState = createBaseState(input);
    saveConversationState(freshState);
    return buildBusinessMenu(freshState.customerName);
  }

  const existingState = getConversationState(input.customerPhone);
  const state = existingState ?? createBaseState(input);

  if (!existingState) {
    saveConversationState(state);
  }

  if (state.stage === "awaiting_business_choice") {
    const selectedOption = resolveBusinessOption(customerMessage);

    if (!selectedOption) {
      return [
        "Nao identifiquei a opcao escolhida.",
        "",
        buildBusinessMenu(state.customerName)
      ].join("\n");
    }

    if (selectedOption.id === "outros") {
      saveConversationState({
        ...state,
        stage: "awaiting_custom_business"
      });

      return "Perfeito. Qual tipo de negocio voce deseja simular?";
    }

    saveConversationState({
      ...state,
      stage: "awaiting_product",
      selectedBusiness: selectedOption.id,
      selectedBusinessLabel: selectedOption.label
    });

    return `Perfeito. Agora me diga qual produto ou servico voce quer vender em uma simulacao de ${selectedOption.label}.`;
  }

  if (state.stage === "awaiting_custom_business") {
    saveConversationState({
      ...state,
      stage: "awaiting_product",
      selectedBusiness: "custom",
      selectedBusinessLabel: customerMessage
    });

    return `Entendi. Agora me diga qual produto ou servico voce quer vender nessa simulacao de ${customerMessage}.`;
  }

  if (state.stage === "awaiting_product") {
    const scenarioSummary = await createScenarioIntroduction({
      customerName: state.customerName,
      businessType: state.selectedBusinessLabel ?? "negocio local",
      productToSell: customerMessage
    });

    saveConversationState({
      ...state,
      stage: "in_simulation",
      productToSell: customerMessage,
      scenarioSummary,
      turns: state.turns + 1
    });

    return scenarioSummary;
  }

  const scenarioReply = await generateScenarioReply({
    customerName: state.customerName,
    businessType: state.selectedBusinessLabel ?? "negocio local",
    productToSell: state.productToSell ?? "produto principal",
    customerMessage,
    scenarioSummary:
      state.scenarioSummary ??
      "Cenario hipotetico comercial em andamento com foco em venda consultiva."
  });

  saveConversationState({
    ...state,
    stage: "in_simulation",
    turns: state.turns + 1
  });

  return scenarioReply;
}
