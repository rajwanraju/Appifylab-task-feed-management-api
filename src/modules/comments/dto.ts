export interface CommentResponse {
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
}
