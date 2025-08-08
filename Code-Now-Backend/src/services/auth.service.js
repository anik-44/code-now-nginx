import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';
import {genAccess, genRefresh, verifyRefresh,} from "../utils/jwt.js";
import redis from '../config/redis.js';
import crypto from 'crypto';
import {sendResetEmail} from '../utils/mail.js';

class AuthService {
    async register(email, password) {
        try {
            // Check if user already exists
            const existingUser = await prisma.user.findUnique({where: {email}});
            if (existingUser) {
                throw new Error('User with this email already exists');
            }
            const hashedPassword = await bcrypt.hash(password, 12);
            await prisma.user.create({
                data: {
                    email, password: hashedPassword
                }
            });
        } catch (error) {
            console.error(error);
            throw new Error(error.message || 'Registration failed');
        }
    }

    async login(email, password) {
        try {
            const user = await prisma.user.findUnique({where: {email}});

            if (!user) {
                throw new Error('Invalid credentials');
            }

            // Check if user has a password (not OAuth-only user)
            if (!user.password) {
                throw new Error('Please login with GitHub OAuth');
            }

            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                throw new Error('Invalid credentials');
            }

            const tokens = await this.issueTokens(user.id)

            const userDetails = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            }
            return {
                tokens,
                userDetails,
            }

        } catch (error) {
            console.error(error);
            throw new Error(error.message || 'login failed');
        }
    }

    async refresh(refreshToken) {
        try {
            const payload = verifyRefresh(refreshToken);
            const storedUserId = await redis.get(`rt:${refreshToken}`);

            if (!storedUserId || storedUserId !== payload.sub) {
                throw new Error('Session expired');
            }

            // Verify user still exists
            const user = await prisma.user.findUnique({where: {id: payload.sub}});
            if (!user) {
                await redis.del(`rt:${refreshToken}`);
                throw new Error('User no longer exists');
            }

            return {accessToken: genAccess({sub: payload.sub})};
        } catch (error) {
            console.error(error);
            throw new Error(error.message || 'Invalid token');
        }
    }

    async logout(refreshToken) {
        try {
            await redis.del(`rt:${refreshToken}`);
        } catch (error) {
            console.error(error);
            throw new Error(error.message || 'Invalid token');
        }
    }

    async forgotPassword(email) {
        try {
            const user = await prisma.user.findUnique({where: {email}});
            if (!user) {
                // user not found
                return;
            }

            // Clean up existing reset tokens for this user
            await prisma.passwordResetToken.deleteMany({
                where: {userId: user.id}
            });

            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

            await prisma.passwordResetToken.create({
                data: {
                    tokenHash, userId: user.id, expires
                }
            });

            const resetLink = `${process.env.CLIENT_URL}/reset-password/${user.id}/${rawToken}`;
            await sendResetEmail(email, resetLink);
        } catch (error) {
            console.error(error);
            throw new Error(error.message || "ForgotPassword failed");
        }

    }

    async reset(userId, rawToken, newPassword) {
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

        const resetToken = await prisma.passwordResetToken.findFirst({
            where: {
                userId, tokenHash, expires: {gt: new Date()}
            }
        });

        if (!resetToken) {
            throw new Error('Invalid or expired token');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Update password and clean up reset tokens
        await prisma.$transaction([prisma.user.update({
            where: {id: userId}, data: {password: hashedPassword}
        }), prisma.passwordResetToken.deleteMany({
            where: {userId}
        })]);

        // Invalidate all refresh tokens for this user
        const keys = await redis.keys('rt:*');
        for (const key of keys) {
            const storedUserId = await redis.get(key);
            if (storedUserId === userId) {
                await redis.del(key);
            }
        }
    }

    async issueTokens(userId) {
        const accessToken = genAccess({sub: userId});
        const refreshToken = genRefresh({sub: userId});

        // store refresh token in redis
        await redis.set(`rt:${refreshToken}`, userId, {EX: 60 * 60 * 24 * 7});

        return {accessToken, refreshToken};
    }

}

export default new AuthService();
