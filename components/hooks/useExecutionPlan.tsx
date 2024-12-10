import { WorkflowToExecutionPlan, WorkflowToExecutionPlanError } from "@/lib/workflow/executionPlan";
import { AppNode } from "@/types/app-nodes";
import { useReactFlow } from "@xyflow/react";
import { useCallback } from "react";
import useWorkflowValidation from "./useWorkflowValidation";
import { toast } from "sonner";

const useExecutionPlan = () => {
  const { toObject } = useReactFlow();
  const { setInvalidInputs, clearErrors } = useWorkflowValidation();

  const handleError = useCallback((error: any) => {
    switch(error.type) {
      case WorkflowToExecutionPlanError.NO_ENTRYPOINT:
        toast.error("No entrypoint found");
        break;
      case WorkflowToExecutionPlanError.INVALID_INPUTS:
        toast.error("Not all inputs values are set");
        setInvalidInputs(error.invalidElements);
        break;
      default:
        toast.error("Something went wrong");
        break;
    }
  }, [setInvalidInputs])

  const generateExecutionPlan = useCallback(() => {
    const { nodes, edges } = toObject();
    const { executionPlan, error } = WorkflowToExecutionPlan(nodes as AppNode[], edges);

    if (error) {
      handleError(error);
      return null;
    }

    clearErrors();
    return executionPlan;
  }, [toObject, handleError, clearErrors]);

  return generateExecutionPlan;
}

export default useExecutionPlan;