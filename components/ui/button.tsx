import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

export const buttonVariants = cva('relative inline-flex min-h-11 items-center justify-center gap-2 overflow-hidden rounded-xl px-4 py-2 text-sm font-semibold tracking-tight transition-[transform,background-color,border-color,box-shadow,opacity] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-40 hover:-translate-y-0.5 active:scale-[0.97]', {
  variants: {
    variant: {
      primary: 'accent-gradient text-primary-foreground shadow-[0_8px_30px_rgb(255_59_34_/_0.3)] hover:shadow-[0_12px_40px_rgb(255_59_34_/_0.42)]',
      secondary: 'border border-border-bright bg-elevated text-white hover:bg-border/50',
      outline: 'border border-border-bright bg-transparent text-white hover:border-primary/50 hover:bg-primary/8',
      ghost: 'text-muted-foreground hover:bg-white/5 hover:text-white',
      danger: 'border border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/18',
      success: 'bg-success/15 border border-success/30 text-success hover:bg-success/25',
    },
    size: { sm: 'min-h-11 rounded-lg px-3 text-xs', md: 'min-h-11 px-4', lg: 'min-h-12 px-6 text-base' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
