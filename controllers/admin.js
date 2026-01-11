const prisma = require("../config/prisma")

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus , trackingNumber } = req.body;

    // 1. ดึงออเดอร์เดิมมาดูก่อน (เพื่อเช็คสถานะเก่า)
    const originalOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: { products: true }
    });

    // ป้องกัน: ถ้าออเดอร์เดิมมัน Cancelled อยู่แล้ว ไม่ต้องทำอะไร (กันคืนสต็อกเบิ้ล)
    if (originalOrder.orderStatus === 'Cancelled') {
       return res.status(400).json({ message: "ออเดอร์นี้ถูกยกเลิกไปแล้ว (คืนสต็อกไปแล้ว)" });
    }

    // 2. อัปเดตสถานะ + เลขพัสดุ (ถ้ามีส่งมา)
    const orderUpdate = await prisma.order.update({
      where: { id: orderId },
      data: { 
          orderStatus: orderStatus,
          // ถ้ามี trackingNumber ส่งมาให้อัปเดตด้วย
          ...(trackingNumber && { trackingNumber: trackingNumber }) 
      },
      include: { products: true }
    });

    // 3. Logic คืนของ ถ้าเปลี่ยนสถานะเป็น 'Cancelled'
    if (orderStatus === 'Cancelled') {
      for (const item of orderUpdate.products) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            quantity: { increment: item.count },
            sold: { decrement: item.count }
          }
        });
      }
    }

    res.json(orderUpdate);

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "changeOrderStatus Error" });
  }
};
exports.getOrderAdmin = async (req,res) => {
    try{
        //code
        const orders = await prisma.order.findMany({
            include:{
                products: {
                    include:{
                        product: true
                    }
                },
                orderedBy :{
                    select:{
                        id: true,
                        email: true,
                        addresses: true
                    }
                }
            }
        })
        res.json(orders)

    } catch (err) {
        console.log(err)
        res.status(500).json({ message: "getOrderAdmin Error"})
    }
}
exports.getOrderStats = async (req, res) => {
  try {
    // 1. นับจำนวนออเดอร์ทั้งหมด
    const totalOrders = await prisma.order.count();

    // 2. หาผลรวมยอดขาย (Sum cartTotal)
    const totalSalesData = await prisma.order.aggregate({
      _sum: {
        cartTotal: true
      }
    });
    const totalSales = totalSalesData._sum.cartTotal || 0;

    // 3. นับออเดอร์ที่ "รอจัดส่ง" (Not Process)
    const pendingOrders = await prisma.order.count({
      where: {
        orderStatus: "Not Process"
      }
    });

    res.json({
      totalOrders,
      totalSales,
      pendingOrders
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Get Order Stats Error" });
  }
};

exports.getAdminLogs = async (req, res) => {
  try {
    const logs = await prisma.adminLog.findMany({
      include: {
        admin: {
            select: { id: true, email: true, name: true } // เลือกเฉพาะข้อมูลที่จำเป็น (Security)
        }
      },
      orderBy: { createdAt: 'desc' } // เรียงจากใหม่ไปเก่า
    });
    res.json(logs);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
};