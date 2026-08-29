import React from "react";
import { ClientManager } from "@/components/dashboard/ClientManager";
import { getClientsWithProjectCounts } from "./actions";

export const metadata = {
  title: "Clients — ABCD Agency",
};

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const clients = await getClientsWithProjectCounts();
  return <ClientManager initialClients={clients} />;
}
