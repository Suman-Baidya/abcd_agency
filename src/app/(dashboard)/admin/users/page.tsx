import React from "react";
import { UserManager } from "@/components/dashboard/UserManager";
import { getUsersList } from "./actions";

export const metadata = {
  title: "Users & Activity CRM — ABCD Agency",
};

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const users = await getUsersList();
  return <UserManager initialUsers={users} />;
}
