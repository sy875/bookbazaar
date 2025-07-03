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
