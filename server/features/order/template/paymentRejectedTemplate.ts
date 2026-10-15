// To the customer when an admin can't find their payment.

import { contactLink } from "@/app/(view)/(pview)/contact/helper/contactHelper";
import { appInfo } from "@/app/(view)/(pview)/home/content/homeContent";
import {
  button,
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
import { PAYMENT_FEATURE, type PaymentMailData } from "./paymentMailData";

export const paymentRejectedTemplate = defineMailTemplate<PaymentMailData>({
  id: "payment.rejected",
  feature: PAYMENT_FEATURE,
  render: ({ reference, planLabel, amount, utr }) => {
    const supportLink = siteLink(contactLink({ topic: "login" }));
    const rows: DetailRow[] = [
      { icon: "row-order", label: "Order", value: reference },
      { icon: "row-topic", label: "Plan", value: planLabel },
      { icon: "row-time", label: "Amount", value: amount },
      ...(utr ? [{ icon: "row-order", label: "UTR", value: utr } as DetailRow] : []),
    ];
    const lead = `We couldn't find a payment matching order ${reference} and the transaction ID you sent, so we haven't activated ${appInfo.name}.`;
    const nextSteps = [
      { title: "Check the transaction ID", text: "Compare the 12-digit UTR in your UPI app with the one above." },
      {
        title: "Contact support",
        text: `If the money left your account, write to ${appInfo.supportEmail} with ${reference} and a screenshot of the payment.`,
      },
    ];

    return {
      subject: `We couldn't confirm your payment · ${reference}`,
      text: [
        "Hi,",
        "",
        lead,
        "",
        detailsText(rows),
        "",
        ...nextSteps.map((step, index) => `${index + 1}. ${step.title}: ${step.text}`),
        "",
        `Contact support: ${supportLink}`,
        "",
        `${appInfo.name} Support`,
      ].join("\n"),
      html: layout({
        preheader: `We couldn't match a payment to ${reference}.`,
        footerNote: `You're receiving this email because you placed an ${appInfo.name} order.`,
        body: [
          hero({ icon: "tile-inbox", eyebrow: "Payment · Not found", title: "We couldn't confirm it.", lead }),
          sectionTitle("Your order"),
          detailsList(rows),
          sectionTitle("What to do"),
          steps(nextSteps),
          button({ href: supportLink, label: "Contact support", trailingIcon: "button-arrow" }),
        ].join(""),
      }),
    };
  },
});
