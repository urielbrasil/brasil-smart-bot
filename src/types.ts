export type ConversationStage =
  | "awaiting_automation_choice"
  | "awaiting_custom_automation"
  | "awaiting_service_to_automate"
  | "in_consultation";

export type AutomationOption = {
  id: string;
  label: string;
  keywords: string[];
  menuNumber: number;
};

export type ConversationState = {
  customerName: string;
  customerPhone: string;
  stage: ConversationStage;
  selectedAutomation?: string;
  selectedAutomationLabel?: string;
  serviceToAutomate?: string;
  implementationSummary?: string;
  turns: number;
  lastUpdatedAt: string;
};

export type ConsultationReplyInput = {
  customerName: string;
  automationGoal: string;
  serviceToAutomate: string;
  customerMessage: string;
  implementationSummary: string;
};
