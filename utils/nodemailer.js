import nodemailer from 'nodemailer';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const verifyEmailTemplatePath = join(
  __dirname,
  'emailTemplates',
  'verifyEmail.html'
);

const verifyEmailTemplate = readFileSync(verifyEmailTemplatePath, 'utf-8');

const verifyEmail = async (link, email) => {
  try {
    const emailVerification = verifyEmailTemplate.replace('{{link}}', link);

    const transporter = nodemailer.createTransport({
      host: process.env.host,
      port: process.env.EMAIL_PORT,
      service: process.env.SERVICE,
      secure: process.env.SECURE,
      auth: {
        user: process.env.USER,
        pass: process.env.PASS,
      },
      tls: { rejectUnauthorized: false },
    });

    const info = await transporter.sendMail({
      from: process.env.USER,
      to: email,
      subject: 'Verify your email',
      text: 'Welcome',
      html: emailVerification,
    });
  } catch (error) {
    console.log(error);
  }
};

export { verifyEmail };
