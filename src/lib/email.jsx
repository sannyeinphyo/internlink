import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendApplicationAcceptEmail(email, name, internshipTitle) {
  try {
    await transporter.sendMail({
      from: `"UniJobLink" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Congratulations! Your Internship "${internshipTitle}" Has Been Accepted`,
      html: `
        <h3>Hi ${name},</h3>
        <p>We are excited to inform you that your application for the internship position <strong>"${internshipTitle}"</strong> has been <strong>accepted</strong>!</p>
        <p>Get ready to start your journey with this amazing opportunity. Please check your UniJobLink dashboard for next steps and further details.</p>
        <br />
        <p>Best wishes,<br/>The UniJobLink Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send acceptance email:", error);
    throw error;
  }
}

export async function sendApplicationRejectEmail(email, name, internshipTitle) {
  try {
    await transporter.sendMail({
      from: `"UniJobLink" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your Internship Application Has Been Rejected",
      html: `
        <h3>Hello ${name},</h3>
        <p>Thank you for your interest and for patiently waiting for our decision.</p>
        <p>We regret to inform you that your internship application for <strong>"${internshipTitle}"</strong> has been <strong>rejected</strong>. We encourage you to keep applying and wish you the best in your future endeavors.</p>
        <br />
        <p>Thank you,<br/>The UniJobLink Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send rejection email:", error);
    throw error;
  }
}

export async function sendInterviewScheduledEmail(
  email,
  name,
  internshipTitle,

) {
  try {
    await transporter.sendMail({
      from: `"UniJobLink" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Interview Scheduled for "${internshipTitle}" Internship`,
      html: `
        <h3>Hello ${name},</h3>
        <p>Your interview for the internship position <strong>"${internshipTitle}"</strong> has been scheduled.</p>
        <p>Please prepare accordingly and check your UniJobLink dashboard for any updates.</p>
        <br />
        <p>Good luck!<br/>The UniJobLink Team</p>
      `,
    });
  } catch (error) {
    console.error("Failed to send interview email:", error);
    throw error;
  }
}
