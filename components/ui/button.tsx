import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva('inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold tracking-tight transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 disabled:pointer-events-none disabled:opacity-40 active:scale-[0.98]', {
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground shadow-[0_8px_30px_rgb(255_59_34_/_0.3)] hover:bg-primary-dim hover:shadow-[0_10px_35px_rgb(255_59_34_/_0.4)]',
      secondary: 'border border-border-bright bg-elevated text-white hover:bg-border/50',
      outline: 'border border-border-bright bg-transparent text-white hover:border-primary/50 hover:bg-primary/8',
      ghost: 'text-muted-foreground hover:bg-elevated hover:text-white',
      danger: 'border border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/18',
      success: 'bg-success/15 border border-success/30 text-success hover:bg-success/25',
    },
    size: { sm: 'min-h-11 rounded-md px-3 text-xs', md: 'min-h-11 px-4', lg: 'min-h-12 px-6 text-base' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
