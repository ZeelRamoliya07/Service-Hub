import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getServices, createService, updateService, deleteService } from '../services/services';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { Search, Plus, Edit2, Trash2, Wrench, Clock, DollarSign } from 'lucide-react';

const Services = () => {
  const { isAdmin } = useAuth();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', price: '', duration: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchServiceList = async () => {
    setLoading(true);
    try {
      const data = await getServices(search);
      setServices(data);
    } catch (err) {
      console.error('Failed to fetch services catalog:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchServiceList();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleOpenCreateModal = () => {
    setEditingService(null);
    setFormData({ name: '', description: '', price: '1500', duration: '60' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description || '',
      price: String(service.price),
      duration: String(service.duration),
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveService = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };

      if (editingService) {
        await updateService(editingService.id, payload);
      } else {
        await createService(payload);
      }
      setIsModalOpen(false);
      fetchServiceList();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save service offering.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteService(deletingId);
      setDeletingId(null);
      fetchServiceList();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete service offering.');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Controls Bar */}
      <div className="brutal-card p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
          <input
            type="text"
            placeholder="SEARCH SERVICES CATALOG..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="brutal-input pl-9 text-xs font-bold w-full uppercase"
          />
        </div>

        {isAdmin && (
          <Button variant="yellow" onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4 mr-1 inline-block" /> CREATE NEW SERVICE
          </Button>
        )}
      </div>

      {/* Main Services Cards Grid */}
      {loading ? (
        <LoadingState message="FETCHING SERVICE CATALOG..." />
      ) : services.length === 0 ? (
        <EmptyState
          title="NO SERVICES CATALOGED"
          message="No active service offerings found in the system catalog."
          actionText={isAdmin ? 'CREATE NEW SERVICE' : null}
          onAction={handleOpenCreateModal}
          icon={Wrench}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card
              key={service.id}
              title={service.name}
              accentColor="#FFD600"
              action={
                isAdmin && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEditModal(service)}
                      className="p-1 border-2 border-black bg-white hover:bg-neutral-100 font-bold"
                      title="Edit Service"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingId(service.id)}
                      className="p-1 border-2 border-black bg-[#FF3B30] text-white hover:bg-red-700 font-bold"
                      title="Delete Service"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              }
            >
              <p className="text-xs font-medium text-neutral-700 mb-4 min-h-[40px]">
                {service.description || 'No detailed specifications provided for this service.'}
              </p>

              <div className="pt-3 border-t-2 border-black flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs font-black">
                  <DollarSign className="w-4 h-4 text-[#0057FF]" />
                  <span className="text-lg font-heading text-black">${service.price.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-neutral-600 bg-neutral-100 border border-black px-2 py-0.5">
                  <Clock className="w-3.5 h-3.5 text-black" />
                  <span>{service.duration} MINS</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingService ? 'UPDATE SERVICE OFFERING' : 'CREATE NEW SERVICE'}
      >
        <form onSubmit={handleSaveService} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 border-2 border-black bg-[#FF3B30] text-white text-xs font-bold uppercase">
              {formError}
            </div>
          )}

          <Input
            label="SERVICE NAME"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Mobile App Development"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="PRICE (USD)"
              id="price"
              type="number"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              placeholder="1500.00"
              required
            />

            <Input
              label="ESTIMATED DURATION (MINUTES)"
              id="duration"
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="120"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-black">
              DETAILED DESCRIPTION
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter service scope and deliverables..."
              className="brutal-input text-sm text-black"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-black mt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="yellow" type="submit" disabled={submitting}>
              {submitting ? 'SAVING...' : editingService ? 'UPDATE SERVICE' : 'CREATE SERVICE'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE SERVICE OFFERING"
        message="Are you sure you want to permanently remove this service from the catalog?"
        confirmText="DELETE OFFERING"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Services;
