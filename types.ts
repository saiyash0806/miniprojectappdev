export interface CoinAsset {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
}

export interface Holding {
  assetId: string;
  name: string;
  symbol: string;
  quantity: number;
  avgPrice: number;
  image: string;
}

export interface TransactionRecord {
  id?: string;
  type: 'BUY' | 'SELL';
  assetId: string;
  symbol: string;
  price: number;
  quantity: number;
  total: number;
  timestamp: any;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Root: undefined;
  TradeDetail: { coin: CoinAsset };
};

export type MainTabParamList = {
  Market: undefined;
  Portfolio: undefined;
  History: undefined;
  Profile: undefined;
};
