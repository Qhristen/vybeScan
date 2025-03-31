import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, Observable } from 'rxjs';
import { TelegramService } from 'src/telegram/telegram.service';
import { AxiosResponse } from 'axios';

@Injectable()
export class VybeService {
  private readonly API_KEY = process.env.VYBE_API_KEY;
  private readonly API_URL = 'https://api.vybenetwork.xyz';

  constructor(
    private readonly httpService: HttpService,
    private readonly telegramService: TelegramService,
  ) {}

  async getTokenMetrics(mintAddress: string): Promise<any> {
    const url = `${this.API_URL}/token/${mintAddress}`;
    const headers = { 'X-API-Key': this.API_KEY };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );
      return response.data;
    } catch (error) {
      console.error('Vybe API Error:', error);
      return null;
    }
  }

  async tokenBalances(walletAddress: string): Promise<any> {
    const url = `${this.API_URL}/account/token-balance/${walletAddress}`;
    const headers = { 'X-API-Key': this.API_KEY };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );

      return response.data;
    } catch (error) {
      console.error('Vybe API Error:', error);
      return null;
    }
  }

  async nftCollectionOwers(collectionAddress: string) {
    const url = `${this.API_URL}/nft/collection-owners/${collectionAddress}`;
    const headers = { 'X-API-Key': this.API_KEY };

    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );

      return response.data.data;
    } catch (error) {
      console.error('Vybe API Error:', error);
      return null;
    }
  }

  async fetchTransactions(walletAddress: string) {
    const url = `${this.API_URL}/token/transfers?receiverAddress=${walletAddress}&senderAddress=${walletAddress}&limit=3`;
    const headers = { 'X-API-Key': this.API_KEY };
    try {
      const response = await firstValueFrom(
        this.httpService.get(url, { headers }),
      );
      console.log(response.data, "res")
      return response.data?.transfers;
    } catch (error) {
      console.error('❌ Error fetching transactions:', error.message);
      return [];
    }
  }
}
