import {
  Controller
} from '@nestjs/common';
import { SubscriptionService } from './subscription.service';

@Controller('Subscription')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

}
