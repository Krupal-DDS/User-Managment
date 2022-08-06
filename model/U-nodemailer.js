const nodemailer = require("nodemailer");
const SendEmail = (email,subject, link) => {
  
  let trasporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: 'krupal.dds@gmail.com',
      pass: 'hkvq ttyi mzod nfgf',
    },
  });
  let messageOptions = {
    from: process.env.USER,
    to: email,
    subject: subject,
    html: link,
  };
  trasporter.sendMail(messageOptions, (err, res) => {
    if (err) return console.log(err.message);
    else console.log("sent Successfully", res);
  });
};
module.exports = SendEmail;