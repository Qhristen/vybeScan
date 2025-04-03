import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { SubscriptionService } from 'src/subscription/subscription.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { WebSocket } from 'ws';

@Injectable()
export class VybeWebsocket implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(VybeWebsocket.name);
  private ws: WebSocket | null = null;
  private readonly websocketUri = 'https://api.vybenetwork.xyz/live';
  private readonly apiKey = process.env.VYBE_API_KEY;
  private enableReconnect = true;

  constructor(
    private readonly subscriptionService: SubscriptionService,
    private readonly telegramService: TelegramService,
  ) {}

  onModuleInit() {
    this.connectToVybe();
  }

  onModuleDestroy() {
    // Clean up the websocket if it exists
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }
  }

  private connectToVybe() {
    // If an old connection exists, clean it up first
    if (this.ws) {
      this.ws.removeAllListeners();
      this.ws.close();
      this.ws = null;
    }

    this.ws = new WebSocket(this.websocketUri, {
      headers: { 'X-API-Key': this.apiKey },
    });

    this.ws.on('open', async () => {
      this.logger.log('Connected to Vybe WebSocket');
      const subscribedWallets =
        await this.subscriptionService.getAllSubscriptions();
      const walletAddresses = subscribedWallets.flatMap((sub) => sub.addresses);
      // console.log(walletAddresses, 'WALLET');

      // Subscribe to token transfers
      const configureMessage = JSON.stringify({
        type: 'configure',
        filters: {
          transfers: walletAddresses.map((address) => ({
            tokenMintAddress: address.value,
            minAmount: 1000000000,
            maxAmount: 5000000000,
          })),
        },
      });
      this.ws?.send(configureMessage);
    });

    this.ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        // this.logger.log(`messsage: ${JSON.stringify(message)}`);
        // Extract data
        const {
          senderAddress,
          receiverAddress,
          amount,
          decimal,
          signature,
          mintAddress,
        } = message;
        const formattedAmount = amount / 10 ** decimal;

        const subscribedWallets =
          await this.subscriptionService.getAllSubscriptions();
        this.logger.log(`formattedAmount: ${JSON.stringify(formattedAmount)}`);

        const userSubscription = subscribedWallets.find((sub) =>
          sub.addresses.some((addr) => addr.value === mintAddress),
        );

        if (userSubscription && formattedAmount >= 1000000) {
          const alertMessage = `🐋 *Whale Alert!* ${senderAddress} sent *${formattedAmount} wSOL* to ${receiverAddress}. [View on Explorer](https://explorer.solana.com/tx/${signature})`;

          await this.telegramService.sendMarkdownMessage(
            alertMessage,
            userSubscription.telegramUserId,
          );
        }
      } catch (error) {
        this.logger.error(`Failed to process message: ${error}`);
      }
    });

    this.ws.on('close', () => {
      this.logger.warn('WebSocket closed');
      // Clean up the current connection to free memory
      if (this.ws) {
        this.ws.removeAllListeners();
        this.ws = null;
      }
      if (this.enableReconnect) {
        setTimeout(() => this.connectToVybe(), 5000);
      }
    });

    this.ws.on('error', (error) => {
      this.logger.error(`WebSocket error: ${error}`);
    });
  }
}
