const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // false for 587
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
})

async function sendOtpEmail(email, otp) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS || process.env.SMTP_USER.includes("your-email")) {
        console.warn("\n========================================================================\n" + 
                     `[MOCK EMAIL SERVICE] Verification OTP for ${email}: ${otp}\n` +
                     "Please configure SMTP_USER and SMTP_PASS in Backend/.env to send actual emails.\n" +
                     "========================================================================\n")
        return true
    }

    const mailOptions = {
        from: `"InterviewIQ" <${process.env.SMTP_USER}>`,
        to: email,
        subject: "Verify your email - InterviewIQ",
        text: `Your verification code is: ${otp}. This code is valid for 10 minutes.`,
        html: `
            <div style="font-family: sans-serif; padding: 20px; background-color: #0a0e1a; color: #eef2f8; border-radius: 8px; max-width: 600px; margin: auto; border: 1px solid #232c47;">
                <h2 style="color: #ff6b35; margin-bottom: 20px; font-size: 24px; text-align: center;">Verify Your Email Address</h2>
                <p style="font-size: 16px; line-height: 1.5; color: #eef2f8;">Welcome to InterviewIQ! Please use the following One-Time Password (OTP) to complete your registration. This code is valid for 10 minutes.</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; text-align: center; margin: 30px 0; padding: 15px; background-color: #12182b; border: 1px dashed #4ecdc4; color: #4ecdc4; border-radius: 4px;">
                    ${otp}
                </div>
                <p style="font-size: 14px; color: #6b7894; text-align: center;">If you did not request this code, please ignore this email.</p>
            </div>
        `,
    }

    try {
        await transporter.sendMail(mailOptions)
        return true
    } catch (err) {
        console.error("Error sending OTP email:", err)
        throw new Error("Failed to send verification email. Please try again later.")
    }
}

module.exports = { sendOtpEmail }
