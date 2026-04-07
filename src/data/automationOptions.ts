import { AutomationOption } from "../types.js";

export const automationOptions: AutomationOption[] = [
  {
    id: "atendimento",
    label: "Atendimento inteligente",
    keywords: ["1", "atendimento", "suporte", "duvidas", "cliente"],
    menuNumber: 1
  },
  {
    id: "qualificacao",
    label: "Qualificacao de leads",
    keywords: ["2", "qualificacao", "leads", "triagem", "lead"],
    menuNumber: 2
  },
  {
    id: "vendas",
    label: "Vendas no WhatsApp",
    keywords: ["3", "vendas", "comercial", "conversao", "recuperacao"],
    menuNumber: 3
  },
  {
    id: "agendamentos",
    label: "Agendamentos e confirmacoes",
    keywords: ["4", "agendamento", "agendamentos", "confirmacoes", "agenda"],
    menuNumber: 4
  },
  {
    id: "pos-venda",
    label: "Relacionamento e pos-venda",
    keywords: ["5", "pos-venda", "relacionamento", "fidelizacao", "suporte interno"],
    menuNumber: 5
  },
  {
    id: "outros",
    label: "Outros",
    keywords: ["6", "outros", "outro"],
    menuNumber: 6
  }
];
