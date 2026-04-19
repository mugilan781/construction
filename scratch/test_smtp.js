const nodemailer = require('nodemailer');
require('dotenv').config();

async function testMail() {
  console.log('--- Mail Configuration Test ---');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_USER);
  console.log('From:', process.env.SMTP_FROM);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log('\nVerifying connection...');
    await transporter.verify();
    console.log('✅ Connection successful! Your SMTP settings are correct.');

    console.log('\nSending test email to', process.env.SMTP_USER, '...');
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: process.env.SMTP_USER,
      subject: 'InfraNest - SMTP Test',
      text: 'If you are reading this, your realtime email system is working correctly!',
    });
    console.log('✅ Test email sent! Check your inbox.');
  } catch (error) {
    console.log('\n❌ Test failed!');
    console.log('Error Message:', error.message);
    if (error.message.includes('535')) {
      console.log('\n💡 Hint: This usually means "Invalid Credentials". If you use Gmail, you MUST use an "App Password", not your normal password.');
    }
  }
}

testMail();
