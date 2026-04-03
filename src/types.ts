export type ConversationStage =
  | "awaiting_business_choice"
  | "awaiting_custom_business"
  | "awaiting_product"
  | "in_simulation";

export type BusinessOption = {
  id: string;
  label: string;
  keywords: string[];
  menuNumber: number;
};

export type ConversationState = {
  customerName: string;
  customerPhone: string;
  stage: ConversationStage;
  selectedBusiness?: string;
  selectedBusinessLabel?: string;
  productToSell?: string;
  scenarioSummary?: string;
  turns: number;
  lastUpdatedAt: string;
};

export type ScenarioReplyInput = {
  customerName: string;
  businessType: string;
  productToSell: string;
  customerMessage: string;
  scenarioSummary: string;
};
