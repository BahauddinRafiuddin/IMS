import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS
    }
  });

  await transporter.sendMail({
    from: `"IMS Platform" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html
  });
};