import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva('inline-flex min-h-10 items-center justify-center gap-2 rounded-2xl px-4 py-2 text-sm font-semibold tracking-[-0.01em] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 disabled:pointer-events-none disabled:opacity-50', {
  variants: {
    variant: {
      primary: 'bg-gradient-to-b from-[#ff5038] to-primary text-primary-foreground shadow-[0_18px_45px_rgb(255_59_34_/_0.24)] hover:translate-y-[-1px] hover:shadow-[0_22px_55px_rgb(255_59_34_/_0.32)]',
      secondary: 'border border-white/10 bg-white/[0.075] text-white shadow-inner shadow-white/5 hover:border-white/16 hover:bg-white/[0.11]',
      outline: 'border border-white/14 bg-black/20 text-white backdrop-blur hover:border-primary/45 hover:bg-primary/10',
      ghost: 'text-muted hover:bg-white/[0.07] hover:text-white',
      danger: 'border border-red-400/30 bg-red-500/10 text-red-100 hover:bg-red-500/15',
    },
    size: { sm: 'min-h-9 rounded-xl px-3 text-xs', md: 'min-h-10 px-4', lg: 'min-h-12 px-5 text-base' },
  },
  defaultVariants: { variant: 'primary', size: 'md' },
})

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
