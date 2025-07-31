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
    from: `BorrowLend <${process.env.EMAIL_FROM}>`,
    to: options.email,
    subject: options.subject,
    html: options.message, 
  };

   try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (error) {
    console.error('Error from Nodemailer:', error);
    throw error;
  }
};

module.exports = sendEmail;