import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES, TELEGRAM_BTN_ACTIONS } from 'src/common/constants';

import { SubscriptionService } from 'src/subscription/subscription.service';
import { VybeService } from '../../vybe/vybe.service';
import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';
import { Markup } from 'telegraf';

@Wizard(SCENES.WHALE_ALERT)
export class WhalesAlertScene {
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

    await ctx.reply('Enter mint address:', keyboard);
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step2(@Context() ctx) {
    // Handle Cancel via button
    const action = ctx?.update?.callback_query?.data;
    if (action === TELEGRAM_BTN_ACTIONS.CANCEL) {
      await ctx.reply('❌ Operation cancelled.');
      return ctx.scene.leave();
    }

    const mintAddress = ctx.message?.text.trim();
    ctx.wizard.state.userData.mintAddress = mintAddress;

    const { userData } = ctx.wizard.state;

    if(!this.telegramService.isValidSolanaAddress(userData.mintAddress)){
      await ctx.reply('❌ Please enter a valid Solana token address.');
      // return ctx.scene.leave();
    }

    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('❌ Cancel', TELEGRAM_BTN_ACTIONS.CANCEL),
    ]);

    await ctx.reply('Enter mint/address name:', keyboard);
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step3(@Context() ctx) {
    // Handle Cancel via button
    const action = ctx?.update?.callback_query?.data;
    if (action === TELEGRAM_BTN_ACTIONS.CANCEL) {
      await ctx.reply('❌ Operation cancelled.');
      return ctx.scene.leave();
    }

    const addressName = ctx.message?.text.trim();
    ctx.wizard.state.userData.addressName = addressName;
    const { userData } = ctx.wizard.state;

    try {
      const userId = ctx.from.id.toString();
      await ctx.sendChatAction('typing');
      await this.subscriptionService.subscribeUser(
        userId,
        userData.mintAddress,
        userData.addressName,
        'whale_alert',
      );

      ctx.reply(
        `✅ Tracking mint address for 🐋 Whale Alert!: ${userData.mintAddress}`,
      );
      ctx.scene.leave();
    } catch (error) {
      console.log(error, 'err');
      ctx.scene.leave();
    }
  }
}
