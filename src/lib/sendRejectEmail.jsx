import nodemailer from "nodemailer";

export async function sendRejectingApprovalEmail(email, name) {
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
    subject: "Your Account is Rejected Approval",
    html: `
      <h3>Hello ${name},</h3>
      <p>Thank you for registering on <strong>UniJobLink</strong>.</p>
      <p>We are very sorry , Your account has been <strong> reject </strong> for many reason. <strong>pplz contact us for more informations.</strong> by an administrator.</p>
      <br />
      <p>Thank you,<br/>The UniJobLink Team</p>
    `,
  });
}