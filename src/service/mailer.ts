import { createTransport } from "nodemailer";

let transporter = createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL,
    pass: process.env.MAIL_PASSKEY,
  },
});

export default async (
  to: string,
  subject: string,
  body: { heading: string; name: string; content: any }
) => {
  try {
    await transporter.sendMail({
      to: to,
      from: process.env.GMAIL,
      subject,
      html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Email Template</title>
    <style>
      body {
        font-family: 'Helvetica Neue', Arial, sans-serif;
        background-color: #f5f5f5;
        color: #333;
        margin: 0;
        padding: 0;
        line-height: 1.6;
      }
      .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #000;
        padding: 20px;
        text-align: center;
      }
      .header img {
        max-width: 120px;
      }
      .heading {
        font-size: 28px;
        color: #000;
        text-align: center;
        margin: 20px 0;
        font-weight: bold;
      }
      .content {
        padding: 20px;
        font-size: 16px;
        color: #555;
        line-height: 1.8;
      }
      .content p {
        margin-bottom: 20px;
      }
    </style>
  </head>
  <body>
    <div class="email-container">
      <div class="header">
        <img src="https://res.cloudinary.com/dcozag1og/image/upload/v1707777308/Group_52_p5qtui.png" alt="logo" style="max-height: 100%; margin-right: 10px;">
      </div>

      <div class="heading">${body.heading}</div>

      <div class="content">
        <p>Hi ${body.name},</p>
        <p>${body.content}</p>
      </div>
    </div>
  </body>
</html>
`,
    });
  } catch (error) {
    console.log(error);
  }
};
