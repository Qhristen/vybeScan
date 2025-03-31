import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { VybeService } from './vybe.service';
import { VybeWebsocket } from './vybe.websoket';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { TelegramModule } from 'src/telegram/telegram.module';

@Module({
  imports: [
    HttpModule.register({
    }),
    SubscriptionModule,
    forwardRef(() => TelegramModule),
  ],
  controllers: [],
  providers: [VybeService, VybeWebsocket],
  exports: [VybeService],
})
export class VybeModule {}
