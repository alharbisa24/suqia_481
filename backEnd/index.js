const express = require('express');
const { sequelize, User, Member, Subscriber, SubscriberKey, Payment, Order, Coupon, Marketer, MarketerPayment, AppsUser, App, AppSubscriber, AccessAlert,UseRequest } = require('./models/relationships');

const bcrypt = require('bcryptjs');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { Op, literal } = require('sequelize');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST','PUT', "DELETE", "PATCH"],
    credentials: true 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  next();
});

const uploadDir = path.join(__dirname, '/receipts');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
   filename: function (req, file, cb) {
    const randomId = Math.floor(10000 + Math.random() * 90000).toString();
    req.generatedOrderId = randomId; 
    cb(null, `${randomId}.png`);
  }
});
const upload = multer({ storage });
async function initializeDatabase() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); 
    console.log('✅ All tables synchronized');
  } catch (err) {
    console.error('❌ Database sync error:', err);
    process.exit(1);
  }
}

initializeDatabase();

app.post('/homeapi/dashboard_api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if(!email || !password){
              return res.status(400).json({ message: 'اسم المستخدم او كلمة المرور غير مدخلة' });

    }

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: 'اسم المستخدم او كلمة المرور غير صحيحة' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'اسم المستخدم او كلمة المرور غير صحيحة' });
    }

    // اصنع توكن JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ message: 'تم تسجيل الدخول بنجاح', token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

app.get('/homeapi/dashboard_api/coupons', async (req, res) => {
  try {
    const coupons = await Coupon.findAll({
      include: [
        {
          model: Subscriber,
          as: 'subscriber',
          include: [
            {
              model: Member,
              as: 'member'
            }
          ]
        },
        {
          model: Order,
          as: 'Orders',
          attributes: ['id'], 
        }
      ]
    });

    const formattedCoupons = coupons.map(coupon => {
      const ordersCount = coupon.Orders?.length || 0;
      const couponJson = coupon.toJSON();
      
      return {
        ...couponJson,
        _count: {
          Orders: ordersCount
        },
        remainingUses: (coupon.uses ?? 0) - ordersCount,
        Orders: undefined
      };
    });

    res.status(200).json(formattedCoupons);
  } catch (error) {
    console.error('❌ Error fetching coupons:', error);
    res.status(500).json({ message: 'Error fetching coupons' });
  }
});

app.post('/homeapi/dashboard_api/coupons', async (req, res) => {
  try {
    const { title, code, uses, amount, start_date, end_date, status } = req.body;

    // Validate fields
    if (!title || !code || !uses || !amount || !start_date || !end_date || status === undefined) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Create coupon
    const newCoupon = await Coupon.create({
      title,
      code,
      uses: parseInt(uses, 10),
      amount: parseInt(amount, 10),
      start_date: new Date(start_date),
      end_date: new Date(end_date),
      status: status === '1' || status === 1 || status === true,
      type: 'coupon'
    });

    res.status(201).json(newCoupon);
  } catch (error) {
    console.error('❌ Error creating coupon:', error);
    res.status(500).json({ error: 'Something went wrong, please try again' });
  }
});
app.put('/homeapi/dashboard_api/coupons/:id', async (req, res) => {
    
  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    const id = req.params.id;
    const data = req.body;

    if (!id) {
      return res.status(400).json({ error: "الكوبون غير موجود" });
    }

    if (!data.title || !data.code || !data.uses || !data.amount || !data.start_date || !data.end_date || !data.type) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    const start_date = new Date(data.start_date);
    const end_date = new Date(data.end_date);
    const amount = parseInt(data.amount);

    start_date.setHours(0, 0, 0, 0);
    end_date.setHours(0, 0, 0, 0);

    const existingCoupon = await Coupon.findByPk(id);

    if (!existingCoupon) {
      return res.status(404).json({ error: "الكوبون غير موجود في قاعدة البيانات" });
    }

    // تحديث البيانات
    await existingCoupon.update({
      title: data.title,
      code: data.code,
      uses: data.uses,
      amount: amount,
      start_date: start_date,
      end_date: end_date,
      status: data.status === "1" || data.status === 1 || data.status === true,
      type: data.type,
    });

    return res.status(200).json({ message: "تم تحديث الكوبون بنجاح", coupon: existingCoupon });

  } catch (error) {
    console.error("❌ Error processing request:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء المعالجة" });
  }
});
app.delete('/homeapi/dashboard_api/coupons/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Coupon.destroy({
      where: { id: parseInt(id) },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'الكوبون غير موجود أو تم حذفه مسبقاً' });
    }

    return res.status(200).json({ message: 'تم حذف الكوبون بنجاح' });

  } catch (error) {
    console.error("❌ Error deleting coupon:", error);
    return res.status(500).json({ message: 'حدث خطأ أثناء الحذف' });
  }
});
app.get('/homeapi/dashboard_api/analytics', async (req, res) => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const totalOrders = await Order.count();

    const newOrdersThisMonth = await Order.count({
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: firstDay,
          [require('sequelize').Op.lte]: lastDay,
        },
      },
    });

    const totalMembers = await Member.count();
    const totalSubscribers = await Subscriber.count();

    const totalProfitsResult = await Payment.sum('amount');
    const monthlyProfits = await Payment.sum('amount', {
      where: {
        createdAt: {
          [require('sequelize').Op.gte]: firstDay,
          [require('sequelize').Op.lte]: lastDay,
        },
      },
    });

    res.status(200).json({
      totalOrders,
      newOrdersThisMonth,
      totalMembers,
      totalSubscribers,
      totalProfits: totalProfitsResult ?? 0,
      monthlyProfits: monthlyProfits ?? 0,
    });
  } catch (error) {
    console.error('❌ Error fetching analytics:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء جلب الإحصائيات' });
  }
});

