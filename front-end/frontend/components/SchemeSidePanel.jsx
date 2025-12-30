"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  FileText,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SchemeSidePanel({
  isOpen,
  setIsOpen,
  selectedSchemeId,
  onSelectScheme,
}) {
  // Sample data for schemes
  const appliedSchemes = [
    {
      id: "S1",
      name: "Personal Loan Scheme",
      status: "In Progress",
      progress: 40,
    },
    {
      id: "S2",
      name: "Home Mortgage Plan",
      status: "Completed",
      progress: 100,
    },
    { id: "S3", name: "Small Business Grant", status: "Pending", progress: 10 },
  ];

  return (
    <div
      className={cn(
        "fixed left-0 top-0 h-full bg-white border-r shadow-xl transition-all duration-300 z-40 flex flex-col",
        isOpen ? "w-80" : "w-0"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "absolute -right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg hover:bg-blue-700 transition-colors",
          !isOpen && "right-[-40px]"
        )}
      >
        {isOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
      </button>

      {isOpen && (
        <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-left-4 duration-300">
          <div className="p-6 border-bottom">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Your Schemes
            </h2>
            <Button className="w-full justify-start gap-2 bg-blue-600 hover:bg-blue-700">
              <Plus size={18} /> Apply for New Scheme
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {appliedSchemes.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => onSelectScheme(scheme.id)}
                className={cn(
                  "p-4 rounded-xl border-2 cursor-pointer transition-all hover:shadow-md",
                  selectedSchemeId === scheme.id
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-100 bg-white hover:border-blue-200"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                    {scheme.id}
                  </span>
                  {scheme.status === "Completed" ? (
                    <CheckCircle2 size={16} className="text-green-500" />
                  ) : (
                    <Clock size={16} className="text-amber-500" />
                  )}
                </div>
                <h3 className="font-bold text-gray-800 text-sm mb-2">
                  {scheme.name}
                </h3>

                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      scheme.status === "Completed"
                        ? "bg-green-500"
                        : "bg-blue-500"
                    )}
                    style={{ width: `${scheme.progress}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-500">
                  <span>Progress</span>
                  <span>{scheme.progress}%</span>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-gray-50 border-t">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                <FileText size={16} />
              </div>
              <p className="leading-tight">
                Need help with your application? <br />
                <span className="font-semibold text-blue-600 cursor-pointer">
                  Contact Support
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
