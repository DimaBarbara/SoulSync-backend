const { getEnvVar } = require("../utils/getEnvVar");

const nodemailer = require('nodemailer')

class MailService {
  constructor() {
    this.transporter = nodemailer.createTransport( {
      host: getEnvVar('SMTP_HOST'),
      port:getEnvVar('SMTP_PORT'),
      secure: false,
      auth: {
        user: getEnvVar('SMTP_USER'),
        pass: getEnvVar('SMTP_PASSWORD'),
      }

    })

  }
  async sendActivationMail(to, link) {
    await this.transporter.sendMail({
  from: getEnvVar('SMTP_USER'),
  to,
  subject: 'Activate your account in ' + getEnvVar('API_URL'),
  text: 'Please activate your account by clicking the link below.',
  html: `
    <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.5;">
      <h2 style="color: #1976d2;">Welcome to ${getEnvVar('API_URL')}!</h2>
      <p>Thank you for registering. To activate your account, please click the button below:</p>
      <a href="${link}" 
         style="display: inline-block; padding: 10px 20px; margin: 20px 0; 
                background-color: #1976d2; color: #fff; text-decoration: none; 
                border-radius: 5px;">Activate Account</a>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <p style="word-break: break-all;"><a href="${link}">${link}</a></p>
      <hr />
      <p style="font-size: 12px; color: #999;">If you didn't register on our site, just ignore this email.</p>
    </div>
  `
});

  }
}

module.exports = new MailService();
