"use client";

import React, { useRef, useState, useEffect } from "react";
import { X, Check, PenTool, Type, RotateCcw, ShieldCheck, Loader2 } from "lucide-react";

interface SignatureCanvasModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSign: (data: {
    signatureType: "DRAW" | "TYPE";
    signatureData: string;
    legalName: string;
    jobTitle: string;
  }) => Promise<void>;
  defaultName?: string;
  defaultTitle?: string;
  projectTitle?: string;
  agreementNumber?: string;
  isAmendment?: boolean;
}

export function SignatureCanvasModal({
  isOpen,
  onClose,
  onSign,
  defaultName = "",
  defaultTitle = "Authorized Signatory",
  projectTitle = "Project SOW",
  agreementNumber = "",
  isAmendment = false,
}: SignatureCanvasModalProps) {
  const [activeTab, setActiveTab] = useState<"DRAW" | "TYPE">("DRAW");
  const [legalName, setLegalName] = useState(defaultName);
  const [jobTitle, setJobTitle] = useState(defaultTitle);
  const [consentChecked, setConsentChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  useEffect(() => {
    if (defaultName && !legalName) {
      setLegalName(defaultName);
    }
  }, [defaultName]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage("");
      setConsentChecked(false);
      setIsSubmitting(false);
      setTimeout(initCanvas, 100);
    }
  }, [isOpen, activeTab]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Support ultra high-DPI displays (minimum 3x retina for crisp signatures)
    const rect = canvas.getBoundingClientRect();
    const width = rect.width > 0 ? rect.width : 520;
    const height = rect.height > 0 ? rect.height : 144;
    const dpr = Math.max(window.devicePixelRatio || 1, 3);
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = "#0A0A0A";
    ctx.lineWidth = 2.8;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  };

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
    setErrorMessage("");
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = (e?: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (isDrawing) {
      if (e) e.preventDefault();
      setIsDrawing(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    initCanvas();
    setHasDrawn(false);
  };

  const handleExecute = async () => {
    setErrorMessage("");

    if (!legalName.trim()) {
      setErrorMessage("Please enter the Authorized Signatory full legal name.");
      return;
    }

    if (!jobTitle.trim()) {
      setErrorMessage("Please enter your official job designation/title.");
      return;
    }

    let sigData = "";
    if (activeTab === "DRAW") {
      if (!hasDrawn || !canvasRef.current) {
        setErrorMessage("Please draw your signature on the signature pad.");
        return;
      }
      sigData = canvasRef.current.toDataURL("image/png", 1.0);
    } else {
      if (!legalName.trim()) {
        setErrorMessage("Please type your name to generate your digital signature.");
        return;
      }
      sigData = legalName.trim();
    }

    if (!consentChecked) {
      setErrorMessage("You must accept the legal authorization declaration to proceed.");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSign({
        signatureType: activeTab,
        signatureData: sigData,
        legalName: legalName.trim(),
        jobTitle: jobTitle.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to submit signature. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-xl w-full overflow-hidden my-6">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/70">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-black" />
              <h2 className="text-base font-semibold tracking-tight text-gray-950">
                {isAmendment ? "Re-Confirm & Execute Amended SOW" : "Execute Statement of Work"}
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {projectTitle} &bull; {agreementNumber || "Contract SOW"}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-black p-1 rounded-md transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Signatory Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Signatory Legal Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={legalName}
                onChange={(e) => setLegalName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                disabled={isSubmitting}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 mb-1.5">
                Official Job Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Managing Director / CEO"
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Mode Switcher */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                Signature Method
              </label>
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  type="button"
                  onClick={() => setActiveTab("DRAW")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition ${
                    activeTab === "DRAW"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <PenTool className="w-3.5 h-3.5" />
                  Draw
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("TYPE")}
                  className={`flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-md transition ${
                    activeTab === "TYPE"
                      ? "bg-white text-black shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <Type className="w-3.5 h-3.5" />
                  Type
                </button>
              </div>
            </div>

            {/* Signature Area */}
            {activeTab === "DRAW" ? (
              <div className="relative border border-gray-300 rounded-lg overflow-hidden bg-white shadow-inner">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 touch-none cursor-crosshair block"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-xs italic">
                    Draw your signature here using mouse, finger or stylus
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="absolute bottom-2 right-2 flex items-center gap-1 text-[11px] font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded border border-gray-200 transition shadow-xs"
                >
                  <RotateCcw className="w-3 h-3" />
                  Clear
                </button>
              </div>
            ) : (
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 flex flex-col justify-center min-h-[144px]">
                <p className="text-[11px] text-gray-500 mb-1 uppercase tracking-wider">Live Signature Preview</p>
                <div className="text-3xl italic text-gray-950 font-serif min-h-[48px] flex items-center">
                  {legalName.trim() || <span className="text-gray-400 text-sm italic font-sans">Type your legal name above to preview</span>}
                </div>
                <div className="border-t border-gray-200 mt-2 pt-1 text-[10px] text-gray-400 font-mono">
                  Executive Stylized Electronic Signature
                </div>
              </div>
            )}
          </div>

          {/* Legal Compliance Checkbox */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3.5">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={consentChecked}
                onChange={(e) => setConsentChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                disabled={isSubmitting}
              />
              <span className="text-xs text-gray-600 leading-relaxed">
                {isAmendment ? (
                  <>
                    I hereby declare that I am authorized to re-confirm and execute this amended Statement of Work on behalf of the Client.
                    I accept all revised commercial terms and milestones under{" "}
                    <strong className="text-gray-900 font-semibold">Section 10A of the Indian Information Technology Act, 2000</strong>.
                  </>
                ) : (
                  <>
                    I hereby declare that I am authorized to execute this Statement of Work on behalf of the Client.
                    I understand this digital execution constitutes a legally binding contract under{" "}
                    <strong className="text-gray-900 font-semibold">Section 10A of the Indian Information Technology Act, 2000</strong>.
                  </>
                )}
              </span>
            </label>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
              {errorMessage}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-medium text-gray-700 hover:text-black hover:bg-gray-200 rounded-md transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExecute}
            disabled={isSubmitting || !consentChecked}
            className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-black hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition shadow-sm cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                {isAmendment ? "Re-Confirming & Stamping..." : "Signing & Stamping..."}
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                {isAmendment ? "Re-Confirm & Legally Accept" : "Sign & Legally Accept"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
