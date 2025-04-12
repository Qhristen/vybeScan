import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscription } from 'src/schemas/subscription.schema';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectModel(Subscription.name) public subscriptionModel: Model<Subscription>,
  ) {}

  async subscribeUser(telegramUserId: string, walletAddress: string, addressName: string, event: string) {
    const subscription = await this.subscriptionModel.findOne({ telegramUserId });

    if (subscription) {
      if (subscription.addresses.some(addr => addr.value === walletAddress)) {
        return { message: 'You are already subscribed to this address!' };
      }
      subscription.addresses.push({ event, name: addressName, value: walletAddress });
      await subscription.save();
    } else {
      await this.subscriptionModel.create({ telegramUserId, addresses: [{event, name: addressName, value: walletAddress }] });
    }

    return { message: `Successfully subscribed to address: ${walletAddress}` };
  }

  async unsubscribeUser(telegramUserId: string, walletAddress?: string,) {
    const subscription = await this.subscriptionModel.findOne({ telegramUserId });

    if (!subscription) {
      return { message: 'No active subscription found!' };
    }

    if (walletAddress) {
      subscription.addresses = subscription.addresses.filter(addr => addr.value !== walletAddress);
      await subscription.save();

      if (subscription.addresses.length === 0) {
        await this.subscriptionModel.deleteOne({ telegramUserId });
        return { message: 'Successfully unsubscribed from all address!' };
      }

      return { message: `Successfully unsubscribed from wallet: ${walletAddress}` };
    }

    await this.subscriptionModel.deleteOne({ telegramUserId });
    return { message: 'Successfully unsubscribed from all address!' };
  }

  async getUserSubscriptions(telegramUserId: string) {
    return this.subscriptionModel.findOne({ telegramUserId });
  }

  async getAllSubscriptions() {
    return this.subscriptionModel.find();
  }
}
