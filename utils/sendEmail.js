import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { ApiError } from "./ApiError.js";


dotenv.config();

export const sendMail = async ({ email, subject, isSelected, jobTitle,companyName }) => {
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

  // Determine the message based on the selection status
  const message = isSelected
    ? `
      <h2 style="color: #2ecc71; text-align: center;">Congratulations!</h2>
      <p style="font-size: 16px; color: #333;">Dear Candidate,</p>
           <p style="font-size: 16px; color: #333;">FROM ${companyName}</p>
      <p style="font-size: 16px; color: #333;">We are thrilled to inform you that you have been selected for the position of <strong>${jobTitle}</strong>.</p>
      <p style="font-size: 16px; color: #333;">We look forward to welcoming you to our team and hope you will find this opportunity rewarding and fulfilling.</p>
      <p style="font-size: 16px; color: #333;">Further details will be shared with you shortly.</p>
      <p style="font-size: 16px; color: #333;">Thank you for your application.</p>
      <p style="font-size: 16px; color: #333;">Best Regards,</p>
      <p style="font-size: 16px; color: #333;">The Hiring Team</p>
    `
    : `
      <h2 style="color: #e74c3c; text-align: center;">Thank You for Applying</h2>
      <p style="font-size: 16px; color: #333;">Dear Candidate,</p>
      <p style="font-size: 16px; color: #333;">We appreciate your interest in the position of <strong>${jobTitle}</strong>.</p>
      
      <p style="font-size: 16px; color: #333;">After careful consideration, we regret to inform you that you have not been selected for this position at this time.</p>
      <p style="font-size: 16px; color: #333;">We encourage you to apply for future opportunities that match your skills and experience.</p>
      <p style="font-size: 16px; color: #333;">Thank you for considering our organization, and we wish you all the best in your career endeavors.</p>
      <p style="font-size: 16px; color: #333;">Best Regards,</p>
      <p style="font-size: 16px; color: #333;">The Hiring Team</p>
    `;

  // Email options
  const mailOption = {
    from: `Hiring Team <${process.env.SMTP_MAIL}>`,
    to: email,
    subject,
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
    console.log(error)
    throw new ApiError(400, "Email is not connected to the SMTP server");
  }
};
