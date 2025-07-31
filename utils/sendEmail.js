const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: 'Your App Name <yourapp@example.com>',
    to: options.email,
    subject: options.subject,
    html: options.message, // We'll send an HTML email
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;