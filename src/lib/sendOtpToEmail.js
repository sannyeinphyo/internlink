import nodemailer from "nodemailer";

export async function sendOtpToEmail(email, otp) {
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
    subject: "Verify Your Email",
    html: `
      <h3>Your OTP Code</h3>
      <p>Use the following code to verify your email:</p>
      <h2>${otp}</h2>
      <p>This code expires in 10 minutes.</p>
    `,
  });
}
