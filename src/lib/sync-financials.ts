import { db } from "@/lib/prisma";

export function parseCurrencyToNumber(val?: string | number | null): number {
  if (typeof val === "number") return isNaN(val) ? 0 : val;
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9]/g, "");
  const num = parseInt(cleaned, 10);
  return isNaN(num) ? 0 : num;
}

export function formatNumberToINR(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/**
 * Synchronize financial metrics for a specific Client and all their linked Projects
 */
export async function syncClientAndProjectBalances(clientIdOrName?: string | null) {
  if (!clientIdOrName) return;

  try {
    // 1. Find the target client by ID or Name
    const client = await db.client.findFirst({
      where: {
        OR: [
          { id: clientIdOrName },
          { name: { equals: clientIdOrName, mode: "insensitive" } },
        ],
      },
      include: {
        projects: true,
      },
    });

    if (!client) return;

    // 2. Fetch all projects associated with this client (by clientId or matching client name)
    const projects = await db.project.findMany({
      where: {
        OR: [
          { clientId: client.id },
          { client: { equals: client.name, mode: "insensitive" } },
        ],
      },
    });

    // 3. Fetch all completed income transactions for this client
    const clientIncomeTransactions = await db.transaction.findMany({
      where: {
        type: "Income",
        status: "Completed",
        OR: [
          { clientId: client.id },
          { clientName: { equals: client.name, mode: "insensitive" } },
        ],
      },
    });

    // 4. Update each project's paidRaw value
    for (const proj of projects) {
      const projIncome = clientIncomeTransactions.filter(
        (t: any) =>
          t.projectId === proj.id ||
          (t.title && t.title.toLowerCase().includes(proj.title.toLowerCase()))
      );

      const paidRaw = projIncome.reduce(
        (sum: number, t: any) => sum + (t.amountRaw || parseCurrencyToNumber(t.amount)),
        0
      );

      const budgetRaw = proj.budgetRaw > 0 ? proj.budgetRaw : parseCurrencyToNumber(proj.budget);

      // If project didn't have clientId linked yet, link it now
      await db.project.update({
        where: { id: proj.id },
        data: {
          clientId: client.id,
          paidRaw,
          budgetRaw,
        },
      });
    }

    // 5. Calculate Client Total Spend and Overall Due Balance
    const totalSpendRaw = clientIncomeTransactions.reduce(
      (sum: number, t: any) => sum + (t.amountRaw || parseCurrencyToNumber(t.amount)),
      0
    );

    const totalContractedRaw = projects.reduce(
      (sum: number, p: any) => sum + (p.budgetRaw > 0 ? p.budgetRaw : parseCurrencyToNumber(p.budget)),
      0
    );

    const dueBalanceRaw = Math.max(0, totalContractedRaw - totalSpendRaw);

    // 6. Update the Client with synchronized values
    await db.client.update({
      where: { id: client.id },
      data: {
        totalSpendRaw,
        totalSpend: formatNumberToINR(totalSpendRaw),
        dueBalanceRaw,
        dueBalance: formatNumberToINR(dueBalanceRaw),
      },
    });
  } catch (error) {
    console.error("Error in syncClientAndProjectBalances:", error);
  }
}

/**
 * Bulk sync all clients and projects across the agency
 */
export async function syncAllFinancials() {
  try {
    const clients = await db.client.findMany({ select: { id: true } });
    for (const c of clients) {
      await syncClientAndProjectBalances(c.id);
    }
  } catch (error) {
    console.error("Error in syncAllFinancials:", error);
  }
}
