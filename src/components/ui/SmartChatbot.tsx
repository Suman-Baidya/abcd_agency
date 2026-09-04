"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  MessageSquare,
  X,
  Send,
  RotateCcw,
  ExternalLink,
  Phone,
  Mail,
  ChevronRight,
  Bot,
  Package,
  Layers,
  MessageCircle,
  Calendar,
  FileText,
  User,
} from "lucide-react";

type ActionIconType =
  | "package"
  | "layers"
  | "phone"
  | "whatsapp"
  | "mail"
  | "portal"
  | "calendar"
  | "file";

interface ActionItem {
  label: string;
  href?: string;
  actionType?: string;
  icon?: ActionIconType;
}

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
  actions?: ActionItem[];
  timestamp: string;
}

const renderActionIcon = (iconName?: ActionIconType) => {
  const iconProps = { className: "w-3 h-3 shrink-0 text-current" };
  switch (iconName) {
    case "package":
      return <Package {...iconProps} />;
    case "layers":
      return <Layers {...iconProps} />;
    case "phone":
      return <Phone {...iconProps} />;
    case "whatsapp":
      return <MessageCircle {...iconProps} />;
    case "mail":
      return <Mail {...iconProps} />;
    case "portal":
      return <User {...iconProps} />;
    case "calendar":
      return <Calendar {...iconProps} />;
    case "file":
      return <FileText {...iconProps} />;
    default:
      return null;
  }
};

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "bot",
    text: "Hello! I'm the ABCD Agency Intelligent Assistant. How can I help you today? Ask me about our core packages, software services, custom quotes, or technical consulting.",
    actions: [
      { label: "Pricing & Packages", actionType: "pricing", icon: "package" },
      { label: "Our Services", actionType: "services", icon: "layers" },
      { label: "Direct Contact", actionType: "contact", icon: "phone" },
      {
        label: "Chat on WhatsApp",
        href: "https://wa.me/918167685731?text=Hi%20ABCD%20Agency,%20I%20would%20like%20to%20discuss%20a%20project.",
        icon: "whatsapp",
      },
    ],
    timestamp: "Just now",
  },
];

