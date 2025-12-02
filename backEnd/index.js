const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');
const jwt = require("jsonwebtoken");
const User = require('./models/User');
const Order = require('./models/Order');
const dis_requests = require('./models/Distributers_request');
const ResetPassword = require('./models/reset_password');
const Products = require('./models/Product');
const multer = require("multer");
const crypto = require('crypto');
const profileRoutes = require('./profile');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

const cloudinary = require('cloudinary').v2;

// Configure Cloudinary using environment variables
cloudinary.config({ 
  cloud_name:'dczk3x8n0', 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



const run = async () => {
    await mongoose.connect(process.env.MONGODB_URL, { useNewUrlParser: true, useUnifiedTopology: true })

    console.log("Connected to myDB");
  }
  
  run()
  .catch((err) => console.error(err))



app.use('/api', profileRoutes);
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxxxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const uuid = generateUUID();


app.post('/pay', async (req, res) => {
  const {company, city, mosque,district, street,latitude,longitude, selectedSize, quantity,totalPrice, email} = req.body;
  const orderid = Math.floor(10000 + Math.random() * 90000);
  const userID =await User.findOne({ email });

  try {
    const newOrder = new Order({
      order_id: orderid,
      cart_id: uuid,
      company,
      city,
      mosque,
      district,
      street,
      selectedSize,
      quantity,
      totalPrice,
      completed: false,
      image: null,
      latitude,
      longitude,
      status: "waiting",
      user_id: userID._id,
      distributer_id: null,
      product_id: "68da678e4200c8b6b4784e35"
    });
  
  await newOrder.save();

    const response = await axios.post(
      'https://secure.paytabs.sa/payment/request',
      {
        profile_id: '117746',
        tran_type: 'sale',
        tran_class: 'ecom',
        cart_id: uuid,
        cart_description: 'طلب من سقيا كميات ماء',
        cart_currency: 'SAR',
        cart_amount: totalPrice,
        callback: 'https://suqia-481.onrender.com/payment_complete',
        return: 'https://suqia-481.onrender.com/payment_success'
      },
      {
        headers: {
          'authorization': 'SZJNKNBGBK-JKRMHZHDWT-T9DB92RZDB',
          'content-type': 'application/json'
        }
      }
    );

    console.log('Payment Created:', response.data);
    res.json({ redirect_url: response.data.redirect_url });


  } catch (error) {
    console.error('Error creating payment:', error.response ? error.response.data : error.message);
    throw error;
  }

});
app.post('/register', async (req, res) => {
    const { email, password, fullname, phoneNumber } = req.body;
    if (!email || !password || !fullname || !phoneNumber) {
        return res.status(400).send({ message: 'الرجاء ادخال كل المدخلات !' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(400).json({ message: 'البريد الالكتروني موجود مسبقا !' });
    }
    const existingUser2 = await User.findOne({ phoneNumber });
    if (existingUser2) {
        return res.status(400).json({ message: 'رقم الجوال موجود مسبقا !' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({
            email,
            password: hashedPassword,
            fullname,
            phoneNumber,
            driver_id:null,
            rank: "user",
        });

        await user.save();
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user });
   
    } catch (error) {
        res.status(500).send({ message: 'حدث خطأ ما، يرجى المحاولة مرة أخرى لاحقاً' });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).send({ message: 'الرجاء ادخال البريد الالكتروني وكلمة المرور !' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).send({ message: 'البريد الالكتروني او كلمة المرور غير صحيحة !' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ message: 'البريد الالكتروني او كلمة المرور غير صحيحة !' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, user });

   
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

app.post('/user', async (req, res) => {
    const { token } = req.body;
    if (!token) return res.status(401).json({ message: 'No token provided' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      res.json(user);
    } catch (err) {
      res.status(400).json({ message: 'Invalid token' });
    }
});



app.post('/userEmail', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(401).json({ message: 'No email provided' });

  try {
    const user = await User.findOne({ email });
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: 'Invalid email' });
  }
});


app.post('/payment_complete', async (req, res) => {
  try {
    const { cart_id } = req.body;

    if (!cart_id) {
      console.log("مطلوب cartid");
      return res.status(400).json({ success: false, message: 'cart_id مطلوب' });
    }

    console.log("البحث عن الطلب باستخدام cart_id:", cart_id);
    const order = await Order.findOne({ cart_id }).lean(); 

    if (!order) {
      console.log("لم يتم العثور على الطلب:", cart_id);
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }

    console.log("تم العثور على الطلب، يتم التحديث...");
    const updatedOrder = await Order.findOneAndUpdate(
      { cart_id }, 
      { completed: true },
      { new: true }
    );

    res.json({ success: true, message: 'تم تحديث الطلب', order: updatedOrder });

} catch (error) {
    console.error('Error:', error);
    res.status(500).json({ success: false, message: 'حدث خطأ أثناء التحديث' });
}


  
});
app.post('/payment_success', async (req, res) => {
res.redirect('https://suqia-481.vercel.app/success');
});
app.get('/payment_success', async (req, res) => {
  res.redirect('https://suqia-481.vercel.app/success');
  });

app.get('/orders', async (req, res) => {
  const { userId } = req.query;

  try {
    const orders = await Order.find({ user_id: userId });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
});

app.get('/new_orders', async (req,res)=> {
  try {
    const orders = await Order.find({ distributer_id: null, status:"waiting" });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
});
app.get('/distributer_orders', async (req,res)=> {
  const {distributer_id} = req.query;
  try {
    const orders = await Order.find({ distributer_id: distributer_id, status:"waiting" });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
});

app.get('/distributer_completed_orders', async (req,res)=> {
  const {distributer_id} = req.query;
  try {
    const orders = await Order.find({ distributer_id: distributer_id, status:"completed" });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders', error: error.message });
  }
});
app.get('/distributer_completed_orders_chart', async (req, res) => {
  const { distributer_id } = req.query;

  try {
    let matchStage = {};
    
    if (distributer_id) {
      matchStage = {
        distributer_id: new mongoose.Types.ObjectId(distributer_id),
        status: "completed"
      };
    } else {
      matchStage = {
        distributer_id: { $ne: null }, // Ensure a distributer is assigned
        status: "completed"
      };
    }

    const orders = await Order.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$created_at"
            }
          },
          total: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      },
      {
        $project: {
          date: "$_id",
          total: 1,
          _id: 0
        }
      }
    ]);

    res.json(orders); // Array of { date: "YYYY-MM-DD", total: number }
  } catch (error) {
    res.status(500).json({ message: 'Error generating chart data', error: error.message });
  }
});

app.get('/distributer_orders_by_company', async (req, res) => {
  const { distributer_id } = req.query;

  try {
    let matchStage = {};
    
    if (distributer_id) {
      matchStage = {
        distributer_id: new mongoose.Types.ObjectId(distributer_id),
        status: "completed"
      };
    } else {
      matchStage = {
        distributer_id: { $ne: null }, // Ensure a distributer is assigned
        status: "completed"
      };
    }

    const orders = await Order.aggregate([
      {
        $match: matchStage
      },
      {
        $group: {
          _id: "$company",  // Group by company name
          total: { $sum: 1 }    // Count orders for each company
        }
      },
      {
        $sort: { _id: 1 }  // Sort companies by name
      },
      {
        $project: {
          company_name: "$_id", // Show company name
          total: 1,             // Show total orders
          _id: 0                // Hide _id
        }
      }
    ]);

    res.json(orders); // Array of { company_name: string, total: number }
  } catch (error) {
    res.status(500).json({ message: 'Error generating chart data', error: error.message });
  }
});

app.post('/assignOrder', async (req, res) => {
  const { id, distributer_id } = req.body;

  try {
    const order = await Order.findById(id);

    if(order.distributer_id != null)
      return res.status(500).json({ message: 'عذرا ! الطلب مسجل لسائق مسبقا' });


    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.distributer_id = distributer_id;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});
app.get('/distributors_order_counts', async (req, res) => {
  try {
    // Find all users with rank = distributer
    const distributors = await User.find({ rank: "distributer" }).select('_id fullname');
    
    // For each distributor, count their orders
    const distributorStats = await Promise.all(distributors.map(async (distributor) => {
      const orderCount = await Order.countDocuments({ distributer_id: distributor._id });
      
      return {
        distributor_name: distributor.fullname,
        orders_count: orderCount
      };
    }));
    
    // Sort by order count descending
    const sortedData = distributorStats.sort((a, b) => b.orders_count - a.orders_count);
    
    res.json(sortedData);
  } catch (error) {
    console.error('Error generating distributor order counts:', error);
    res.status(500).json({ message: 'Error generating chart data', error: error.message });
  }
});
app.post('/cancelDelivery', async(req,res)=>{
  const { id } = req.body;

  try {
    const order = await Order.findById(id);

    if(order.distributer_id == null)
      return res.status(500).json({ message: 'عذرا ! الطلب غبر مسجل لسائق مسبقا' });


    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.distributer_id = null;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: 'Error updating order', error: error.message });
  }
});
app.post('/order_completed', upload.single('image'), async (req, res) => {
  const { id } = req.body;

  try {
  

    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ message: 'No image provided' });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { 
          resource_type: 'auto',
          folder: 'suqia_orders' 
        }, 
        (error, result) => {
          if (error) {
            console.error('Cloudinary error:', error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      
      // Send the buffer to Cloudinary
      uploadStream.end(req.file.buffer);
    });

    // Update order with image URL
    order.image = uploadResult.secure_url;
    order.status = 'completed';
    order.completed = true;
    order.completed_at = new Date();
    await order.save();

    res.json({
      success: true,
      message: 'تم تأكيد التسليم بنجاح!',
      order: order
    });

  } catch (error) {
    console.error('Error in order completion:', error);
    res.status(500).json({ success: false, message: 'Error updating order', error: error.message });
  }
});

app.get('/distributer_total_price', async (req, res) => {
  const { distributer_id } = req.query;
  try {
    const orders = await Order.find({ distributer_id: distributer_id, status: "completed" });

    // Calculate the total price from all orders
    const totalPrice = orders.reduce((sum, order) => {
      return sum + (Number(order.totalPrice) || 0);
    }, 0);
    
    const deduction = orders.length * 2;
    const finalPrice = totalPrice - deduction;

    res.json({ 
      Price:finalPrice 
    });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating total price', error: error.message });
  }
});

app.get('/distributer_completed_count', async (req, res) => {
  const { distributer_id } = req.query;

  try {
    const completedOrdersCount = await Order.countDocuments({ distributer_id: distributer_id, status: "completed" });

    res.json({ completedOrdersCount });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating completed orders count', error: error.message });
  }
});
app.get('/distributer_waiting_count', async (req, res) => {
  const { distributer_id } = req.query;

  try {
    const waitingOrdersCount = await Order.countDocuments({ distributer_id: distributer_id, status: "waiting" });

    res.json({ waitingOrdersCount });
  } catch (error) {
    res.status(500).json({ message: 'Error calculating completed orders count', error: error.message });
  }
});


app.post('/distributer-request', async (req, res) => {
  const { token, city, district, drive_licence_number } = req.body;

  if (!token) return res.status(401).json({ message: 'يجب تسجيل الدخول أولاً' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    const user_id = decoded.userId;

    const newRequest = new dis_requests({
      city,
      district,
      drive_licence_number,
      user_id,
    });

   

    await newRequest.save();
    
 

    res.status(201).json({ message: 'تم حفظ الطلب بنجاح' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'فشل في حفظ الطلب' });
  }
});



app.post('/Requestreset_password', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(401).json({ message: 'البريد الالكتروني مطلوب' });

  try {
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'البريد الالكتروني غير مسجل لدينا' });
    }
    
    const token = crypto.randomBytes(32).toString('hex');
    
    await ResetPassword.deleteMany({ userId: user._id });
    await new ResetPassword({
      userId: user._id,
      token
    }).save();
    
    const resetUrl = `https://suqia-481.vercel.app/reset-password?token=${token}`;
    
    // Send email using MailerSend
    await axios.post('https://api.mailersend.com/v1/email', {
      from: {
        email: "noreply@test-65qngkdd6qjlwr12.mlsender.net",
        name: "Suqia"
      },
      to: [
        {
          email: user.email,
          name: user.fullname
        }
      ],
      subject: "إعادة تعيين كلمة المرور - سقيا",
      text: `لإعادة تعيين كلمة المرور الخاصة بك، يرجى النقر على الرابط التالي: ${resetUrl}`,
      html: `
        <div style="direction: rtl; text-align: right; font-family: Arial, sans-serif;">
          <h2>إعادة تعيين كلمة المرور</h2>
          <p>لقد تلقينا طلبًا لإعادة تعيين كلمة المرور الخاصة بحسابك في تطبيق سقيا.</p>
          <p>يرجى النقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>
          <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 15px; text-align: center; text-decoration: none; display: inline-block; border-radius: 5px; margin: 10px 0;">إعادة تعيين كلمة المرور</a>
         <b>${resetUrl} او الضغط على هذا الرابط</b>
          <p>إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذا البريد الإلكتروني.</p>
          <p>هذا الرابط صالح لمدة ساعة واحدة فقط.</p>
        </div>
      `
    }, {
      headers: {
        'Authorization': 'Bearer mlsn.7e1bd7b699ba6cd8a682f8bc158e994bf7498ef0ae88b1ad556a5815678bbf14',
        'Content-Type': 'application/json'
      }
    });
    
    res.json({ message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني' });
    
  } catch(err) {
    console.log(err);
    res.status(500).json({ message: 'حدث خطأ أثناء معالجة الطلب' });
  }
});

