# Webmend

Webmend is an orchestration layer and command center for self-healing AI scrapers, built using the [Bright Data Scraper CLI](https://brightdata.com/products/web-scraper).

It demonstrates how you can confidently deploy AI scrapers into production by keeping humans in the loop for approval when a scraper detects a layout change, automatically heals itself, and proposes a schema fix.

## Features

- **Live Monitoring & Uptime:** Track exactly how many runs succeed vs fail.
- **Break Detection:** Identifies when scrapers return excessive nulls due to DOM changes.
- **Auto-Healing Orchestration:** Triggers the Bright Data `heal` API automatically.
- **Human-in-the-Loop Approval:** Presents the proposed new schema vs the old schema side-by-side in a dashboard.
- **Self-Serve Onboarding:** Dynamically create new scrapers using natural language via the `create` API.
- **Webhook Alerts:** Notifies your systems the moment a scraper breaks.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL
- Bright Data Account (with API Key)
- OpenAI API Key (if relying on Bright Data's OpenAI integration)

*Note: This project was developed on Windows. The backend uses `process.platform === 'win32' ? 'npx.cmd' : 'npx'` for spawned processes to ensure cross-platform compatibility, but if you encounter any CLI execution issues on Mac/Linux, ensure `npx` is available in your PATH.*
### Installation

1. Clone the repo and navigate to `backend/` and `frontend/` to `npm install`.
2. Set up your `.env` (use `.env.example` as a template).
3. Initialize the database by running `schema.sql` in your Postgres DB.
4. Run the backend: `npm run dev` in `backend/`.
5. Run the frontend: `npm run dev` in `frontend/`.

## Demo Flow

Webmend comes with a `fixture-store` built-in designed to explicitly test break/heal scenarios.

1. View the `fixture-store` collector in the Webmend dashboard.
2. Click **Simulate Live Break** on the dashboard.
3. This injects mangled DOM classes into the fixture store, causing the next scraper run to extract `null` for most fields.
4. The backend detects the break, triggers a webhook alert, and orchestrates an AI heal.
5. Review the side-by-side JSON diff in the dashboard, and click **Approve** to deploy the fix!
