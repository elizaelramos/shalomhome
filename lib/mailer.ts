import nodemailer from "nodemailer";

const host = process.env.SMTP_HOST;
const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const secure = process.env.SMTP_SECURE === "true";
const from = process.env.EMAIL_FROM || "no-reply@localhost";

if (!host || !port || !user || !pass) {
  console.warn("SMTP not fully configured. Emails will fail until SMTP_HOST/SMTP_PORT/SMTP_USER/SMTP_PASS are set in .env");
}

const transporter = nodemailer.createTransport({
  host,
  port,
  secure,
  auth: user && pass ? { user, pass } : undefined,
});

export async function sendEmail(to: string, subject: string, html: string) {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log("Email enviado:", info.messageId);
    return { success: true, info };
  } catch (error) {
    console.error("Erro ao enviar email:", error);
    return { success: false, error };
  }
}
