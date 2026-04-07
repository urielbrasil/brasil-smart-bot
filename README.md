# WhatsAppBot

Backend Node.js + TypeScript da inteligencia do WhatsAppBot, focado em atendimento consultivo sobre automacao de WhatsApp para negocios.

## Identity

Este repositorio contem apenas a inteligencia do bot:

- Meta Developers / WhatsApp Cloud API
- OpenAI for guided commercial conversations
- Railway for deployment
- GitHub for source control and CI-ready structure

O site institucional fica em um projeto separado:

- repositorio remoto: [urielbrasil/brasil-smart-service](https://github.com/urielbrasil/brasil-smart-service)
- pasta local recomendada: `/Users/uribr/Documents/brasil-smart-service`

Este repositorio deve espelhar o proposito de `urielbrasil/WhatsAppBot`: backend, webhook, integracoes e logica conversacional.

## What this project does now

- Exposes a WhatsApp webhook endpoint for Meta verification and incoming messages
- Reads WhatsApp and OpenAI secrets from environment variables
- Starts the conversation with a menu of automation goals
- Supports an `Outros` path for custom automation needs
- Asks which service, process, or business step should be automated
- Explains how the contracted service would be implemented and operate in practice
- Keeps a short in-memory conversation state per WhatsApp number
- Uses OpenAI to generate Portuguese-BR consultative replies
- Is ready to deploy on Railway

## Local separation

Estrutura local recomendada:

```text
/Users/uribr/Documents/
  WhatsAppBot-or-whatsapp-bot/
  brasil-smart-service/
```

Se este diretorio ainda estiver com um nome provisório, ele já está organizado internamente para ser movido depois sem depender do projeto do site.

## Suggested stack

- Editor: Visual Studio Code
- Runtime: Node.js 20+
- Repo hosting: GitHub
- Hosting: Railway
- Messaging: Meta WhatsApp Cloud API
- AI: OpenAI Responses API

## Quick start

```bash
npm install
cp .env.example .env
npm run dev
```

Open `http://localhost:3000/health`.

## Environment variables

Copy `.env.example` to `.env` and fill in:

- `WHATSAPP_VERIFY_TOKEN`: your custom verification token from Meta
- `WHATSAPP_ACCESS_TOKEN`: permanent or long-lived system user token
- `WHATSAPP_PHONE_NUMBER_ID`: the phone number ID from WhatsApp Cloud API
- `OPENAI_API_KEY`: your OpenAI API key
- `OPENAI_MODEL`: default is `gpt-4.1-mini`

## Meta / WhatsApp setup

1. Create a Meta app in [Meta for Developers](https://developers.facebook.com/).
2. Add the WhatsApp product.
3. Set the callback URL to:

   `https://your-railway-domain.up.railway.app/webhooks/whatsapp`

4. Set the verify token to the same value used in `.env`.
5. Subscribe to message webhook events.
6. Add your WhatsApp test number or production number.
7. For the Meta test sandbox, allow the registered recipient number `+55 35 92001 3266` to receive messages from the test sender `+1 555 144 7602`.

## Railway deploy

1. Push this repo to GitHub as the bot/intelligence project.
2. In Railway, create a new project from the GitHub repo.
3. Add all variables from `.env.example` to Railway environment variables.
4. Deploy.
5. Copy the Railway public URL and use it in Meta webhook configuration.

## Conversation flow

1. User sends any message to the WhatsApp number.
2. Bot replies with a menu of automation goals.
3. User chooses a goal or `Outros`.
4. Bot asks which service, process, or business step should be automated.
5. Bot explains how Brasil Smart would implement the automation in that case.
6. Every next message continues the conversation as consultative guidance about setup, operation, and next steps.

Send `menu` at any point to restart the flow.

## Recommended next implementation

1. Persist conversation state in Redis or PostgreSQL so Railway restarts do not reset active consultations.
2. Add WhatsApp templates for proactive re-engagement.
3. Add admin analytics for business type, product, and conversion stage.
4. Add optional CRM handoff when a qualified conversation should become a real lead.

## Project structure

```text
src/
  config.ts
  server.ts
  data/
  services/
```

## Suggested future rename

Quando quiser alinhar o nome da pasta local com o GitHub, o ideal é renomear este diretorio para algo como `WhatsAppBot` ou `whatsapp-bot`.
