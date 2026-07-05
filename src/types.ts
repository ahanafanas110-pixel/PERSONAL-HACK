export interface HackPassword {
  id: string;
  code: string;
  vipNum: number; // 1, 2, 3, 4
  validUntil: string; // ISO string, or 'alltime'
  maxUsers: number; // number of allowed users, or -1 for unlimited
  usedCount: number; // how many times successfully logged in
  createdAt: string;
}

export interface PredictionData {
  vip1: {
    period: string;
    countdown: number;
    prediction: 'SMALL' | 'BIG';
    num: number;
  };
  vip2: {
    period: string;
    wins: number;
    losses: number;
    total: number;
    currentSide: string;
    currentEmoji: string;
    history: Array<{ period: string; pred: string; result: string; resultClass: string }>;
  };
  vip3: {
    secRemaining: number;
    prediction: string;
    color: string;
  };
  vip4: {
    period: string;
    secRemaining: number;
    prediction: string;
    color: string;
  };
}
