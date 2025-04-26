import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES } from 'src/common/constants';
import { Markup } from 'telegraf';

import { SubscriptionService } from 'src/subscription/subscription.service';
import { TELEGRAM_BTN_ACTIONS } from '../../common/constants';
import { VybeService } from '../../vybe/vybe.service';
import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';

@Wizard(SCENES.UNSUBSCRIBE)
export class UnsubscribeScene {
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
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('❌ Cancel', TELEGRAM_BTN_ACTIONS.CANCEL),
    ]);

    await ctx.reply('Enter address:', keyboard);
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step4(@Context() ctx) {
    // Handle Cancel via button
    const action = ctx?.update?.callback_query?.data;
    if (action === TELEGRAM_BTN_ACTIONS.CANCEL) {
      await ctx.reply('❌ Operation cancelled.');
      return ctx.scene.leave();
    }
    const address = ctx.message?.text.trim();
    ctx.wizard.state.userData.address = address;
    const { userData } = ctx.wizard.state;

    if(!this.telegramService.isValidSolanaAddress(userData.address)){
      await ctx.reply('❌ Please enter a valid Solana address.');
      // return ctx.scene.leave();
    }

    try {
      await ctx.sendChatAction('typing');
      const response = await this.subscriptionService.unsubscribeUser(
        ctx.from.id.toString(),
        userData.address,
      );

      ctx.reply(response.message);
      ctx.scene.leave();
    } catch (error) {
      console.log(error, 'err');
      ctx.scene.leave();
    }
  }
}
