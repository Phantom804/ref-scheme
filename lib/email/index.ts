import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_SERVER_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
    }
});

export const sendVerificationEmail = async (
    email: string,
    token: string
): Promise<void> => {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}`;

    await transporter.sendMail({
        from: process.env.EMAIL_FROM || '"Digital Marketplace" <noreply@digitalmarketplace.com>',
        to: email,
        subject: 'Verify your email address',
        html: `
      <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <h2 style="color: #5740b2; margin-bottom: 20px;">Verify your email address</h2>
        <p>Thank you for signing up with Digital Marketplace! Please verify your email address by clicking the link below:</p>
        <p style="margin: 30px 0;">
          <a href="${verificationUrl}" style="background-color: #715cff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold;">
            Verify Email
          </a>
        </p>
        <p>This link will expire in 24 hours. If you did not sign up for an account, please ignore this email.</p>
        <p style="margin-top: 40px; font-size: 12px; color: #666;">
          &copy; ${new Date().getFullYear()} Digital Marketplace. All rights reserved.
        </p>
      </div>
    `,
    });
}; 