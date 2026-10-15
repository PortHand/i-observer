// To the customer once an admin finds their payment: their iOverlay login.

import { routes } from "@/helper/route";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import {
  button,
  codeCard,
  defineMailTemplate,
  detailsList,
  detailsText,
  hero,
  layout,
  sectionTitle,
  siteLink,
  steps,
  type DetailRow,
} from "@/server/features/mail/template/mailTemplate";
import { PAYMENT_FEATURE, type PaymentVerifiedMailData } from "./paymentMailData";

/** Holds the password, so it's `secret`: no BCC copies. */
export const paymentVerifiedTemplate = defineMailTemplate<PaymentVerifiedMailData>({
  id: "payment.verified",
  feature: PAYMENT_FEATURE,
  secret: true,
  render: ({ reference, planLabel, amount, username, password }) => {
    const signInLink = siteLink(routes.signIn);
    const rows: DetailRow[] = [
      { icon: "row-user", label: "Username", value: username },
      { icon: "row-order", label: "Order", value: reference },
      { icon: "row-topic", label: "Plan", value: planLabel },
      { icon: "row-time", label: "Paid", value: amount },
    ];
    const lead = `We found your payment for ${reference}. Your ${appInfo.name} access is active: sign in with the details below.`;
    const nextSteps = [
      { title: "Sign in", text: `Open ${appInfo.name} and sign in with your username and password.` },
      { title: "Keep this email", text: "It's the only copy of your password. Don't forward it to anyone." },
      { title: "Need help?", text: `Write to ${appInfo.supportEmail} and quote ${reference}.` },
    ];

    return {
      subject: `Your ${appInfo.name} login · ${reference}`,
      text: [
        "Hi,",
        "",
        lead,
        "",
        `Username: ${username}`,
        `Password: ${password}`,
        "",
        detailsText(rows.slice(1)),
        "",
        ...nextSteps.map((step, index) => `${index + 1}. ${step.title}: ${step.text}`),
        "",
        `Sign in: ${signInLink}`,
        "",
        `${appInfo.name} Support`,
      ].join("\n"),
      html: layout({
        preheader: `Payment confirmed for ${reference}. Here's your login.`,
        footerNote: `You're receiving this email because you bought ${appInfo.name}.`,
        body: [
          hero({ icon: "tile-check", eyebrow: "Payment · Confirmed", title: "You're all set.", lead }),
          codeCard({ label: "Your password", value: password, note: `Sign in with username ${username}.` }),
          sectionTitle("Your order"),
          detailsList(rows),
          sectionTitle("What's next"),
          steps(nextSteps),
          button({ href: signInLink, label: "Sign in", trailingIcon: "button-arrow" }),
        ].join(""),
      }),
    };
  },
});