app.get('/homeapi/home_api/confirm/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ error: "الطلب غير موجود" });
    }

    const order = await Order.findOne({
      where: { order_id: id }, 
    });

    if (!order) {
      return res.status(404).json({ error: "الطلب غير موجود" });
    }

    return res.status(200).json({ order });
  } catch (error) {
    console.error("❌ Error fetching order:", error);
    return res.status(500).json({ error: "حدث خطأ أثناء المعالجة" });
  }
});
function generateSessionToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '1d' });
}

app.post('/homeapi/home_api/member/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // التحقق من الإدخال
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبة' });
    }

    // البحث عن العضو
    const user = await Member.findOne({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'الايميل او كلمة المرور غير صحيحة' });
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'الايميل او كلمة المرور غير صحيحة' });
    }

    // إنشاء التوكن
    const token = generateSessionToken(user.id);

    return res.status(200).json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
  }
});
app.post('/homeapi/home_api/getData', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET3);
      const userId = decoded.userId;

      const user = await Member.findOne({
        where: { id: userId },
        attributes: ['id', 'email', 'name', 'phone', 'x'], 
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(user);
    } catch (jwtError) {
      console.error('JWT verification failed:', jwtError);
      return res.status(401).json({ error: 'Invalid token' });
    }
  } catch (error) {
    console.error('Server error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});
app.post('/homeapi/home_api/coupon/validate', async (req, res) => {
  try {
    const { code, totalPrice, months } = req.body;

    if (!code) {
      return res.status(400).json({ success: false, error: "الرجاء ادخال كود الكوبون" });
    }

    const coupon = await Coupon.findOne({ where: { code } });

    if (!coupon || coupon.status === false) {
      return res.status(400).json({ success: false, error: "الكوبون غير صحيح" });
    }

    const now = new Date();

    if (!coupon.start_date || !coupon.end_date || now < coupon.start_date || now > coupon.end_date) {
      return res.status(400).json({ success: false, error: "الكوبون منتهي" });
    }

    const orderCount = await Order.count({
      where: { CouponId: coupon.id },
    });

    if (orderCount >= (coupon.uses ?? 0)) {
      return res.status(400).json({ success: false, error: "تم استخدام الكوبون عدد مرات اكثر من المسموح" });
    }

    // تحقق من نوع market
    if (coupon.type === 'market' && months === 0) {
      return res.status(400).json({ success: false, error: "لا يمكن استخدام كود تسويق واشتراكك غير محدود" });
    }

    if (coupon.type === 'market') {
      const message = `تم تفعيل كود الدعوة! كسبت ${coupon.amount} شهر اضافي مجاني`;
      return res.status(200).json({ success: true, message, newTotal: totalPrice, freeMonths: coupon.amount, codeId: coupon.id });
    }

    const discount = (totalPrice * ((coupon.amount ?? 0) / 100));
    const newTotal = totalPrice - discount;

    const message = `%${coupon.amount} (${coupon.title}) تم تفعيل الكوبون`;

    return res.status(200).json({ success: true, message, newTotal, discountAmount: discount, codeId: coupon.id });

  } catch (error) {
    console.error("Coupon validation error:", error);
    return res.status(500).json({ success: false, error: "عذرا لقد حدث خطأ!" });
  }
});
app.get('/homeapi/dashboard_api/AccessAlerts', async (req,res)=>{
  try {
    const accessalerts = await AccessAlert.findAll();
    res.json(accessalerts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});
app.get('/homeapi/UseRequest', async (req,res)=>{
  try {
    const UseRequests = await UseRequest.findAll();
    res.json(UseRequests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

app.post('/homeapi/UseRequest', async (req, res) => {

 try {


    const { name, phone, x } = req.body;

    if (!name || !phone || !x) {
      return res.status(400).json({ error: 'جميع المدخلات مطلوبة' });
    }

     

    const newRequest = await UseRequest.create({
   
        name,
        phone,
        x,
   
    });

    return res.status(201).json({ 
      success: true, 
      newRequest 
    });


   

  } catch (error) {
    res.status(500).json({ message: 'Error add Request' });
  }
});

app.post('/homeapi/access_API/login', async (req, res) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: false,
      message: 'مطلوب مصادقة. يرجى تقديم رمز الوصول',
    });
  }

  const accessToken = authHeader.split(' ')[1];
  const { url } = req.body;
  if(!url){
         return res.status(400).json({
        status: false,
        message: 'يرجى ادخال الرابط',
      });
  }

  try {
    const subscriber = await Subscriber.findOne({
      where: {
        url,
        token: accessToken,
      },
      include: [
        {
          model: SubscriberKey,
          as: 'keys',
          order: [['createdAt', 'DESC']],
          limit: 1,
        },
      ],
    });


    if (!subscriber) {
      await AccessAlert.create({
        url,
        token: accessToken,
      });

      return res.status(400).json({
        status: false,
        message: 'النظام غير مصرح للاستخدام ! يرجى مراجعتنا',
      });
    }

    if (subscriber.status === false) {
      return res.status(400).json({
        status: false,
        message: 'التصريح ملغى تفعيله للاستخدام ! يرجى مراجعتنا',
      });
    }

    let formattedExpiration;

    if (subscriber.type === 'monthly') {
      const latestKey = subscriber.keys?.[0];

      if (!latestKey) {
        return res.status(400).json({
          status: false,
          message: 'عذرا ! الاشتراك منتهي',
        });
      }

      const currentDate = new Date();
      const keyCreationDate = new Date(latestKey.createdAt);
      const expirationDate = new Date(keyCreationDate);
      expirationDate.setMonth(expirationDate.getMonth() + 1);

      formattedExpiration = `${expirationDate.getFullYear()}-${String(expirationDate.getMonth() + 1).padStart(2, '0')}-${String(expirationDate.getDate()).padStart(2, '0')} ${String(expirationDate.getHours()).padStart(2, '0')}:${String(expirationDate.getMinutes()).padStart(2, '0')}:${String(expirationDate.getSeconds()).padStart(2, '0')}`;

      if (currentDate > expirationDate) {
        return res.status(403).json({
          status: false,
          message: 'انتهت صلاحية المفتاح. يرجى تجديد الاشتراك',
        });
      }
    } else {
      formattedExpiration = new Date();
    }

    return res.status(200).json({
      status: true,
      message: 'تم تسجيل الدخول بنجاح',
      type: subscriber.type,
      expiresAt: formattedExpiration,
    });
  } catch (error) {
    console.error('❌ Error during login:', error);
    return res.status(500).json({
      status: false,
      message: 'حدث خطأ في الخادم',
    });
  }
});


app.get('/homeapi/dashboard_api/members', async (req, res) => {
  try {
    const members = await Member.findAll();


    

   

    res.status(200).json(members);
  } catch (error) {
    console.error('❌ Error fetching members:', error);
    res.status(500).json({ message: 'Error fetching members' });
  }
});

app.post('/homeapi/dashboard_api/members/add', async (req, res) => {

 try {


    const { name, email, phone, x, password } = req.body;

    if (!name || !email || !phone || !x || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

     const existingMember = await Member.findOne({
      where: {
        [Op.or]: [
          { email },
          { phone }
        ]
      }
    });
    
    if (existingMember) {
      return res.status(400).json({ 
        message: 'الايميل او رقم الجوال موجود مسبقا' 
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);


    const newMember = await Member.create({
   
        name,
        email,
        password: hashedPassword,
        phone,
        x,
   
    });

    return res.status(201).json({ 
      success: true, 
      newMember 
    });


   

  } catch (error) {
    res.status(500).json({ message: 'Error add member' });
  }
});

app.put('/homeapi/dashboard_api/members/changePassword/:id', async (req, res) => {

 try {
    const { id } = req.params;
   
    if (!id) {
      return res.status(400).json({ 
        error: "الحساب غير موجود" 
      });
    }

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

      const existingMember = await Member.findByPk(id);

    if (!existingMember) {
      return res.status(404).json({ 
        error: "الحساب غير موجود في قاعدة البيانات" 
      });
    }
    const hashedPassword = await bcrypt.hash(password, 10);


     const updatedMember = await existingMember.update({
      password: hashedPassword
    });

    const memberResponse = updatedMember.toJSON();
    delete memberResponse.password;

    return res.status(200).json({ 
      message: "تم تحديث كلمة المرور بنجاح",
    });


   
   

  } catch (error) {
    res.status(500).json({ message: 'Error add member' });
  }
});

app.delete('/homeapi/dashboard_api/members/delete/:id', async (req, res) => {
  const transaction = await sequelize.transaction();

 try {
   

   
     const { id } = req.params;
    const memberId = parseInt(id);

    if (!memberId) {
      await transaction.rollback();
      return res.status(400).json({ error: "Member ID is required" });
    }
    
    await Payment.destroy({
      where: { memberId: memberId },
      transaction
    });

    await Order.destroy({
      where: { memberId: memberId },
      transaction
    });

    const subscriber = await Subscriber.findOne({
      where: { memberId: memberId },
      transaction
    });

    if (subscriber) {
      await SubscriberKey.destroy({
        where: { subscriberId: subscriber.id },
        transaction
      });

      await Coupon.destroy({
        where: { subscriberId: subscriber.id },
        transaction
      });

      await Subscriber.destroy({
        where: { id: subscriber.id },
        transaction
      });
    }

    await Member.destroy({
      where: { id: memberId },
      transaction
    });

    await transaction.commit();
    return res.status(200).json({ message: 'تم حذف العميل بنجاح' });

  } catch (error) {
          await transaction.rollback();
    res.status(500).json({ message: 'Error add member' });
  }
});


app.put('/homeapi/dashboard_api/members/update/:id', async (req, res) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');

 try {
      const { id } = req.params;
    const memberId = parseInt(id);

    if (!memberId) {
      return res.status(400).json({ 
        error: "العميل غير موجود" 
      });
    }

    const { name, email, phone, x } = req.body;

    // Validate the input data
    if (!name || !email || !phone || !x) {
      return res.status(400).json({ 
        error: "جميع الحقول مطلوبة" 
      });
    }

    const existingMember = await Member.findByPk(memberId);

    if (!existingMember) {
      return res.status(404).json({ 
        error: "العميل غير موجود في قاعدة البيانات" 
      });
    }

    const updatedMember = await existingMember.update({
      name,
      email,
      x,
      phone
    });

    const memberResponse = updatedMember.toJSON();

    return res.status(200).json({ 
      message: "تم تحديث الحساب بنجاح",
    });
   

  } catch (error) {
    res.status(500).json({ message: 'Error add member' });
  }
});

app.post('/homeapi/dashboard_api/orders/status', async (req, res) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');

 try {
       const { id, order_id, status } = req.body;
  if (!id || !order_id || !status) {
      return res.status(400).json({ 
        success: false,
        error: 'جميع الحقول مطلوبة' 
      });
    }
    
        const updatedCount = await Order.update(
      { status: status },
      { 
        where: { 
          id: id,
          order_id: order_id 
        } 
      }
    );

    return res.status(200).json({ 
      message: "تم تحديث الطلب بنجاح",
    });
   

  } catch (error) {
    res.status(500).json({ message: 'خطا في تعديل الطلب' });
  }
});

app.get('/homeapi/dashboard_api/orders', async (req, res) => {
  try {
  const orders = await Order.findAll({
  include: [
    {
      model: Member,
      as: 'member' 
    },
    {
      model: Coupon,
      as: 'Coupon', 
      include: [
        {
          model: Subscriber,
          as: 'subscriber', // Singular, matching Coupon association
          include: [
            {
              model: Member,
              as: 'member' // Should match Subscriber association
            }
          ]
        }
      ]
    }
  ]
});
    

   

    res.status(200).json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

app.delete('/homeapi/dashboard_api/orders/delete/:id', async (req, res) => {
try {
    const { id } = req.params;
    const orderId = parseInt(id);

    if (isNaN(orderId)) {
      return res.status(400).json({ error: 'Invalid order ID' });
    }

    // Find the order first
    const order = await Order.findByPk(orderId);

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

  

    const payment = await Payment.findOne({
      where: { orderId: orderId }
    });

    if (payment) {
      await payment.destroy();
    }

    await order.destroy();

    return res.status(200).json({ 
      success: true,
      message: 'تم حذف الطلب بنجاح' 
    });

  } catch (error) {
    console.error('Error deleting order:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error deleting order',
    });
  }
});
// utils/helpers.js

/**
 * Generates a random alphanumeric code without ambiguous characters
 * @param {number} minLength - Minimum length of code (default: 5)
 * @param {number} maxLength - Maximum length of code (default: 10)
 * @returns {string} Generated random code
 */
function generateRandomCode(minLength = 5, maxLength = 10) {
  const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  
  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  
  let result = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  
  return result;
}


function generateToken() {
  const part1 = Math.random().toString(36).substr(2, 4);
  const part2 = Math.random().toString(36).substr(2, 4);
  const part3 = Math.random().toString(36).substr(2, 4);
  return `${part1}-${part2}-${part3}`;
}




app.post('/homeapi/dashboard_api/subscribers/add', async (req, res) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
   const transaction = await sequelize.transaction();
  
  try {
    const { order_id, memberId, type, amount, url, coupon } = req.body;

    if (!order_id || !memberId || type === undefined ) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'جميع الحقول المطلوبة' 
      });
    }

    // Find and update order
    const order = await Order.findOne({ 
      where: { order_id },
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({ 
        success: false,
        error: 'الطلب غير موجود' 
      });
    }

    await order.update({
      status: 'completed',
      paid: true
    }, { transaction });

    const subscriber = await Subscriber.create({
      token: generateToken(),
      url,
      status: true,
      memberId,
      type: type == 0 ? 'unlimited' : 'monthly'
    }, { transaction });

    await Payment.create({
      amount,
      memberId,
      type: `اشتراك جديد ${type}`,
      orderId: order.id
    }, { transaction });

    if (type != 0) {
      const now = new Date();
      const subscribeKeys = Array.from({ length: type }, (_, index) => ({
        access_key: generateToken(),
        subscriberId: subscriber.id,
        createdAt: new Date(now.getFullYear(), now.getMonth() + index, 1, 12, 0, 0, 0)
      }));

      await SubscriberKey.bulkCreate(subscribeKeys, { transaction });
    }

    if (coupon) {
      const couponId = typeof coupon === 'string' ? parseInt(coupon) : coupon;
      
      if (!isNaN(couponId)) {
        const couponRecord = await Coupon.findByPk(couponId, { transaction });

        if (couponRecord && couponRecord.type === 'market' && type != 0) {
          const amount = couponRecord.amount || 0;
          const subscriberId = couponRecord.subscriberId || 0;
          
          let startDate = new Date();
          if (subscriberId > 0) {
            const latestKey = await SubscriberKey.findOne({
              where: { subscriberId },
              order: [['createdAt', 'DESC']],
              transaction
            });
            
            if (latestKey) {
              startDate = new Date(latestKey.createdAt);
              startDate.setMonth(startDate.getMonth() + 1);
            }
          }
          
          const marketKeys = Array.from({ length: amount }, (_, index) => {
            const keyDate = new Date(startDate);
            keyDate.setMonth(startDate.getMonth() + index);
            return {
              access_key: generateToken(),
              subscriberId,
              createdAt: keyDate
            };
          });

          if (marketKeys.length > 0) {
            await SubscriberKey.bulkCreate(marketKeys, { transaction });
          }
        }
      }

      const member = await Member.findByPk(memberId, { transaction });
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);
      
      let code;
      let exists;
      do {
        code = generateRandomCode();
        exists = await Coupon.findOne({ where: { code }, transaction });
      } while (exists);

      await Coupon.create({
        title: member?.name ? `كوبون ${member.name}` : "كوبون تسويق",
        code,
        uses: 30,
        amount: 1,
        start_date: startDate,
        end_date: endDate,
        status: true,
        subscriberId: subscriber.id,
        type: "market"
      }, { transaction });
    }

    await transaction.commit();
    return res.status(200).json({ 
      success: true, 
      subscriber 
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error processing subscription:', error);
    return res.status(500).json({ 
      success: false,
      error: error
    });
  }
});

app.post('/homeapi/dashboard_api/subscribers/addnew', async (req, res) => {
          res.setHeader('Content-Type', 'application/json; charset=utf-8');
   const transaction = await sequelize.transaction();
  
  try {
    const {url, status, member, type, amount } = req.body;

    if (!url || status === undefined || !member || type === undefined || !amount) {
      await transaction.rollback();
      return res.status(400).json({ 
        success: false,
        error: 'جميع الحقول المطلوبة' 
      });
    }
    
  const existingSubscribe = await Subscriber.findOne({
      where: { url },
      transaction
    });

    if (existingSubscribe) {
      await transaction.rollback();
      return res.status(400).json({ error: 'الرابط موجود مسبقا' });
    }

token = generateToken();

  const newSubscriber = await Subscriber.create({
      token,
      url,
      status: status === '1',
      memberId: Number(member),
      type: type == 0 ? 'unlimited' : 'monthly'
    }, { transaction });
       if (type != 0) {
      const startDate = new Date();
      const endDate = new Date(startDate);
      endDate.setFullYear(startDate.getFullYear() + 1);
      
      let code;
      let exists;
      do {
        code = generateRandomCode();
        exists = await Coupon.findOne({ where: { code }, transaction });
      } while (exists);

      const memberData = await Member.findByPk(Number(member), { transaction });
      
      await Coupon.create({
        title: memberData?.name ? `كوبون ${memberData.name}` : "كوبون تسويق",
        code,
        uses: 30,
        amount: 1,
        start_date: startDate,
        end_date: endDate,
        status: true,
        subscriberId: newSubscriber.id,
        type: "market"
      }, { transaction });
    }

    const newOrder = await Order.create({
      order_id: generateRandomCode().toString(),
      amount: parseInt(amount),
      type: parseInt(type),
      paid: true,
      status: 'completed',
      url,
      memberId: Number(member)
    }, { transaction });

    await Payment.create({
      amount: parseInt(amount),
      memberId: Number(member),
      type: `اشتراك جديد ${type}`,
      orderId: newOrder.id
    }, { transaction });

    if (type != 0) {
      const now = new Date();
      const subscribeKeys = Array.from({ length: type }, (_, index) => ({
        access_key: generateToken(),
        subscriberId: newSubscriber.id,
        createdAt: new Date(now.getFullYear(), now.getMonth() + index, 1, 12, 0, 0, 0)
      }));

      await SubscriberKey.bulkCreate(subscribeKeys, { transaction });
    }

    await transaction.commit();
    return res.status(201).json({ success: true, newSubscriber });

  } catch (error) {
    await transaction.rollback();
    console.error("Error creating subscriber:", error);
    return res.status(500).json({
      success: false,
    });
  }
});


app.get('/homeapi/dashboard_api/payments', async (req, res) => {
  try {
      
    const payments = await Payment.findAll({
      include: [
        {
          model: Order,
          as: 'order',
        },
        {
          model: Member,
          as: 'member',
        }
      ]
    });


    res.status(200).json(payments);
  } catch (error) {
    console.error('❌ Error fetching payments:', error);
    res.status(500).json({ message: 'Error fetching payments' });
  }
});

app.delete('/homeapi/dashboard_api/payments/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await Payment.destroy({
      where: { id: parseInt(id) },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'المدفوعات غير موجودة أو تم حذفها مسبقاً' });
    }

    return res.status(200).json({ message: 'تم حذف الكوبون بنجاح' });

  } catch (error) {
    console.error("❌ Error deleting payments:", error);
    return res.status(500).json({ message: 'حدث خطأ أثناء الحذف' });
  }
});