app.post('/checkToken', async (req, res) => {
  const {token} = req.body;
  if (!token) return res.status(401).json({ message: 'No token provided' });
  
  try {
    // Find the reset password record with this token
    const resetRequest = await ResetPassword.findOne({ token });
    
    if (!resetRequest) {
      return res.status(404).json({ 
        valid: false,
        message: 'Token is invalid or expired' 
      });
    }
    
    // Find the user associated with this token
    const user = await User.findById(resetRequest.userId);
    
    if (!user) {
      return res.status(404).json({ 
        valid: false,
        message: 'User not found' 
      });
    }
    
    // Return the email address
    return res.json({
      valid: true,
      email: user.email,
      userId: user._id
    });
  } catch (error) {
    console.error('Error checking token:', error);
    return res.status(500).json({ 
      valid: false,
      message: 'Error verifying token'
    });
  }
});
app.get('/users', (req, res) => {
  // First get all users with rank "user"
  User.find({ rank: "user" })
    .then(async users => {
      try {
        const enhancedUsers = await Promise.all(users.map(async user => {
          const orderCount = await Order.countDocuments({ user_id: user._id });
          
          const userObj = user.toObject();
          
          userObj.orders_count = orderCount;
          
          return userObj;
        }));
        
        res.json(enhancedUsers);
      } catch (err) {
        console.error('Error counting orders:', err);
        res.status(500).json({ message: 'Error processing user data' });
      }
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Error retrieving users' });
    });
});
app.post('/reset-password', async (req, res) => {
  const { email, password, token } = req.body;
  
  if (!email || !password || !token) {
    return res.status(400).json({ message: 'يجب توفير كلمة المرور والرمز' });
  }

  try {
    // Verify the token is valid
    const resetRequest = await ResetPassword.findOne({ token });
    
    if (!resetRequest) {
      return res.status(401).json({ message: 'الرمز غير صالح أو منتهي الصلاحية' });
    }
    
    // Find user with the email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'لم يتم العثور على المستخدم' });
    }
    
    // Verify that the token belongs to this user
    if (resetRequest.userId.toString() !== user._id.toString()) {
      return res.status(401).json({ message: 'الرمز غير صالح لهذا المستخدم' });
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Update user's password
    user.password = hashedPassword;
    await user.save();
    
    // Delete the reset token since it has been used
    await ResetPassword.deleteOne({ _id: resetRequest._id });
    
    res.json({ message: 'تم تحديث كلمة المرور بنجاح' });
    
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث كلمة المرور' });
  }
});
app.get('/admin_summary', async (req, res) => {
  try {
    // Get all orders
    const orders = await Order.find();
    const totalOrdersCount = await Order.countDocuments({ completed: true });    

    const newOrdersCount = await Order.countDocuments({ distributer_id: null });
    
    // Get orders with assigned distributors
    const assignedOrders = orders.filter(order => order.distributer_id != null);
    const assignedOrdersCount = assignedOrders.length;
    
    // Calculate total order value for all orders
    const totalOrderValue = orders.reduce((sum, order) => {
      return sum + (Number(order.totalPrice) || 0);
    }, 0);
    
    const serviceFees = totalOrdersCount * 2; 
    
    // Net revenue is total value minus service fees for assigned orders
    const netRevenue = totalOrderValue - serviceFees;
    
    const regularUsersCount = await User.countDocuments({ rank: "user" });
    const distributersCount = await User.countDocuments({ rank: "distributer" });
    
    // Format response
    res.json({
      orders: {
        count: totalOrdersCount,
        newOrders: newOrdersCount,
        assignedOrders: assignedOrdersCount,
        totalValue: totalOrderValue,
        serviceFees: serviceFees,
        netRevenue: netRevenue
      },
      users: {
        regularUsers: regularUsersCount,
        distributers: distributersCount,
        total: regularUsersCount + distributersCount
      }
    });
  } catch (error) {
    console.error('Error generating dashboard summary:', error);
    res.status(500).json({ 
      message: 'Error generating dashboard summary', 
      error: error.message 
    });
  }
});
app.get('/distributers', (req, res) => {
  User.find({ rank: "distributer" })
    .then(async distributers => {
      try {
        const enhancedDistributers = await Promise.all(distributers.map(async distributer => {
          // Find distributor request info using driver_id
          const distributorRequest = await dis_requests.findOne({ 
            user_id: distributer._id 
          });

          const waitingOrdersCount = await Order.countDocuments({ 
            distributer_id: distributer._id,
            status: "waiting"
          });
          
          const completedOrdersCount = await Order.countDocuments({ 
            distributer_id: distributer._id,
            status: "completed"
          });
          
          const completedOrders = await Order.find({
            distributer_id: distributer._id,
            status: "completed"
          });
          
          // Calculate total revenue from completed orders
          const totalRevenue = completedOrders.reduce((sum, order) => {
            return sum + (Number(order.totalPrice) || 0);
          }, 0);
          
          const serviceFees = completedOrdersCount * 5;
          
          const netProfit = totalRevenue - serviceFees;
          
          const distribObj = distributer.toObject();
          
          // Add distributor request data if found
          if (distributorRequest) {
            distribObj.request_data = {
              city: distributorRequest.city,
              district: distributorRequest.district,
              drive_licence_number: distributorRequest.drive_licence_number,
              status: distributorRequest.status,
              request_date: distributorRequest.created_at
            };
          }
          
          // Add the order counts
          distribObj.waiting_orders = waitingOrdersCount;
          distribObj.completed_orders = completedOrdersCount;
          distribObj.profits = netProfit;
          
          // Include the list of completed orders with their data
          distribObj.completed_orders_list = completedOrders.map(order => {
            return {
              _id: order._id,
              order_id: order.order_id,
              company: order.company,
              city: order.city,
              district: order.district,
              street: order.street,
              mosque: order.mosque,
              selectedSize: order.selectedSize,
              quantity: order.quantity,
              totalPrice: order.totalPrice,
              completed_at: order.completed_at,
              image: order.image
            };
          });
          
          return distribObj;
        }));
        
        res.json(enhancedDistributers);
      } catch (err) {
        console.error('Error processing distributor data:', err);
        res.status(500).json({ message: 'Error processing distributer data' });
      }
    })
    .catch(err => {
      console.error('Error retrieving distributors:', err);
      res.status(500).json({ message: 'Error retrieving distributers' });
    });
});
app.get('/distributers_all_completed_orders', (req, res) => {
  Order.find({ status: "completed" })
    .populate({
      path: 'distributer_id',
      select: 'fullname email phoneNumber',
      model: User
    })
    .then(orders => {
      res.json(orders);
    })
    .catch(err => {
      console.error(err);
      res.status(500).json({ message: 'Error retrieving orders' });
    });
});


