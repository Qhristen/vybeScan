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

      await ctx.reply('Enter collection address:', keyboard);
      ctx.wizard.next();
    } catch (error) {
      console.log(error, 'err');
      ctx.scene.leave();
    }
  }

  @WizardStep(2)
  async step2(@Context() ctx) {
    try {
      ctx.wizard.state.userData.collectionAddress = ctx.message?.text.trim();
      const { userData } = ctx.wizard.state;

      if (
        !this.telegramService.isValidSolanaAddress(userData.collectionAddress)
      ) {
        await ctx.reply('❌ Please enter a valid Solana token address.');
        // return ctx.scene.leave();
        return;
      }
      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('❌ Cancel', TELEGRAM_BTN_ACTIONS.CANCEL),
      ]);

      await ctx.reply('Enter wallet address:', keyboard);

      ctx.wizard.next();
    } catch (error) {
      console.log(error, 'err');
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

    if (!this.telegramService.isValidSolanaAddress(userData.walletAddress)) {
      const keyboard = Markup.inlineKeyboard([
        Markup.button.callback('❌ Cancel', TELEGRAM_BTN_ACTIONS.CANCEL),
      ]);

      await ctx.reply(
        '❌ Please enter a valid Solana wallet address.',
        keyboard,
      );
      // return ctx.scene.leave();
      return;
    }

    try {
      await ctx.sendChatAction('typing');

      const collection = await this.vybeService.nftCollectionOwers(
        userData.collectionAddress,
      );

      const exists = collection.some(
        (item) =>
          item.owner.toLowerCase() === userData.walletAddress.toLowerCase(),
      );

      if (!collection) {
        await ctx.reply('⚠️ Failed to retrieve NFT collection owners.');
        return;
      }

      if (exists) {
        await ctx.reply(
          `✅ Wallet ${userData.walletAddress} owns NFT from the collection.`,
        );
      } else {
        await ctx.reply(
          `❌ Wallet ${userData.walletAddress} does NOT own NFT from the collection.`,
        );
      }
      ctx.scene.leave();
    } catch (error) {
      console.log(error, 'err');
      ctx.scene.leave();
    }
  }
}
