import nodemailer from "nodemailer";

export async function sendApprovedApprovedEmail(email, name) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"UniJobLink" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your Account had been Approved",
    html: `
      <h3>Hello ${name},</h3>
      <p>Thank you for patient on waiting our approval from <strong>UniJobLink</strong>.</p>
      <p>your account had been <strong>approved</strong>, you can now gain full access to the platform.</p>
      <br />
      <p>Thank you,<br/>The UniJobLink Team</p>
    `,
  });
}