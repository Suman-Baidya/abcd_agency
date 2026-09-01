import React from "react";
import { RevisionManager } from "@/components/dashboard/RevisionManager";
import { getAdminRevisionsData } from "./actions";

export const metadata = {
  title: "Revision Requests & Feedback — Super Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminRevisionsPage() {
  const { revisions, projects, clients } = await getAdminRevisionsData();

  return (
    <RevisionManager
      initialRevisions={revisions}
      projects={projects}
      clients={clients}
    />
  );
}
