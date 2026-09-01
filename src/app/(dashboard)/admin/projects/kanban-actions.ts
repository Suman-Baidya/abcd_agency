"use server";

import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export type KanbanStatus = "Backlog" | "Todo" | "InProgress" | "Done" | "Approved";
export type KanbanPriority = "Urgent" | "High" | "Medium" | "Low" | "Critical";

export async function getAdminKanbanData(projectId?: string) {
  try {
    const [projects, clients, tasks] = await Promise.all([
      db.project.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          clientRel: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
      }),
      db.client.findMany({
        select: { id: true, name: true, email: true },
        orderBy: { name: "asc" },
      }),
      db.projectTask.findMany({
        where: projectId && projectId !== "all" ? { projectId } : undefined,
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        include: {
          projectRel: {
            select: { id: true, title: true, client: true, status: true, progress: true },
          },
        },
      }),
    ]);

    return {
      projects,
      clients,
      tasks,
    };
  } catch (error) {
    console.error("Error fetching admin kanban data:", error);
    return { projects: [], clients: [], tasks: [] };
  }
}

export async function createProjectTask(data: {
  projectId: string;
  title: string;
  description?: string;
  priority?: KanbanPriority | string;
  status?: KanbanStatus | string;
  assignee?: string;
  dueDate?: string;
}) {
  try {
    const newTask = await db.projectTask.create({
      data: {
        projectId: data.projectId,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        priority: data.priority || "Medium",
        status: data.status || "Todo",
        assignee: data.assignee?.trim() || null,
        dueDate: data.dueDate?.trim() || null,
      },
    });

    // Automatically recalculate project progress if tasks exist
    await autoSyncProjectProgress(data.projectId);

    revalidatePath("/admin/projects");
    revalidatePath("/portal/projects");
    revalidatePath("/portal");

    return { success: true, task: newTask };
  } catch (error: any) {
    console.error("Error creating project task:", error);
    return { success: false, error: error.message || "Failed to create task" };
  }
}

export async function updateProjectTaskStatus(taskId: string, newStatus: KanbanStatus | string) {
  try {
    const task = await db.projectTask.update({
      where: { id: taskId },
      data: { status: newStatus },
      select: { id: true, projectId: true, status: true },
    });

    if (task.projectId) {
      await autoSyncProjectProgress(task.projectId);
    }

    revalidatePath("/admin/projects");
    revalidatePath("/portal/projects");
    revalidatePath("/portal");

    return { success: true, task };
  } catch (error: any) {
    console.error("Error updating task status:", error);
    return { success: false, error: error.message || "Failed to update task status" };
  }
}

export async function updateProjectTask(
  taskId: string,
  data: {
    title?: string;
    description?: string;
    priority?: KanbanPriority | string;
    status?: KanbanStatus | string;
    assignee?: string;
    dueDate?: string;
  }
) {
  try {
    const updated = await db.projectTask.update({
      where: { id: taskId },
      data: {
        ...(data.title ? { title: data.title.trim() } : {}),
        ...(data.description !== undefined ? { description: data.description?.trim() || null } : {}),
        ...(data.priority ? { priority: data.priority } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.assignee !== undefined ? { assignee: data.assignee?.trim() || null } : {}),
        ...(data.dueDate !== undefined ? { dueDate: data.dueDate?.trim() || null } : {}),
      },
    });

    if (updated.projectId) {
      await autoSyncProjectProgress(updated.projectId);
    }

    revalidatePath("/admin/projects");
    revalidatePath("/portal/projects");

    return { success: true, task: updated };
  } catch (error: any) {
    console.error("Error updating task:", error);
    return { success: false, error: error.message || "Failed to update task" };
  }
}

export async function deleteProjectTask(taskId: string) {
  try {
    const task = await db.projectTask.delete({
      where: { id: taskId },
      select: { projectId: true },
    });

    if (task.projectId) {
      await autoSyncProjectProgress(task.projectId);
    }

    revalidatePath("/admin/projects");
    revalidatePath("/portal/projects");

    return { success: true };
  } catch (error: any) {
    console.error("Error deleting task:", error);
    return { success: false, error: error.message || "Failed to delete task" };
  }
}

export async function autoSyncProjectProgress(projectId: string) {
  try {
    const counts = await db.projectTask.groupBy({
      by: ["status"],
      where: { projectId },
      _count: { _all: true },
    });

    if (counts.length === 0) return;

    let totalTasks = 0;
    let completedTasks = 0;

    counts.forEach((c: { status: string; _count: { _all: number } }) => {
      totalTasks += c._count._all;
      if (c.status === "Approved" || c.status === "Done") {
        completedTasks += c._count._all;
      }
    });

    const computedProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    let derivedStatus = "In Progress";
    if (computedProgress === 100) {
      derivedStatus = "Completed";
    } else if (computedProgress === 0) {
      derivedStatus = "Planning";
    }

    await db.project.update({
      where: { id: projectId },
      data: {
        progress: computedProgress,
        ...(computedProgress === 100 ? { status: "Completed" } : {}),
      },
    });
  } catch (e) {
    console.error("Error auto-syncing project progress:", e);
  }
}
