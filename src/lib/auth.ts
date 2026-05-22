import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "@/lib/prisma";
import { sendAuthCodeEmail } from "@/lib/email";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const authSecret =
  process.env.AUTH_SECRET ??
  process.env.BETTER_AUTH_SECRET ??
  "local-development-auth-secret-minimum-32-characters";

export const auth = betterAuth({
  appName: "Долина знаний",
  baseURL: appUrl,
  secret: authSecret,
  trustedOrigins: [appUrl, "http://localhost:3000", "https://diary-ai.ru"],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    minPasswordLength: 8,
    maxPasswordLength: 128,
  },
  user: {
    additionalFields: {
      role: {
        type: ["TUTOR", "STUDENT", "ADMIN"],
        required: false,
        input: true,
        defaultValue: "STUDENT",
      },
      onboardingCompletedAt: {
        type: "date",
        required: false,
        input: false,
      },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24,
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  plugins: [
    emailOTP({
      otpLength: 4,
      expiresIn: 60 * 10,
      allowedAttempts: 5,
      storeOTP: "hashed",
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      generateOTP: () => Math.floor(1000 + Math.random() * 9000).toString(),
      sendVerificationOTP: sendAuthCodeEmail,
    }),
    nextCookies(),
  ],
});

export type AuthSession = typeof auth.$Infer.Session;
