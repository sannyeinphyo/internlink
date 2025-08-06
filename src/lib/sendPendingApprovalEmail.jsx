import nodemailer from "nodemailer";

export async function sendPendingApprovalEmail(email, name) {
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
    subject: "Your Account is Pending Approval",
    html: `
      <h3>Hello ${name},</h3>
      <p>Thank you for registering on <strong>UniJobLink</strong>.</p>
      <p>Your account has been created successfully and is currently <strong>pending approval</strong> by an administrator.</p>
      <p>Once your account is approved, you will receive a confirmation email and gain full access to the platform.</p>
      <br />
      <p>Thank you,<br/>The UniJobLink Team</p>
    `,
  });
}