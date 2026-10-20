import { plansPage } from "../content/adminContent";
import type { AdminPlanView } from "../services/adminService";

/** Short slug such as "yearly" or "two-years": the plan's id, in checkout links and on orders. */
const PLAN_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PLAN_ID_MAX = 32;
/** Taken by the admin portal's new-plan page, /sview/admin/plans/new. */
const RESERVED_PLAN_IDS = ["new"];

/** Rupees with up to 2 decimals; commas allowed, e.g. "3,999" or "499.50". */
const RUPEES_PATTERN = /^\d{1,7}(?:\.\d{1,2})?$/;

/** A <input type="datetime-local"> value, read as IST: "2026-10-20T09:30". */
const DATETIME_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

const IST_OFFSET_MS = 330 * 60 * 1000;

/** How a plan's access is counted: calendar months, hours (short passes), or never ending. */
export const DURATION_UNITS = ["months", "hours", "lifetime"] as const;
export type DurationUnit = (typeof DURATION_UNITS)[number];

/** Longest duration the form accepts, per unit: 10 years, or 30 days in hours. */
const DURATION_MAX: Record<Exclude<DurationUnit, "lifetime">, number> = { months: 120, hours: 720 };

export const PLAN_TEXT_MAX = { name: 40, period: 40, badge: 24, description: 200 } as const;

/** The Plans form as typed: numbers and dates stay strings until parsePlanForm reads them. */
export interface PlanInput {
  id: string;
  name: string;
  period: string;
  description: string;
  /** "" for no ribbon. */
  badge: string;
  durationUnit: DurationUnit;
  /** Whole months or hours, per durationUnit; ignored for lifetime. */
  duration: string;
  /** Rupees customers pay. */
  price: string;
  /** Rupees shown struck through; "" for no discount. */
  compareAtPrice: string;
  sortOrder: string;
  maxQuantity: string;
  isDefault: boolean;
  active: boolean;
  /** datetime-local values in IST; "" for no limit on that side. */
  availableFrom: string;
  availableUntil: string;
}

export type PlanField = keyof PlanInput;

/** A checked plan, ready to save. Amounts are in paise, as plan_prices stores them. */
export interface PlanChange {
  id: string;
  name: string;
  period: string;
  description: string;
  badge: string | null;
  /** At most one is set; both null for lifetime. */
  durationMonths: number | null;
  durationHours: number | null;
  amountPaise: number;
  compareAtPaise: number | null;
  sortOrder: number;
  maxQuantity: number;
  isDefault: boolean;
  active: boolean;
  availableFrom: Date | null;
  availableUntil: Date | null;
}

export type PlanParse = { ok: true; change: PlanChange } | { ok: false; errors: Partial<Record<PlanField, string>> };

const toPaise = (rupees: string) => Math.round(Number(rupees.replace(/,/g, "")) * 100);

/** "2026-10-20T09:30" (IST) → that moment; null when it isn't a datetime-local value. */
export const istInputToDate = (value: string): Date | null => {
  if (!DATETIME_PATTERN.test(value)) return null;
  const date = new Date(`${value}:00+05:30`);
  return Number.isNaN(date.getTime()) ? null : date;
};

/** An ISO timestamp as a datetime-local value in IST, for the form. */
export const toIstInput = (iso: string | null) =>
  iso ? new Date(Date.parse(iso) + IST_OFFSET_MS).toISOString().slice(0, 16) : "";

const rupeesText = (rupees: number | null) => (rupees === null ? "" : String(rupees));

/** An empty form for a new plan. */
export const emptyPlanInput = (sortOrder: number): PlanInput => ({
  id: "",
  name: "",
  period: "",
  description: "",
  badge: "",
  durationUnit: "months",
  duration: "",
  price: "",
  compareAtPrice: "",
  sortOrder: String(sortOrder),
  maxQuantity: "1",
  isDefault: false,
  active: true,
  availableFrom: "",
  availableUntil: "",
});

/** A saved plan in the form's terms. */
export const planToInput = (plan: AdminPlanView): PlanInput => ({
  id: plan.id,
  name: plan.name,
  period: plan.period,
  description: plan.description,
  badge: plan.badge ?? "",
  durationUnit: plan.durationMonths !== null ? "months" : plan.durationHours !== null ? "hours" : "lifetime",
  duration: String(plan.durationMonths ?? plan.durationHours ?? ""),
  price: rupeesText(plan.price),
  compareAtPrice: rupeesText(plan.compareAtPrice),
  sortOrder: String(plan.sortOrder),
  maxQuantity: String(plan.maxQuantity),
  isDefault: plan.isDefault,
  active: plan.active,
  availableFrom: toIstInput(plan.availableFrom),
  availableUntil: toIstInput(plan.availableUntil),
});

const wholeNumber = (value: string, min: number, max: number) => {
  if (!/^\d{1,6}$/.test(value)) return null;
  const number = Number(value);
  return number >= min && number <= max ? number : null;
};

