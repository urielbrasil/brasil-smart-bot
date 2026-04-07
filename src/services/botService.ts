import {
  createScenarioIntroduction,
  generateScenarioReply
} from "./openaiService.js";
import {
  getConversationState,
  resetConversationState,
  saveConversationState
} from "./stateService.js";
import { automationOptions } from "../data/automationOptions.js";
import { AutomationOption, ConversationState } from "../types.js";

const restartKeywords = ["menu", "reiniciar", "reset", "comecar", "iniciar", "inicio"];

function buildBusinessMenu(customerName?: string): string {
  const firstName = customerName?.trim().split(/\s+/)[0] ?? "cliente";

  return [
    `Ola, ${firstName}. A Brasil Smart transforma seu WhatsApp em um canal inteligente de atendimento, qualificacao e vendas.`,
    "",
    "Escolha o tipo de resultado que voce quer colocar para funcionar no seu WhatsApp:",
    ...automationOptions.map((option) => `${option.menuNumber}. ${option.label}`),
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

function resolveBusinessOption(message: string): AutomationOption | undefined {
  const normalized = normalizeMessage(message);

  return automationOptions.find((option) =>
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
    stage: "awaiting_automation_choice",
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

  if (state.stage === "awaiting_automation_choice") {
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
        stage: "awaiting_custom_automation"
      });

      return "Perfeito. Me diga qual tipo de atendimento, processo ou operacao voce quer automatizar no seu WhatsApp.";
    }

    saveConversationState({
      ...state,
      stage: "awaiting_service_to_automate",
      selectedAutomation: selectedOption.id,
      selectedAutomationLabel: selectedOption.label
    });

    return `Perfeito. Agora me diga qual servico, processo ou etapa do seu negocio voce quer automatizar com foco em ${selectedOption.label}. Pode ser, por exemplo, atendimento inicial, triagem, agendamento, recuperacao de leads ou suporte.`;
  }

  if (state.stage === "awaiting_custom_automation") {
    saveConversationState({
      ...state,
      stage: "awaiting_service_to_automate",
      selectedAutomation: "custom",
      selectedAutomationLabel: customerMessage
    });

    return `Entendi. Agora me diga qual servico, processo ou etapa voce quer automatizar nesse contexto de ${customerMessage}.`;
  }

  if (state.stage === "awaiting_service_to_automate") {
    const scenarioSummary = await createScenarioIntroduction({
      customerName: state.customerName,
      automationGoal: state.selectedAutomationLabel ?? "automacao comercial",
      serviceToAutomate: customerMessage
    });

    saveConversationState({
      ...state,
      stage: "in_consultation",
      serviceToAutomate: customerMessage,
      implementationSummary: scenarioSummary,
      turns: state.turns + 1
    });

    return scenarioSummary;
  }

  const scenarioReply = await generateScenarioReply({
    customerName: state.customerName,
    automationGoal: state.selectedAutomationLabel ?? "automacao comercial",
    serviceToAutomate: state.serviceToAutomate ?? "atendimento inicial",
    customerMessage,
    implementationSummary:
      state.implementationSummary ??
      "Implantacao consultiva no WhatsApp com atendimento inteligente, qualificacao automatica e repasse para a equipe no momento certo."
  });

  saveConversationState({
    ...state,
    stage: "in_consultation",
    turns: state.turns + 1
  });

  return scenarioReply;
}
