import jwt from 'jsonwebtoken';
import { readDB } from './database.js';

const publicGets = /^\/(health|products(?:\/[^/]+)?|brands|foreign-brands|categories|banners|settings|stores)$/;
const publicPosts = new Set(['/orders', '/orders/one-click', '/vin-requests']);

export async function guardAdminApi(req, res, next) {
  if ((process.env.VERCEL || process.env.STORAGE_BACKEND === 'supabase') && !process.env.JWT_SECRET) {
    return res.status(503).json({ message: 'Сервер не настроен: отсутствует ключ сессии' });
  }
  // Customer routes have their own customer-token / OTP checks.
  if (req.path.startsWith('/auth/') || req.path.startsWith('/my/')
      || (req.path === '/admin/login' && req.method === 'POST')
      || (req.method === 'POST' && publicPosts.has(req.path))) return next();
  if (req.method === 'GET' && publicGets.test(req.path) && req.query.all !== 'true') return next();

  const header = req.get('authorization') || '';
  let session;
  try {
    session = jwt.verify(header.startsWith('Bearer ') ? header.slice(7) : '', process.env.JWT_SECRET || 'autolider_super_secret_jwt_key_2026_kz');
  } catch {
    return res.status(401).json({ message: 'Войдите в админ-панель повторно' });
  }
  if (!['admin', 'staff', 'seller'].includes(session.roleKey)) {
    return res.status(403).json({ message: 'Недостаточно прав' });
  }
  const db = await readDB();
  if (session.roleKey === 'staff' || session.staffId) {
    const staff = (db.adminUsers || []).find(u => String(u.id) === String(session.staffId));
    if (!staff || staff.status === 'disabled') return res.status(401).json({ message: 'Аккаунт сотрудника недоступен' });
    if (session.roleKey === 'admin' && staff.role !== 'admin') return res.status(403).json({ message: 'Недостаточно прав' });
  }
  if (/^\/admin-users(?:\/|$)/.test(req.path) && session.roleKey !== 'admin') {
    return res.status(403).json({ message: 'Управлять сотрудниками может только администратор' });
  }
  if (session.roleKey === 'seller') {
    const seller = (db.sellers || []).find(s => String(s.id) === String(session.sellerId));
    if (!seller || seller.status === 'disabled') return res.status(401).json({ message: 'Аккаунт поставщика недоступен' });
    if (req.path === '/upload') return next();
    if (req.method === 'GET' && publicGets.test(req.path)) {
      req.sellerSession = session;
      return next();
    }
    if (req.method === 'GET' && req.path === '/orders') {
      req.sellerSession = session;
      return next();
    }
    if (req.method === 'GET' && (req.path === '/sellers' || req.path === `/sellers/${session.sellerId}/stats`)) {
      req.sellerSession = session;
      return next();
    }
    if (req.path === '/products' && req.method === 'POST') {
      req.body.seller_id = session.sellerId;
      return next();
    }
    const productId = /^\/products\/([^/]+)$/.exec(req.path)?.[1];
    if (productId && ['PUT', 'DELETE'].includes(req.method)) {
      const product = (db.products || []).find(p => String(p.id) === productId);
      if (product && String(product.seller_id) === String(session.sellerId)) {
        if (req.method === 'PUT') req.body.seller_id = session.sellerId;
        return next();
      }
    }
    return res.status(403).json({ message: 'Поставщик может управлять только своими товарами' });
  }
  req.adminSession = session;
  next();
}
