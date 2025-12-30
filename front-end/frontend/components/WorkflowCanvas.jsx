"use client";

import React, { useCallback, useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { Check, Loader2, AlertCircle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// Custom Node Component to match n8n style
const CustomNode = ({ data, selected }) => {
  const Icon = data.icon || Check;

  return (
    <div
      className={cn(
        "px-4 py-3 rounded-xl border-2 bg-[#fdfdfd] shadow-lg min-w-[200px] transition-all duration-300",
        selected
          ? "border-blue-500 ring-4 ring-blue-500/20"
          : "border-gray-200",
        data.isActive && "border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.2)]"
      )}
    >
      {/* Node Input Handle */}
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
            data.status === "completed"
              ? "bg-green-100 text-green-600"
              : data.status === "in-progress"
              ? "bg-blue-100 text-blue-600"
              : "bg-gray-100 text-gray-400"
          )}
        >
          {data.status === "in-progress" ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <Icon size={20} />
          )}
        </div>

        <div className="flex-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-0.5">
            {data.category}
          </p>
          <h3 className="text-sm font-bold text-gray-800">{data.label}</h3>
        </div>

        {data.status === "completed" && (
          <Check size={16} className="text-green-500" />
        )}
      </div>

      <div className="mt-3 text-[10px] text-gray-500 flex justify-between items-center bg-gray-50 -mx-4 px-4 py-1.5 border-t">
        <span>Step {data.step}</span>
        <span className="capitalize font-medium">
          {data.status.replace("-", " ")}
        </span>
      </div>

      {/* Node Output Handle */}
      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const initialNodes = [
  {
    id: "1",
    type: "custom",
    position: { x: 100, y: 150 },
    data: {
      label: "Biometric Scan",
      category: "IDENTITY",
      step: 1,
      status: "completed",
      icon: Check,
    },
  },
  {
    id: "2",
    type: "custom",
    position: { x: 400, y: 150 },
    data: {
      label: "KYC Verification",
      category: "AUTHENTICATION",
      step: 2,
      status: "in-progress",
      isActive: true,
      icon: Check,
    },
  },
  {
    id: "3",
    type: "custom",
    position: { x: 700, y: 50 },
    data: {
      label: "Credit Check",
      category: "FINANCE",
      step: 3,
      status: "pending",
      icon: AlertCircle,
    },
  },
  {
    id: "4",
    type: "custom",
    position: { x: 700, y: 250 },
    data: {
      label: "Manual Review",
      category: "APPROVAL",
      step: 3,
      status: "pending",
      icon: Clock,
    },
  },
  {
    id: "5",
    type: "custom",
    position: { x: 1000, y: 150 },
    data: {
      label: "Final Approval",
      category: "RESULT",
      step: 4,
      status: "pending",
      icon: Check,
    },
  },
];

const initialEdges = [
  {
    id: "e1-2",
    source: "1",
    target: "2",
    animated: true,
    style: { stroke: "#2563eb", strokeWidth: 3 },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    style: { stroke: "#cbd5e1", strokeWidth: 2 },
  },
  {
    id: "e2-4",
    source: "2",
    target: "4",
    style: { stroke: "#cbd5e1", strokeWidth: 2 },
  },
  {
    id: "e3-5",
    source: "3",
    target: "5",
    style: { stroke: "#cbd5e1", strokeWidth: 2 },
  },
  {
    id: "e4-5",
    source: "4",
    target: "5",
    style: { stroke: "#cbd5e1", strokeWidth: 2 },
  },
];

export default function WorkflowCanvas({ selectedSchemeId }) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((event, node) => {
    console.log("Node clicked:", node);
    if (node.id === "1") {
      // Logic for Biometric Scan Page navigation
      alert("Navigating to Biometric Scan Page...");
    }
  }, []);

  /* 
    BACKEND LOGIC INTEGRATION:
    1. useEffect(() => {
         // Fetch scheme workflow data based on selectedSchemeId
         // const data = await fetch(`/api/schemes/${selectedSchemeId}/workflow`)
         // setNodes(data.nodes)
         // setEdges(data.edges)
       }, [selectedSchemeId])

    2. Real-time updates:
       // Use WebSockets or polling to update node statuses as procedures complete
       // updateNodeStatus(nodeId, 'completed')
  */

  return (
    <div className="w-full h-full bg-[#f8fafc]">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 px-6 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-white/20 shadow-xl flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-xs font-bold text-gray-600">
            Active Workflow
          </span>
        </div>
        <div className="w-px h-4 bg-gray-200" />
        <span className="text-xs font-medium text-gray-500">
          Scheme ID: {selectedSchemeId || "None"}
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        // Restricting connection logic as per requirements
        nodesConnectable={false}
        elementsSelectable={true}
        nodesDraggable={true}
      >
        <Background
          variant="dots"
          gap={30}
          size={1.5}
          color="#d1d5db"
          className="bg-[#f8fafc]"
        />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.data.status === "completed") return "#22c55e";
            if (node.data.status === "in-progress") return "#2563eb";
            return "#cbd5e1";
          }}
          style={{ borderRadius: 12, overflow: "hidden" }}
        />
      </ReactFlow>
    </div>
  );
}
