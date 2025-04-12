import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES, TELEGRAM_BTN_ACTIONS } from 'src/common/constants';

import { SubscriptionService } from 'src/subscription/subscription.service';
import { VybeService } from '../../vybe/vybe.service';
import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';
import { Markup } from 'telegraf';

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
  async step1(@Context() ctx) {
    ctx.wizard.state.userData = {};

    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('❌ Cancel', TELEGRAM_BTN_ACTIONS.CANCEL),
    ]);

    await ctx.reply(
      '🔍 Please enter the Solana wallet address you want to track:',
      keyboard,
    );
    ctx.wizard.next();
  }
  @WizardStep(2)
  async step2(@Context() ctx) {
    // Handle Cancel via button
    const action = ctx?.update?.callback_query?.data;
    if (action === TELEGRAM_BTN_ACTIONS.CANCEL) {
      await ctx.reply('❌ Tracking cancelled.');
      return ctx.scene.leave();
    }

    const walletAddress = ctx.message?.text.trim();

    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('❌ Cancel', TELEGRAM_BTN_ACTIONS.CANCEL),
    ]);

    ctx.wizard.state.userData.walletAddress = walletAddress;
    await ctx.reply('Enter wallet name:', keyboard);
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx) {
    // Handle Cancel via button
    const action = ctx?.update?.callback_query?.data;
    if (action === TELEGRAM_BTN_ACTIONS.CANCEL) {
      await ctx.reply('❌ Tracking cancelled.');
      return ctx.scene.leave();
    }

    const walletName = ctx?.message?.text.trim();
    ctx.wizard.state.userData.walletName = walletName;
    const { userData } = ctx.wizard.state;

    try {
      // Subscribe user to wallet tracking
      const userId = ctx.from.id.toString();

      const Loading = await ctx.reply(`Loading...`);
      await this.subscriptionService.subscribeUser(
        userId,
        userData.walletAddress,
        userData.walletName,
        'track_alert',
      );
      await ctx.deleteMessage(Loading.message_id);

      // ctx.replyWithMarkdownV2(this.telegramService.formatTransactions(data));
      ctx.reply(`✅ Tracking wallet: ${userData.walletAddress}`);
      ctx.scene.leave();
    } catch (error) {
      console.log(error, 'err');
      ctx.scene.leave();
    }
  }
}
