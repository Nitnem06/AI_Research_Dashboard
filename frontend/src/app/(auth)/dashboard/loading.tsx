export default function Loading() {
  return (
    <div className="space-y-8 animate-pulse">
      <div>
        <div className="h-10 w-72 rounded-xl bg-white/10" />

        <div className="mt-3 h-4 w-96 rounded-lg bg-white/5" />
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="
              h-36
              rounded-3xl
              border
              border-white/10
              bg-white/[0.03]
            "
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div
          className="
            lg:col-span-2
            h-[420px]
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
          "
        />

        <div
          className="
            h-[420px]
            rounded-3xl
            border
            border-white/10
            bg-white/[0.03]
          "
        />
      </div>
    </div>
  )
}