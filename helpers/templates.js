const getVerificationEmailTemplate = (code) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Email Verification</h2>
      <p>Thank you for registering! Please use the following verification code:</p>
      <h3 style="background: #f5f5f5; padding: 10px; text-align: center;">${code}</h3>
      <p>This code will expire in 24 hours.</p>
    </div>
  `;
};

const getPasswordResetTemplate = (code) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Password Reset</h2>
      <p>You have requested to reset your password. Use the following code:</p>
      <h3 style="background: #f5f5f5; padding: 10px; text-align: center;">${code}</h3>
      <p>If you did not request this, please ignore this email.</p>
    </div>
  `;
};

const getWelcomeEmailTemplate = (name) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to Anahna!</h2>
      <p>Hello ${name},</p>
      <p>Thank you for joining us. We're excited to have you on board!</p>
    </div>
  `;
};

module.exports = {
  getVerificationEmailTemplate,
  getPasswordResetTemplate,
  getWelcomeEmailTemplate
};
