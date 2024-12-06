"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";

interface Penjualan {
  idpenjualan: number;
  sale_date: string;
  subtotal: number;
  tax: number;
  total: number;
  handled_by: string;
}

interface DetailPenjualan {
  iddetail_penjualan: number;
  item_name: string;
  unit_price: number;
  quantity: number;
  sub_total: number;
}

interface Barang {
  idbarang: number;
  item_name: string;
  unit_name: string;
  stock: number;
}

interface MarginPenjualan {
  idmargin_penjualan: number;
  margin_percentage: number;
}

export default function PenjualanPage() {
  const [penjualan, setPenjualan] = useState<Penjualan[]>([]);
  const [detailPenjualan, setDetailPenjualan] = useState<DetailPenjualan[]>([]);
  const [barang, setBarang] = useState<Barang[]>([]);
  const [marginPenjualan, setMarginPenjualan] = useState<MarginPenjualan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPenjualan, setSelectedPenjualan] = useState<Penjualan | null>(null);
  const [formData, setFormData] = useState({
    iduser: 1, // Assuming a default user ID, you might want to get this from authentication
    idmargin_penjualan: 0,
    details: [{ idbarang: 0, jumlah: 0, harga_satuan: 0 }],
  });

  const fetchPenjualan = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/penjualan");
      const result = await response.json();
      if (result.data) {
        setPenjualan(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch penjualan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBarang = async () => {
    try {
      const response = await fetch("/api/barang");
      const result = await response.json();
      if (result.data) {
        setBarang(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch barang:", error);
    }
  };

  const fetchMarginPenjualan = async () => {
    try {
      const response = await fetch("/api/margin-penjualan");
      const result = await response.json();
      if (result.data) {
        setMarginPenjualan(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch margin penjualan:", error);
    }
  };

  const fetchDetailPenjualan = async (idpenjualan: number) => {
    try {
      const response = await fetch(`/api/penjualan/${idpenjualan}`);
      const result = await response.json();
      if (result.data) {
        setDetailPenjualan(result.data);
      }
    } catch (error) {
      console.error("Failed to fetch detail penjualan:", error);
    }
  };

  useEffect(() => {
    fetchPenjualan();
    fetchBarang();
    fetchMarginPenjualan();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDetailChange = (index: number, e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const updatedDetails = [...formData.details];
    updatedDetails[index] = { ...updatedDetails[index], [name]: parseFloat(value) };
    
    if (name === 'idbarang') {
      const selectedBarang = barang.find(b => b.idbarang === parseInt(value));
      if (selectedBarang) {
        const selectedMargin = marginPenjualan.find(m => m.idmargin_penjualan === formData.idmargin_penjualan);
        const marginMultiplier = selectedMargin ? 1 + (selectedMargin.margin_percentage / 100) : 1;
        updatedDetails[index].harga_satuan = selectedBarang.unit_price * marginMultiplier;
      }
    }
    
    setFormData(prev => ({ ...prev, details: updatedDetails }));
  };

  const addDetailRow = () => {
    setFormData(prev => ({
      ...prev,
      details: [...prev.details, { idbarang: 0, jumlah: 0, harga_satuan: 0 }],
    }));
  };

  const removeDetailRow = (index: number) => {
    setFormData(prev => ({
      ...prev,
      details: prev.details.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/penjualan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setIsOpen(false);
        fetchPenjualan();
      } else {
        throw new Error("Failed to save penjualan");
      }
    } catch (error) {
      console.error("Error saving penjualan:", error);
    }
  };

  const columns = [
    { name: "ID", selector: (row: Penjualan) => row.idpenjualan, sortable: true },
    { name: "Date", selector: (row: Penjualan) => new Date(row.sale_date).toLocaleString(), sortable: true },
    { name: "Subtotal", selector: (row: Penjualan) => row.subtotal.toFixed(2), sortable: true },
    { name: "Tax", selector: (row: Penjualan) => row.tax.toFixed(2), sortable: true },
    { name: "Total", selector: (row: Penjualan) => row.total.toFixed(2), sortable: true },
    { name: "Handled By", selector: (row: Penjualan) => row.handled_by, sortable: true },
    {
      name: "Actions",
      cell: (row: Penjualan) => (
        <button
          onClick={() => {
            setSelectedPenjualan(row);
            fetchDetailPenjualan(row.idpenjualan);
          }}
          className="bg-blue-500 text-white p-2 rounded mr-2"
        >
          View Details
        </button>
      ),
    },
  ];

  const detailColumns = [
    { name: "Product", selector: (row: DetailPenjualan) => row.item_name, sortable: true },
    { name: "Quantity", selector: (row: DetailPenjualan) => row.quantity, sortable: true },
    { name: "Unit Price", selector: (row: DetailPenjualan) => row.unit_price.toFixed(2), sortable: true },
    { name: "Subtotal", selector: (row: DetailPenjualan) => row.sub_total.toFixed(2), sortable: true },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Sales Management</h1>
      <button
        onClick={() => {
          setSelectedPenjualan(null);
          setFormData({
            iduser: 1,
            idmargin_penjualan: 0,
            details: [{ idbarang: 0, jumlah: 0, harga_satuan: 0 }],
          });
          setIsOpen(true);
        }}
        className="bg-green-500 text-white p-2 rounded mb-4"
      >
        Add New Sale
      </button>

      <DataTable
        title="Sales"
        columns={columns}
        data={penjualan}
        pagination
        progressPending={isLoading}
      />

      {selectedPenjualan && (
        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">
            Sale Details for ID: {selectedPenjualan.idpenjualan}
          </h2>
          <DataTable
            columns={detailColumns}
            data={detailPenjualan}
            pagination
            progressPending={isLoading}
          />
        </div>
      )}
      </div>
      )};