app.post('/deleteUser', async (req, res) => {
  const { userId } = req.body;
  
  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
  }
  
  try {
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (user.rank === "distributer") {
      await dis_requests.deleteOne({ user_id: userId });
    }
    
    // Delete the user
    await User.deleteOne({ _id: userId });
    
    res.json({ 
      success: true, 
      message: 'User deleted successfully',
      wasDistributer: user.rank === "distributer"
    });
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
});
app.post('/deleteOrder', async (req, res) => {
  const { orderId } = req.body;
  
  if (!orderId) {
    return res.status(400).json({ message: 'Order ID is required' });
  }
  
  try {
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    // Delete the order
    await Order.deleteOne({ _id: orderId });
    
    res.json({ 
      success: true, 
      message: 'Order deleted successfully',
   
    });
    
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting order', 
      error: error.message 
    });
  }
});


app.post('/admin/approve_distributer_request', async (req, res) => {
  const { requestId } = req.body;

  try {
    const request = await dis_requests.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: 'طلب السائق غير موجود' });
    }

    request.status = true;
    await request.save();

    const user = await User.findById(request.user_id);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    user.rank = 'distributer';
    user.driver_id = request._id;
    await user.save();

    res.json({ message: 'تم قبول الطلب بنجاح', user });
  } catch (error) {
    console.error('Error approving request:', error);
    res.status(500).json({ message: 'فشل في قبول الطلب', error: error.message });
  }
});

