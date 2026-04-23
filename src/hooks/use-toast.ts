import * as React from "react";
import type { ToastActionElement } from "@/components/ui/toast";

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: "default" | "destructive";
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

type Toast = Omit<ToasterToast, "id">;

let count = 0;
function genId() { count = (count + 1) % Number.MAX_SAFE_INTEGER; return count.toString(); }

const listeners: Array<(state: { toasts: ToasterToast[] }) => void> = [];
let memoryState: { toasts: ToasterToast[] } = { toasts: [] };

function dispatch(action: { type: string; toast?: ToasterToast; toastId?: string }) {
  switch (action.type) {
    case "ADD":
      memoryState = { toasts: [action.toast!, ...memoryState.toasts].slice(0, 3) };
      break;
    case "DISMISS":
      memoryState = { toasts: memoryState.toasts.map((t) => action.toastId ? (t.id === action.toastId ? { ...t, open: false } : t) : { ...t, open: false }) };
      setTimeout(() => dispatch({ type: "REMOVE", toastId: action.toastId }), 4000);
      break;
    case "REMOVE":
      memoryState = { toasts: action.toastId ? memoryState.toasts.filter((t) => t.id !== action.toastId) : [] };
      break;
  }
  listeners.forEach((l) => l(memoryState));
}

function toast(props: Toast) {
  const id = genId();
  dispatch({ type: "ADD", toast: { ...props, id, open: true, onOpenChange: (o) => { if (!o) dispatch({ type: "DISMISS", toastId: id }); } } });
  return { id, dismiss: () => dispatch({ type: "DISMISS", toastId: id }) };
}

function useToast() {
  const [state, setState] = React.useState(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const i = listeners.indexOf(setState); if (i > -1) listeners.splice(i, 1); };
  }, []);
  return { ...state, toast, dismiss: (id?: string) => dispatch({ type: "DISMISS", toastId: id }) };
}

export { useToast, toast };