app.get('/homeapi/dashboard_api/marketers', async (req, res) => {
    try {
    const marketers = await Marketer.findAll({
      include: [{
        model: Coupon,
        as: 'Coupon',
        include: [{
          model: Order,
          as: 'Orders',
          attributes: ['amount']
        }]
      }]
    });

    const result = marketers.map(marketer => {
      const coupon = marketer.Coupon;
      const orderCount = coupon ? coupon.Orders.length : 0;
      const totalAmount = coupon ? coupon.Orders.reduce((sum, order) => sum + order.amount, 0) : 0;

      return {
        id: marketer.id,
        name: marketer.name,
        email: marketer.email,
        phone: marketer.phone,
        password: marketer.password,
        amount: marketer.amount,
        status: marketer.status,
        couponId: marketer.couponId,
        couponCode: coupon?.code || null,
        uses: coupon?.uses || 0,
        orderCount: orderCount,
        totalAmount: totalAmount,
        createdAt: marketer.createdAt
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching marketers:", error);
    return res.status(500).json({ 
      message: 'Error fetching marketers',
    });
  }
});

app.get('/homeapi/dashboard_api/subscribers/showActivated', async (req, res) => {
   try {
    // Get first & last date of current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // First get all unlimited subscribers
    const unlimitedSubscribers = await Subscriber.findAll({
      where: {
        type: 'unlimited'
      },
      include: [{
        model: Member,
        as: 'member'
      }]
    });

    // Then get subscribers with keys this month
    const subscribersWithKeys = await Subscriber.findAll({
      include: [
        {
          model: Member,
          as: 'member'
        },
        {
          model: SubscriberKey,
          as: 'keys',
          where: {
            createdAt: {
              [Op.between]: [firstDay, lastDay]
            }
          },
          required: true,
          attributes: []
        }
      ]
    });

    // Combine and deduplicate results
    const allSubscribers = [...unlimitedSubscribers, ...subscribersWithKeys]
      .filter((sub, index, self) => 
        index === self.findIndex(s => s.id === sub.id)
      );

    // Get total key counts for all subscribers
    const subscriberIds = allSubscribers.map(s => s.id);
    const keyCounts = await SubscriberKey.findAll({
      where: {
        subscriberId: subscriberIds
      },
      attributes: [
        'subscriberId',
        [sequelize.fn('COUNT', sequelize.col('id')), 'totalKeys']
      ],
      group: ['subscriberId']
    });

    // Format the final result
    const result = allSubscribers.map(subscriber => {
      const subscriberJson = subscriber.toJSON();
      const keyCount = keyCounts.find(k => k.subscriberId === subscriber.id)?.dataValues.totalKeys || 0;
      
      return {
        id: subscriberJson.id,
        token: subscriberJson.token,
        url: subscriberJson.url,
        status: subscriberJson.status,
        createdAt: subscriberJson.createdAt,
        member: subscriberJson.member,
        keysThisMonth: subscriberJson.keys ? subscriberJson.keys.length : 0,
        keysCount: keyCount
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return res.status(500).json({ 
      message: "Error fetching subscribers",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/homeapi/dashboard_api/subscribers/soon_expired', async (req, res) => {
   try {
    // Get first & last date of current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

     const subscribers = await Subscriber.findAll({
      include: [
        {
          model: Member,
          as: 'member', // Must match the alias defined in your association
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: SubscriberKey,
          as: 'keys', 
          attributes: ['createdAt'],
          order: [['createdAt', 'DESC']],
          limit: 1,
          required: false // Left outer join
        }
      ]
    });

    const result = subscribers
      .filter(subscriber => {
        if (!subscriber.keys || subscriber.keys.length === 0) return false;
        
        const lastKeyDate = subscriber.keys[0].createdAt;
        return lastKeyDate >= firstDay && lastKeyDate <= lastDay;
      })
      .map(subscriber => {
        const subscriberJson = subscriber.toJSON();
        const lastKey = subscriberJson.keys[0];
        let expiresAt = null;
        
        if (lastKey?.createdAt) {
          expiresAt = new Date(lastKey.createdAt);
          expiresAt.setMonth(expiresAt.getMonth() + 1);
        }

        return {
          id: subscriberJson.id,
          token: subscriberJson.token,
          url: subscriberJson.url,
          status: subscriberJson.status,
          createdAt: subscriberJson.createdAt,
          member: subscriberJson.member, // Now using the correct alias
          lastKeyDate: lastKey?.createdAt,
          expiresAt: expiresAt
        };
      });


    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return res.status(500).json({ 
      message: "Error fetching subscribers",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

app.get('/homeapi/dashboard_api/subscribers/expired', async (req, res) => {
  try {
    // Get first & last date of current month
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Get monthly subscribers with keys in current month
    const monthlySubscribersWithKeys = await Subscriber.findAll({
      where: {
        type: 'monthly' // Only check monthly subscribers
      },
      include: [{
        model: SubscriberKey,
        as: 'keys',
        where: {
          createdAt: {
            [Op.between]: [firstDay, lastDay]
          }
        },
        attributes: ['subscriberId'],
        required: true
      }],
      raw: true
    });

    // Get all monthly subscribers with their member info and total key count
    const monthlySubscribers = await Subscriber.findAll({
      where: {
        type: 'monthly', // Only monthly subscribers
        id: {
          [Op.notIn]: monthlySubscribersWithKeys.map(s => s['keys.subscriberId'])
        }
      },
      include: [{
        model: Member,
        as: 'member',
        attributes: ['id', 'name', 'email', 'phone']
      }, {
        model: SubscriberKey,
        as: 'keys',
        attributes: [],
        required: false
      }],
      attributes: [
        'id',
        'token',
        'url',
        'status',
        'createdAt',
        [sequelize.fn('COUNT', sequelize.col('keys.id')), 'keysCount']
      ],
      group: ['Subscriber.id', 'member.id']
    });

    const result = monthlySubscribers.map(subscriber => {
      const subscriberJson = subscriber.toJSON();
      return {
        id: subscriberJson.id,
        token: subscriberJson.token,
        url: subscriberJson.url,
        status: subscriberJson.status,
        createdAt: subscriberJson.createdAt,
        member: subscriberJson.member,
        keysThisMonth: 0,
        keysCount: parseInt(subscriberJson.keysCount) || 0,
        type: 'monthly' // Explicitly show type in response
      };
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching monthly subscribers:", error);
    return res.status(500).json({ 
      message: "Error fetching monthly subscribers",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } 
});
app.delete('/homeapi/dashboard_api/subscribers/:id', async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const id = parseInt(req.params.id);
    
    if (isNaN(id)) {
      await transaction.rollback();
      return res.status(400).json({ message: 'معرف المشترك غير صالح' });
    }

    await SubscriberKey.destroy({
      where: { subscriberId: id },
      transaction
    });
    
       await Coupon.destroy({
      where: { subscriberId: id },
      transaction
    });

    const deleted = await Subscriber.destroy({
      where: { id },
      transaction
    });

    if (deleted === 0) {
      await transaction.rollback();
      return res.status(404).json({ message: 'المشترك غير موجود أو تم حذفه مسبقاً' });
    }

    await transaction.commit();
    return res.status(200).json({ message: 'تم حذف المشترك بنجاح' });

  } catch (error) {
    await transaction.rollback();
    console.error("❌ Error deleting subscriber:", error);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(409).json({ 
        message: 'لا يمكن حذف المشترك لأنه مرتبط ببيانات أخرى'
      });
    }
    
    return res.status(500).json({ 
      message: 'حدث خطأ أثناء الحذف',
    });
  }
});

app.put('/homeapi/dashboard_api/subscribers/:id', async (req, res) => {
      const transaction = await sequelize.transaction();

  try {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
   const { id } = req.params;
    const subscriberId = parseInt(id);

    if (!subscriberId || isNaN(subscriberId)) {
      await transaction.rollback();
      return res.status(400).json({ error: "المشترك غير موجود" });
    }

    const { url, status, member } = req.body;

    // Validate the input data
    if (!url || status === undefined || member === undefined) {
      await transaction.rollback();
      return res.status(400).json({ error: "جميع الحقول مطلوبة" });
    }

    // Check if subscriber exists
    const existingSubscriber = await Subscriber.findByPk(subscriberId, { transaction });

    if (!existingSubscriber) {
      await transaction.rollback();
      return res.status(404).json({ error: "المشترك غير موجود في قاعدة البيانات" });
    }

    // Check for duplicate URL (excluding current subscriber)
    const duplicateUrl = await Subscriber.findOne({
      where: {
        url,
        id: { [Op.ne]: subscriberId } // Not equal to current subscriber ID
      },
      transaction
    });

    if (duplicateUrl) {
      await transaction.rollback();
      return res.status(400).json({ error: "الرابط موجود مسبقاً لمشترك آخر" });
    }

    // Update subscriber
    const updatedSubscriber = await existingSubscriber.update({
      url,
      status: status === "1",
      memberId: member ? Number(member) : existingSubscriber.memberId
    }, { transaction });

    await transaction.commit();
    return res.status(200).json({ 
      message: "تم تحديث المشترك بنجاح",
      subscriber: updatedSubscriber
    });

  } catch (error) {
    await transaction.rollback();
    console.error("Error updating subscriber:", error);
    return res.status(500).json({ 
      error: "حدث خطأ أثناء المعالجة",
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});
app.get('/homeapi/dashboard_api/subscribers/keys/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const subscriberId = parseInt(id);

    if (isNaN(subscriberId)) {
      return res.status(400).json({ 
        error: 'معرف المشترك غير صالح',
        message: 'يجب أن يكون معرف المشترك رقمًا صحيحًا'
      });
    }

    // Verify subscriber exists
    const subscriberExists = await Subscriber.findByPk(subscriberId);
    if (!subscriberExists) {
      return res.status(404).json({ 
        error: 'المشترك غير موجود',
        message: 'لم يتم العثور على المشترك المطلوب'
      });
    }

    const keys = await SubscriberKey.findAll({
      where: { subscriberId },
      order: [['createdAt', 'DESC']]
    });

    return res.status(200).json(keys);

  } catch (error) {
    console.error("Error fetching subscriber keys:", error);
    return res.status(500).json({ 
      error: 'حدث خطأ في السيرفر',
    });
  }
});

app.post('/homeapi/dashboard_api/subscribers/keys/:id', async (req, res) => {
  try {
    const { id, number } = req.body;

    if (!id || !number) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get latest key by createdAt
    const latestKey = await SubscriberKey.findOne({
      where: { subscriberId: parseInt(id) },
      order: [['createdAt', 'DESC']],
    });

    let startDate = latestKey ? new Date(latestKey.createdAt) : new Date();
    startDate.setMonth(startDate.getMonth() + 1); // next month

    const keys = Array.from({ length: number }, (_, index) => {
      const keyDate = new Date(startDate);
      keyDate.setMonth(startDate.getMonth() + index);

      return {
        access_key: generateToken(),
        subscriberId: parseInt(id),
        createdAt: keyDate,
      };
    });

    // Create records (skipDuplicates not directly supported in Sequelize)
    await SubscriberKey.bulkCreate(keys, { ignoreDuplicates: true });

    return res.json({ message: 'Keys updated successfully' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.patch('/homeapi/dashboard_api/subscribers/keys/:id', async (req, res) => {
 

 try {
    const { id } = req.params;

    const key = await SubscriberKey.findByPk(id);

    if (!key) {
      return res.status(404).json({ error: 'Key not found' });
    }

    key.status = !key.status;
    await key.save();

    return res.json(key);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Failed to update status' });
  }

});
app.delete('/homeapi/dashboard_api/subscribers/keys/:id', async (req, res) => {
  try {
    const id = req.params.id;

    const deleted = await SubscriberKey.destroy({
      where: { id: parseInt(id) },
    });

    if (deleted === 0) {
      return res.status(404).json({ message: 'الكود غير موجود أو تم حذفه مسبقاً' });
    }

    return res.status(200).json({ message: 'تم حذف الكود بنجاح' });

  } catch (error) {
    console.error("❌ Error deleting coupon:", error);
    return res.status(500).json({ message: 'حدث خطأ أثناء الحذف' });
  }
});

app.post('/homeapi/home_api/order/validate', async (req, res) => {
  try {
    const { email, phone } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'الرجاء ادخال البريد الالكتروني' });
    }

    if (!phone) {
      return res.status(400).json({ success: false, error: 'الرجاء ادخال رقم الجوال' });
    }

    const emailExists = await Member.findOne({ where: { email } });
    if (emailExists) {
      return res.status(400).json({ success: false, error: '! البريد الالكتروني موجود مسبقا ' });
    }

    const phoneExists = await Member.findOne({ where: { phone } });
    if (phoneExists) {
      return res.status(400).json({ success: false, error: '! رقم الجوال موجود مسبقا ' });
    }

    return res.json({ success: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, error: 'عذرا لقد حدث خطا !' });
  }
});
function generateSessionToken(userId) {
  const secret = process.env.JWT_SECRET3 || '';
  return jwt.sign({ userId }, secret, { expiresIn: '1d' });
}

async function generateUniqueOrderId() {
  let orderId = '';
  let isUnique = false;

  while (!isUnique) {
    orderId = Math.floor(10000 + Math.random() * 90000).toString();
    const existingOrder = await Order.findOne({ where: { order_id: orderId } });
    if (!existingOrder) isUnique = true;
  }

  return orderId;
}
app.post('/homeapi/home_api/order/transfer_order', upload.single('file'), async (req, res) => {
  try {
    const {
      name, x, phone, email, password, url, paymentMethod,
      total, type, discountCode, userID
    } = req.body;

    // Validate required fields
    if (!name || !phone || !email || !url || !paymentMethod || !total || !type) {
      return res.status(400).json({ error: 'جميع المدخلات مطلوبة' });
    }
    if (!userID && !password) {
      return res.status(400).json({ error: 'جميع المدخلات مطلوبة' });
    }

    const orderId = await generateUniqueOrderId();
    const receiptFile = req.file ? `${req.generatedOrderId}.png` : null;

    let memberId = parseInt(userID || 0);

    // Case: new member registration
    if (!userID && password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      const newMember = await Member.create({
        name,
        email,
        password: hashedPassword,
        phone,
        x: x || ''
      });
      memberId = newMember.id;

      const sessionToken = generateSessionToken(memberId);
      res.cookie('session_token', sessionToken, {
        httpOnly: false,
        secure: true,
        maxAge: 60 * 60 * 24 * 1000,
        path: '/'
      });
    }

    await Order.create({
      order_id: orderId,
      amount: parseInt(total),
      type: parseInt(type),
      paid: false,
      status: 'waiting',
      CouponId: discountCode ? parseInt(discountCode) : null,
      memberId,
      payment_method: paymentMethod,
      url,
      receipt: receiptFile
    });

    return res.json({ success: true, orderId });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ success: false, message: error.message || 'حدث خطأ في السيرفر' });
  }
});

app.get('/homeapi/home_api/orders', async (req, res) => {
  try {
    const sessionToken = req.headers['session_token'];

    if (!sessionToken) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    let userId;
    try {
      const decoded = jwt.verify(sessionToken, process.env.JWT_SECRET3);
      userId = decoded.userId;
    } catch (error) {
      return res.status(403).json({ error: "Invalid token" });
    }

    // Fetch orders for this user
    const orders = await Order.findAll({
      where: { 
        memberId: userId, 
      },
    });

    return res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});