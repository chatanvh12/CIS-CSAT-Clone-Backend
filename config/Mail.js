// const nodemailer = require("nodemailer");
import nodemailer from 'nodemailer';
import dotenv from 'dotenv'
dotenv.config()

console.log(process.env.MAIL_ID," ",process.env.PASS);
 const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: process.env.MAIL_ID,
    pass: process.env.PASS,
  },
});

export default transporter;