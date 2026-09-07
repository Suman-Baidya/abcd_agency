import React from "react";
import { ClientManager } from "@/components/dashboard/ClientManager";
import { getClientsWithProjectCounts } from "./actions";

export const metadata = {
  title: "Client Accounts — ABCD Agency",
};

export const dynamic = "force-dynamic";

export default async function ClientsPage({
  searchParams,
}: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  const resolvedParams = await searchParams;
  const initialSearch = typeof resolvedParams?.search === "string" ? resolvedParams.search : undefined;
  const initialClientId = typeof resolvedParams?.clientId === "string" ? resolvedParams.clientId : undefined;

  const clients = await getClientsWithProjectCounts();
  return (
    <ClientManager
      initialClients={clients}
      initialSearch={initialSearch}
      initialClientId={initialClientId}
    />
  );
}
