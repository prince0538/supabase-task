import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs'
import prisma from "../prisma";
import { Role } from '@prisma/client';

export const addUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password, age, role, adminCode } = req.body;
        if (!name || !email || !password || age === undefined) {
            return res.status(400).json({
                error: 'name, email, password, and age are required'
            })
        }

        const requestedRole = typeof role === 'string' ? role.trim().toUpperCase() : 'USER';
        if (requestedRole !== 'USER' && requestedRole !== 'ADMIN') {
            return res.status(400).json({ error: 'role must be USER or ADMIN' });
        }

        let userRole: Role = Role.USER;
        if (requestedRole === 'ADMIN') {
            if (!process.env.ADMIN_CODE?.trim() || adminCode?.trim() !== process.env.ADMIN_CODE.trim()) {
                return res.status(403).json({ error: 'Invalid admin code' })
            }
            userRole = Role.ADMIN;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name: name.trim().toLowerCase(),
                email: email.toLowerCase(),
                password: hashedPassword,
                age: Number(age),
                role: userRole
            }
        })
        res.status(201).json(user);
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({
                error: 'Email already exists'
            })
        }
        res.status(500).json({
            error: error.message
        })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'email and password are required'
            })
        }

        const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            omit: { password: false }
        })

        if (!user) {
            return res.status(401).json({
                error: 'Invalid email or password'
            })
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({
                error: 'Invalid email or password'
            })
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "1d" }
        )
        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });
    } catch (error: any) {
        res.status(500).json({
            error: error.message
        })
    }
}

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.json(users);
    } catch (error: any)  {
        res.status(500).json({
            error: error.message
        })
    }
}

export const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: id as string },
            omit: { password: false },
        });
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            })
        }
        res.json(user);
    } catch (error: any) {
        res.status(500).json({
            error: error.message
        })
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, email, password, age, role } = req.body;
        const user = await prisma.user.findUnique({
            where: { id: id as string },
            omit: { password: false },
        })
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            })
        }
        const updatedUser = await prisma.user.update({
            where: { id: id as string },
            data: { name, email, password, age, role }
        })
        res.json(updatedUser);
    } catch (error: any) {
        res.status(500).json({
            error: error.message
        })
    }
}

export const deleteUser = async (req: Request, res:Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: id as string },
            omit: { password: false },
        })
        if (!user) {
            return res.status(404).json({
                error: 'User not found'
            })
        }
        await prisma.user.delete({
            where: { id: id as string }
        })
        res.json({ 
            message: 'User deleted successfully'
         });
    } catch (error: any) {
        res.status(500).json({
            error: error.message
        })
    }
}