/**
 * @type {{FICTION: "fiction", NON_FICTION: "non-fiction", MYSTERY: "mystery", ROMANCE: "romance", SCIENCE_FICTION: "science-fiction", FANTASY: "fantasy", BIOGRAPHY: "biography", HISTORY: "history", SELF_HELP: "self-help", CHILDREN: "children"} as const}
 */

export const BookGenre = {
  FICTION: "fiction",
  NON_FICTION: "non-fiction",
  MYSTERY: "mystery",
  ROMANCE: "romance",
  SCIENCE_FICTION: "science-fiction",
  FANTASY: "fantasy",
  BIOGRAPHY: "biography",
  HISTORY: "history",
  SELF_HELP: "self-help",
  CHILDREN: "children",
};

export const AvailableGenres = Object.values(BookGenre);

/**
 * @type {{USER:"user",ADMIN: "admin"} as const}
 */

export const UserRolesEnum = {
  USER: "user",
  ADMIN: "admin",
};

export const AvailableUserRoles = Object.values(UserRolesEnum);

/**
 * @type {{ PENDING: "PENDING"; CANCELLED: "CANCELLED"; DELIVERED: "DELIVERED" } as const}
 */
export const OrderStatusEnum = {
  PENDING: "PENDING",
  CANCELLED: "CANCELLED",
  DELIVERED: "DELIVERED",
};

export const AvailableOrderStatuses = Object.values(OrderStatusEnum);

/**
 * @type {{ UNKNOWN:"UNKNOWN"; RAZORPAY: "RAZORPAY"; PAYPAL: "PAYPAL"; } as const}
 */
export const PaymentProviderEnum = {
  UNKNOWN: "UNKNOWN",
  RAZORPAY: "RAZORPAY",
  PAYPAL: "PAYPAL",
};

export const AvailablePaymentProviders = Object.values(PaymentProviderEnum);

/**
 * @type {{ PENDING: "PENDING",SUCCESSFUL:"SUCCESSFUL",FAILED: "FAILED" } as const}
 */
export const PaymentStatusEnum = {
  PENDING: "PENDING",
  SUCCESSFUL: "SUCCESSFUL",
  FAILED: "FAILED",
};

export const AvailablePaymentStatuses = Object.values(PaymentStatusEnum);

export const EXCLUDE_API_KEY_VERIFICATION = "/api/v1/auth";
