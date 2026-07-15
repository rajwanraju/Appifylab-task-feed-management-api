export interface ShareResponse {
  id: string;
  userId: string;
  postId: string;
  createdAt: Date;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  };
}
