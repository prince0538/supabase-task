import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
    user?: { id: string; role: string };
}


export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        return res.status(401).json({
            error: 'No token provided'
        });
    }

    const token = header.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            role: string;
        };

        (req as AuthRequest).user = { id: decoded.id, role: decoded.role };
        next();
    } catch {
        return res.status(401).json({
            error: 'Invalid or expired token'
        });
    }
};


export const authorize = (...roles: string[]) =>
    (req: Request, res: Response, next: NextFunction) => {
        const user = (req as AuthRequest).user;

        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized'
            });
        }

        const userRole = user.role
        const allowedRoles = roles.map((role) => role.trim().toUpperCase());
        if (!allowedRoles.includes(userRole)) {
            return res.status(403).json({
                error: 'Forbidden'
            });
        }

        next();
    };
