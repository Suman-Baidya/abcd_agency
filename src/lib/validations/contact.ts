import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().trim().refine((val) => val.split(/\s+/).length >= 2, {
    message: "Please enter your full name (at least two words)",
  }),
  email: z.string().email("Please enter a valid email address"),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number"),
  isWhatsappSame: z.boolean(),
  whatsapp: z.string().optional(),
  projectType: z.string().min(1, "Please select a project type"),
  budget: z.string().min(1, "Please select an estimated budget"),
  businessType: z.string().min(1, "Please select a business type"),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  message: z.string().min(10, "Please provide a brief project overview (at least 10 characters)"),
  honeypot: z.string().optional(),
  formLoadedAt: z.number().optional(),
}).refine((data) => {
  if (!data.isWhatsappSame && (!data.whatsapp || !/^[6-9]\d{9}$/.test(data.whatsapp))) {
    return false;
  }
  return true;
}, {
  message: "Please enter a valid 10-digit Indian WhatsApp number",
  path: ["whatsapp"],
});

export type ContactFormData = z.infer<typeof contactFormSchema>;
