// This small relay stays in the original Vercel project, where the existing
// SMTP/SMS secrets live. Only the new backend can sign delivery requests.
import fs from 'node:fs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';

const publicKey = fs.readFileSync(new URL('../server/otp-public-key.pem', import.meta.url), 'utf8');

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ success: false });
  let payload;
  try {
    const authorization = req.headers.authorization || '';
    payload = jwt.verify(authorization.replace(/^Bearer /, ''), publicKey, {
      algorithms: ['RS256'], audience: 'autolider-otp-delivery', issuer: 'autolider-storage-api',
    });
  } catch {
    return res.status(401).json({ success: false });
  }
  const { target, code } = payload;
  if (typeof target !== 'string' || target.length > 254 || !/^\d{4}$/.test(code)) {
    return res.status(400).json({ success: false });
  }
  try {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      const user = process.env.GMAIL_USER || process.env.SMTP_USER;
      const pass = process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS;
      if (!user || !pass) return res.status(503).json({ success: false, message: 'Почта для кодов не настроена' });
      const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
      await transport.sendMail({ from: `"AutoLider" <${user}>`, to: target,
        subject: `Код подтверждения AutoLider: ${code}`,
        text: `Ваш код авторизации в AutoLider: ${code}. Код действителен 5 минут.`,
      });
    } else {
      if (!/^\+?[\d ()-]{7,25}$/.test(target)) return res.status(400).json({ success: false });
      if (!process.env.SMS_GATEWAY_URL || !process.env.SMS_API_KEY) {
        return res.status(503).json({ success: false, message: 'SMS для кодов не настроены' });
      }
      const response = await fetch(process.env.SMS_GATEWAY_URL, { method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.SMS_API_KEY}` },
        body: JSON.stringify({ recipient: target, message: `Ваш код авторизации в AutoLider: ${code}` }),
        signal: AbortSignal.timeout(15000),
      });
      if (!response.ok) throw new Error('SMS provider rejected delivery');
    }
    res.json({ success: true });
  } catch {
    res.status(502).json({ success: false, message: 'Не удалось отправить код. Попробуйте позже.' });
  }
}
