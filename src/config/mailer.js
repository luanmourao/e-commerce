const nodemailer = require('nodemailer');

module.exports = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "ecd39f951dbe6d",
    pass: "0fe40fb6dab68b"
  }
});