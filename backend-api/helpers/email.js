const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USERNAME,
    pass: process.env.SMTP_PASSWORD
  }
});

const sendEmail = async (to, subject, text, html, attachment) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      text,
      html
    };
    
    if (attachment) {
      mailOptions.attachments = [
        {
        filename: 'logo.png',
        path: attachment
        }
      ];
    }

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email sending failed:', error);
    return false;
  }
};

module.exports = {
  sendEmail
};
