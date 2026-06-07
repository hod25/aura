import bcrypt from 'bcryptjs';
import { userRepository } from '../repositories/user.repository';
import { signToken } from '../utils/jwt';
import { AppError } from '../utils/AppError';
import { PublicUser, User } from '../types';

const BCRYPT_ROUNDS = 12;

function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    created_at: user.created_at,
  };
}

export const authService = {
  async signup(input: {
    name: string;
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; token: string }> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict('An account with this email already exists');
    }

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await userRepository.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    const token = signToken({ sub: user.id, email: user.email });
    return { user: toPublicUser(user), token };
  },

  async login(input: {
    email: string;
    password: string;
  }): Promise<{ user: PublicUser; token: string }> {
    const user = await userRepository.findByEmail(input.email);
    // Always run a compare to mitigate user-enumeration timing differences.
    const hash = user?.password_hash ?? '$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinva';
    const passwordMatches = await bcrypt.compare(input.password, hash);

    if (!user || !passwordMatches) {
      throw AppError.unauthorized('Invalid email or password');
    }

    const token = signToken({ sub: user.id, email: user.email });
    return { user: toPublicUser(user), token };
  },

  async getProfile(userId: number): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw AppError.notFound('User not found');
    }
    return toPublicUser(user);
  },
};
