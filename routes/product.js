const express = require('express');
const router = express.Router();

// Controller
const { 
    create,
    list,
    read,
    update,
    remove,
    listby,
    searchFilters,
    createImages,
    removeImage,
    listAdminLogs,
    getAllProductPriceHistory,
   
} = require('../controllers/product');

const { adminCheck, authCheck } = require('../middlewares/authCheck');

// Enpoint https://ai-ecom-vc-api.vercel.app/api/product
router.post('/product', authCheck, adminCheck, create);
router.get('/products/:count', list);
router.get('/product/:id', read);
router.put('/product/:id', authCheck, adminCheck, update);
router.delete('/product/:id', authCheck, adminCheck, remove);
router.post('/productby', listby);
router.post('/search/filters', searchFilters);

router.post('/images', authCheck, adminCheck, createImages);
router.post('/removeimages', authCheck, adminCheck, removeImage);

router.get('/product/admin/logs', authCheck, adminCheck, listAdminLogs);

//  แก้ชื่อฟังก์ชันให้ตรงกับ controller
router.get('/productpricehistory', authCheck, adminCheck, getAllProductPriceHistory);



module.exports = router;