app.get('/distributer-requests', async (req, res) => {
  try {
    const requests = await dis_requests.find().populate('user_id', 'fullname email phoneNumber');
    res.json(requests);
  } catch (error) {
    console.error('Error retrieving requests:', error);
    res.status(500).json({ message: 'Error retrieving requests', error: error.message });
  }
}
);
app.get('/products', async (req, res) => {
  try {
    const products = await Products.find();
    
    const productsWithRemainingQuantity = await Promise.all(
      products.map(async (product) => {
        const orderCount = await Order.countDocuments({
          company: product.company,
          selectedSize: product.size,
        });
    
        const productObj = product.toObject();
    
        productObj.remaining_quantity = product.quantity - orderCount;
    
        return productObj;
      })
    );
    
    res.json(productsWithRemainingQuantity);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving products', error: error.message });
  }
});
app.post('/products', async (req, res) => {
  const { company, size, quantity, price } = req.body;
  
  if (!company || !size || !quantity || !price) {
    return res.status(400).json({ message: 'جميع الحقول مطلوبة (الشركة، الحجم، الكمية)' });
  }
  
  try {
    const newProduct = new Products({
      company,
      size,
      quantity,
      price
    });
     
    await newProduct.save();
    
    res.status(201).json({
      success: true,
      message: 'تم إضافة المنتج بنجاح',
      product: newProduct
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'فشل في إضافة المنتج', 
      error: error.message 
    });
  }
});

