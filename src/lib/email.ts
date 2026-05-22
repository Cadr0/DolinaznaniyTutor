import nodemailer from "nodemailer";

type AuthCodeEmail = {
  email: string;
  otp: string;
  type: "sign-in" | "email-verification" | "forget-password" | "change-email";
};

const smtpPort = Number(process.env.SMTP_PORT ?? 587);

function getTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP is not configured. Set SMTP_HOST, SMTP_USER and SMTP_PASS.");
  }

  return nodemailer.createTransport({
    host,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user, pass },
  });
}

function getSubject(type: AuthCodeEmail["type"]) {
  switch (type) {
    case "forget-password":
      return "Код восстановления пароля";
    case "change-email":
      return "Код подтверждения новой почты";
    case "sign-in":
      return "Код входа в Долину знаний";
    case "email-verification":
    default:
      return "Код подтверждения регистрации";
  }
}

function getIntro(type: AuthCodeEmail["type"]) {
  if (type === "forget-password") {
    return "Введите этот код на странице восстановления пароля, затем задайте новый пароль.";
  }

  return "Введите этот код на сайте, чтобы подтвердить почту и войти в Долину знаний.";
}

export async function sendAuthCodeEmail({ email, otp, type }: AuthCodeEmail) {
  const from = process.env.SMTP_FROM ?? "noreply@diary-ai.ru";
  const subject = getSubject(type);
  const intro = getIntro(type);

  await getTransport().sendMail({
    from,
    to: email,
    subject,
    text: `${intro}\n\nКод: ${otp}\n\nКод действует 10 минут. Если вы не запрашивали письмо, просто проигнорируйте его.`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #2a3e47; line-height: 1.5;">
        <p>${intro}</p>
        <p style="font-size: 32px; letter-spacing: 8px; font-weight: 700; color: #3daa9a;">${otp}</p>
        <p>Код действует 10 минут. Если вы не запрашивали письмо, просто проигнорируйте его.</p>
      </div>
    `,
  });
}