/**
 * Checks the Plans form. Used in the browser and again by the Server Action, so messages match.
 * Checks needing the database (a taken id, too many plans on sale) are the Server Action's.
 */
export const parsePlanForm = (input: PlanInput): PlanParse => {
  const text = (value: unknown) => String(value ?? "").trim();
  const id = text(input.id).toLowerCase();
  const name = text(input.name);
  const period = text(input.period);
  const description = text(input.description);
  const badge = text(input.badge);
  const unit: DurationUnit = DURATION_UNITS.includes(input.durationUnit) ? input.durationUnit : "months";
  const durationText = text(input.duration);
  const priceText = text(input.price).replace(/,/g, "");
  const compareText = text(input.compareAtPrice).replace(/,/g, "");
  const fromText = text(input.availableFrom);
  const untilText = text(input.availableUntil);
  const { errors: messages } = plansPage;

  const errors: Partial<Record<PlanField, string>> = {};
  if (!PLAN_ID_PATTERN.test(id) || id.length > PLAN_ID_MAX) errors.id = messages.id;
  else if (RESERVED_PLAN_IDS.includes(id)) errors.id = messages.idTaken;
  if (!name) errors.name = messages.required;
  else if (name.length > PLAN_TEXT_MAX.name) errors.name = messages.tooLong(PLAN_TEXT_MAX.name);
  if (!period) errors.period = messages.required;
  else if (period.length > PLAN_TEXT_MAX.period) errors.period = messages.tooLong(PLAN_TEXT_MAX.period);
  if (!description) errors.description = messages.required;
  else if (description.length > PLAN_TEXT_MAX.description) errors.description = messages.tooLong(PLAN_TEXT_MAX.description);
  if (badge.length > PLAN_TEXT_MAX.badge) errors.badge = messages.tooLong(PLAN_TEXT_MAX.badge);

  const duration = unit === "lifetime" ? null : wholeNumber(durationText, 1, DURATION_MAX[unit]);
  if (unit !== "lifetime" && duration === null) errors.duration = messages.duration(unit, DURATION_MAX[unit]);

  // Required, but 0 is allowed: a free plan, claimed once per email or phone.
  const amountPaise = RUPEES_PATTERN.test(priceText) ? toPaise(priceText) : -1;
  if (amountPaise < 0) errors.price = priceText === "" ? messages.required : messages.price;
  const compareAtPaise = compareText === "" ? null : RUPEES_PATTERN.test(compareText) ? toPaise(compareText) : 0;
  if (compareAtPaise !== null && compareAtPaise <= 0) errors.compareAtPrice = messages.price;
  else if (compareAtPaise !== null && amountPaise >= 0 && compareAtPaise <= amountPaise) errors.compareAtPrice = messages.compareAt;

  const sortOrder = wholeNumber(text(input.sortOrder), 0, 999);
  if (sortOrder === null) errors.sortOrder = messages.sortOrder;
  const maxQuantity = wholeNumber(text(input.maxQuantity), 1, 99);
  if (maxQuantity === null) errors.maxQuantity = messages.maxQuantity;
  // A lifetime plan bought twice gives nothing more.
  else if (unit === "lifetime" && maxQuantity > 1) errors.maxQuantity = messages.lifetimeQuantity;

  const availableFrom = fromText === "" ? null : istInputToDate(fromText);
  if (fromText !== "" && !availableFrom) errors.availableFrom = messages.date;
  const availableUntil = untilText === "" ? null : istInputToDate(untilText);
  if (untilText !== "" && !availableUntil) errors.availableUntil = messages.date;
  else if (availableFrom && availableUntil && availableUntil <= availableFrom) errors.availableUntil = messages.dateOrder;

  if (input.isDefault === true && input.active !== true) errors.isDefault = messages.defaultInactive;

  if (Object.keys(errors).length > 0) return { ok: false, errors };
  return {
    ok: true,
    change: {
      id,
      name,
      period,
      description,
      badge: badge || null,
      durationMonths: unit === "months" ? duration : null,
      durationHours: unit === "hours" ? duration : null,
      amountPaise,
      compareAtPaise,
      sortOrder: sortOrder!,
      maxQuantity: maxQuantity!,
      isDefault: input.isDefault === true,
      active: input.active === true,
      availableFrom,
      availableUntil,
    },
  };
};

/** Whole percent off for the form's preview, or null when the prices don't make a discount. */
export const previewDiscount = (price: string, compareAtPrice: string) => {
  if (price.trim() === "" || compareAtPrice.trim() === "") return null;
  const amount = Number(price.replace(/,/g, ""));
  const compareAt = Number(compareAtPrice.replace(/,/g, ""));
  if (!(amount >= 0) || !(compareAt > amount)) return null;
  return Math.round(((compareAt - amount) / compareAt) * 100);
};
