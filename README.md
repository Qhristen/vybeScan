# VybeScan

## Overview

VybeScan is an advanced Telegram bot designed to provide real-time crypto transaction monitoring and token analytics using Vybe Network’s powerful APIs. This bot is tailored for traders, investors, and blockchain enthusiasts who need instant updates on wallet movements, token transactions, and market trends without manually scanning blockchain explorers.

With VybeScan, users can subscribe to specific wallet addresses and token mint addresses to receive real-time notifications on incoming and outgoing transactions. The bot utilizes Vybe’s WebSocket API to track movements across the Solana blockchain, ensuring users stay informed about critical financial activities. Whether it's monitoring personal wallet inflows and outflows, tracking whales making large transactions, or receiving alerts on specific token mints, VybeScan brings actionable insights directly to your Telegram chat.

## Features

- **Real-time Wallet Tracking:** Monitor multiple addresses and receive instant transfer alerts
- **Whale Movement Alerts:** Get notifications for large transactions affecting markets
- **Token Analytics:** Access live market data including price, volume, and liquidity
- **WebSocket Integration:** Efficient real-time updates via WebSocket connections
- **Custom Subscriptions:** Manage tracked wallets and tokens through Telegram commands

## Getting Started

### Prerequisites

- Node.js
- Yarn package manager
- MongoDB database
- Telegram Bot Token

### Installation

1. Install dependencies:

```bash
yarn install
```

2. Create `.env` file with:

```env
PORT=3080
MONGO_CONNECTION_STRING=
TELEGRAM_BOT_TOKEN=
VYBE_API_KEY=
```

3. Start the bot:

```bash
yarn start:dev
```
