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
    
    ctx.wizard.state.userData = {};
    const keyboard = Markup.inlineKeyboard([
      Markup.button.callback('❌ Cancel', TELEGRAM_BTN_ACTIONS.CANCEL),
    ]);

    await ctx.reply('Enter wallet address:', keyboard);
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

    const walletAddress = ctx.message?.text.trim();
    ctx.wizard.state.userData.walletAddress = walletAddress;
    const { userData } = ctx.wizard.state;

    try {
      const Loading = await ctx.reply(`Loading...`);
      const response = await this.vybeService.tokenBalances(
        userData.walletAddress,
      );

      await ctx.deleteMessage(Loading.message_id);
      ctx.replyWithMarkdownV2(this.telegramService.formatTokens(response));
      ctx.scene.leave();
    } catch (error) {
      console.log(error, 'err');
    }
  }
}
