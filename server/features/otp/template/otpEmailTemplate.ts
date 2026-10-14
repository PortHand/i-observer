// To a customer proving they own their email address, e.g. at checkout.

import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import { codeCard, defineMailTemplate, hero, layout, paragraph } from "@/server/features/mail/template/mailTemplate";

/** Feature name on OTP emails. They're secret, so no MAIL_BCC address gets a copy. */
export const OTP_FEATURE = "otp";

export interface OtpEmailData {
  code: string;
  expiresInMinutes: number;
}

/** The 6-digit code the customer types into the checkout. */
export const otpEmailTemplate = defineMailTemplate<OtpEmailData>({
  id: "otp.email",
  feature: OTP_FEATURE,
  secret: true,
  render: ({ code, expiresInMinutes }) => {
    const lead = `Enter this code on the ${appInfo.name} checkout to confirm your email address.`;
    const expiry = `It expires in ${expiresInMinutes} minutes and works once.`;
    const ignore = "If you didn't ask for this code, you can ignore this email: nothing happens without it.";

    return {
      subject: `${code} is your ${appInfo.name} verification code`,
      text: [`Your ${appInfo.name} verification code: ${code}`, "", lead, expiry, "", ignore, "", `${appInfo.name} Support`].join("\n"),
      html: layout({
        preheader: `Your code is ${code}. ${expiry}`,
        footerNote: `You're receiving this email because someone entered this address on the ${appInfo.name} checkout.`,
        body: [
          hero({ icon: "tile-inbox", eyebrow: "Checkout · Verify email", title: "Your verification code.", lead }),
          codeCard({ label: "Verification code", value: code, note: expiry }),
          paragraph(ignore),
        ].join(""),
      }),
    };
  },
});
