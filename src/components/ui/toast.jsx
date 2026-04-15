import * as React from "react";
import { cva } from "class-variance-authority";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = React.forwardRef(({ ...props }, ref) => (
  <div
    ref={ref}
    className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    {...props}
  />
));
ToastProvider.displayName = "ToastProvider";

const ToastViewport = React.forwardRef(({ ...props }, ref) => (
  <div
    ref={ref}
    className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
    {...props}
  />
));
ToastViewport.displayName = "ToastViewport";

const toastVariants = cva(
  "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all duration-300 transform data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:translate-y-0 data-[state=open]:opacity-100 data-[state=closed]:translate-y-2 data-[state=closed]:opacity-0",
  {
    variants: {
      variant: {
        default: "border-[#5A5A5A] bg-[#121212] text-[#F3F3F3] shadow-black/40",
        warning:
          "border-[#C28A1D] bg-[#2A2212] text-[#FFF3D6] shadow-black/50",
        destructive:
          "destructive group border-[#B54141] bg-[#3A1717] text-[#FFE0E0] shadow-black/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Toast = React.forwardRef(({ className, variant, open = true, ...props }, ref) => {
  // Ensure the DOM element has a data-state attribute so CSS using data-[state=open|closed]
  // can animate the toast in/out when `open` changes.
  return (
    <div
      ref={ref}
      className={cn(toastVariants({ variant }), className)}
      data-state={open ? 'open' : 'closed'}
      {...props}
    />
  );
});
Toast.displayName = "Toast";

const ToastAction = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-8 shrink-0 items-center justify-center rounded-md border border-[#595959] bg-transparent px-3 text-sm font-medium text-[#ECECEC] ring-offset-background transition-colors hover:bg-[#2A2A2A] focus:outline-none focus:ring-2 focus:ring-[#8A8A8A] focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 group-[.warning]:border-[#C28A1D] group-[.warning]:hover:bg-[#453415] group-[.destructive]:border-[#B54141] group-[.destructive]:hover:bg-[#5A1E1E]",
      className
    )}
    {...props}
  />
));
ToastAction.displayName = "ToastAction";

const ToastClose = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "absolute right-2 top-2 rounded-md p-1 text-[#BDBDBD] opacity-0 transition-opacity hover:text-white focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-[#8A8A8A] group-hover:opacity-100 group-[.warning]:text-[#E5C784] group-[.warning]:hover:text-[#FFF3D6] group-[.destructive]:text-[#F3A6A6] group-[.destructive]:hover:text-[#FFE0E0]",
      className
    )}
    toast-close=""
    {...props}
  >
    <X className="h-4 w-4" />
  </button>
));
ToastClose.displayName = "ToastClose";

const ToastTitle = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm font-semibold text-[#F5F5F5]", className)}
    {...props}
  />
));
ToastTitle.displayName = "ToastTitle";

const ToastDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-[#D3D3D3]", className)}
    {...props}
  />
));
ToastDescription.displayName = "ToastDescription";

export {
  ToastProvider,
  ToastViewport,
  Toast,
  ToastTitle,
  ToastDescription,
  ToastClose,
  ToastAction,
}; 