import { useContext } from "react";
import { WorkflowValidationContext } from "../context/WorkflowValidationContext";

export default function useWorkflowValidation() {
  const context = useContext(WorkflowValidationContext);

  if (!context) {
    throw new Error("useWorkflowValidation must be used within a worflow validation context");
  }

  return context;
}