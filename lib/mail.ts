import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
  console.log({
    code: token,
  });

  await resend.emails.send({
    from: "abdoufaci982@gmail.com",
    to: ["abdoufaci982@gmail.com"],
    subject: "2FA Code",
    html: `<p>Click <a href="${token}">here</a> to reset password.</p>`,
  });
};

export const sendPasswordResetEmail = async (email: string, token: string) => {
  const resetLink = `http://localhost:3000/auth/new-password?token=${token}`;

  console.log({
    resetLink,
  });
  await resend.emails.send({
    from: "abdoufaci982@gmail.com",
    to: ["abdoufaci982@gmail.com"],
    subject: "reset your password",
    html: `<p>Click <a href="${resetLink}">here</a> to reset password.</p>`,
  });
};

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`;

  console.log({
    confirmLink,
  });
  await resend.emails.send({
    from: "abdoufaci982@gmail.com",
    to: ["abdoufaci982@gmail.com"],
    subject: "Confirm your email",
    html: `<p>Click <a href="${confirmLink}">here</a> to confirm email.</p>`,
  });
};
