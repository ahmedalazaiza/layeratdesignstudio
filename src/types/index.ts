export type Page =
  | "home"
  | "browse"
  | "product"
  | "profile"
  | "admin"
  | "publisher"
  | "about"
  | "favorites"
  | "team";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin" | "creator";
  purchases: string[];
  wishlist: string[];
  createdAt: string;
  bio?: string;
  website?: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  icon?: any;
  color?: string;
  subcategories?: { id: string; name: string; slug: string }[];
};

