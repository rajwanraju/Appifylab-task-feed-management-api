import { Visibility, ReactionType } from '@prisma/client';

export interface PostListQuery {
  cursor?: string;
  limit?: number;
}

export interface PostDto {
  id: string;
  content: string;
  image: string | null;
  visibility: Visibility;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
  stats: {
    likesCount: number;
    commentsCount: number;
    sharesCount: number;
  };
  topReactions: Array<{
    userId: string;
    reactionType: ReactionType;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
  }>;
  isLiked: boolean;
  isSaved: boolean;
  comments: Array<{
    id: string;
    content: string;
    userId: string;
    postId: string;
    createdAt: Date;
    updatedAt: Date;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: string | null;
    };
    stats: {
      likesCount: number;
      repliesCount: number;
    };
    isLiked: boolean;
    replies: Array<{
      id: string;
      content: string;
      userId: string;
      commentId: string;
      createdAt: Date;
      updatedAt: Date;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
      };
      stats: {
        likesCount: number;
      };
      isLiked: boolean;
    }>;
  }>;
}

export interface FeedResponse {
  posts: PostDto[];
  nextCursor: string | null;
  hasMore: boolean;
}
