import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES } from 'src/common/constants';
import { Markup } from 'telegraf';

import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';
import { TELEGRAM_BTN_ACTIONS } from '../../common/constants';
import { VybeService } from '../../vybe/vybe.service';
import { BOT_MESSAGES } from '../telegram.messages';
import { SubscriptionService } from 'src/subscription/subscription.service';

@Wizard(SCENES.TOKEN_HOLDERS)
export class TokenHoldersScene {
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
    await ctx.reply('Enter mint address:');
    ctx.wizard.next();
  }
  

  @WizardStep(2)
  async step4(@Context() ctx) {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply('Invalid input. Please enter a valid wallet address:');
      return;
    }

    const mintAddress = ctx.message.text.trim();
    ctx.wizard.state.userData.mintAddress = mintAddress;
    const { userData } = ctx.wizard.state;

    
    try {
      const Loading = await ctx.reply(`Loading...`);
    const data =  await this.vybeService.getTopTokenHolders(userData.mintAddress)

      await ctx.deleteMessage(Loading.message_id);
         ctx.replyWithMarkdownV2(this.telegramService.formatTopTokenHolders(data));

      ctx.scene.leave();
    } catch (error) {
      console.log(error, "err")
      ctx.scene.leave();
    }
  }
}
