// Every feature's tables, for drizzle-kit (see drizzle.config.ts) and the typed query client.
// Add a feature's schema file here when you create one. Changing a table does nothing to the
// database until you run `npm run db:generate` and `npm run db:migrate`.

export * from "../features/auth/schema/authSchema";
export * from "../features/contact/schema/contactSchema";
export * from "../features/orders/schema/orderSchema";
