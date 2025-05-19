"use strict";

const nodemailer = require("nodemailer");
const { BadRequestError } = require("../configs/error.response");

class MailService {
  // Khởi tạo transporter
  #transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  // Template HTML cho email
  #generateEmailTemplate = ({
    title,
    message,
    buttonText,
    link,
    secondaryMessage = "",
  }) => {
    return `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
      </head>
      <body style="margin: 0; padding: 0; font-family: Arial, Helvetica, sans-serif; background-color: #f4f4f4;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 30px auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="background-color: #d32f2f; padding: 20px; text-align: center;">
              <img src="https://your-logo-url.com/bloodhouse-logo.png" alt="BloodHouse Logo" style="max-width: 150px; height: auto;">
            </td>
          </tr>
          <tr>
            <td style="padding: 30px; text-align: center;">
              <h1 style="font-size: 24px; color: #333333; margin: 0 0 20px;">${title}</h1>
              <p style="font-size: 16px; color: #555555; line-height: 1.5; margin: 0 0 20px;">
                ${message}
              </p>
              <a href="${link}" style="display: inline-block; padding: 12px 24px; background-color: #d32f2f; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: bold; border-radius: 4px; margin: 20px 0;">
                ${buttonText}
              </a>
              <p style="font-size: 14px; color: #777777; margin: 10px 0;">
                ${secondaryMessage}
              </p>
              <p style="font-size: 14px; color: #777777; margin: 10px 0;">
                Nếu nút trên không hoạt động, vui lòng sao chép và dán liên kết sau vào trình duyệt:
                <br>
                <a href="${link}" style="color: #d32f2f; word-break: break-all;">${link}</a>
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 12px; color: #777777;">
              <p style="margin: 0 0 10px;">
                BloodHouse - Kết nối người hiến máu, cứu lấy cuộc sống
              </p>
              <p style="margin: 0 0 10px;">
                Cần hỗ trợ? Liên hệ với chúng tôi tại <a href="mailto:support@bloodhouse.org" style="color: #d32f2f; text-decoration: none;">support@bloodhouse.org</a>
              </p>
              <p style="margin: 0;">
                © 2025 BloodHouse. Bản quyền thuộc về BloodHouse.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  };

  // Gửi email với template tùy chỉnh
  sendEmail = async ({ to, subject, title, message, buttonText, link, secondaryMessage = "" }) => {
    if (!to || !subject || !title || !message || !buttonText || !link) {
      throw new BadRequestError("Thiếu thông tin email bắt buộc");
    }

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject,
      html: this.#generateEmailTemplate({ title, message, buttonText, link, secondaryMessage }),
    };

    try {
      await this.#transporter.sendMail(mailOptions);
      return { message: `Email ${subject} đã được gửi` };
    } catch (error) {
      throw new BadRequestError(`Gửi email thất bại: ${error.message}`);
    }
  };

  // Gửi email xác minh tài khoản
  sendVerificationEmail = async (to, verifyToken) => {
    const verificationLink = `${process.env.APP_URL}/api/v1/users/verify?token=${verifyToken}`;
    return this.sendEmail({
      to,
      subject: "Xác minh tài khoản BloodHouse",
      title: "Chào mừng đến với BloodHouse!",
      message:
        "Cảm ơn bạn đã tham gia sứ mệnh cứu người thông qua việc hiến máu. Vui lòng xác minh tài khoản để bắt đầu.",
      buttonText: "Xác minh tài khoản",
      link: verificationLink,
      secondaryMessage: "Liên kết này sẽ hết hạn sau <strong>24 giờ</strong>.",
    });
  };

  // Gửi email đặt lại mật khẩu
  sendResetPasswordEmail = async (to, resetToken) => {
    const resetLink = `${process.env.APP_URL}/api/v1/users/reset-password?token=${resetToken}`;
    return this.sendEmail({
      to,
      subject: "Đặt lại mật khẩu BloodHouse",
      title: "Đặt lại mật khẩu BloodHouse",
      message:
        "Bạn đã yêu cầu đặt lại mật khẩu. Nhấn vào liên kết dưới đây để thiết lập mật khẩu mới:",
      buttonText: "Đặt lại mật khẩu",
      link: resetLink,
      secondaryMessage:
        "Liên kết này sẽ hết hạn sau <strong>1 giờ</strong>. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.",
    });
  };
}

module.exports = new MailService();