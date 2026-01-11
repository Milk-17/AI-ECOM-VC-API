const express = require('express');
const router = express.Router();
const { createOrder, getOrders , getRecentOrders, getPendingOrders, getOrderStats, updateTrackingNumber } = require('../controllers/order'); //  ต้องเป็น function จริงๆ
const { authCheck } = require('../middlewares/authCheck');

router.post("/order", createOrder);  // post ต้องรับ function เท่านั้น
router.get("/order", getOrders);


router.get("/order/recent", getRecentOrders);      // ออเดอร์ล่าสุด
router.get("/order/pending", getPendingOrders);    // ออเดอร์ที่ยังไม่จัดส่ง
router.get("/order/stats", getOrderStats);         // สถิติรวม

router.put("/order/tracking/:orderId", authCheck, updateTrackingNumber);


module.exports = router;