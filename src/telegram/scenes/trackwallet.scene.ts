import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES } from 'src/common/constants';
import { Markup } from 'telegraf';

import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';
import { TELEGRAM_BTN_ACTIONS } from '../../common/constants';
import { VybeService } from '../../vybe/vybe.service';
import { BOT_MESSAGES } from '../telegram.messages';
import { SubscriptionService } from 'src/subscription/subscription.service';

@Wizard(SCENES.TRACK_WALLET)
export class TrackWalletScene {
  private readonly telegramUtils: TelegramUtils;

  constructor(
    private readonly telegramService: TelegramService,
    private readonly vybeService: VybeService,
    private readonly subscriptionService: SubscriptionService,
  ) {
    this.telegramUtils = new TelegramUtils();
  }

  @WizardStep(1)
  async step2(@Context() ctx) {
    ctx.wizard.state.userData = {};
    await ctx.reply('Enter wallet address:');
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step4(@Context() ctx) {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Invalid input. Please enter a valid wallet address:');
      return;
    }

    const walletAddress = ctx.message.text.trim();
    ctx.wizard.state.userData.walletAddress = walletAddress;
    const { userData } = ctx.wizard.state;

    try {
      // Subscribe user to wallet tracking
      const userId = ctx.from.id.toString();

      const Loading = await ctx.reply(`Loading...`);
      await this.subscriptionService.subscribeUser(
        userId,
        userData.walletAddress,
        'track_alert',
      );
      const data = await this.vybeService.fetchTransactions(userData.walletAddress);
      await ctx.deleteMessage(Loading.message_id);
      if (!data && data.length < 0) {
        return 
     }
      console.log(data, 'data');
      ctx.replyWithMarkdownV2(this.telegramService.formatTransactions(data));
      ctx.reply(`✅ Tracking wallet: ${userData.walletAddress}`);
    } catch (error) {
      console.log(error, "err")
      await ctx.reply('❌ Error. Try again later.');
    }

    ctx.scene.leave();
  }
}
