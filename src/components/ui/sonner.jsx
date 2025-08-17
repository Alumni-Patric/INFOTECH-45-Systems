import { Toaster as Sonner } from "sonner";

const Toaster = ({
    ...props
}) => {
    return (
        <Sonner
            theme="light"
            className="toaster group"
            style={
                {
                    "--normal-bg": "hsl(var(--popover))",
                    "--normal-text": "hsl(var(--popover-foreground))",
                    "--normal-border": "hsl(var(--border))",
                    "--success-bg": "hsl(var(--success))",
                    "--success-text": "hsl(var(--success-foreground))",
                    "--success-border": "hsl(var(--success))",
                    "--error-bg": "hsl(var(--destructive))",
                    "--error-text": "hsl(var(--destructive-foreground))",
                    "--error-border": "hsl(var(--destructive))",
                    "--warning-bg": "hsl(var(--warning))",
                    "--warning-text": "hsl(var(--warning-foreground))",
                    "--warning-border": "hsl(var(--warning))",
                    "--info-bg": "hsl(var(--info))",
                    "--info-text": "hsl(var(--info-foreground))",
                    "--info-border": "hsl(var(--info))"
                }
            }
            {...props} />
    );
}

export { Toaster }
