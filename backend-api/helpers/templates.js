const verificationTemplate = async (verificationCode) => {
  return `
    <div>
      <h1>Email Verification</h1>
      <p>Your verification code is: <strong>${verificationCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;
};

const resetPasswordTemplate = async (resetCode) => {
  return `
    <div>
      <h1>Reset Password</h1>
      <p>Your password reset code is: <strong>${resetCode}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    </div>
  `;
};

const placeOrderTemplate = async (orderDetails) => {
  return `
    <div>
      <h1>Order Confirmation</h1>
      <p>Your order #${orderDetails[0]} has been placed successfully.</p>
    </div>
  `;
};

const signupTemplate = async ({ name, email }) => {
  return `
    <div>
      <h1>Welcome to Anahna, ${name}!</h1>
      <p>Thank you for signing up with your email: <strong>${email}</strong>.</p>
      <p>We're excited to have you with us.</p>
    </div>
  `;
};

const signupText = ({ name, email }) => {
  return `Welcome to Anahna, ${name}!
          Thank you for signing up with your email: ${email}.
          We're excited to have you with us.`;
};

module.exports = {
  verificationTemplate,
  resetPasswordTemplate,
  placeOrderTemplate,
  signupTemplate,
  signupText,
};
