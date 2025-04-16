const nodemailer = require('nodemailer');

let transporter = null;

const initializeEmailTransporter = (config) => {
  transporter = nodemailer.createTransport({
    service: 'SendGrid',
    auth: {
      user: config.sendGridEmail,
      pass: config.sendGridApiKey
    }
  });
};

const sendVerificationEmail = async (email, token) => {
  if (!transporter) return;
  
  const mailOptions = {
    from: process.env.SENDGRID_FROM_EMAIL,
    to: email,
    subject: 'Email Verification',
    html: `
      <h1>Verify Your Email</h1>
      <p>Please use the following code to verify your email: ${token}</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, token) => {
  if (!transporter) return;

  const mailOptions = {
    from: process.env.SENDGRID_FROM_EMAIL,
    to: email,
    subject: 'Password Reset Request',
    html: `
      <h1>Reset Your Password</h1>
      <p>Please use the following code to reset your password: ${token}</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  initializeEmailTransporter,
  sendVerificationEmail,
  sendPasswordResetEmail
};
