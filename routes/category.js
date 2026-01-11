const express = require ('express');
const router = express.Router();

// *** เริ่มต้นการแก้ไข: Import controller ของ SubCategory ***
const { 
    createCategory,
    listCategories,
    removeCategory,
    updateCategory,
    createSubCategory,     // <-- เพิ่ม
    listSubCategories,     // <-- เพิ่ม
    removeSubCategory,
    updateSubCategory      // <-- เพิ่ม
} = require('../controllers/category');
// *** สิ้นสุดการแก้ไข: Import controller ของ SubCategory ***

const { authCheck, adminCheck } = require('../middlewares/authCheck');


// --- Routes for Main Category ---
// Enpoint https://ai-ecom-vc-api.vercel.app/api/category
router.post('/category', authCheck, adminCheck, createCategory);
router.get('/category', listCategories);
router.put('/category/:id', authCheck, adminCheck, updateCategory);
router.delete('/category/:id', authCheck, adminCheck, removeCategory);

EXAMPLE:
// --- Routes for SubCategory ---
// (เพิ่มส่วนนี้เข้ามาใหม่ทั้งหมด)

// Enpoint https://ai-ecom-vc-api.vercel.app/api/subcategory
router.post('/subcategory', authCheck, adminCheck, createSubCategory);

// Enpoint https://ai-ecom-vc-api.vercel.app/api/subcategories (ใช้ /subcategories เพื่อดึงทั้งหมด)
router.get('/subcategories', listSubCategories); 

// Enpoint https://ai-ecom-vc-api.vercel.app/api/subcategory/:id
router.put('/subcategory/:id', authCheck, adminCheck, updateSubCategory);
router.delete('/subcategory/:id', authCheck, adminCheck, removeSubCategory);

// *** สิ้นสุดการแก้ไข: เพิ่ม Routes สำหรับ SubCategory ***

module.exports = router;