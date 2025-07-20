const express = require('express');
const fs = require('fs');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Simpan pesanan ke file
function saveOrder(order) {
  let orders = [];
  if (fs.existsSync('orders.json')) {
    orders = JSON.parse(fs.readFileSync('orders.json'));
  }
  orders.push(order);
  fs.writeFileSync('orders.json', JSON.stringify(orders, null, 2));
}

// Kirim email ke admin (ganti dengan email asli & password aplikasi)
async function sendEmail(order) {
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'EMAIL_ADMIN_ANDA@gmail.com',
      pass: 'PASSWORD_APLIKASI_GMAIL'
    }
  });

  await transporter.sendMail({
    from: '"Toko Komputer" <EMAIL_ADMIN_ANDA@gmail.com>',
    to: 'EMAIL_ADMIN_ANDA@gmail.com',
    subject: 'Pesanan Baru Masuk',
    text: `Pesanan baru:\n\n${JSON.stringify(order, null, 2)}`
  });
}

// Endpoint menerima pesanan
app.post('/api/order', async (req, res) => {
  const order = req.body;
  saveOrder(order);
  try {
    await sendEmail(order);
    res.json({ success: true, message: 'Pesanan diterima dan email terkirim ke admin.' });
  } catch (e) {
    res.json({ success: false, message: 'Pesanan diterima, tapi gagal kirim email.' });
  }
});

// Endpoint admin melihat semua pesanan
app.get('/api/orders', (req, res) => {
  if (fs.existsSync('orders.json')) {
    const orders = JSON.parse(fs.readFileSync('orders.json'));
    res.json(orders);
  } else {
    res.json([]);
  }
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});