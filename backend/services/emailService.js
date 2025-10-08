import nodemailer from 'nodemailer';

// Create transporter based on environment
const createTransporter = () => {
  console.log('🔧 SMTP Configuration:');
  console.log(`🔧 SMTP_HOST: ${process.env.SMTP_HOST}`);
  console.log(`🔧 SMTP_PORT: ${process.env.SMTP_PORT}`);
  console.log(`🔧 SMTP_SECURE: ${process.env.SMTP_SECURE}`);
  console.log(`🔧 SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`🔧 SMTP_PASS: ${process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET'}`);
  
  // Use Gmail for both development and production
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Create transporter when needed, not at module load time
let transporter = null;

const getTransporter = () => {
  if (!transporter) {
    transporter = createTransporter();
  }
  return transporter;
};

export const sendPasswordResetEmail = async (email, resetToken, userName) => {
  console.log(`📧 Preparing to send password reset email to: ${email}`);
  console.log(`📧 Using SMTP_USER: ${process.env.SMTP_USER}`);
  console.log(`📧 Using EMAIL_FROM: ${process.env.EMAIL_FROM}`);
  
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/?reset=true&token=${resetToken}`;
  console.log(`📧 Reset URL: ${resetUrl}`);
  
  const mailOptions = {
    from: `"WorkCompass" <${process.env.EMAIL_FROM || 'noreply@workcompass.com'}>`,
    to: email,
    subject: 'Reset Your WorkCompass Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">WorkCompass</h1>
          <p style="color: #6b7280; margin: 5px 0;">Your job tracking companion</p>
        </div>
        
        <div style="background: #f8fafc; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Password Reset Request</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Hi ${userName || 'there'},
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            We received a request to reset your password for your WorkCompass account. 
            Click the button below to set a new password:
          </p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
              Reset Password
            </a>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-bottom: 0;">
            This link will expire in 1 hour for security reasons.
          </p>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>If you didn't request this password reset, you can safely ignore this email.</p>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f3f4f6; padding: 10px; border-radius: 4px; margin: 10px 0;">
            ${resetUrl}
          </p>
        </div>
      </div>
    `,
    text: `
      WorkCompass - Password Reset Request
      
      Hi ${userName || 'there'},
      
      We received a request to reset your password for your WorkCompass account.
      
      Click this link to reset your password: ${resetUrl}
      
      This link will expire in 1 hour for security reasons.
      
      If you didn't request this password reset, you can safely ignore this email.
    `
  };

  try {
    console.log(`📧 Attempting to send email via Gmail SMTP...`);
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Password reset email sent successfully!`);
    console.log(`📧 Message ID: ${info.messageId}`);
    console.log(`📧 Response: ${info.response}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Error sending password reset email:`, error);
    console.error(`❌ Error details:`, {
      message: error.message,
      code: error.code,
      command: error.command,
      response: error.response
    });
    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

export const sendWelcomeEmail = async (email, userName) => {
  const mailOptions = {
    from: `"WorkCompass" <${process.env.EMAIL_FROM || 'noreply@workcompass.com'}>`,
    to: email,
    subject: 'Welcome to WorkCompass!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">Welcome to WorkCompass!</h1>
          <p style="color: #6b7280; margin: 5px 0;">Your job tracking journey starts here</p>
        </div>
        
        <div style="background: #f0f9ff; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-top: 0;">Hi ${userName}!</h2>
          <p style="color: #4b5563; line-height: 1.6;">
            Welcome to WorkCompass! We're excited to help you track your job applications and career progress.
          </p>
          <p style="color: #4b5563; line-height: 1.6;">
            You can now:
          </p>
          <ul style="color: #4b5563; line-height: 1.6;">
            <li>Track all your job applications in one place</li>
            <li>Monitor application status and progress</li>
            <li>Set reminders for follow-ups</li>
            <li>Analyze your application patterns</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard" 
             style="background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">
            Get Started
          </a>
        </div>
        
        <div style="text-align: center; color: #9ca3af; font-size: 12px;">
          <p>Happy job hunting!</p>
          <p>The WorkCompass Team</p>
        </div>
      </div>
    `
  };

  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email as it's not critical
    return { success: false, error: error.message };
  }
};

export const sendFeedbackEmail = async (mailOptions) => {
  try {
    const transporter = getTransporter();
    const info = await transporter.sendMail(mailOptions);
    console.log('Feedback email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending feedback email:', error);
    throw error;
  }
};
