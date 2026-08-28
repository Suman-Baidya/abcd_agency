"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProjectEditForm } from "./ProjectEditForm";

interface NewProjectButtonProps {
  categories: string[];
}

export function NewProjectButton({ categories }: NewProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="primary" size="sm" onClick={() => setIsOpen(true)}>
        New Project
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Create New Project"
        variant="slide-over"
      >
        <ProjectEditForm
          categories={categories}
          onSuccess={() => setIsOpen(false)}
          onCancel={() => setIsOpen(false)}
        />
      </Modal>
    </>
  );
}
