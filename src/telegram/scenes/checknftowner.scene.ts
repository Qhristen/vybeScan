import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES, TELEGRAM_BTN_ACTIONS } from 'src/common/constants';

import { VybeService } from '../../vybe/vybe.service';
import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';
import { Markup } from 'telegraf';

@Wizard(SCENES.NFT_COLLECTION)
export class NFTCollectionAddressCheckerScene {
  private readonly telegramUtils: TelegramUtils;

  constructor(
    private readonly telegramService: TelegramService,
    private readonly vybeService: VybeService,
  ) {
    this.telegramUtils = new TelegramUtils();
  }

  @WizardStep(1)
  async step1(@Context() ctx) {
    try {

      ctx.wizard.state.userData = {};
       const keyboard = Markup.inlineKeyboard([
            Markup.button.callback('❌ Cancel', TELEGRAM_BTN_ACTIONS.CANCEL),
          ]);
      
      await ctx.reply("Enter collection address:", keyboard);
      ctx.wizard.next(); 
      
    } catch (error) {
      console.log(error, "err")
      ctx.scene.leave();
    }
  }

  @WizardStep(2)
  async step2(@Context() ctx) {
    try {
      
      ctx.wizard.state.userData.collectionAddress = ctx.message?.text.trim();

      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('❌ Cancel', TELEGRAM_BTN_ACTIONS.CANCEL),
      ]);
  
      await ctx.reply("Enter wallet address:", keyboard);
      
      ctx.wizard.next();
    } catch (error) {
      console.log(error, "err")
      ctx.scene.leave();
    }
  }

  @WizardStep(3)
  async step3(@Context() ctx) {
    // Handle Cancel via button
    const action = ctx?.update?.callback_query?.data;
    if (action === TELEGRAM_BTN_ACTIONS.CANCEL) {
      await ctx.reply('❌ Operation cancelled.');
      return ctx.scene.leave();
    }
    const walletAddress = ctx.message.text.trim();
    ctx.wizard.state.userData.walletAddress = walletAddress;
    const { userData } = ctx.wizard.state;

    try {
      const owners = await this.vybeService.nftCollectionOwers(userData.collectionAddress);

      if (!owners) {
        await ctx.reply("⚠️ Failed to retrieve NFT collection owners.");
      } else if (owners.includes(userData.walletAddress)) {
        await ctx.reply(`✅ Wallet ${userData.walletAddress} owns an NFT from the collection.`);
      } else {
        await ctx.reply(`❌ Wallet ${userData.walletAddress} does NOT own an NFT from the collection.`);
      }
      ctx.scene.leave();
    } catch (error) {
      console.log(error, "err")
      ctx.scene.leave();
    }

  }
}
