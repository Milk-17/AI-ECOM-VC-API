const express = require('express')
const router = express.Router()
const { authCheck, adminCheck } = require('../middlewares/authCheck')
const { 
    listUsers,
    changeStatus,
    changeRole,
    userCart,
    getUserCart,
    emptyCart,
    saveAddress,
    getAddresses,     //  เพิ่ม
    updateAddress,    //  เพิ่ม
    deleteAddress,    //  เพิ่ม
    saveOrder,
    getOrder ,
    updateProfile
    
} = require('../controllers/user')

// Admin
router.get('/users',authCheck,adminCheck,listUsers);
router.post('/change-status',authCheck,adminCheck,changeStatus);
router.post('/change-role',authCheck,adminCheck,changeRole);

// User Cart
router.post('/user/cart',authCheck,userCart);
router.get('/user/cart',authCheck,getUserCart);
router.delete('/user/cart',authCheck,emptyCart);

// User Address (ระบบที่อยู่ใหม่)
router.post('/user/address', authCheck, saveAddress);      // สร้างที่อยู่
router.get('/user/address', authCheck, getAddresses);      // ดูรายการที่อยู่
router.put('/user/address', authCheck, updateAddress);     // แก้ไขที่อยู่
router.delete('/user/address/:id', authCheck, deleteAddress); // ลบที่อยู่
router.put('/user/update-profile', authCheck, updateProfile);  // อัปเดตโปรไฟล์ผู้ใช้

// User Order
router.post('/user/order',authCheck,saveOrder);
router.get('/user/order',authCheck,getOrder);

module.exports = router