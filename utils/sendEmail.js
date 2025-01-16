import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";

dotenv.config();

export const sendOtpMail = async ({ email, otp, quizTitle, expiryTime }) => {
  // Create the transporter for sending emails
  const transport = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "500"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // OTP email template
  const message = `
    <h2 style="color: #2c3e50; text-align: center;">Your OTP for Quiz Verification</h2>
    <p style="font-size: 16px; color: #333;">Dear Quiz Participant,</p>
    <p style="font-size: 16px; color: #333;">You are receiving this email because you are attempting to access the quiz <strong>"${quizTitle}"</strong>.</p>
    <p style="font-size: 16px; color: #333;">Please use the following OTP to verify your access:</p>
    <p style="font-size: 24px; color: #3498db; text-align: center; font-weight: bold;">${otp}</p>
    <p style="font-size: 16px; color: #333;">This OTP is valid for the next <strong>${expiryTime} minutes</strong>.</p>
    <p style="font-size: 16px; color: #333;">If you did not request this OTP, please ignore this email.</p>
    <p style="font-size: 16px; color: #333;">Best Regards,</p>
    <p style="font-size: 16px; color: #333;">The Quiz Team</p>
  `;

  // Email options
  const mailOption = {
    from: `Quiz Team <${process.env.SMTP_MAIL}>`,
    to: email,
    subject: `Your OTP for Quiz "${quizTitle}"`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9; max-width: 600px; margin: auto;">
        ${message}
      </div>
    `,
  };

  // Send the email
  try {
    await transport.sendMail(mailOption);
  } catch (error) {
    console.error(error);
    throw new ApiError(400, "Email is not connected to the SMTP server");
  }
};
