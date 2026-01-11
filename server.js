// step 1  inport 
const express = require ('express');
const app = express ();
const morgan = require('morgan');
//บิวอินฟังก์ชัน .js อยู่แล้ว
const { readdirSync } = require ('fs');
const cors = require('cors');  // Server connet Clyan
const orderRoutes = require('./routes/order');


//const authRouter = require ('./routes/auth');
//const categoryRouter = require ('./routes/category');




// middleware
 app.use(morgan('dev'));
 app.use(express.json({limit: '15mb'}));
 app.use(cors());
 app.use('/api', orderRoutes);

// app.use('/api',authRouter);
// app.use('/api',categoryRouter);
//console.log(readdirSync('./routes'));
readdirSync('./routes').map((c)=> app.use('/api',require('./routes/'+c)));
// step 3 Router
//app.get('/api',(req,res)=>{
    // code
//    const { username,password} = req.body
//    console.log(username , password)
//    res.send('Hello 1234')
//});


// step 2 start sever 
app.listen (5001, ()=> {
    console.log ('server is running on port 5001')
});