const express = require('express');
const User = require('./models/User');
const dis_requests = require('./models/Distributers_request');

const router = express.Router();

router.get('/profile', async (req, res) => {
  const { email } = req.query;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'الحساب غير موجود' });
    }


    const userData = {
      fullname: user.fullname,
      email: user.email,
      phoneNumber: user.phoneNumber,
    };

    const distributerRequest = await dis_requests.findOne({ user_id: user._id });

    if (distributerRequest) {
      userData.distributer = {
        city: distributerRequest.city,
        district: distributerRequest.district,
        drive_licence_number: distributerRequest.drive_licence_number,
      };
    }
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/profile', async (req, res) => {
  const { email } = req.query;
  const { newEmail, fullname, phoneNumber, city, district, drive_licence_number } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
        return res.status(404).json({ message: 'الحساب غير موجود' });
    }
    
    const existingUser2 = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
    if (existingUser2) {
        return res.status(400).json({ message: 'البريد الالكتروني موجود مسبقا !' });
    }
    
    const existingUser3 = await User.findOne({ phoneNumber, _id: { $ne: user._id } });
    if (existingUser3) {
        return res.status(400).json({ message: 'رقم الجوال موجود مسبقا !' });
    }

    user.email = newEmail || user.email;
    user.fullname = fullname || user.fullname;
    user.phoneNumber = phoneNumber || user.phoneNumber;

    const distributerRequest = await dis_requests.findOne({ user_id: user._id });

    if (distributerRequest) {
 
      distributerRequest.city= city || distributerRequest.city;
      distributerRequest.district= district || distributerRequest.district;
      distributerRequest.drive_licence_number= drive_licence_number || distributerRequest.drive_licence_number;

      await distributerRequest.save();
    }

    await user.save();

    res.json({ message: 'تم تحديث البيانات', user });
  }
  catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;