import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import type { Types } from 'mongoose';
import { config } from './config.js';
import { ProfileModel, UserModel } from './models.js';

export type AuthUser = {
  id: string;
  tenantId: string;
  email: string;
  profileId: string;
  permissions: string[];
};

export type GraphQLContext = {
  user: AuthUser | null;
};

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return bcrypt.compare(password, passwordHash);
}

export function signToken(userId: string) {
  const options: SignOptions = { expiresIn: config.jwtExpiresIn as SignOptions['expiresIn'] };
  return jwt.sign({ sub: userId }, config.jwtSecret, options);
}

export async function getUserFromAuthorization(authorization?: string): Promise<AuthUser | null> {
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authorization.replace('Bearer ', '');
    const payload = jwt.verify(token, config.jwtSecret);
    const userId = typeof payload === 'object' && 'sub' in payload ? String(payload.sub) : '';
    const user = await UserModel.findById(userId).lean();

    if (!user || user.status === 'SUSPENDED') {
      return null;
    }

    const profile = await ProfileModel.findById(user.profileId).lean();

    return {
      id: String(user._id),
      tenantId: String(user.tenantId),
      email: user.email,
      profileId: String(user.profileId),
      permissions: profile?.permissions ?? [],
    };
  } catch {
    return null;
  }
}

export function requireAuth(context: GraphQLContext) {
  if (!context.user) {
    throw new Error('Authentication required');
  }

  return context.user;
}

export function requirePermission(context: GraphQLContext, permission: string) {
  const user = requireAuth(context);

  if (!user.permissions.includes(permission)) {
    throw new Error(`Missing permission: ${permission}`);
  }

  return user;
}

export function toObjectId(id: string) {
  return id as unknown as Types.ObjectId;
}
