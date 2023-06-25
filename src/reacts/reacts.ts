export interface IReactsService {
  reactPost(reactBy: string, postRef: string, react: string): Promise<string>;

  getReacts(
    reactBy: string,
    postRef: string,
  ): Promise<{
    reacts: {
      react: string;
      count: number;
    }[];
    check: string;
    total: number;
    checkSaved: boolean;
  }>;
}
