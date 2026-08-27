"use server";

import { db } from "@/lib/prisma";
import { z } from "zod";
import { contactFormSchema, type ContactFormData } from "@/lib/validations/contact";

export async function submitInquiry(data: ContactFormData) {
  try {
    const parsedData = contactFormSchema.parse(data);
    
    const inquiry = await db.inquiry.create({
      data: {
        name: parsedData.name,
        email: parsedData.email,
        mobile: parsedData.mobile,
        isWhatsappSame: parsedData.isWhatsappSame,
        whatsapp: parsedData.isWhatsappSame ? parsedData.mobile : parsedData.whatsapp,
        businessType: parsedData.businessType,
        services: parsedData.services,
        projectType: parsedData.projectType,
        budget: parsedData.budget,
        message: parsedData.message,
        status: "New",
        priority: "Medium", // Can be determined dynamically later
      },
    });

    return { success: true, inquiryId: inquiry.id };
  } catch (error) {
    console.error("Error submitting inquiry:", error);
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed" };
    }
    return { success: false, error: "An unexpected error occurred" };
  }
}
