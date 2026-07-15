import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { config } from '../../config';
import { ConflictError, UnauthorizedError } from '../../shared/errors';
import { authRepository } from './repository';
import { AuthResponse, RegisterInput, LoginInput } from './types';

const generateToken = (user: { id: string; email: string }): string => {
  return jwt.sign({ id: user.id, email: user.email }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as jwt.SignOptions);
};

export const authService = {
  register: async (input: RegisterInput): Promise<AuthResponse> => {
    const existing = await authRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(input.password, 12);
    const user = await authRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: hashedPassword,
    });

    const token = generateToken(user);
    return { user, token };
  },

  login: async (input: LoginInput): Promise<AuthResponse> => {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const token = generateToken({ id: user.id, email: user.email });
    return {
      user: { id: user.id, firstName: user.firstName, lastName: user.lastName, email: user.email },
      token,
    };
  },

  getCurrentUser: async (userId: string) => {
    const user = await authRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return user;
  },
};
