import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      primary: 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:bg-red-500',
      secondary: 'bg-white/8 text-white hover:bg-white/12',
      outline: 'border border-border bg-transparent text-white hover:bg-white/8',
      ghost: 'text-muted hover:bg-white/8 hover:text-white',
    },
    size: { sm: 'min-h-9 px-3', md: 'min-h-10 px-4', lg: 'min-h-12 px-5 text-base' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
