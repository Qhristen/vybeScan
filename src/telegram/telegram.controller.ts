import { Action, Command, InjectBot, Start, Update } from 'nestjs-telegraf';
import { Context, Telegraf } from 'telegraf';

import { TelegramService } from './telegram.service';

import { TelegramUtils } from './telegram.utils';

import { SubscriptionService } from 'src/subscription/subscription.service';
import { VybeService } from 'src/vybe/vybe.service';
import { COMMANDS } from './telegram.commands';
import { BOT_MESSAGES } from './telegram.messages';
import { SCENES } from 'src/common/constants';
import { User } from 'src/schemas/user.schema';

@Update()
export class TelegramController {
  private readonly telegramUtils: TelegramUtils;

  constructor(
    @InjectBot() private readonly bot: Telegraf<Context>,
    private readonly telegramService: TelegramService,
    private readonly vybeService: VybeService,
    private readonly subscriptionService: SubscriptionService,
  ) {
    this.bot.telegram.setMyCommands(COMMANDS);
    this.telegramUtils = new TelegramUtils();
  }

  @Start()
  async startCommand(ctx): Promise<any> {
    const userTelegramName: string =
      ctx?.update?.message?.from?.first_name ||
      ctx?.update?.message?.from?.username;

    await ctx.reply(`${BOT_MESSAGES.START_MESSAGE}`);

    const chatID: number = ctx?.update?.message?.from?.id;

    if (!chatID) {
      await ctx.reply(`${BOT_MESSAGES.ERROR.GENERAL}`);
    }

    const user: null | User = await this.telegramService.getUser({
      chatID,
    });

    // Handlers for new user
    if (!user) {
      await ctx.reply(BOT_MESSAGES.START_MESSAGE);
      await this.telegramService.createUser({
        chatID,
        telegramNickname: userTelegramName,
      });
    }
  }

  // @Command('trackwallet')
  // async trackwaller(ctx): Promise<any> {
  //   try {
  //     await ctx.scene.enter(SCENES.TRACK_WALLET, {});
  //   } catch (error) {
  //     console.log('TRACK_WALLET :::', error.message);
  //   }
  // }

  @Command('token_detail')
  async tokenmetrics(ctx): Promise<any> {
    try {
      await ctx.scene.enter(SCENES.TOKEN_METRICS, {});
    } catch (error) {
      console.log('TOKEN_METRICS :::', error.message);
    }
  }

  @Command('whalealert')
  async whalealert(ctx): Promise<any> {
    try {
      await ctx.scene.enter(SCENES.WHALE_ALERT, {});
    } catch (error) {
      console.log('WHALE_ALERT :::', error.message);
    }
  }

  @Command('showportfolio')
  async showportfolio(ctx): Promise<any> {
    try {
      await ctx.scene.enter(SCENES.SHOW_PORTFOLIO, {});
    } catch (error) {
      console.log('SHOW_PORTFOLIO :::', error.message);
    }
  }
  @Command('token_holders')
  async tokenHolders(ctx): Promise<any> {
    try {
      await ctx.scene.enter(SCENES.TOKEN_HOLDERS, {});
    } catch (error) {
      console.log('TOKEN_HOLDERS :::', error.message);
    }
  }

  @Command('checknftowner')
  async checkNftOwnerScene(ctx): Promise<any> {
    try {
      await ctx.scene.enter(SCENES.NFT_COLLECTION, {});
    } catch (error) {
      console.log('NFT_COLLECTION :::', error.message);
    }
  }

  // @Command('subscribe')
  // async subscribe(ctx): Promise<any> {
  //   try {
  //     await ctx.scene.enter(SCENES.UNSUBSCRIBE, {});
  //   } catch (error) {
  //     console.log('UNSUBSCRIBE :::', error.message);
  //   }
  // }

  @Command('unsubscribe')
  async unsubscribe(ctx): Promise<any> {
    try {
      await ctx.scene.enter(SCENES.UNSUBSCRIBE, {});
    } catch (error) {
      console.log('UNSUBSCRIBE :::', error.message);
    }
  }

  @Command('subscriptions')
  async subscriptions(ctx: Context) {
    try {
      const Loading = await ctx.reply(`Loading...`);
      const subscription = await this.subscriptionService.getUserSubscriptions(
        ctx.from.id.toString(),
      );

      if (!subscription || subscription.addresses.length === 0) {
        return ctx.reply('You are not subscribed to any address.');
      }

      const walletList = subscription.addresses
        .map(
          (addr) => `\`\`\`
    📋 ${addr.name}
    ----------------------------
   ${addr.value}
    ----------------------------
    \`\`\``,
        )
        .join('\n');
      await ctx.deleteMessage(Loading.message_id);
      ctx.replyWithMarkdownV2(`${walletList}`);

    } catch (error) {
      ctx.reply('An error occurred while fetching your subscriptions.');
    }
  }
}
