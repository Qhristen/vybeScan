import { Injectable, Logger } from '@nestjs/common';

import { UserService } from '../user/user.service';

import { User } from '../schemas/user.schema';

import { CreateUserDto } from '../user/dto/create-user.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';
import { InjectBot } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private userService: UserService,
  ) {}

  async getUser(params): Promise<User> {
    return this.userService.findOne(params);
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  async updateUser(params, updateUserDto: UpdateUserDto): Promise<User> {
    return this.userService.update(params, updateUserDto);
  }

  async sendMarkdownMessage(message: string, chatId: string) {
    try {
      await this.bot.telegram.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
      });
      this.logger.log('Telegram message sent successfully');
    } catch (error) {
      this.logger.error(`Failed to send Telegram message: ${error}`);
    }
  }

  formatTokenMetrics(data: any): string {
    return `\`\`\`
Token Metrics
----------------------------
Name          | ${data.name}
Symbol        | ${data.symbol}
Price         | $${data.price.toFixed(12)}
24h Change    | ${((data.price - data.price1d) / data.price1d * 100).toFixed(2)}%
Market Cap    | $${Math.round(data.marketCap).toLocaleString()}
24h Volume    | $${Math.round(data.usdValueVolume24h).toLocaleString()}
Supply        | ${Math.round(data.currentSupply).toLocaleString()}
Category      | ${data.category}
Subcategory   | ${data.subcategory}
----------------------------
\`\`\``;
  }
  

  formatTokens(res: any): string {
    const tokens = res.data.map(token => `${token.name} (${token.symbol})
Amount      | ${token.amount}
Price USD   | $${Number(token.priceUsd).toFixed(4)}
Value USD   | $${Number(token.valueUsd).toFixed(4)}
24h Change  | ${Number(token.priceUsd1dChange).toFixed(2)}%
`).join('\n');

    return `\`\`\`
Portfolio Summary
----------------------------
Total Value    | $${Number(res.totalTokenValueUsd).toFixed(4)}
24h Change     | ${Number(res.totalTokenValueUsd1dChange).toFixed(4)}
Token Count    | ${res.totalTokenCount}
----------------------------
${tokens}
----------------------------
\`\`\``;
  }

  formatTopTokenHolders(holders: any[]): string {
    const formattedHolders = holders.map((holder, index) => `
  ${index + 1}. Holder Address: ${holder.ownerAddress}
     ValueUsd: ${Number(holder.valueUsd).toFixed(2)}
     Percentage: ${Number(holder.percentageOfSupplyHeld).toFixed(2)}%
  `).join('\n');

    return `\`\`\`
  Top Token Holders
  ----------------------------
  ${formattedHolders}
  ----------------------------
  \`\`\``;
  }



  formatWhaleAlert(data: any): string {
    return `\`\`\`
🐋 Whale Alert!
----------------------------
Token      | ${data.token}
Amount     | ${data.amount}
USD Value  | $${data.value}
From       | ${data.from}
To         | ${data.to}
----------------------------
\`\`\``;
  }

  formatTransactions(transactions: any): string {
    console.log(transactions, "txn")
    const formattedTxs = transactions.map(tx => `
Transaction Details
----------------------------
Amount     | ${tx.calculatedAmount} SOL
USD Value  | $${Number(tx.valueUsd).toFixed(2)}
From       | ${tx.senderAddress}
To         | ${tx.receiverAddress}
Price      | $${Number(tx.price).toFixed(2)}
Time       | ${new Date(tx.blockTime * 1000).toLocaleString()}
----------------------------`).join('\n');

    return `\`\`\`
${formattedTxs}
\`\`\``;
  }
}
