"use client";

import { ApexOptions } from "apexcharts";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ChartTwoProps {
  monthlyCost: {
    data: Array<{ month: string; monthly_cost: string }>;
    status: string;
  };
  monthlySales: {
    data: Array<{ month: string; monthly_total: string }>;
    status: string;
  };
}

const ChartTwo: React.FC<ChartTwoProps> = ({ monthlyCost, monthlySales }) => {
  const chartData = useMemo(() => {
    // Get the most recent month's data for comparison
    const latestCost = monthlyCost?.data?.length > 0 
      ? parseInt(monthlyCost.data[monthlyCost.data.length - 1].monthly_cost)
      : 0;
    
    const latestSales = monthlySales?.data?.length > 0
      ? parseInt(monthlySales.data[monthlySales.data.length - 1].monthly_total)
      : 0;

    // Calculate daily averages (divide by 30 days)
    const dailyCost = latestCost / 30;
    const dailySales = latestSales / 30;

    // Generate weekly data (multiply daily average by 7)
    const weeklyCost = Array(7).fill(dailyCost);
    const weeklySales = Array(7).fill(dailySales);

    return {
      series: [
        {
          name: "Pengadaan",
          data: weeklyCost,
        },
        {
          name: "Penjualan",
          data: weeklySales,
        },
      ],
    };
  }, [monthlyCost, monthlySales]);

  const options: ApexOptions = {
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 335,
      stacked: false,
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
    },
    responsive: [
      {
        breakpoint: 1536,
        options: {
          plotOptions: {
            bar: {
              borderRadius: 0,
              columnWidth: "25%",
            },
          },
        },
      },
    ],
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 0,
        columnWidth: "25%",
        borderRadiusApplication: "end",
        borderRadiusWhenStacked: "last",
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    yaxis: {
      labels: {
        formatter: function (value) {
          return `Rp ${value.toLocaleString('id-ID')}`;
        },
      },
    },
    tooltip: {
      y: {
        formatter: function (value) {
          return `Rp ${value.toLocaleString('id-ID')}`;
        },
      },
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Satoshi",
      fontWeight: 500,
      fontSize: "14px",
      markers: {
        radius: 99,
      },
    },
    fill: {
      opacity: 1,
    },
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white p-7.5 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <div className="mb-4 justify-between gap-4 sm:flex">
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Weekly Overview
          </h4>
        </div>
      </div>

      <div>
        <div id="chartTwo" className="-mb-9 -ml-5">
          <ReactApexChart
            options={options}
            series={chartData.series}
            type="bar"
            height={350}
            width={"100%"}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartTwo;