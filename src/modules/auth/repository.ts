import { prisma } from '../../shared/prisma';

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  avatar: true,
} as const;

export const authRepository = {
  findByEmail: (email: string) => prisma.user.findUnique({ where: { email } }),

  findById: (id: string) => prisma.user.findUnique({ where: { id }, select: userSelect }),

  create: (data: { firstName: string; lastName: string; email: string; password: string; avatar?: string }) =>
    prisma.user.create({
      data,
      select: userSelect,
    }),
};
