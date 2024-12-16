"use client";

import React, { useState, useEffect } from 'react';
import DataTable from 'react-data-table-component';
import Link from 'next/link';

interface MarginPenjualan {
  idmargin_penjualan: number;
  persen: number;
  created_at: string;
  updated_at: string;
  status: string;
}

export default function MarginPage() {
  const [margins, setMargins] = useState<MarginPenjualan[]>([]);
  const [newMargin, setNewMargin] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMargins();
  }, []);

  const fetchMargins = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/margin-penjualan');
      const data = await response.json();
      if (data.data) {
        setMargins(data.data);
      }
    } catch (error) {
      console.error('Error fetching margins:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/margin-penjualan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ persen: newMargin }),
      });

      if (response.ok) {
        alert('Margin added successfully!');
        setNewMargin(0);
        fetchMargins();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.message || 'Failed to add margin'}`);
      }
    } catch (error) {
      console.error('Error adding margin:', error);
      alert('An unexpected error occurred');
    }
  };

  const columns = [
    {
      name: 'ID',
      selector: (row: MarginPenjualan) => row.idmargin_penjualan,
      sortable: true,
    },
    {
      name: 'Percentage',
      selector: (row: MarginPenjualan) => row.persen,
      sortable: true,
      format: (row: MarginPenjualan) => `${row.persen}%`,
    },
    {
      name: 'Created At',
      selector: (row: MarginPenjualan) => row.created_at,
      sortable: true,
      format: (row: MarginPenjualan) => new Date(row.created_at).toLocaleString(),
    },
    {
      name: 'Updated At',
      selector: (row: MarginPenjualan) => row.updated_at,
      sortable: true,
      format: (row: MarginPenjualan) => new Date(row.updated_at).toLocaleString(),
    },
    {
      name: 'Status',
      selector: (row: MarginPenjualan) => row.status,
      sortable: true,
    },
  ];

  return (
    <div className="container mx-auto p-4">
     <Link href="/penjualan/" className="bg-blue-500 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded inline-flex items-center">
            Back To Penjualan
          </Link>
      <h1 className="text-2xl font-bold mb-4">Manage Sales Margins</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex items-center space-x-4">
          <input
            type="number"
            value={newMargin}
            onChange={(e) => setNewMargin(Number(e.target.value))}
            placeholder="Enter margin percentage"
            className="border rounded py-2 px-3 w-48"
            min="0"
            max="100"
            step="0.01"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Add New Margin
          </button>
        </div>
      </form>

      <DataTable
        title="Existing Margins"
        columns={columns}
        data={margins}
        progressPending={isLoading}
        pagination
        responsive
      />
    </div>
  );
}