import { prisma } from '../../shared/prisma';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
  createdAt: true,
  updatedAt: true,
} as const;

export const userRepository = {
  findById: (id: string) =>
    prisma.user.findUnique({
      where: { id },
      select: userSelect,
    }),

  update: (id: string, data: { firstName?: string; lastName?: string; email?: string; avatar?: string }) =>
    prisma.user.update({
      where: { id },
      data,
      select: userSelect,
    }),
};
