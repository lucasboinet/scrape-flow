import { AppNodeMissingInputs } from "@/types/app-nodes";
import { createContext, Dispatch, ReactNode, SetStateAction, useState } from "react";

type WorkflowValidationContextType = {
  invalidInputs: AppNodeMissingInputs[];
  setInvalidInputs: Dispatch<SetStateAction<AppNodeMissingInputs[]>>;
  clearErrors: () => void;
}

export const WorkflowValidationContext = createContext<WorkflowValidationContextType | null>(null);

export function WorkflowValidationContextProvider({ children }: { children: ReactNode }) {
  const [invalidInputs, setInvalidInputs] = useState<AppNodeMissingInputs[]>([]);

  const clearErrors = () => {
    setInvalidInputs([]);
  }
  
  return (
    <WorkflowValidationContext.Provider 
      value={{ invalidInputs, setInvalidInputs, clearErrors }}
    >
      {children}
      </WorkflowValidationContext.Provider>
  )
}