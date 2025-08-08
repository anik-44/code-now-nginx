import prisma from '../config/prisma.js';
import bcrypt from 'bcryptjs';

class UserService {
    async getUserById(userId) {
        try {
            const user = await prisma.user.findUnique({
                where: {id: userId},
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });

            if (!user) {
                throw new Error('User not found');
            }

            return user;

        } catch (error) {
            console.error(error);
            throw new Error(error.message || 'User not found');
        }
    }

    async updateUser(userId, updateData) {
        const {email, name, password, role} = updateData;

        try {
            const existingUser = await prisma.user.findUnique({
                where: {id: userId}
            });

            if (!existingUser) {
                throw new Error('User not found');
            }

            if (email && email !== existingUser.email) {
                const emailExists = await prisma.user.findUnique({
                    where: {email}
                });

                if (emailExists) {
                    throw new Error('Email already in use');
                }
            }

            // data to update
            const dataToUpdate = {};

            if (email) dataToUpdate.email = email;
            if (name && name !== "") dataToUpdate.name = name;
            if (role) dataToUpdate.role = role;

            if (password) {
                dataToUpdate.password = await bcrypt.hash(password, 12);
            }

            const updatedUser = await prisma.user.update({
                where: {id: userId},
                data: dataToUpdate,
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    createdAt: true,
                    updatedAt: true
                }
            });
            return updatedUser;
        } catch (error) {
            console.error(error);
            throw new Error(error.message || 'Update user failed');
        }
    }
}

export default new UserService();
