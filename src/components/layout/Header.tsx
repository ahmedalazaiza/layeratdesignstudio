"use client";

export { Navbar as Header, Navbar } from "./Navbar";
export default function HeaderWrapper(props: any) {
  const { Navbar } = require("./Navbar");
  return <Navbar {...props} />;
}
