"use client";

import { useState } from "react";
import SchemeSidePanel from "@/components/SchemeSidePanel";
import WorkflowCanvas from "@/components/WorkflowCanvas";
import { cn } from "@/lib/utils";

export default function ApplySchemePage() {
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);
  const [selectedSchemeId, setSelectedSchemeId] = useState("S1");

  /* 
    BACKEND LOGIC INTEGRATION:
    1. Fetch list of applied schemes for the current user on mount.
    2. Handle "Apply for New Scheme" button action (API POST).
    3. State management for tracking absolute positions of nodes if they need to be persisted 
       (the user said nodes can be moved "for fun", but usually n8n saves node positions).
  */

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-gray-50">
      {/* Side Panel */}
      <SchemeSidePanel
        isOpen={isSidePanelOpen}
        setIsOpen={setIsSidePanelOpen}
        selectedSchemeId={selectedSchemeId}
        onSelectScheme={(id) => setSelectedSchemeId(id)}
      />

      {/* Main Content (Canvas Area) */}
      <main
        className={cn(
          "flex-1 h-full transition-all duration-300 relative",
          isSidePanelOpen ? "ml-80" : "ml-0"
        )}
      >
        <WorkflowCanvas selectedSchemeId={selectedSchemeId} />
      </main>

      {/* Overlay for very small screens if side panel is open */}
      {isSidePanelOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-30 md:hidden"
          onClick={() => setIsSidePanelOpen(false)}
        />
      )}
    </div>
  );
}
