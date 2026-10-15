// Wires the entitlement feature together. The order feature takes entitlementService in its
// constructor, to grant time when a payment is verified and take it back on a refund.

import "server-only";
import { EntitlementRepository } from "../repository/entitlementRepository";
import { EntitlementService } from "../service/entitlementService";

export const entitlementService = new EntitlementService(new EntitlementRepository());
