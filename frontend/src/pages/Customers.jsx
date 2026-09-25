import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from '../services/customers';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { Search, Plus, Edit2, Trash2, Eye, User, Phone, Mail, MapPin } from 'lucide-react';

const Customers = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Dialog State
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchCustomerList = async () => {
    setLoading(true);
    try {
      const data = await getCustomers(search);
      setCustomers(data);
    } catch (err) {
      console.error('Failed to fetch customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomerList();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreateModal = () => {
    setEditingCustomer(null);
    setFormData({ name: '', email: '', phone: '', address: '' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (customer, e) => {
    e.stopPropagation();
    setEditingCustomer(customer);
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData);
      } else {
        await createCustomer(formData);
      }
      setIsModalOpen(false);
      fetchCustomerList();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save customer details.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteCustomer(deletingId);
      setDeletingId(null);
      fetchCustomerList();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete customer.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'CUSTOMER NAME',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#FFD600] border-2 border-black font-black flex items-center justify-center text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-extrabold uppercase text-sm text-black block">{row.name}</span>
            <span className="text-[10px] font-bold text-neutral-500">{new Date(row.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'EMAIL ADDRESS',
      accessor: 'email',
      render: (row) => <span className="font-semibold text-xs text-neutral-800">{row.email}</span>,
    },
    {
      header: 'PHONE NUMBER',
      accessor: 'phone',
      render: (row) => <span className="font-bold text-xs text-black">{row.phone}</span>,
    },
    {
      header: 'TOTAL REQUESTS',
      accessor: 'request_count',
      render: (row) => (
        <span className="px-2 py-0.5 border-2 border-black font-black text-xs bg-neutral-100">
          {row.request_count} REQUESTS
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => navigate(`/customers/${row.id}`)}
            className="p-1.5 border-2 border-black bg-white hover:bg-neutral-100 font-bold"
            title="View Details"
          >
            <Eye className="w-4 h-4 text-black" />
          </button>
          <button
            onClick={(e) => handleOpenEditModal(row, e)}
            className="p-1.5 border-2 border-black bg-[#FFD600] hover:bg-yellow-400 font-bold"
            title="Edit Customer"
          >
            <Edit2 className="w-4 h-4 text-black" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeletingId(row.id)}
              className="p-1.5 border-2 border-black bg-[#FF3B30] text-white hover:bg-red-700 font-bold"
              title="Delete Customer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Search Controls */}
      <div className="brutal-card p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-72">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="SEARCH BY NAME, EMAIL, PHONE..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="brutal-input pl-9 text-xs font-bold w-full uppercase"
            />
          </div>
        </div>

        <Button variant="yellow" onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-1 inline-block" /> ADD NEW CUSTOMER
        </Button>
      </div>

      {/* Main Table Content */}
      {loading ? (
        <LoadingState message="SEARCHING CUSTOMER DIRECTORY..." />
      ) : customers.length === 0 ? (
        <EmptyState
          title="NO CUSTOMERS FOUND"
          message="No customer accounts match your criteria. Create your first customer to get started."
          actionText="ADD NEW CUSTOMER"
          onAction={handleOpenCreateModal}
          icon={User}
        />
      ) : (
        <Table
          columns={columns}
          data={customers}
          onRowClick={(row) => navigate(`/customers/${row.id}`)}
        />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'EDIT CUSTOMER ACCOUNT' : 'CREATE NEW CUSTOMER'}
      >
        <form onSubmit={handleSaveCustomer} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 border-2 border-black bg-[#FF3B30] text-white text-xs font-bold uppercase">
              {formError}
            </div>
          )}

          <Input
            label="FULL NAME / COMPANY NAME"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Apex Solutions Inc."
            required
          />

          <Input
            label="EMAIL ADDRESS"
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="contact@apexsolutions.com"
            required
          />

          <Input
            label="PHONE NUMBER"
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="+1-555-0100"
            required
          />

          <Input
            label="OFFICE ADDRESS"
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="100 Tech Plaza, Austin TX"
          />

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-black mt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="yellow" type="submit" disabled={submitting}>
              {submitting ? 'SAVING...' : editingCustomer ? 'UPDATE CUSTOMER' : 'CREATE CUSTOMER'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE CUSTOMER ACCOUNT"
        message="Are you sure you want to permanently delete this customer? All associated service requests and appointments will also be removed."
        confirmText="DELETE PERMANENTLY"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Customers;
