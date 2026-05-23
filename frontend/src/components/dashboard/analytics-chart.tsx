"use client"

import dynamic from "next/dynamic"

const Chart = dynamic(
  () => import("react-apexcharts"),
  { ssr: false }
)

export function AnalyticsChart() {
  const series = [
    {
      name: "Research Activity",
      data: [32, 45, 41, 58, 62, 75, 82],
    },
    {
      name: "AI Insights",
      data: [18, 25, 35, 48, 52, 68, 74],
    },
  ]

  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "area",
      toolbar: {
        show: false,
      },
      background: "transparent",
      foreColor: "#a1a1aa",
    },

    stroke: {
      curve: "smooth",
      width: 3,
    },

    dataLabels: {
      enabled: false,
    },

    grid: {
      borderColor: "rgba(255,255,255,0.06)",
    },

    xaxis: {
      categories: [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Sun",
      ],

      labels: {
        style: {
          colors: "#71717a",
        },
      },
    },

    yaxis: {
      labels: {
        style: {
          colors: "#71717a",
        },
      },
    },

    legend: {
      labels: {
        colors: "#d4d4d8",
      },
    },

    fill: {
      type: "gradient",

      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
      },
    },

    colors: [
      "#8b5cf6",
      "#ec4899",
    ],

    tooltip: {
      theme: "dark",
    },
  }

  return (
    <div className="h-[320px]">
      <Chart
        options={options}
        series={series}
        type="area"
        height="100%"
      />
    </div>
  )
}