"use client";

import React, { useState, useEffect } from "react";
import DataTable from 'react-data-table-component';
import { ArrowDown, ArrowUp } from 'lucide-react';

interface StockCard {
  idkartu_stok: number;
  transaction_type: string;
  item_name: string;
  quantity_in: number | null;
  quantity_out: number | null;
  stock: number | null;
  transaction_date: string;
}

interface StockSummary {
  item_name: string;
  total_in: number;
  total_out: number;
  current_stock: number;
}

export default function StockCardPage() {
  const [stockCards, setStockCards] = useState<StockCard[]>([]);
  const [summaries, setSummaries] = useState<StockSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStockCards = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/stock-card');
        const data = await response.json();
        if (Array.isArray(data)) {
          setStockCards(data);
          calculateSummaries(data);
        }
      } catch (error) {
        console.error('Error fetching stock cards:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStockCards();
  }, []);

  const calculateSummaries = (data: StockCard[]) => {
    const summaryMap = new Map<string, StockSummary>();

    data.forEach(card => {
      if (!summaryMap.has(card.item_name)) {
        summaryMap.set(card.item_name, {
          item_name: card.item_name,
          total_in: 0,
          total_out: 0,
          current_stock: card.stock || 0
        });
      }

      const summary = summaryMap.get(card.item_name)!;
      if (card.quantity_in) {
        summary.total_in += card.quantity_in;
      }
      if (card.quantity_out) {
        summary.total_out += card.quantity_out;
      }
      // Update current stock with the latest value
      if (card.stock !== null) {
        summary.current_stock = card.stock;
      }
    });

    setSummaries(Array.from(summaryMap.values()));
  };

  const columns = [
    {
      name: 'Date',
      selector: (row: StockCard) => row.transaction_date,
      sortable: true,
      format: (row: StockCard) => new Date(row.transaction_date).toLocaleString(),
    },
    {
      name: 'Item',
      selector: (row: StockCard) => row.item_name,
      sortable: true,
    },
    {
      name: 'Type',
      selector: (row: StockCard) => row.transaction_type,
      sortable: true,
      format: (row: StockCard) => row.transaction_type === 'M' ? 'Masuk' : 'Keluar',
    },
    {
      name: 'In',
      selector: (row: StockCard) => row.quantity_in,
      sortable: true,
      format: (row: StockCard) => row.quantity_in?.toString() || '-',
    },
    {
      name: 'Out',
      selector: (row: StockCard) => row.quantity_out,
      sortable: true,
      format: (row: StockCard) => row.quantity_out?.toString() || '-',
    },
    {
      name: 'Stock',
      selector: (row: StockCard) => row.stock,
      sortable: true,
      format: (row: StockCard) => row.stock?.toString() || '-',
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Stock Card</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-6">
        {summaries.map((summary) => (
          <div key={summary.item_name} className="bg-white shadow-md rounded-lg p-4">
            <div className="pb-2">
              <h2 className="text-lg font-semibold">{summary.item_name}</h2>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowUp className="mr-2 h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">Total In:</span>
                </div>
                <span className="font-medium">{summary.total_in}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ArrowDown className="mr-2 h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-600">Total Out:</span>
                </div>
                <span className="font-medium">{summary.total_out}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2 mt-2">
                <span className="text-sm font-medium">Current Stock:</span>
                <span className="font-bold">{summary.current_stock}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg p-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Stock Movement History</h2>
        </div>
        <DataTable
          columns={columns}
          data={stockCards}
          pagination
          responsive
          highlightOnHover
          progressPending={isLoading}
          defaultSortFieldId={1}
          defaultSortAsc={false}
        />
      </div>
    </div>
  );
}