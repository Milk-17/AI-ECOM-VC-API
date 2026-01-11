const prisma = require('../config/prisma');
const { authCheck } = require('../middlewares/authCheck');
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id; // จาก middleware auth
    const cart = await prisma.cart.findFirst({
      where: { orderedById: userId },
      include: { products: { include: { product: true } } },
    });

    if (!cart) return res.status(400).json({ message: 'Cart is empty' });

    const order = await prisma.order.create({
      data: {
        orderedById: userId,
        cartTotal: cart.cartTotal,
        products: {
          create: cart.products.map(p => ({
            productId: p.productId,
            count: p.count,
            price: p.price,
          })),
        },
        amount: cart.cartTotal,
        status: 'Paid',
        currentcy: 'THB',
      },
      include: { products: { include: { product: true } } },
    });

    // เคลียร์ตะกร้า
    await prisma.productOnCart.deleteMany({ where: { cartId: cart.id } });
    await prisma.cart.update({ where: { id: cart.id }, data: { cartTotal: 0 } });

    res.json(order);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order.findMany({
      where: { orderedById: userId },
      include: { products: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ======= Start Fix: เพิ่มฟังก์ชันสำหรับ Dashboard =======

// ออเดอร์ล่าสุด (5 รายการ)
exports.getRecentOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        products: {
          include: { product: true } // ดึงรายละเอียดสินค้า
        },
        orderedBy: true, // ดึงข้อมูลผู้สั่ง
      },
    });
    res.json(orders);
  } catch (err) {
    console.error("getRecentOrders error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงออเดอร์ล่าสุดได้" });
  }
};

// ออเดอร์ที่ยังไม่จัดส่ง
exports.getPendingOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { orderStatus: "Not Process" }, // ใช้ field orderStatus
      orderBy: { createdAt: 'desc' },
      include: {
        products: { include: { product: true } },
        orderedBy: true,
      },
    });
    res.json(orders);
  } catch (err) {
    console.error("getPendingOrders error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงออเดอร์ที่ยังไม่จัดส่งได้" });
  }
};

// สถิติรวม
exports.getOrderStats = async (req, res) => {
  try {
    const totalOrders = await prisma.order.count();

    const totalSales = await prisma.order.aggregate({
      _sum: { cartTotal: true }
    });

    const pendingOrders = await prisma.order.count({
      where: { orderStatus: "Not Process" }
    });

    res.json({
      totalOrders,
      totalSales: totalSales._sum.cartTotal || 0,
      pendingOrders,
    });
  } catch (err) {
    console.error("getOrderStats error:", err);
    res.status(500).json({ error: "ไม่สามารถดึงสถิติได้" });
  }
};

exports.updateTrackingNumber = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { trackingNumber } = req.body;

    if (!trackingNumber || trackingNumber.trim() === "") {
      return res.status(400).json({ message: 'Tracking number is required' });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: { trackingNumber: trackingNumber }
    });

    res.status(200).json({
      message: 'Tracking number updated successfully',
      order: updatedOrder
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ======= End Fix =======