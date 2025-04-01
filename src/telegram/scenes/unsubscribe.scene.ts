import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES } from 'src/common/constants';
import { Markup } from 'telegraf';

import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';
import { TELEGRAM_BTN_ACTIONS } from '../../common/constants';
import { VybeService } from '../../vybe/vybe.service';
import { BOT_MESSAGES } from '../telegram.messages';
import { SubscriptionService } from 'src/subscription/subscription.service';

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
    ctx.scene.leave();
    ctx.wizard.state.userData = {};
    await ctx.reply('Enter address:');
    ctx.wizard.next();
  }

  @WizardStep(2)
  async step4(@Context() ctx) {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Invalid input. Please enter a valid address:');
      return;
    }

    const address = ctx.message.text.trim();
    ctx.wizard.state.userData.address = address;
    const { userData } = ctx.wizard.state;

    try {
      const Loading = await ctx.reply(`Loading...`);
      const response = await this.subscriptionService.unsubscribeUser(
        ctx.from.id.toString(),
        userData.address,
      );

      await ctx.deleteMessage(Loading.message_id);
       ctx.reply(response.message);
    } catch (error) {
      await ctx.reply('❌ Error. Try again later.');
    }

    ctx.scene.leave();
  }
}
