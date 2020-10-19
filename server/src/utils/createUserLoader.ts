import DataLoader from 'dataloader';
import { User } from '../entities/User';
export const createUserLoader = () => new DataLoader<number, User>( async (userIds) => {
  const users = await User.findByIds(userIds as number[]);
  const map: Record<number, User> = {};
  users.forEach(user => map[user.id] = user);
  return userIds.map(id => map[id]);
})