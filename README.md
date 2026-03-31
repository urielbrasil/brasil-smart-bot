# brasil-smart-bot

Node.js + TypeScript starter for a Brazilian WhatsApp receptionist bot using:

- Meta Developers / WhatsApp Cloud API
- OpenAI for natural replies
- Railway for deployment
- GitHub for source control and CI-ready structure
- Availability providers for agenda and Booking.com style lookups

## What this starter already does

- Exposes a WhatsApp webhook endpoint for Meta verification and incoming messages
- Reads WhatsApp and OpenAI secrets from environment variables
- Builds a simple booking request from customer text
- Checks mock availability providers in parallel
- Uses OpenAI to generate a Portuguese-BR receptionist reply
- Is ready to deploy on Railway

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
- `CALENDAR_PROVIDER`: `mock`, `google-calendar`, or `calcom`
- `BOOKING_PROVIDER`: `mock` or `booking-com`

## Meta / WhatsApp setup

1. Create a Meta app in [Meta for Developers](https://developers.facebook.com/).
2. Add the WhatsApp product.
3. Set the callback URL to:

   `https://your-railway-domain.up.railway.app/webhooks/whatsapp`

4. Set the verify token to the same value used in `.env`.
5. Subscribe to message webhook events.
6. Add your WhatsApp test number or production number.

## Railway deploy

1. Push this repo to GitHub.
2. In Railway, create a new project from the GitHub repo.
3. Add all variables from `.env.example` to Railway environment variables.
4. Deploy.
5. Copy the Railway public URL and use it in Meta webhook configuration.

## Booking and agenda integrations

This starter uses mock providers first so the bot works before external systems are connected.

### Agenda options

- Google Calendar API for appointments, salons, clinics, consultants
- Cal.com API for appointment scheduling
- Custom PMS/ERP or internal agenda API

### Booking.com notes

Booking.com integrations normally require partner access and approved APIs. In practice, many hospitality teams start by integrating:

- Their own PMS/channel manager API
- Booking engine API from Cloudbeds, Omnibees, HotelRunner, etc.
- Manual availability sync from an existing reservation system

If you want true Booking.com availability, confirm which partner/API access your property already has.

## Recommended next implementation

1. Replace `mock` providers with your real agenda source.
2. Add customer state storage with PostgreSQL or Redis.
3. Add tool/function calling to OpenAI so the model chooses when to check availability.
4. Add message templates, fallback rules, and human handoff.
5. Add audit logs and admin alerts.

## Project structure

```text
src/
  config.ts
  server.ts
  providers/
  services/
```
