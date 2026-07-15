export interface ReplyResponse {
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
}
