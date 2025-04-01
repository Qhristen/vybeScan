import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES } from 'src/common/constants';
import { Markup } from 'telegraf';

import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';
import { TELEGRAM_BTN_ACTIONS } from '../../common/constants';
import { VybeService } from '../../vybe/vybe.service';
import { BOT_MESSAGES } from '../telegram.messages';

@Wizard(SCENES.TOKEN_METRICS)
export class TokenMetricsScene {
  private readonly telegramUtils: TelegramUtils;

  constructor(
    private readonly telegramService: TelegramService,
    private readonly vybeService: VybeService,
  ) {
    this.telegramUtils = new TelegramUtils();
  }

  @WizardStep(1)
  async step2(@Context() ctx) {
    ctx.scene.leave();
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
      const data = await this.vybeService.getTokenMetrics(userData.mintAddress);
      if (!data) {
        return ctx.reply('❌ Token data not found.');
      }

      await ctx.deleteMessage(Loading.message_id);
      ctx.replyWithMarkdownV2(this.telegramService.formatTokenMetrics(data));
    } catch (error) {
      await ctx.reply('❌ Error. Try again later.');
    }

    ctx.scene.leave();
  }
}
