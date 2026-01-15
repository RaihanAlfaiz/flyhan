import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail", // Use your preferred service
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  attachments?: any[];
};

export const sendEmail = async (data: EmailPayload) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"FlyHan" <no-reply@flyhan.com>',
    ...data,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Message sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
