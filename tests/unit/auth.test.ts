import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { authService } from '../../src/modules/auth/service';

jest.mock('../../src/shared/prisma', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock('bcrypt');
jest.mock('jsonwebtoken');

import { prisma } from '../../src/shared/prisma';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    const mockInput = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      password: 'password123',
    };

    it('should register a new user successfully', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedPassword');
      (prisma.user.create as jest.Mock).mockResolvedValue({
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
      });
      (jwt.sign as jest.Mock).mockReturnValue('token-123');

      const result = await authService.register(mockInput);

      expect(result.user.email).toBe('john@example.com');
      expect(result.token).toBe('token-123');
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 12);
    });

    it('should throw if email already exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: 'existing' });

      await expect(authService.register(mockInput)).rejects.toThrow('Email already registered');
    });
  });

  describe('login', () => {
    const mockInput = {
      email: 'john@example.com',
      password: 'password123',
    };

    it('should login successfully with valid credentials', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token-123');

      const result = await authService.login(mockInput);

      expect(result.token).toBe('token-123');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword');
    });

    it('should throw with invalid email', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(authService.login(mockInput)).rejects.toThrow('Invalid email or password');
    });

    it('should throw with invalid password', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: 'user-1',
        password: 'hashedPassword',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(authService.login(mockInput)).rejects.toThrow('Invalid email or password');
    });
  });
});
