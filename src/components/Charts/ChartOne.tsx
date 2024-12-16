"use client";

import { ApexOptions } from "apexcharts";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface ChartOneProps {
  monthlyCost: {
    data: Array<{ month: string; monthly_cost: string }>;
    status: string;
  };
  monthlySales: {
    data: Array<{ month: string; monthly_total: string }>;
    status: string;
  };
}

const ChartOne: React.FC<ChartOneProps> = ({ monthlyCost, monthlySales }) => {
  console.log("The cost:",monthlyCost, monthlySales);
  const chartData = useMemo(() => {
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];

    const costData = new Array(12).fill(0);
    const salesData = new Array(12).fill(0);

    // Process monthlyCost data
    if (monthlyCost?.data) {
      monthlyCost.data.forEach(item => {
        const date = new Date(item.month);
        const monthIndex = date.getMonth();
        costData[monthIndex] = parseInt(item.monthly_cost);
      });
    }

    // Process monthlySales data
    if (monthlySales?.data) {
      monthlySales.data.forEach(item => {
        const date = new Date(item.month);
        const monthIndex = date.getMonth();
        salesData[monthIndex] = parseInt(item.monthly_total);
      });
    }

    return {
      categories: months,
      series: [
        {
          name: "Pengadaan",
          data: costData,
        },
        {
          name: "Penjualan",
          data: salesData,
        },
      ],
    };
  }, [monthlyCost, monthlySales]);

  const options: ApexOptions = {
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#3C50E0", "#80CAEE"],
    chart: {
      fontFamily: "Satoshi, sans-serif",
      height: 335,
      type: "area",
      toolbar: {
        show: false,
      },
    },
    stroke: {
      width: [2, 2],
      curve: "smooth",
    },
    grid: {
      show: true,
      borderColor: "#E2E8F0",
      strokeDashArray: 4,
      padding: {
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
      },
    },
    dataLabels: {
      enabled: false,
    },
    markers: {
      size: 4,
      colors: "#fff",
      strokeColors: ["#3C50E0", "#80CAEE"],
      strokeWidth: 3,
      strokeOpacity: 0.9,
      fillOpacity: 1,
      discrete: [],
      hover: {
        size: undefined,
        sizeOffset: 5,
      },
    },
    xaxis: {
      type: "category",
      categories: chartData.categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      title: {
        style: {
          fontSize: "0px",
        },
      },
      min: 0,
      max: Math.max(
        ...chartData.series[0].data,
        ...chartData.series[1].data
      ) * 1.1,
      labels: {
        formatter: function (value) {
          return value.toLocaleString('id-ID');
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
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pb-5 pt-7.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-8">
      <div className="flex flex-wrap items-start justify-between gap-3 sm:flex-nowrap">
        <div className="flex w-full flex-wrap gap-3 sm:gap-5">
          <div className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-primary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-primary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-primary">Pengadaan</p>
              <p className="text-sm font-medium">Jan - Dec</p>
            </div>
          </div>
          <div className="flex min-w-47.5">
            <span className="mr-2 mt-1 flex h-4 w-full max-w-4 items-center justify-center rounded-full border border-secondary">
              <span className="block h-2.5 w-full max-w-2.5 rounded-full bg-secondary"></span>
            </span>
            <div className="w-full">
              <p className="font-semibold text-secondary">Penjualan</p>
              <p className="text-sm font-medium">Jan - Dec</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <div id="chartOne" className="-ml-5">
          <ReactApexChart
            options={options}
            series={chartData.series}
            type="area"
            height={350}
            width={"100%"}
          />
        </div>
      </div>
    </div>
  );
};

export default ChartOne;