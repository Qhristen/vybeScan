import { Context, Wizard, WizardStep } from 'nestjs-telegraf';
import { SCENES } from 'src/common/constants';

import { VybeService } from '../../vybe/vybe.service';
import { TelegramService } from '../telegram.service';
import { TelegramUtils } from '../telegram.utils';

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
  async step2(@Context() ctx) {
    ctx.wizard.state.userData = {};
    await ctx.reply("Enter collection address:");
    ctx.wizard.next(); 
  }

  @WizardStep(2)
  async step3(@Context() ctx) {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply("Invalid input. Please enter a valid collection address:");
      return;
    }

    ctx.wizard.state.userData.collectionAddress = ctx.message.text.trim();
    await ctx.reply("Enter wallet address:");
    
    ctx.wizard.next();
  }

  @WizardStep(3)
  async step4(@Context() ctx) {
    if (!ctx.message || !ctx.message.text) {
      await ctx.reply("Invalid input. Please enter a valid wallet address:");
      return;
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
    } catch (error) {
      await ctx.reply("❌ Error checking ownership. Try again later.");
    }

    ctx.scene.leave();
  }
}
