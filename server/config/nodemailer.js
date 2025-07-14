import nodemailer from 'nodemailer'; 

const transporter = nodemailer.createTransport({
  host: "smtp-relay.sendinblue.com", // Example SMTP host
  port: 587, // Example SMTP port 
  auth: {
    user: process.env.SMTP_USER, // SMTP username from .env 
    pass: process.env.SMTP_PASSWORD // SMTP password from .env 
  }
});

export default transporter;
