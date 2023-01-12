import React from "react";
import { Line } from "react-chartjs-2";

export default function LineChart({ chartData }) {
  const leg = chartData.datasets.length > 1 ? true : false;
  return (
    <div className="container flex w-full">
      <Line
        data={chartData}
        options={{
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: leg,
              onClick: (e) => e.stopPropagation(),
              labels: {
                boxWidth: 15,
              },
            },
          },
          scales: {
            y: {
              max: 10,
              min: 0,
            },
          },
          layout: {
            padding: {},
          },
        }}
      />
    </div>
  );
}
