import nodemailer from "nodemailer";
import sendgrid from "nodemailer-sendgrid";

const transporter = nodemailer.createTransport(
  sendgrid({
    apiKey: String(process.env.SENDGRID_API),
  })
);

export default async (to: string, subject: string, data: string) => {
  try {
    await transporter.sendMail({
      to: to,
      from: process.env.MAIL_SENDER,
      subject: subject,
      html: `
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="background-color: #f8f9fa; padding: 5%;">
    <div style="background-color: #ffffff; padding: 5%; height: 75%;">
        <div style="display: flex;">
            <img src="https://res.cloudinary.com/dcozag1og/image/upload/v1707777308/Group_52_p5qtui.png" alt="logo" style="max-height: 100%; margin-right: 10px;">
            <h1 style="color: #bbe809; font-weight: normal;">Doxa</h1>
        </div>
        <h2 style="font-weight: lighter;">${data}</h2>
    </div>
</body>
</html>
      `,
    });
  } catch (error) {
    console.log(error);
  }
};
