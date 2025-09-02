const nodemailer = require('nodemailer');
const crypto = require('crypto');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  // Generate professional email template
  generateEmailTemplate(type, data) {
    const companyName = process.env.COMPANY_NAME || 'HRMS Corporation';
    const companyLogo = process.env.COMPANY_LOGO || 'https://is1-ssl.mzstatic.com/image/thumb/Purple122/v4/74/82/84/74828423-a336-917f-1954-d015d9c3f904/AppIcon-1x_U007emarketing-0-7-0-0-85-220.jpeg/512x512bb.jpg';
    const supportEmail = process.env.SUPPORT_EMAIL || 'support@hrms.com';
    
    const baseStyle = `
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          margin: 0; 
          padding: 0; 
          background-color: #f4f4f4; 
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white; 
          padding: 0; 
          border-radius: 8px; 
          box-shadow: 0 0 10px rgba(0,0,0,0.1); 
        }
        .header { 
          background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); 
          color: white; 
          padding: 30px; 
          text-align: center; 
          border-radius: 8px 8px 0 0; 
        }
        .logo { 
          max-width: 150px; 
          margin-bottom: 10px; 
        }
        .content { 
          padding: 30px; 
        }
        .credentials-box { 
          background: #f8f9fa; 
          border: 1px solid #e9ecef; 
          border-radius: 6px; 
          padding: 20px; 
          margin: 20px 0; 
          text-align: center; 
        }
        .btn { 
          display: inline-block; 
          background: #2196F3; 
          color: white; 
          padding: 12px 24px; 
          text-decoration: none; 
          border-radius: 6px; 
          margin: 10px 0; 
          font-weight: bold; 
        }
        .footer { 
          background: #f8f9fa; 
          padding: 20px; 
          text-align: center; 
          font-size: 12px; 
          color: #6c757d; 
          border-radius: 0 0 8px 8px; 
        }
        .warning { 
          background: #fff3cd; 
          border: 1px solid #ffeaa7; 
          color: #856404; 
          padding: 15px; 
          border-radius: 6px; 
          margin: 20px 0; 
        }
        .success { 
          background: #d4edda; 
          border: 1px solid #c3e6cb; 
          color: #155724; 
          padding: 15px; 
          border-radius: 6px; 
          margin: 20px 0; 
        }
      </style>
    `;

    switch (type) {
      case 'welcome':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to ${companyName}</title>
            ${baseStyle}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${companyLogo}" alt="${companyName}" class="logo">
                <h1>Welcome to ${companyName}!</h1>
                <p>Your HRMS account has been created successfully</p>
              </div>
              
              <div class="content">
                <h2>Hello ${data.fullName},</h2>
                <p>Welcome to our team! We're excited to have you join ${companyName}. Your employee account has been set up and you can now access the HRMS portal.</p>
                
                <div class="credentials-box">
                  <h3>🔐 Your Login Credentials</h3>
                  <p><strong>Employee ID:</strong> ${data.employeeId}</p>
                  <p><strong>Email:</strong> ${data.email}</p>
                  <p><strong>Temporary Password:</strong> <code style="background: #e9ecef; padding: 4px 8px; border-radius: 4px; font-family: monospace;">${data.tempPassword}</code></p>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Important Security Notice:</strong><br>
                  For your security, please change this temporary password immediately after your first login. Your account will be locked until you update your password.
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Login to HRMS Portal</a>
                </div>
                
                <h3>🚀 Next Steps:</h3>
                <ol>
                  <li>Click the login button above to access the HRMS portal</li>
                  <li>Use your credentials to log in</li>
                  <li>Complete your password reset when prompted</li>
                  <li>Update your profile information</li>
                  <li>Explore the dashboard and features</li>
                </ol>
                
                <h3>📋 Your Employee Information:</h3>
                <ul>
                  <li><strong>Department:</strong> ${data.department || 'To be assigned'}</li>
                  <li><strong>Position:</strong> ${data.position || 'To be assigned'}</li>
                  <li><strong>Start Date:</strong> ${new Date(data.joiningDate || Date.now()).toLocaleDateString()}</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>This is an automated message from ${companyName} HRMS.</p>
                <p>If you have any questions, please contact our support team at <a href="mailto:${supportEmail}">${supportEmail}</a></p>
                <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

      case 'password-reset':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Reset - ${companyName}</title>
            ${baseStyle}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${companyLogo}" alt="${companyName}" class="logo">
                <h1>Password Reset Request</h1>
                <p>Reset your HRMS account password</p>
              </div>
              
              <div class="content">
                <h2>Hello ${data.fullName},</h2>
                <p>We received a request to reset your password for your HRMS account. If you made this request, please click the button below to reset your password.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${data.resetToken}" class="btn">Reset Password</a>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Security Information:</strong><br>
                  • This link will expire in 15 minutes for security purposes<br>
                  • If you didn't request this reset, please ignore this email<br>
                  • Contact IT support immediately if you suspect unauthorized access
                </div>
                
                <div class="credentials-box">
                  <h3>🔗 Alternative Reset Link</h3>
                  <p style="word-break: break-all; font-family: monospace; font-size: 12px;">
                    ${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${data.resetToken}
                  </p>
                </div>
                
                <p><strong>Reset Token:</strong> ${data.resetToken.substring(0, 8)}...</p>
                <p><strong>Expires:</strong> ${new Date(Date.now() + 15 * 60 * 1000).toLocaleString()}</p>
              </div>
              
              <div class="footer">
                <p>This is an automated security message from ${companyName} HRMS.</p>
                <p>If you need assistance, contact <a href="mailto:${supportEmail}">${supportEmail}</a></p>
                <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

      case 'password-changed':
        return `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Password Changed - ${companyName}</title>
            ${baseStyle}
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img src="${companyLogo}" alt="${companyName}" class="logo">
                <h1>Password Successfully Changed</h1>
                <p>Your HRMS account password has been updated</p>
              </div>
              
              <div class="content">
                <h2>Hello ${data.fullName},</h2>
                
                <div class="success">
                  <strong>✅ Password Updated Successfully!</strong><br>
                  Your HRMS account password has been changed successfully on ${new Date().toLocaleString()}.
                </div>
                
                <p>Your account is now secured with your new password. You can use it to access the HRMS portal.</p>
                
                <div style="text-align: center; margin: 30px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login" class="btn">Login to HRMS Portal</a>
                </div>
                
                <div class="warning">
                  <strong>⚠️ Didn't make this change?</strong><br>
                  If you didn't change your password, please contact our IT security team immediately at <a href="mailto:${supportEmail}">${supportEmail}</a>
                </div>
                
                <h3>🔒 Security Tips:</h3>
                <ul>
                  <li>Keep your password confidential and secure</li>
                  <li>Don't share your login credentials with anyone</li>
                  <li>Log out completely when using shared computers</li>
                  <li>Report any suspicious activity immediately</li>
                </ul>
              </div>
              
              <div class="footer">
                <p>This is an automated security notification from ${companyName} HRMS.</p>
                <p>For security questions, contact <a href="mailto:${supportEmail}">${supportEmail}</a></p>
                <p>&copy; ${new Date().getFullYear()} ${companyName}. All rights reserved.</p>
              </div>
            </div>
          </body>
          </html>
        `;

      default:
        return '<p>Email template not found.</p>';
    }
  }

  // Generate temporary password
  generateTempPassword() {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
    const special = '!@#$%';
    let password = '';
    
    // Ensure at least one of each type
    password += chars.charAt(Math.floor(Math.random() * 26)); // Uppercase
    password += chars.charAt(Math.floor(Math.random() * 26) + 26); // Lowercase
    password += chars.charAt(Math.floor(Math.random() * 10) + 52); // Number
    password += special.charAt(Math.floor(Math.random() * special.length)); // Special
    
    // Fill the rest randomly to reach 12 characters minimum
    for (let i = 4; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  // Generate reset token
  generateResetToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  // Send welcome email with credentials
  async sendWelcomeEmail(employeeData, tempPassword) {
    try {
      const emailData = {
        ...employeeData,
        tempPassword
      };

      const mailOptions = {
        from: {
          name: process.env.COMPANY_NAME || 'HRMS Corporation',
          address: process.env.EMAIL_USER
        },
        to: employeeData.email,
        subject: `🎉 Welcome to ${process.env.COMPANY_NAME || 'HRMS Corporation'} - Your Login Credentials`,
        html: this.generateEmailTemplate('welcome', emailData),
        text: `Welcome to ${process.env.COMPANY_NAME || 'HRMS Corporation'}!\n\nYour login credentials:\nEmployee ID: ${employeeData.employeeId}\nEmail: ${employeeData.email}\nTemporary Password: ${tempPassword}\n\nPlease change your password after first login.\n\nLogin at: ${process.env.FRONTEND_URL || 'http://localhost:5173'}/login`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(userData, resetToken) {
    try {
      const emailData = {
        ...userData,
        resetToken
      };

      const mailOptions = {
        from: {
          name: process.env.COMPANY_NAME || 'HRMS Corporation',
          address: process.env.EMAIL_USER
        },
        to: userData.email,
        subject: `🔐 Password Reset Request - ${process.env.COMPANY_NAME || 'HRMS Corporation'}`,
        html: this.generateEmailTemplate('password-reset', emailData),
        text: `Password Reset Request\n\nHello ${userData.fullName},\n\nReset your password using this link:\n${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}\n\nThis link expires in 15 minutes.\n\nIf you didn't request this, please ignore this email.`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password reset email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password reset email:', error);
      return { success: false, error: error.message };
    }
  }

  // Send password changed confirmation
  async sendPasswordChangedEmail(userData) {
    try {
      const mailOptions = {
        from: {
          name: process.env.COMPANY_NAME || 'HRMS Corporation',
          address: process.env.EMAIL_USER
        },
        to: userData.email,
        subject: `✅ Password Changed - ${process.env.COMPANY_NAME || 'HRMS Corporation'}`,
        html: this.generateEmailTemplate('password-changed', userData),
        text: `Password Changed Successfully\n\nHello ${userData.fullName},\n\nYour password has been changed successfully on ${new Date().toLocaleString()}.\n\nIf you didn't make this change, please contact support immediately.`
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log('Password changed email sent successfully:', result.messageId);
      return { success: true, messageId: result.messageId };
    } catch (error) {
      console.error('Error sending password changed email:', error);
      return { success: false, error: error.message };
    }
  }

  // Test email configuration
  async testEmailConfig() {
    try {
      await this.transporter.verify();
      console.log('Email server is ready to take our messages');
      return { success: true, message: 'Email configuration is valid' };
    } catch (error) {
      console.error('Email configuration error:', error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new EmailService();
