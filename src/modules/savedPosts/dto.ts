export interface SavedPostsListResponse {
  savedPosts: Array<{
    id: string;
    savedAt: Date;
    post: {
      id: string;
      content: string;
      image: string | null;
      user: {
        id: string;
        firstName: string;
        lastName: string;
        avatar: string | null;
      };
      _count: {
        comments: number;
      };
    };
  }>;
  nextCursor: string | null;
  hasMore: boolean;
}
