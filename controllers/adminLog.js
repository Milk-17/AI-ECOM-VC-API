const prisma = require("../config/prisma");

// ดึง log ทั้งหมด
exports.listAdminLogs = async (req, res) => {
    try {
        // query parameter สำหรับกรอง (optional)
        const { adminId, productId, action } = req.query;

        const where = {};

        if(adminId) where.adminId = Number(adminId);
        if(productId) where.productId = Number(productId);
        if(action) where.action = action;

        const logs = await prisma.adminLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: {
                admin: {
                    select: { id: true, email: true, name: true }
                },
                product: {
                    select: { id: true, title: true }
                }
            }
        });

        res.send(logs);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "listAdminLogs Error" });
    }
};