"use client";

import React, { useState, useEffect } from "react";
import DataTable from 'react-data-table-component';
import { Trash2, Plus, Eye } from 'lucide-react';
import Link from 'next/link';

interface Barang {
  idbarang: number;
  nama: string;
  harga: number;
}

interface SalesItem {
  idbarang: number;
  nama_barang: string;
  harga_satuan: number;
  jumlah: number;
  subtotal: number;
}

interface MarginPenjualan {
  idmargin_penjualan: number;
  persen: number;
  created_at: string;
  updated_at: string;
  status: string;
  iduser: number;
}

interface Penjualan {
  idpenjualan: number;
  created_at: string;
  subtotal_nilai: number;
  ppn: number;
  total_nilai: number;
  iduser: number;
  username: string;
  idmargin_penjualan: number;
  margin_persen: number;
}

interface PenjualanDetail {
  iddetail_penjualan: number;
  harga_satuan: number;
  jumlah: number;
  sub_total: number;
  nama_barang: string;
}

export default function PenjualanPage() {
  const [items, setItems] = useState<Barang[]>([]);
  const [margins, setMargins] = useState<MarginPenjualan[]>([]);
  const [selectedItems, setSelectedItems] = useState<SalesItem[]>([]);
  const [selectedMargin, setSelectedMargin] = useState<number | null>(null);
  const [penjualanList, setPenjualanList] = useState<Penjualan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPenjualan, setSelectedPenjualan] = useState<Penjualan | null>(null);
  const [penjualanDetails, setPenjualanDetails] = useState<PenjualanDetail[]>([]);
  
  const [subtotalNilai, setSubtotalNilai] = useState<number>(0);
  const [ppn, setPpn] = useState<number>(0);
  const [totalNilai, setTotalNilai] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [itemsResponse, marginsResponse, penjualanResponse] = await Promise.all([
          fetch('/api/barang'),
          fetch('/api/margin-penjualan'),
          fetch('/api/penjualan')
        ]);
        
        const itemsData = await itemsResponse.json();
        const marginsData = await marginsResponse.json();
        const penjualanData = await penjualanResponse.json();
        
        if (itemsData.data) setItems(itemsData.data);
        if (marginsData.data) setMargins(marginsData.data);
        if (penjualanData.data) setPenjualanList(penjualanData.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const subtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * 0.11; // 11% PPN
    const total = subtotal + tax;

    setSubtotalNilai(subtotal);
    setPpn(tax);
    setTotalNilai(total);
  }, [selectedItems]);

  const handleAddItem = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const idbarang = parseInt(event.target.value);
    const item = items.find(i => i.idbarang === idbarang);
    if (!item) return;

    setSelectedItems(prev => [
      ...prev,
      {
        idbarang: item.idbarang,
        nama_barang: item.nama,
        harga_satuan: item.harga,
        jumlah: 1,
        subtotal: item.harga
      }
    ]);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setSelectedItems(prev => prev.map((item, i) => {
      if (i === index) {
        return {
          ...item,
          jumlah: quantity,
          subtotal: quantity * item.harga_satuan
        };
      }
      return item;
    }));
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleMarginChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedMargin(value ? parseInt(value) : null);
  };

  const handleSubmit = async () => {
    if (selectedItems.length === 0) {
      alert('Please add items to the sale');
      return;
    }

    if (selectedMargin === null) {
      alert('Please select a margin');
      return;
    }

    const salesData = {
      subtotal_nilai: subtotalNilai,
      ppn: ppn,
      total_nilai: totalNilai,
      iduser: 1, // Replace with actual user ID
      idmargin_penjualan: selectedMargin,
      details: selectedItems.map(item => ({
        idbarang: item.idbarang,
        harga_satuan: item.harga_satuan,
        jumlah: item.jumlah,
        subtotal: item.subtotal
      }))
    };

    try {
      const response = await fetch('/api/penjualan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(salesData),
      });

      const result = await response.json();

      if (response.ok) {
        alert('Sale recorded successfully!');
        setSelectedItems([]);
        setSelectedMargin(null);
        // Refresh the penjualan list
        const penjualanResponse = await fetch('/api/penjualan');
        const penjualanData = await penjualanResponse.json();
        if (penjualanData.data) {
          setPenjualanList(penjualanData.data);
        }
      } else {
        alert(`Error: ${result.message || 'Failed to record sale'}`);
      }
    } catch (error) {
      console.error('Error submitting sale:', error);
      alert('An unexpected error occurred');
    }
  };

  const handleViewDetails = async (penjualan: Penjualan) => {
    setSelectedPenjualan(penjualan);
    try {
      const response = await fetch(`/api/penjualan/${penjualan.idpenjualan}`);
      const result = await response.json();
      if (result.data) {
        setPenjualanDetails(result.data);
        setIsModalOpen(true);
      } else {
        console.error('Failed to fetch sale details:', result);
        alert('Failed to fetch sale details');
      }
    } catch (error) {
      console.error('Error fetching sale details:', error);
      alert('An unexpected error occurred while fetching sale details');
    }
  };

  const columns = [
    {
      name: 'Item Name',
      selector: (row: SalesItem) => row.nama_barang,
      sortable: true,
    },
    {
      name: 'Unit Price',
      selector: (row: SalesItem) => row.harga_satuan,
      sortable: true,
      format: (row: SalesItem) => `Rp ${row.harga_satuan.toLocaleString()}`,
    },
    {
      name: 'Quantity',
      cell: (row: SalesItem, index: number) => (
        <input
          type="number"
          min="1"
          value={row.jumlah}
          onChange={(e) => handleQuantityChange(index, parseInt(e.target.value) || 0)}
          className="w-20 border rounded py-1 px-2"
        />
      ),
    },
    {
      name: 'Subtotal',
      selector: (row: SalesItem) => row.subtotal,
      sortable: true,
      format: (row: SalesItem) => `Rp ${row.subtotal.toLocaleString()}`,
    },
    {
      name: 'Actions',
      cell: (row: SalesItem, index: number) => (
        <button
          onClick={() => handleRemoveItem(index)}
          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      ),
    },
  ];

  const penjualanColumns = [
    {
      name: 'ID',
      selector: (row: Penjualan) => row.idpenjualan,
      sortable: true,
    },
    {
      name: 'Date',
      selector: (row: Penjualan) => row.created_at,
      sortable: true,
      format: (row: Penjualan) => new Date(row.created_at).toLocaleString(),
    },
    {
      name: 'Subtotal',
      selector: (row: Penjualan) => row.subtotal_nilai,
      sortable: true,
      format: (row: Penjualan) => `Rp ${row.subtotal_nilai.toLocaleString()}`,
    },
    {
      name: 'PPN',
      selector: (row: Penjualan) => row.ppn,
      sortable: true,
      format: (row: Penjualan) => `Rp ${row.ppn.toLocaleString()}`,
    },
    {
      name: 'Total',
      selector: (row: Penjualan) => row.total_nilai,
      sortable: true,
      format: (row: Penjualan) => `Rp ${row.total_nilai.toLocaleString()}`,
    },
    {
      name: 'User',
      selector: (row: Penjualan) => row.username,
      sortable: true,
    },
    {
      name: 'Margin',
      selector: (row: Penjualan) => row.margin_persen,
      sortable: true,
      format: (row: Penjualan) => `${row.margin_persen}%`,
    },
    {
      name: 'Actions',
      cell: (row: Penjualan) => (
        <button
          onClick={() => handleViewDetails(row)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded"
        >
          <Eye className="h-4 w-4" />
        </button>
      ),
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">New Sale</h1>
          <Link href="/penjualan/margin" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded inline-flex items-center">
            <Plus className="h-4 w-4 mr-2" />
            Add New Margin
          </Link>
        </div>
        <div className="mb-4 flex gap-4">
          <div className="flex-1">
            <select
              onChange={handleAddItem}
              className="block w-full bg-white border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:border-blue-500"
            >
              <option value="">Add item to sale</option>
              {items.map((item) => (
                <option key={item.idbarang} value={item.idbarang}>
                  {item.nama} - Rp {item.harga.toLocaleString()}
                </option>
              ))}
            </select>
          </div>
          <div className="w-48">
            <select
              value={selectedMargin !== null ? selectedMargin.toString() : ""}
              onChange={handleMarginChange}
              className="block w-full bg-white border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:border-blue-500"
            >
              <option value="">Select margin</option>
              {margins.map((margin) => (
                <option 
                  key={margin.idmargin_penjualan} 
                  value={margin.idmargin_penjualan.toString()}
                >
                  {margin.persen}%
                </option>
              ))}
            </select>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={selectedItems}
          pagination
          responsive
          highlightOnHover
        />

        <div className="mb-4 text-right">
          <div className="mb-2">
            <span className="font-medium">Subtotal:</span> Rp {subtotalNilai.toLocaleString()}
          </div>
          <div className="mb-2">
            <span className="font-medium">PPN (11%):</span> Rp {ppn.toLocaleString()}
          </div>
          <div className="text-xl font-bold">
            <span className="font-medium">Total:</span> Rp {totalNilai.toLocaleString()}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Submit Sale
          </button>
        </div>
      </div>

      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <h2 className="text-xl font-bold mb-4">Sales History</h2>
        <DataTable
          columns={penjualanColumns}
          data={penjualanList}
          pagination
          responsive
          highlightOnHover
          progressPending={isLoading}
        />
      </div>

      {isModalOpen && selectedPenjualan && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Sale Details</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Sale ID: {selectedPenjualan.idpenjualan}
                </p>
                <p className="text-sm text-gray-500">
                  Date: {new Date(selectedPenjualan.created_at).toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">
                  Total: Rp {selectedPenjualan.total_nilai?.toLocaleString() ?? 'N/A'}
                </p>
                <div className="mt-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {penjualanDetails.map((detail) => (
                        <tr key={detail.iddetail_penjualan}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detail.nama_barang}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{detail.jumlah}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rp {detail.harga_satuan?.toLocaleString() ?? 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Rp {detail.sub_total?.toLocaleString() ?? 'N/A'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="items-center px-4 py-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}