app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({ message: 'Product ID is required' });
  }
  console.log(id);
  
  try {
    const product = await Products.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await Products.deleteOne({ _id: id });
    
    res.json({ 
      success: true, 
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting product', 
      error: error.message 
    });
  }
});

app.put('/products/:id/quantity', async (req, res) => {
  const { id } = req.params;
  const { quantity } = req.body;
  
  
  if (!id || quantity === undefined) {
    return res.status(400).json({ message: 'Product ID and quantity are required' });
  }
  
  try {
    const product = await Products.findById(id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    product.quantity = quantity;
    await product.save();
    
    res.json({ 
      success: true, 
      message: 'Product quantity updated successfully',
      product
    });
    
  } catch (error) {
    console.error('Error updating product quantity:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating product quantity', 
      error: error.message 
    });
  }
});


app.get('/available_products', async (req, res) => {
  try {
    const products = await Products.find();
    
    const productsWithAvailability = await Promise.all(
      products.map(async (product) => {
        const orderCount = await Order.countDocuments({
          company: product.company,
          selectedSize: product.size,
        });
        
        return {
          _id: product._id,
          company: product.company,
          size: product.size,
          total_quantity: product.quantity,
          price: product.price,
          orders_count: orderCount,
          remaining_quantity: product.quantity - orderCount
        };
      })
    );
    
    res.json(productsWithAvailability);
  } catch (error) {
    console.error('Error retrieving available products:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error retrieving available products', 
      error: error.message 
    });
  }
});
app.listen(2000, () => {
  console.log('Server is running on port 2000');
});