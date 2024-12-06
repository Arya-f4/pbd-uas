"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";

interface Satuan {
  idsatuan: number;
  nama_satuan: string;
  status: number;
}

export default function SatuanPage() {
  const [units, setUnits] = useState<Satuan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Satuan | null>(null);
  const [formData, setFormData] = useState({
    nama_satuan: "",
    status: 1,
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const fetchUnits = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/satuan");
      const result = await response.json();
      if (result.data) {
        setUnits(result.data);
      }
    } catch (error) {
      alert("Failed to fetch units");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      nama_satuan: "",
      status: 1,
    });
    setEditingUnit(null);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/satuan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create unit");

      setPopupMessage("Unit created successfully");
      setShowPopup(true);
      setIsOpen(false);
      resetForm();
      fetchUnits();
    } catch (error) {
      alert("Failed to create unit");
    }
  };

  const handleUpdate = async () => {
    if (!editingUnit) return;

    try {
      const response = await fetch(`/api/satuan/${editingUnit.idsatuan}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update unit");

      setPopupMessage("Unit updated successfully");
      setShowPopup(true);
      setIsOpen(false);
      resetForm();
      fetchUnits();
    } catch (error) {
      alert("Failed to update unit");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this unit?")) return;

    try {
      const response = await fetch(`/api/satuan/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete unit");

      setPopupMessage("Unit deleted successfully");
      setShowPopup(true);
      fetchUnits();
    } catch (error) {
      alert("Failed to delete unit");
    }
  };

  const handleEdit = (unit: Satuan) => {
    setEditingUnit(unit);
    setFormData({
      nama_satuan: unit.nama_satuan,
      status: unit.status,
    });
    setIsOpen(true);
  };

  const columns = [
    {
      name: "ID",
      selector: (row: Satuan) => row.idsatuan,
      sortable: true,
    },
    {
      name: "Unit Name",
      selector: (row: Satuan) => row.nama_satuan,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: Satuan) => (row.status === 1 ? "Active" : "Inactive"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Satuan) => (
        <div className="space-x-2">
          <button
            onClick={() => handleEdit(row)}
            className="rounded bg-yellow-400 px-2 py-1 text-white"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.idsatuan)}
            className="rounded bg-red-500 px-2 py-1 text-white"
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-300">
          Unit Management
        </h1>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Add New Unit
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">
              {editingUnit ? "Edit Unit" : "Add New Unit"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Unit Name</label>
                <input
                  name="nama_satuan"
                  value={formData.nama_satuan}
                  onChange={handleInputChange}
                  placeholder="Enter unit name"
                  className="w-full rounded border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded border p-2"
                >
                  <option value={1}>Active</option>
                  <option value={0}>Inactive</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end space-x-2">
              <button
                onClick={() => setIsOpen(false)}
                className="rounded bg-gray-300 px-4 py-2"
              >
                Cancel
              </button>
              <button
                onClick={editingUnit ? handleUpdate : handleCreate}
                className="rounded bg-blue-500 px-4 py-2 text-white"
              >
                {editingUnit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed bottom-4 right-4 z-50 rounded bg-green-500 p-3 text-white shadow-lg">
          {popupMessage}
          <button onClick={() => setShowPopup(false)} className="ml-4">
            ×
          </button>
        </div>
      )}

      <DataTable
        columns={columns}
        data={units}
        progressPending={isLoading}
        pagination
        paginationRowsPerPageOptions={[10, 25, 50, 100]}
        highlightOnHover
        responsive
        subHeader
        subHeaderComponent={
          <input
            type="text"
            placeholder="Search..."
            className="rounded border p-2"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              const filteredData = units.filter((unit) =>
                unit.nama_satuan.toLowerCase().includes(searchTerm)
              );
              setUnits(filteredData);
            }}
          />
        }
      />
    </div>
  );
}