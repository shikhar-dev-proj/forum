import DataLoader from 'dataloader';
import { Upvote } from '../entities/Upvote';

export const createUpvoteLoader = () => new DataLoader<{ userId: number, postId: number }, Upvote | null>( 
  async (keys) => {
    const upvotes = await Upvote.findByIds(keys as any);    // typeorm handled composite keys
    const map: Record<string, Upvote> = {};
    upvotes.forEach(u => map[`${u.userId}|${u.postId}`] = u);
    return keys.map(k => map[`${k.userId}|${k.postId}`]);
  }
);