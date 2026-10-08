const nodemailer = require('nodemailer');

// Initialize Transporter with Gmail OAuth2
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify email server connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email server connection error:', error.message);
  } else {
    console.log(' Email server is ready to send messages');
  }
});

/**
 * Core sendEmail helper
 * @param {Object} options - { to, subject, text, html }
 */
const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) {
    console.error('❌ Error: Recipient email address ("to") is missing');
    return { success: false, error: 'Recipient email address is required' };
  }

  try {
    const mailOptions = {
      from: `"Backend Ledger" <${process.env.EMAIL_USER}>`,
      replyTo: process.env.EMAIL_USER,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    // console.log(` Email sent successfully to ${to} (Message ID: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ Failed to send email to ${to}:`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Generate Modern Responsive Welcome Email Template
 */
const getWelcomeTemplate = (name, email) => {
  const currentYear = new Date().getFullYear();
  const userName = name || 'there';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Backend Ledger</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #4f46e5 0%, #2563eb 100%); padding: 36px 30px; text-align: center;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 20px; padding: 6px 16px; margin-bottom: 12px;">
                <span style="color: #ffffff; font-size: 12px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">⚡ Backend Ledger</span>
              </div>
              <h1 style="color: #ffffff; font-size: 26px; font-weight: 700; margin: 0; line-height: 1.3;">Welcome to the Platform!</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 36px 32px 24px 32px;">
              <p style="font-size: 18px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">Hello ${userName},</p>
              <p style="font-size: 15px; line-height: 1.6; color: #4b5563; margin: 0 0 24px 0;">
                Thank you for creating your account with <strong>Backend Ledger</strong>. Your registration was successful, and your account is active and ready to go.
              </p>

              <!-- Feature Highlights Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 28px;">
                <tr>
                  <td>
                    <p style="margin: 0 0 12px 0; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px;">What you can do next:</p>
                    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #374151;">
                          📊 <strong>Smart Ledgers:</strong> Record transactions and track cash flow with ease.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #374151;">
                          🔒 <strong>Secure Access:</strong> End-to-end authenticated JWT sessions protecting your data.
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 6px 0; font-size: 14px; color: #374151;">
                          ⚡ <strong>Real-time Analytics:</strong> Instant updates on all your ledger activity.
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 28px 0;">
                <tr>
                  <td align="center">
                    <a href="#" style="display: inline-block; background-color: #4f46e5; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.25);">Get Started Now</a>
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.5; color: #6b7280; margin: 24px 0 0 0;">
                If you have questions or need assistance, feel free to reply directly to this email — we're always here to help!
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 12px; color: #9ca3af;">
                This email was sent to <span style="color: #6b7280; font-weight: 500;">${email}</span> because you signed up on Backend Ledger.
              </p>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: #9ca3af;">
                If you didn't create an account, you can safely ignore this message.
              </p>
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                &copy; ${currentYear} Backend Ledger. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Generate Modern Responsive Login Alert Email Template
 */
const getLoginAlertTemplate = (name, email, timeString) => {
  const currentYear = new Date().getFullYear();
  const userName = name || 'there';

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Security Alert: New Login</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1f2937;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6; padding: 40px 10px;">
    <tr>
      <td align="center">
        <!-- Main Card -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); border: 1px solid #e5e7eb;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 32px 30px; text-align: center;">
              <h1 style="color: #ffffff; font-size: 22px; font-weight: 700; margin: 0;">🔒 Security Alert: Account Login</h1>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 30px 24px 30px;">
              <p style="font-size: 16px; font-weight: 600; color: #111827; margin: 0 0 12px 0;">Hello ${userName},</p>
              <p style="font-size: 14px; line-height: 1.6; color: #4b5563; margin: 0 0 20px 0;">
                Your Backend Ledger account was recently logged into. Here are the details of this session:
              </p>

              <!-- Session Details Box -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
                <tr>
                  <td style="font-size: 13px; color: #4b5563; line-height: 1.8;">
                    <strong>Account Email:</strong> ${email}<br>
                    <strong>Timestamp:</strong> ${timeString}
                  </td>
                </tr>
              </table>

              <p style="font-size: 13px; line-height: 1.6; color: #b91c1c; margin: 0 0 16px 0;">
                If this was you, no action is needed. If you did NOT log in, please reset your password immediately to protect your data.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 20px 30px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                &copy; ${currentYear} Backend Ledger Security Team
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};

/**
 * Send Welcome Email on Registration
 */
async function sendRegisterationEmail(userEmail, name) {
  const subject = `🎉 Welcome to Backend Ledger, ${name || 'User'}!`;
  const text = `Hello ${name || 'there'},\n\nThank you for registering with Backend Ledger! Your account has been created successfully.\n\nWe're excited to have you on board!\n\nBest regards,\nBackend Ledger Team`;
  const html = getWelcomeTemplate(name, userEmail);

  return await sendEmail({ to: userEmail, subject, text, html });
}

/**
 * Send Login Alert Email
 */
async function sendLoginAlertEmail(userEmail, name) {
  const subject = `🔒 Security Alert: New Login to Backend Ledger`;
  const timeString = new Date().toLocaleString();
  const text = `Hello ${name || 'there'},\n\nYour Backend Ledger account (${userEmail}) was logged into at ${timeString}.\n\nIf you did not make this request, please secure your account immediately.\n\nBackend Ledger Security Team`;
  const html = getLoginAlertTemplate(name, userEmail, timeString);

  return await sendEmail({ to: userEmail, subject, text, html });
}

/**
 *  sending transaction alert email
 */


 async function sendTransactionEmail(userEmail,name,amount , toAccount){

  const subject = 'Transaction Successfull!';
  const text = `Hello ${name}, \n\nYour transaction of $${amount} to account was successful .\n\nBest regards,\n The Backend Ledger Team`
  const html= `<p>Hello ${name},</p><p> Your transaction of $${amount} to account ${toAccount} was successful.</p><p>Best regards,</p><p>The Backend Ledger Team</p>`



  await sendEmail({userEmail,subject,text,html})

 }


async function sendTransactionFailedEmail(userEmail,name,amount , toAccount){

  const subject = 'Transaction Failed!';
  const text = `Hello ${name}, \n\nYour transaction of $${amount} to account was failed .\n\nBest regards,\n The Backend Ledger Team`
  const html= `<p>Hello ${name},</p><p> Your transaction of $${amount} to account ${toAccount} was failed.</p><p>Best regards,</p><p>The Backend Ledger Team</p>`

  await sendEmail({userEmail,subject,text,html})

 }






module.exports = {
  sendRegisterationEmail,
  sendLoginAlertEmail,
   sendTransactionEmail,
   sendTransactionFailedEmail,
  sendEmail,
}; 