"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProjectEditForm } from "./ProjectEditForm";

interface NewProjectButtonProps {
  categories: string[];
  clients?: Array<{ id: string; name: string; email: string; isUser?: boolean }>;
}

export function NewProjectButton({ categories, clients = [] }: NewProjectButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formKey, setFormKey] = useState(0);

  const handleOpen = () => {
    // Generate new key so ProjectEditForm completely resets to blank initial state
    setFormKey((prev) => prev + 1);
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={handleOpen}
        className="w-full sm:w-auto text-xs justify-center cursor-pointer"
      >
        New Project
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Create New Project"
        variant="slide-over"
      >
        {isOpen && (
          <ProjectEditForm
            key={`new-project-${formKey}`}
            categories={categories}
            clients={clients}
            onSuccess={() => {
              setIsOpen(false);
              setFormKey((prev) => prev + 1);
            }}
            onCancel={handleClose}
          />
        )}
      </Modal>
    </>
  );
}
