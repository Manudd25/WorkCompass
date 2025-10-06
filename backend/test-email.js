import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const testEmail = async () => {
  console.log('🧪 Testing Gmail email setup...');
  
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const mailOptions = {
    from: `"WorkCompass" <${process.env.EMAIL_FROM}>`,
    to: 'didariomanuela@gmail.com', 
    subject: 'WorkCompass Email Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h1 style="color: #2563eb;">🎉 Email Test Successful!</h1>
        <p>If you're reading this, Gmail is working perfectly with WorkCompass!</p>
        <p>Your password reset and welcome emails are ready to go.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Check your inbox!');
  } catch (error) {
    console.error('❌ Email failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Check your .env file has correct Gmail credentials');
    console.log('2. Verify your Gmail App Password is correct');
    console.log('3. Make sure 2-Factor Authentication is enabled on Gmail');
    console.log('4. Check that SMTP_USER is your Gmail address');
  }
};

testEmail();
