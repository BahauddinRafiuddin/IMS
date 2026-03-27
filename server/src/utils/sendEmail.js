import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, html) => {
  console.log("Sending email to:", to);

  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.BREVO_USER,
      pass: process.env.BREVO_PASS
    },
    connectionTimeout: 20000,
    greetingTimeout: 20000
  });

  await transporter.sendMail({
    from: `"IMS Platform" <${process.env.BREVO_USER}>`,
    to,
    subject,
    html
  });

  console.log("Email sent successfully");
};