"use client"

import * as React from "react"
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group"
import { Radio } from "@base-ui/react/radio"

import { cn } from "@/lib/utils"

function RadioGroup({
  className,
  ...props
}: BaseRadioGroup.Props) {
  return (
    <BaseRadioGroup
      className={cn("grid gap-3", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: Radio.Root.Props) {
  return (
    <Radio.Root
      data-slot="radio-group-item"
      className={cn(
        "peer group/radio flex size-5 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-blue-600",
        className
      )}
      {...props}
    >
      <Radio.Indicator className="size-2.5 rounded-full bg-blue-600" />
    </Radio.Root>
  )
}

export { RadioGroup, RadioGroupItem }
