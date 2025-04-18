import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { SubscriptionModule } from 'src/subscription/subscription.module';
import { TelegramModule } from 'src/telegram/telegram.module';
import { VybeService } from './vybe.service';
// import { VybeWebsocket } from './vybe.websoket';

@Module({
  imports: [
    HttpModule.register({}),
    SubscriptionModule,
    forwardRef(() => TelegramModule),
  ],
  controllers: [],
  // Add websocket to provider
  providers: [
    VybeService, 
    // VybeWebsocket
  ],
  exports: [VybeService],
})
export class VybeModule {}
