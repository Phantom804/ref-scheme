import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import { connectToDatabase } from '@/lib/mongoose';
import { User } from '@/lib/models/User';
import { VerificationToken } from '@/lib/models/VerificationToken';


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

export const generateVerificationToken = async (userId: string): Promise<string> => {
    await connectToDatabase();

    const token = randomBytes(32).toString('hex');
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // Token expires in 24 hours

    // Remove any existing token for the user
    await VerificationToken.findOneAndDelete({ userId });

    // Create new token
    await VerificationToken.create({
        token,
        expires,
        userId
    });

    return token;
};

export const verifyEmail = async (token: string): Promise<boolean> => {
    await connectToDatabase();

    const verificationToken = await VerificationToken.findOne({ token }).exec();

    if (!verificationToken || verificationToken.expires < new Date()) {
        return false;
    }

    // Update user
    await User.findByIdAndUpdate(verificationToken.userId, { isVerified: true });

    // Delete token
    await VerificationToken.findByIdAndDelete(verificationToken.id);

    return true;
}; 