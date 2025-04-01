import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES } from 'src/common/constants';
import { Markup } from 'telegraf';

import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';
import { TELEGRAM_BTN_ACTIONS } from '../../common/constants';
import { VybeService } from '../../vybe/vybe.service';
import { BOT_MESSAGES } from '../telegram.messages';

@Wizard(SCENES.SHOW_PORTFOLIO)
export class ShowPortfolioScene {
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
      const Loading = await ctx.reply(`Loading...`);
      const response = await this.vybeService.tokenBalances(
        userData.walletAddress,
      );
      if (!response) {
        return ctx.reply('❌ No tokens found.');
      }

      await ctx.deleteMessage(Loading.message_id);
      ctx.replyWithMarkdownV2(this.telegramService.formatTokens(response));
    } catch (error) {
      await ctx.reply('❌ Error. Try again later.');
    }

    ctx.scene.leave();
  }
}
