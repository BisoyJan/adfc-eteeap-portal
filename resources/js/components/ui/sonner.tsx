import type { ComponentProps } from "react"
import { Toaster as Sonner } from "sonner"

import { cn } from "@/lib/utils"

function Toaster({ className, ...props }: ComponentProps<typeof Sonner>) {
    return (
        <Sonner
            className={cn("toaster group", className)}
            toastOptions={{
                classNames: {
                    toast: "group toast bg-background text-foreground border border-border shadow-lg",
                    description: "text-muted-foreground",
                    actionButton: "bg-primary text-primary-foreground",
                    cancelButton: "bg-muted text-muted-foreground",
                },
            }}
            {...props}
        />
    )
}

export { Toaster }
