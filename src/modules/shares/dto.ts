export interface SharesListResponse {
  shares: Array<{
    id: string;
    userId: string;
    createdAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
  }>;
  count: number;
}

export interface ToggleShareResponse {
  shared: boolean;
  count: number;
}
