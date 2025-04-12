import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES } from 'src/common/constants';
import { Markup } from 'telegraf';

import { SubscriptionService } from 'src/subscription/subscription.service';
import { TELEGRAM_BTN_ACTIONS } from '../../common/constants';
import { VybeService } from '../../vybe/vybe.service';
import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';

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
