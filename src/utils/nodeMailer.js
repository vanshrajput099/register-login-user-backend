import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

export const sendTokenMail = async (recipientEmail, tokenId) => {
    transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: recipientEmail,
        subject: 'Token Verification',
        text: `This is your verification Token , Click on this link to verify your account. ${process.env.API_STARTING}/api/v1/token/verify?token=${tokenId}`,
    })
}

export const sendChangePasswordMail = async (recipientEmail, tokenId) => {
    transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: recipientEmail,
        subject: 'Change Password Verification',
        text: `This is your Change Password Verification , Click on this link to verify your account. ${process.env.API_STARTING}/api/v1/user/update/password/verify?username=${recipientEmail}?token=${tokenId}`,
    })
}