export function SmartChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isOpen]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  const generateSmartResponse = (
    query: string
  ): { text: string; actions?: ActionItem[] } => {
    const q = query.toLowerCase().trim();

    // 1. Pricing / Packages / Cost
    if (
      q.includes("price") ||
      q.includes("cost") ||
      q.includes("package") ||
      q.includes("plan") ||
      q.includes("retainer") ||
      q.includes("how much") ||
      q.includes("budget") ||
      q.includes("rate") ||
      q.includes("investment")
    ) {
      return {
        text: "We offer 3 primary engagement models tailored for modern software projects:\n\n1. Starter / MVP Launch: Fixed project fee for foundational MVPs, high-performance marketing platforms, and product launches.\n2. Growth Retainer (Most Popular): Dedicated bi-weekly sprint cycles for continuous feature shipping and architecture scaling.\n3. Enterprise Architecture: Custom SLA, dedicated team allocation, and milestone-based enterprise engineering.",
        actions: [
          { label: "View Detailed Pricing Matrix", href: "/pricing", icon: "package" },
          { label: "Get a Custom Fixed Quote", href: "/contact", icon: "mail" },
          { label: "Chat on WhatsApp (+91 81676 85731)", href: "https://wa.me/918167685731", icon: "whatsapp" },
        ],
      };
    }

    // 2. Services / Tech Stack / What we do
    if (
      q.includes("service") ||
      q.includes("tech") ||
      q.includes("stack") ||
      q.includes("what do you do") ||
      q.includes("build") ||
      q.includes("develop") ||
      q.includes("mobile") ||
      q.includes("ai") ||
      q.includes("nextjs") ||
      q.includes("react")
    ) {
      return {
        text: "ABCD Agency specializes in full-stack software development and business digitalization:\n\n• Web & SaaS Applications: Scalable architectures built on Next.js, React, TypeScript, and Neon PostgreSQL.\n• AI Workflows & Automation: Custom LLM workflows, intelligent agent systems, and automated pipelines.\n• Mobile & Progressive Web Apps: High-performance PWAs and native-quality mobile solutions.\n• UI/UX & Product Design: Minimalist, black-and-white high-conversion design systems.\n• Cloud & DevOps: Serverless deployments on Vercel and AWS with 99.9% uptime SLA.",
        actions: [
          { label: "Explore All Services", href: "/services", icon: "layers" },
          { label: "View Client Case Studies", href: "/work", icon: "file" },
          { label: "Book Technical Discovery", href: "/contact", icon: "calendar" },
        ],
      };
    }

    // 3. Contact / Phone / WhatsApp / Email
    if (
      q.includes("contact") ||
      q.includes("call") ||
      q.includes("phone") ||
      q.includes("whatsapp") ||
      q.includes("email") ||
      q.includes("reach") ||
      q.includes("address") ||
      q.includes("location") ||
      q.includes("number")
    ) {
      return {
        text: "You can reach our engineering leads directly through any of these official channels:\n\n• Phone / Call: +91 89448 99747\n• WhatsApp: +91 81676 85731\n• Direct Email: sb.abcd321@gmail.com\n• Location: Tripura, India (Global Remote Delivery)\n\nWe guarantee a direct response from a technical lead within 24 hours.",
        actions: [
          { label: "Chat on WhatsApp Now", href: "https://wa.me/918167685731", icon: "whatsapp" },
          { label: "Call +91 89448 99747", href: "tel:+918944899747", icon: "phone" },
          { label: "Submit Online Inquiry", href: "/contact", icon: "mail" },
        ],
      };
    }

    // 4. Client Portal / Revisions / Tracking
    if (
      q.includes("portal") ||
      q.includes("revision") ||
      q.includes("ticket") ||
      q.includes("invoice") ||
      q.includes("login") ||
      q.includes("client area")
    ) {
      return {
        text: "Our proprietary Client Management Platform allows active clients to:\n\n• Track live project milestones & Kanban sprints\n• Submit and review design & code revision requests\n• Download verified invoices, receipts, and project deliverables\n• Access NDA and compliance documentation",
        actions: [
          { label: "Login to Client Portal", href: "/login", icon: "portal" },
          { label: "Register New Client Account", href: "/register", icon: "portal" },
        ],
      };
    }

    // 5. Timeline / How long
    if (
      q.includes("time") ||
      q.includes("long") ||
      q.includes("duration") ||
      q.includes("deadline")
    ) {
      return {
        text: "Project delivery timelines depend on scope:\n\n• MVP / Foundational Site: 2–4 weeks from brief sign-off.\n• Custom SaaS Platform: 6–10 weeks divided into bi-weekly production sprints.\n• Ongoing Retainers: Dedicated bi-weekly releases with real-time preview URLs.\n\nEvery sprint includes automated tests, security reviews, and mobile-first optimization.",
        actions: [
          { label: "Request Timeline Estimate", href: "/contact", icon: "calendar" },
          { label: "Chat on WhatsApp", href: "https://wa.me/918167685731", icon: "whatsapp" },
        ],
      };
    }

    // Default intelligent response
    return {
      text: "Thanks for reaching out! ABCD Agency is a full-stack digital product agency. We engineer high-performance web applications, AI automation tools, and scalable SaaS platforms.\n\nWould you like to review our pricing packages, check out our engineering services, or speak directly with our team on WhatsApp?",
      actions: [
        { label: "View Pricing Packages", href: "/pricing", icon: "package" },
        { label: "Explore Services", href: "/services", icon: "layers" },
        { label: "Chat on WhatsApp (+91 81676 85731)", href: "https://wa.me/918167685731", icon: "whatsapp" },
        { label: "Send an Email Brief", href: "/contact", icon: "mail" },
      ],
    };
  };

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputValue;
    if (!query.trim()) return;

    setHasInteracted(true);
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: query.trim(),
      timestamp: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsTyping(true);

    // Realistic smart response delay
    setTimeout(() => {
      const { text, actions } = generateSmartResponse(query);
      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: "bot",
        text,
        actions,
        timestamp: "Just now",
      };
      setIsTyping(false);
      setMessages((prev) => [...prev, botMsg]);
    }, 550);
  };

  const handleActionClick = (action: ActionItem) => {
    if (action.href) {
      window.open(action.href, action.href.startsWith("http") ? "_blank" : "_self");
      return;
    }

    if (action.actionType === "pricing") {
      handleSendMessage("Tell me about your pricing packages and costs");
    } else if (action.actionType === "services") {
      handleSendMessage("What services and technologies do you offer?");
    } else if (action.actionType === "contact") {
      handleSendMessage("How can I contact your engineering team?");
    }
  };

  return (
    <div className="fixed bottom-20 right-5 sm:bottom-22 sm:right-6 z-50 select-none">
      {/* 1. Chat Window Popover */}
      {isOpen && (
        <div className="flex flex-col w-[calc(100vw-32px)] sm:w-[380px] h-[520px] max-h-[80vh] rounded-2xl border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0A0A0A] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 mb-3">
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0E0E0E] flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center font-bold text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-xs sm:text-sm text-[#0A0A0A] dark:text-white">
                    ABCD Assistant
                  </h3>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[10px] text-[#737373] dark:text-neutral-400">
                  Online · AI Agency Guide
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 text-[#737373] dark:text-neutral-400">
              <button
                type="button"
                onClick={handleClearChat}
                title="Clear Conversation"
                className="p-1.5 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                title="Close Chat"
                className="p-1.5 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-[#1A1A1A] hover:text-[#0A0A0A] dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4 text-xs scrollbar-thin">
            {messages.map((msg) => {
              const isBot = msg.sender === "bot";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 ${isBot ? "justify-start" : "justify-end"}`}
                >
                  {isBot && (
                    <div className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-3 h-3" />
                    </div>
                  )}

                  <div className="max-w-[84%] space-y-2">
                    <div
                      className={`p-3 rounded-2xl leading-relaxed whitespace-pre-wrap ${
                        isBot
                          ? "bg-[#F5F5F5] dark:bg-[#141414] text-[#0A0A0A] dark:text-neutral-200 border border-[#E5E5E5] dark:border-[#262626] rounded-tl-sm shadow-2xs"
                          : "bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] rounded-tr-sm shadow-xs"
                      }`}
                    >
                      {msg.text}
                    </div>

                    {/* Action Chips */}
                    {isBot && msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {msg.actions.map((act, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleActionClick(act)}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#181818] text-[#0A0A0A] dark:text-neutral-200 hover:bg-[#0A0A0A] hover:text-white dark:hover:bg-white dark:hover:text-[#0A0A0A] transition-all text-[11px] font-medium cursor-pointer shadow-2xs"
                          >
                            {renderActionIcon(act.icon)}
                            <span>{act.label}</span>
                            {act.href ? (
                              <ExternalLink className="w-2.5 h-2.5 opacity-50 shrink-0" />
                            ) : (
                              <ChevronRight className="w-2.5 h-2.5 opacity-50 shrink-0" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center shrink-0">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="p-2.5 rounded-2xl bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-tl-sm flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#737373] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#737373] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#737373] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starters Row (if only initial message) */}
          {messages.length === 1 && (
            <div className="px-3.5 pb-2 pt-0 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px]">
              <button
                type="button"
                onClick={() => handleSendMessage("What are your packages?")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white whitespace-nowrap cursor-pointer transition-colors"
              >
                <Package className="w-3 h-3 text-current" />
                <span>Packages</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("How do I contact you?")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white whitespace-nowrap cursor-pointer transition-colors"
              >
                <Phone className="w-3 h-3 text-current" />
                <span>Contact</span>
              </button>
              <button
                type="button"
                onClick={() => handleSendMessage("How long does a project take?")}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-[#FAFAFA] dark:bg-[#141414] text-[#737373] hover:text-[#0A0A0A] dark:hover:text-white hover:border-[#0A0A0A] dark:hover:border-white whitespace-nowrap cursor-pointer transition-colors"
              >
                <Calendar className="w-3 h-3 text-current" />
                <span>Timeline</span>
              </button>
            </div>
          )}

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 sm:p-3 border-t border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#0E0E0E] flex items-center gap-2 shrink-0"
          >
            <input
              ref={inputRef}
              type="text"
              placeholder="Ask about packages, services, contact..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1 bg-[#F5F5F5] dark:bg-[#141414] border border-[#E5E5E5] dark:border-[#262626] rounded-xl px-3 py-2 text-xs text-[#0A0A0A] dark:text-white placeholder:text-[#737373] outline-none focus:ring-1 focus:ring-[#0A0A0A] dark:focus:ring-white transition-all"
            />
            <button
              type="submit"
              disabled={!inputValue.trim()}
              aria-label="Send message"
              className="w-8 h-8 rounded-xl bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer shrink-0 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}

      {/* 2. Floating Launcher Button (AI Chat on Top) */}
      <div className="flex items-center gap-2">
        {/* Welcome Tag (shown initially before first interaction) */}
        {!isOpen && !hasInteracted && (
          <div
            onClick={() => setIsOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#E5E5E5] dark:border-[#262626] bg-white dark:bg-[#111111] text-[#0A0A0A] dark:text-white text-xs font-semibold shadow-md cursor-pointer hover:border-[#0A0A0A] dark:hover:border-white transition-all animate-bounce"
          >
            <Bot className="w-3.5 h-3.5 text-current" />
            <span>Ask ABCD AI</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Close AI Chatbot" : "Open AI Chatbot"}
          className="relative group w-12 h-12 rounded-full border border-[#0A0A0A] dark:border-white bg-[#0A0A0A] text-white dark:bg-white dark:text-[#0A0A0A] shadow-xl flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black dark:focus-visible:ring-white"
        >
          {isOpen ? (
            <X className="w-5 h-5 transition-transform duration-150 rotate-90 group-hover:rotate-0" />
          ) : (
            <>
              <MessageSquare className="w-5 h-5 transition-transform group-hover:scale-110" />
              {/* Green online dot */}
              <span className="absolute top-0.5 right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 border-2 border-[#0A0A0A] dark:border-white" />
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

