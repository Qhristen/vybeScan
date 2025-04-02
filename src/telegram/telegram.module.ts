import { forwardRef, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TelegrafModule } from 'nestjs-telegraf';
import { session } from 'telegraf';

import { SubscriptionModule } from 'src/subscription/subscription.module';
import { UserModule } from '../user/user.module';
import { VybeModule } from '../vybe/vybe.module';
import { NFTCollectionAddressCheckerScene } from './scenes/checknftowner.scene';
import { ShowPortfolioScene } from './scenes/showportfolio.scene';
import { TokenMetricsScene } from './scenes/tokenMetrics.scene';
import { TrackWalletScene } from './scenes/trackwallet.scene';
import { WhalesAlertScene } from './scenes/whalesAlert.scene';
import { TelegramController } from './telegram.controller';
import { TelegramService } from './telegram.service';
import { UnsubscribeScene } from './scenes/unsubscribe.scene';
import { TokenHoldersScene } from './scenes/tokenHolders.scene';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env',
    }),
    TelegrafModule.forRoot({
      middlewares: [session()],
      token: process.env.TELEGRAM_BOT_TOKEN,
    }),
    UserModule,
    forwardRef(() => VybeModule),
    SubscriptionModule,
  ],
  controllers: [],
  providers: [
    TelegramService,
    NFTCollectionAddressCheckerScene,
    ShowPortfolioScene,
    TokenMetricsScene,
    WhalesAlertScene,
    TrackWalletScene,
    UnsubscribeScene,
    TokenHoldersScene,
    TelegramController,
  ],
  exports: [TelegramService],
})
export class TelegramModule {}
