import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';



interface JwtPayload {
    id: string;
    name: string;
    phoneNumber: string;
    referralCode: string;
    email: string;
    role?: string;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
    return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (user: JwtPayload): string => {
    const { id, name, phoneNumber, referralCode, email, role } = user;

    const payload: JwtPayload = { id, name, phoneNumber, referralCode, email };

    if (role === 'admin' || role === 'superAdmin') {
        payload.role = role;
    }
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload | null => {
    try {
        return jwt.verify(token, JWT_SECRET) as JwtPayload;
    } catch (error) {
        return null;
    }
};


