"use client";
import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";

interface Vendor {
  idvendor: number;
  vendor_name: string;
  legal_status: string;
  status: string;
}

const Vendor: React.FC = () => {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState({
    nama_vendor: "",
    badan_hukum: "",
    status: "1",
  });
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");

  const fetchVendors = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/vendor");
      const result = await response.json();
      if (result.data) {
        setVendors(result.data);
      }
    } catch (error) {
      alert("Failed to fetch vendors");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData({
      nama_vendor: "",
      badan_hukum: "E",
      status: "0",
    });
    setEditingVendor(null);
  };

  const handleCreate = async () => {
    try {
      const response = await fetch("/api/vendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to create vendor");

      setPopupMessage("Vendor created successfully");
      setShowPopup(true);

      setIsOpen(false);
      resetForm();
      fetchVendors();
    } catch (error) {
      alert("Failed to create vendor");
    }
  };

  const handleUpdate = async () => {
    if (!editingVendor) return;

    try {
      const response = await fetch(`/api/vendor/${editingVendor.idvendor}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update vendor");

      setPopupMessage("Vendor updated successfully");
      setShowPopup(true);

      setIsOpen(false);
      resetForm();
      fetchVendors();
    } catch (error) {
      alert("Failed to update vendor");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this vendor?")) return;

    try {
      const response = await fetch(`/api/vendor/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete vendor");

      setPopupMessage("Vendor deleted successfully");
      setShowPopup(true);

      fetchVendors();
    } catch (error) {
      alert("Failed to delete vendor");
    }
  };

  const handleEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      nama_vendor: vendor.vendor_name,
      badan_hukum: vendor.legal_status,
      status: vendor.status,
    });
    setIsOpen(true);
  };

  const columns = [
    {
      name: "ID Vendor",
      selector: (row: Vendor) => row.idvendor,
      sortable: true,
    },
    {
      name: "Vendor Name",
      selector: (row: Vendor) => row.vendor_name,
      sortable: true,
    },
    {
      name: "Business Entity",
      selector: (row: Vendor) => row.legal_status,
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: Vendor) => (row.status === "1" ? "Active" : "Inactive"),
      sortable: true,
    },
    {
      name: "Actions",
      cell: (row: Vendor) => (
        <div className="space-x-2 text-right">
          <button
            onClick={() => handleEdit(row)}
            className="rounded bg-yellow-400 px-2 py-1 text-white"
          >
            Edit
          </button>
          <button
            onClick={() => handleDelete(row.idvendor)}
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
          Vendor Management
        </h1>
        <button
          onClick={() => setIsOpen(true)}
          className="rounded bg-blue-500 px-4 py-2 text-white"
        >
          Add New Vendor
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-gray-50 bg-opacity-50">
          <div className="w-96 rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-lg font-semibold">
              {editingVendor ? "Edit Vendor" : "Add New Vendor"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Vendor Name</label>
                <input
                  name="nama_vendor"
                  value={formData.nama_vendor}
                  onChange={handleInputChange}
                  placeholder="Enter vendor name"
                  className="w-full rounded border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">
                  Legal Status
                </label>
                <input
                  name="badan_hukum"
                  value={formData.badan_hukum}
                  onChange={handleInputChange}
                  maxLength={1}
                  placeholder="Enter Badan Hukum"
                  className="w-full rounded border p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Status</label>
                <select
                  title="Status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full rounded border p-2"
                >
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
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
                onClick={editingVendor ? handleUpdate : handleCreate}
                className="rounded bg-blue-500 px-4 py-2 text-white"
              >
                {editingVendor ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div className="fixed bottom-4 right-4 z-99 rounded bg-green-500 p-3 text-white shadow-lg">
          {popupMessage}
          <button onClick={() => setShowPopup(false)} className="ml-4">
            Close
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900" />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={vendors}
          progressPending={isLoading}
          pagination
          paginationRowsPerPageOptions={[10, 25, 50, 100]}
          highlightOnHover
          subHeader
          subHeaderComponent={
            <input
              type="text"
              placeholder="Search..."
              onChange={(e) =>
                setVendors(
                  vendors.filter((vendor) =>
                    vendor.vendor_name
                      .toLowerCase()
                      .includes(e.target.value.toLowerCase()),
                  ),
                )
              }
              className="rounded border p-2 dark:bg-gray-800"
            />
          }
        />
      )}
    </div>
  );
};

export default Vendor;
