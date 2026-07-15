import { NotFoundError } from '../../shared/errors';
import { userRepository } from './repository';
import { UpdateUserInput } from './types';

export const userService = {
  getById: async (id: string) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return user;
  },

  update: async (id: string, input: UpdateUserInput) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError('User not found');
    }
    return userRepository.update(id, input);
  },
};
