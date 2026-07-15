import { LikeTarget, ReactionType } from '@prisma/client';

export interface LikeResponse {
  id: string;
  userId: string;
  targetType: LikeTarget;
  targetId: string;
  reactionType: ReactionType;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}

export interface LikesListResponse {
  likes: Array<{
    id: string;
    userId: string;
    reactionType: ReactionType;
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

export interface ToggleLikeResponse {
  liked: boolean;
  count: number;
  reactionType?: ReactionType;
  like?: LikeResponse;
}
