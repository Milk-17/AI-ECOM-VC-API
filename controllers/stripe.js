// server/controllers/stripe.js
const path = require('path');
const Stripe = require('stripe');
const prisma = require('../config/prisma');

// โหลด .env — ปรับ path ให้ตรงตำแหน่งไฟล์ของคุณ
// ถ้า .env อยู่ที่รากโปรเจกต์ (C:\ProjectEcom\.env) ให้ใช้ '../../.env'
// ถ้า .env อยู่ในโฟลเดอร์ server (C:\ProjectEcom\server\.env) ให้ใช้ '../.env'
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// เช็คว่าได้ STRIPE_SECRET_KEY จริงหรือไม่ (ต้องขึ้นต้นด้วย sk_ ไม่ใช่ pk_)
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY. Set it in your .env (sk_...)');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

exports.payment = async (req, res) => {
  try {
    // ต้องมี user ก่อน (เช่น มี middleware auth เติม req.user)
    if (!req.user?.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // ดึงตะกร้าของ user
    const cart = await prisma.cart.findFirst({
      where: { orderedById: req.user.id },
      select: { id: true, cartTotal: true },
    });

    if (!cart) {
      return res.status(400).json({ message: 'Cart not found' });
    }

    // แปลงเป็นสตางค์ (จำนวนเต็ม) และกันลบ/ศูนย์
    const amountTHB = Math.max(1, Math.round(Number(cart.cartTotal) * 100));

    // สร้าง PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountTHB,
      currency: 'thb',
      // เปิด auto payment methods (Stripe จะจัดการให้)
      automatic_payment_methods: { enabled: true },
      // แนบ metadata ไว้ debug/ตรวจสอบที่ Dashboard
      metadata: {
        cartId: String(cart.id),
        userId: String(req.user.id),
      },
    });

    return res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      amount: amountTHB,
      currency: 'thb',
    });
  } catch (err) {
    console.error('payment error:', err);
    return res.status(500).json({ message: 'Server Error' });
  }
};
