// Static content for the "Get iObserver" page.

export const getApp = {
  eyebrow: "Get iObserver",
  title: "Up and running in a day.",
  lead: "Pay by UPI, upload the screenshot here, and your login lands in your inbox within 24 hours.",
  // TODO: replace with the real UPI ID.
  upiId: "yourname@upi",
};

export interface GetStep {
  title: string;
  description: string;
}

export const getSteps: GetStep[] = [
  {
    title: "Pay and upload",
    description: "Pay from any UPI app, then upload the screenshot here with the email you want your login on.",
  },
  {
    title: "Get your login",
    description: "We email your access credentials within 24 hours.",
  },
  {
    title: "Download and present",
    description: "Sign in, download the app for your system and start the overlay.",
  },
];
