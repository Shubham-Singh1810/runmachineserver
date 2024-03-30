const nodemailer = require("nodemailer");

exports.sendResponse = (res, code, message, data) => {
  const response = {
    status: {
      code,
      message,
    },
  };
  if (data) {
    response.data = data;
  }
  return res.status(code).json(response);
};


exports.generateOTP = () => {
  const min = 100000;
  const max = 999999;
  return Math.floor(Math.random() * (max - min + 1)) + min;
};


exports.sendMail = async (Email, subject) => {
  let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: "tpaunikar92@gmail.com", // generated ethereal user
      pass: "yapnmzshchqbvnwy", // generated ethereal password
    },
  });
  const info = await transporter.sendMail({
    from: `"The Run Machine" <"tpaunikar92@gmail.com">`,
    to: Email,
    subject:subject,
    text: subject
  });
  return info;
};




