"use client"

import { motion } from "framer-motion"
import { LucideIcon } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string
  change: string
  icon: LucideIcon
}

export function MetricCard({
  title,
  value,
  change,
  icon: Icon,
}: MetricCardProps) {
  return (
    <motion.div
      whileHover={{
        y: -10,
        scale: 1.03,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
      }}
      className="
  glass
  hover-scale
  relative
  overflow-hidden
  rounded-[32px]
  border
  border-white/5
  p-7
  shadow-2xl
"
    >
      <div
        className="
          absolute
          right-0
          top-0
          h-32
          w-32
          rounded-full
          bg-violet-500/20
          blur-3xl
        "
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-400">
            {title}
          </p>

          <div
            className="
              rounded-2xl
              bg-white/5
              p-3
            "
          >
            <Icon className="h-5 w-5 text-violet-300" />
          </div>
        </div>

        <h3 className="mt-6 text-4xl md:text-5xl font-black tracking-tight">
          {value}
        </h3>

        <p className="mt-3 text-sm text-emerald-400">
          {change}
        </p>
      </div>
    </motion.div>
  )
}