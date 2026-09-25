import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../services/appointments';
import { getCustomers } from '../services/customers';
import { getServices } from '../services/services';
import { getEmployees } from '../services/employees';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { Calendar, Plus, Edit2, Trash2, Clock, User, CheckCircle2 } from 'lucide-react';

const Appointments = () => {
  const { isAdmin } = useAuth();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Dropdowns
  const [customers, setCustomers] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  const [createData, setCreateData] = useState({ customer_id: '', service_id: '', employee_id: '', appointment_date: '', notes: '', status: 'SCHEDULED' });
  const [updateData, setUpdateData] = useState({ status: '', notes: '', employee_id: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchReferenceData = async () => {
    try {
      const [c, s, e] = await Promise.all([getCustomers(), getServices(), getEmployees()]);
      setCustomers(c);
      setServicesList(s);
      setEmployees(e);
    } catch (err) {
      console.error('Failed to fetch appointment reference data:', err);
    }
  };

  const fetchAppointmentList = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      const data = await getAppointments(filters);
      setAppointments(data);
    } catch (err) {
      console.error('Failed to fetch appointments list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferenceData();
  }, []);

  useEffect(() => {
    fetchAppointmentList();
  }, [statusFilter]);

  const handleOpenCreateModal = () => {
    // Default tomorrow at 10:00 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    setCreateData({
      customer_id: customers[0]?.id ? String(customers[0].id) : '',
      service_id: servicesList[0]?.id ? String(servicesList[0].id) : '',
      employee_id: employees[0]?.id ? String(employees[0].id) : '',
      appointment_date: tomorrow.toISOString().slice(0, 16),
      notes: '',
      status: 'SCHEDULED',
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await createAppointment({
        ...createData,
        customer_id: parseInt(createData.customer_id),
        service_id: parseInt(createData.service_id),
        employee_id: createData.employee_id ? parseInt(createData.employee_id) : null,
        appointment_date: new Date(createData.appointment_date).toISOString(),
      });
      setIsCreateOpen(false);
      fetchAppointmentList();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to schedule appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenUpdateModal = (app, e) => {
    e?.stopPropagation();
    setSelectedApp(app);
    setUpdateData({
      status: app.status,
      notes: app.notes || '',
      employee_id: app.employee_id ? String(app.employee_id) : '',
    });
    setFormError('');
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await updateAppointment(selectedApp.id, {
        status: updateData.status,
        notes: updateData.notes,
        employee_id: updateData.employee_id ? parseInt(updateData.employee_id) : null,
      });
      setIsUpdateOpen(false);
      fetchAppointmentList();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update appointment.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteAppointment(deletingId);
      setDeletingId(null);
      fetchAppointmentList();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete appointment.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'DATE & TIME',
      accessor: 'appointment_date',
      render: (row) => (
        <div>
          <span className="font-extrabold text-xs text-black block font-heading">
            {new Date(row.appointment_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
          </span>
          <span className="text-[10px] font-bold text-[#0057FF]">
            {new Date(row.appointment_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ),
    },
    {
      header: 'CUSTOMER',
      accessor: 'customer',
      render: (row) => <span className="font-semibold text-xs text-black">{row.customer?.name}</span>,
    },
    {
      header: 'SERVICE TYPE',
      accessor: 'service',
      render: (row) => <span className="font-bold text-xs text-neutral-800">{row.service?.name}</span>,
    },
    {
      header: 'ASSIGNED EMPLOYEE',
      accessor: 'employee',
      render: (row) => (
        <span className="font-bold text-xs text-black">
          {row.employee ? row.employee.name : <span className="text-neutral-400">UNASSIGNED</span>}
        </span>
      ),
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
    {
      header: 'ACTIONS',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => handleOpenUpdateModal(row, e)}
            className="p-1.5 border-2 border-black bg-[#FFD600] hover:bg-yellow-400 font-bold text-xs"
            title="Update Appointment Status"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeletingId(row.id)}
              className="p-1.5 border-2 border-black bg-[#FF3B30] text-white hover:bg-red-700 font-bold"
              title="Cancel / Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Controls Bar */}
      <div className="brutal-card p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="w-full sm:w-64">
          <Select
            placeholder="ALL APPOINTMENT STATUSES"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'SCHEDULED', label: 'SCHEDULED' },
              { value: 'CONFIRMED', label: 'CONFIRMED' },
              { value: 'COMPLETED', label: 'COMPLETED' },
              { value: 'CANCELLED', label: 'CANCELLED' },
            ]}
          />
        </div>

        <Button variant="yellow" onClick={handleOpenCreateModal}>
          <Plus className="w-4 h-4 mr-1 inline-block" /> SCHEDULE APPOINTMENT
        </Button>
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingState message="LOADING CALENDAR APPOINTMENTS..." />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="NO APPOINTMENTS FOUND"
          message="No scheduled appointments match the selected filter criteria."
          actionText="SCHEDULE APPOINTMENT"
          onAction={handleOpenCreateModal}
          icon={Calendar}
        />
      ) : (
        <Table
          columns={columns}
          data={appointments}
          onRowClick={(row) => handleOpenUpdateModal(row)}
        />
      )}

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="SCHEDULE NEW APPOINTMENT"
      >
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 border-2 border-black bg-[#FF3B30] text-white text-xs font-bold uppercase">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="CUSTOMER"
              id="customer_id"
              value={createData.customer_id}
              onChange={(e) => setCreateData({ ...createData, customer_id: e.target.value })}
              options={customers.map((c) => ({ value: String(c.id), label: `${c.name}` }))}
              required
            />

            <Select
              label="SERVICE OFFERING"
              id="service_id"
              value={createData.service_id}
              onChange={(e) => setCreateData({ ...createData, service_id: e.target.value })}
              options={servicesList.map((s) => ({ value: String(s.id), label: `${s.name}` }))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="APPOINTMENT DATE & TIME"
              id="appointment_date"
              type="datetime-local"
              value={createData.appointment_date}
              onChange={(e) => setCreateData({ ...createData, appointment_date: e.target.value })}
              required
            />

            <Select
              label="ASSIGNED EMPLOYEE"
              id="employee_id"
              value={createData.employee_id}
              onChange={(e) => setCreateData({ ...createData, employee_id: e.target.value })}
              options={employees.map((e) => ({ value: String(e.id), label: `${e.name}` }))}
              placeholder="UNASSIGNED"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-black">
              APPOINTMENT NOTES / INSTRUCTIONS
            </label>
            <textarea
              rows={3}
              value={createData.notes}
              onChange={(e) => setCreateData({ ...createData, notes: e.target.value })}
              placeholder="Add any specific site access or meeting instructions..."
              className="brutal-input text-sm text-black"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-black mt-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              CANCEL
            </Button>
            <Button variant="yellow" type="submit" disabled={submitting}>
              {submitting ? 'SCHEDULING...' : 'SCHEDULE APPOINTMENT'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Modal */}
      <Modal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title={`MANAGE APPOINTMENT #${selectedApp?.id}`}
      >
        {selectedApp && (
          <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
            {formError && (
              <div className="p-3 border-2 border-black bg-[#FF3B30] text-white text-xs font-bold uppercase">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="APPOINTMENT STATUS"
                id="update_status"
                value={updateData.status}
                onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                options={[
                  { value: 'SCHEDULED', label: 'SCHEDULED' },
                  { value: 'CONFIRMED', label: 'CONFIRMED' },
                  { value: 'COMPLETED', label: 'COMPLETED' },
                  { value: 'CANCELLED', label: 'CANCELLED' },
                ]}
                required
              />

              <Select
                label="ASSIGNED PERSONNEL"
                id="update_employee"
                value={updateData.employee_id}
                onChange={(e) => setUpdateData({ ...updateData, employee_id: e.target.value })}
                options={employees.map((e) => ({ value: String(e.id), label: `${e.name}` }))}
                placeholder="UNASSIGNED"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-black">
                NOTES & INSTRUCTIONS
              </label>
              <textarea
                rows={3}
                value={updateData.notes}
                onChange={(e) => setUpdateData({ ...updateData, notes: e.target.value })}
                className="brutal-input text-sm text-black"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t-2 border-black mt-2">
              <Button variant="outline" type="button" onClick={() => setIsUpdateOpen(false)}>
                CANCEL
              </Button>
              <Button variant="yellow" type="submit" disabled={submitting}>
                {submitting ? 'SAVING...' : 'SAVE CHANGES'}
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE APPOINTMENT"
        message="Are you sure you want to remove this appointment record from the database?"
        confirmText="DELETE RECORD"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Appointments;
