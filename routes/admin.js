// import 
const express = require ('express');
const { authCheck , adminCheck} = require('../middlewares/authCheck')
const router = express.Router ();

// Import controllers
const { changeOrderStatus,getOrderAdmin , getOrderStats , getAdminLogs} = require('../controllers/admin')

// Enpoint http://localhost:5001/api/admin
router.put('/admin/order-status',authCheck,changeOrderStatus);
router.get('/admin/orders',authCheck,getOrderAdmin);
router.get('/admin/order-stats',authCheck,getOrderStats);
router.get('/admin/logs', authCheck, adminCheck, getAdminLogs);


module.exports = router 