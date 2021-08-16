const nodemailer = require("nodemailer");
const { email: emailConfig } = require("../constants/");

const mailService = async (subject, body, recipient) => {
  const callTransorter = (mailOptions, transporter) =>
    new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          reject(new Error("Something went wrong, please send again."));
        } else if (info) {
          resolve({
            statusCode: 200,
            status: true,
            info
          });
        }
      });
    });

  try {
    const transporter = nodemailer.createTransport({
      ...emailConfig
    });

    const mailOptions = {
      from: recipient.sender, // sender address
      to: recipient.email, // list of receivers
      subject, // Subject line
      html: body // plain text body
    };

    return await callTransorter(mailOptions, transporter);
  } catch (err) {
    return Promise.reject(
      new Error("Something went wrong, please send again.")
    );
  }
};

module.exports = mailService;
