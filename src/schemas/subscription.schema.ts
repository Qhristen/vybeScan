import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  HydratedDocument,
} from 'mongoose';

export type SubscriptionDocument = HydratedDocument<Subscription>;

@Schema({ timestamps: true })
export class Subscription {
  @Prop({ required: true, unique: true })
  telegramUserId: string;

  @Prop({ type: [{ name: String, value: String }], default: [] })
  addresses: { name: string; value: string; }[];
}

export const SubscriptionSchema = SchemaFactory.createForClass(Subscription);
