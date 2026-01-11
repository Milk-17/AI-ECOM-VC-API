// import 
const express = require ('express');
const { authCheck} = require('../middlewares/authCheck')
const router = express.Router ();

// Import controllers
const { payment }  = require ("../controllers/stripe") 

// Enpoint http://localhost:5001/api/admin
router.post('/user/create-payment-intent' , authCheck,payment);



module.exports = router 