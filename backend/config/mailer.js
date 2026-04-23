require('dotenv').config();
const nodemailer = require('nodemailer');

let mailer = null;

if (
  process.env.GMAIL_USER &&
  process.env.GMAIL_APP_PASSWORD
) {
  mailer = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
  mailer.verify((error) => {
  if (error) {
    console.warn(
      '⚠️ Gmail SMTP verification failed:',
      error.message
    );
  } else {
    console.log(
      '✅ Gmail SMTP verified successfully'
    );
  }
});

  console.log('✅ Gmail SMTP configured');
} else {
  console.warn(
    '⚠️ Gmail credentials missing. Emails will be logged only.'
  );
}

module.exports = mailer;