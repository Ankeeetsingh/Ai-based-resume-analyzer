'use server';

/**
 * @fileOverview Defines the email sending service using Nodemailer and Gmail.
 *
 * - sendRejectionEmail - A function that sends a rejection email to a candidate.
 */

import nodemailer from 'nodemailer';

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
}

/**
 * Sends a rejection email to a candidate using Gmail.
 * Reads credentials from environment variables.
 * @param params - The email parameters (to, subject, body).
 */
export async function sendRejectionEmail(params: SendEmailParams): Promise<void> {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS; // Should be the App Password

  if (!emailUser || !emailPass) {
    const errorMessage = 'Missing environment variables for email sending. Ensure EMAIL_USER and EMAIL_PASS are set.';
    console.error(errorMessage);
    throw new Error(errorMessage);
  }

  // Configure the Nodemailer transporter using Gmail
  // IMPORTANT: For Gmail, use an App Password if 2-Step Verification is enabled.
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Use Gmail service
    auth: {
      user: emailUser, // Your Gmail address from .env
      pass: emailPass, // Your Gmail App Password from .env
    },
  });

  const mailOptions = {
    from: `"AI Resume Analyzer" <${emailUser}>`, // Sender address
    to: params.to, // Recipient address
    subject: params.subject, // Subject line
    text: params.body, // Plain text body
    // html: `<p>${params.body.replace(/\n/g, '<br>')}</p>`, // Optional: HTML body
  };

  try {
    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info)); // Useful for testing with ethereal.email
  } catch (error: any) {
    console.error('Error sending email:', error);
    // Provide a more specific error message if possible
    let detailedError = error.message;
    if (error.responseCode === 535) {
      detailedError = 'Authentication failed. Check EMAIL_USER and EMAIL_PASS. If using Gmail with 2FA, ensure you are using an App Password.';
    } else if (error.code === 'ECONNECTION') {
        detailedError = 'Connection error. Check network connectivity or firewall settings.';
    }
    throw new Error(`Failed to send email: ${detailedError}`);
  }
}
