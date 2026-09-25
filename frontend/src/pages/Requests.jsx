import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRequests, createRequest, updateRequest, deleteRequest } from '../services/requests';
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
import { Search, Plus, Edit2, Trash2, ClipboardList, UserCheck, ArrowRight, AlertTriangle } from 'lucide-react';

const Requests = () => {
  const { user, isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [employeeFilter, setEmployeeFilter] = useState('');

  // Dropdown Reference Data
  const [customers, setCustomers] = useState([]);
  const [servicesList, setServicesList] = useState([]);
  const [employees, setEmployees] = useState([]);

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // Form Data
  const [createData, setCreateData] = useState({ customer_id: '', service_id: '', employee_id: '', title: '', description: '', priority: 'MEDIUM' });
  const [updateData, setUpdateData] = useState({ status: '', priority: '', employee_id: '', title: '', description: '' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Dialog
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchDropdownData = async () => {
    try {
      const [c, s, e] = await Promise.all([
        getCustomers(),
        getServices(),
        getEmployees(),
      ]);
      setCustomers(c);
      setServicesList(s);
      setEmployees(e);
    } catch (err) {
      console.error('Failed to load dropdown reference data:', err);
    }
  };

  const fetchRequestList = async () => {
    setLoading(true);
    try {
      const filters = {};
      if (search) filters.search = search;
      if (statusFilter) filters.status = statusFilter;
      if (priorityFilter) filters.priority = priorityFilter;
      if (employeeFilter) filters.employee_id = employeeFilter;

      const data = await getRequests(filters);
      setRequests(data);
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRequestList();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, statusFilter, priorityFilter, employeeFilter]);

  const handleOpenCreateModal = () => {
    setCreateData({
      customer_id: customers[0]?.id ? String(customers[0].id) : '',
      service_id: servicesList[0]?.id ? String(servicesList[0].id) : '',
      employee_id: '',
      title: '',
      description: '',
      priority: 'MEDIUM',
    });
    setFormError('');
    setIsCreateOpen(true);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await createRequest({
        ...createData,
        customer_id: parseInt(createData.customer_id),
        service_id: parseInt(createData.service_id),
        employee_id: createData.employee_id ? parseInt(createData.employee_id) : null,
      });
      setIsCreateOpen(false);
      fetchRequestList();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to create service request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenUpdateModal = (req, e) => {
    e?.stopPropagation();
    setSelectedReq(req);
    setUpdateData({
      status: req.status,
      priority: req.priority,
      employee_id: req.employee_id ? String(req.employee_id) : '',
      title: req.title,
      description: req.description || '',
    });
    setFormError('');
    setIsUpdateOpen(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      await updateRequest(selectedReq.id, {
        status: updateData.status,
        priority: updateData.priority,
        employee_id: updateData.employee_id ? parseInt(updateData.employee_id) : null,
        title: updateData.title,
        description: updateData.description,
      });
      setIsUpdateOpen(false);
      fetchRequestList();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to update request.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteRequest(deletingId);
      setDeletingId(null);
      fetchRequestList();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete request.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'REQ ID',
      accessor: 'id',
      render: (row) => <span className="font-mono font-black text-xs">#{row.id}</span>,
    },
    {
      header: 'SERVICE TITLE',
      accessor: 'title',
      render: (row) => (
        <div>
          <span className="font-extrabold uppercase text-xs text-black block max-w-[220px] truncate">
            {row.title}
          </span>
          <span className="text-[10px] font-bold text-neutral-500 uppercase">{row.service?.name}</span>
        </div>
      ),
    },
    {
      header: 'CUSTOMER',
      accessor: 'customer',
      render: (row) => <span className="font-semibold text-xs text-neutral-800">{row.customer?.name}</span>,
    },
    {
      header: 'ASSIGNED EMPLOYEE',
      accessor: 'employee',
      render: (row) => (
        <span className="font-bold text-xs text-black">
          {row.employee ? (
            <span className="flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#0057FF]" />
              {row.employee.name}
            </span>
          ) : (
            <span className="px-2 py-0.5 border border-dashed border-black bg-yellow-100 text-[10px] font-black uppercase text-black">
              UNASSIGNED
            </span>
          )}
        </span>
      ),
    },
    {
      header: 'PRIORITY',
      accessor: 'priority',
      render: (row) => <Badge priority={row.priority} />,
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
            className="p-1.5 border-2 border-black bg-[#FFD600] hover:bg-yellow-400 font-bold text-xs flex items-center gap-1"
            title="Update Status / Assign"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>UPDATE</span>
          </button>
          {isAdmin && (
            <button
              onClick={() => setDeletingId(row.id)}
              className="p-1.5 border-2 border-black bg-[#FF3B30] text-white hover:bg-red-700 font-bold"
              title="Delete Request"
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
      {/* Search & Filter Control Bar */}
      <div className="brutal-card p-5 bg-white flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full lg:w-auto flex-1">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="SEARCH TITLE / CUSTOMER..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="brutal-input pl-9 text-xs font-bold w-full uppercase"
            />
          </div>

          <Select
            placeholder="ALL STATUSES"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'PENDING', label: 'PENDING' },
              { value: 'ASSIGNED', label: 'ASSIGNED' },
              { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
              { value: 'COMPLETED', label: 'COMPLETED' },
              { value: 'CANCELLED', label: 'CANCELLED' },
            ]}
          />

          <Select
            placeholder="ALL PRIORITIES"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            options={[
              { value: 'LOW', label: 'LOW' },
              { value: 'MEDIUM', label: 'MEDIUM' },
              { value: 'HIGH', label: 'HIGH' },
              { value: 'URGENT', label: 'URGENT' },
            ]}
          />

          <Select
            placeholder="ALL EMPLOYEES"
            value={employeeFilter}
            onChange={(e) => setEmployeeFilter(e.target.value)}
            options={employees.map((emp) => ({ value: String(emp.id), label: `${emp.name} (${emp.employee_code})` }))}
          />
        </div>

        <Button variant="yellow" onClick={handleOpenCreateModal} className="flex-shrink-0">
          <Plus className="w-4 h-4 mr-1 inline-block" /> NEW SERVICE REQUEST
        </Button>
      </div>

      {/* Main Request Table */}
      {loading ? (
        <LoadingState message="QUERYING SERVICE REQUEST PIPELINE..." />
      ) : requests.length === 0 ? (
        <EmptyState
          title="NO SERVICE REQUESTS FOUND"
          message="No service requests match your search or filter parameters."
          actionText="CREATE SERVICE REQUEST"
          onAction={handleOpenCreateModal}
          icon={ClipboardList}
        />
      ) : (
        <Table
          columns={columns}
          data={requests}
          onRowClick={(row) => handleOpenUpdateModal(row)}
        />
      )}

      {/* Create Request Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="SUBMIT NEW SERVICE REQUEST"
        maxWidth="max-w-2xl"
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
              options={customers.map((c) => ({ value: String(c.id), label: `${c.name} (${c.email})` }))}
              required
            />

            <Select
              label="SERVICE TYPE"
              id="service_id"
              value={createData.service_id}
              onChange={(e) => setCreateData({ ...createData, service_id: e.target.value })}
              options={servicesList.map((s) => ({ value: String(s.id), label: `${s.name} ($${s.price})` }))}
              required
            />
          </div>

          <Input
            label="REQUEST TITLE"
            id="title"
            value={createData.title}
            onChange={(e) => setCreateData({ ...createData, title: e.target.value })}
            placeholder="e.g. Portal Database Migration"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="PRIORITY LEVEL"
              id="priority"
              value={createData.priority}
              onChange={(e) => setCreateData({ ...createData, priority: e.target.value })}
              options={[
                { value: 'LOW', label: 'LOW' },
                { value: 'MEDIUM', label: 'MEDIUM' },
                { value: 'HIGH', label: 'HIGH' },
                { value: 'URGENT', label: 'URGENT' },
              ]}
              required
            />

            <Select
              label="ASSIGN TO EMPLOYEE (OPTIONAL)"
              id="employee_id"
              value={createData.employee_id}
              onChange={(e) => setCreateData({ ...createData, employee_id: e.target.value })}
              options={employees.map((e) => ({ value: String(e.id), label: `${e.name} - ${e.position}` }))}
              placeholder="UNASSIGNED (PENDING)"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-black">
              DETAILED DESCRIPTION
            </label>
            <textarea
              rows={3}
              value={createData.description}
              onChange={(e) => setCreateData({ ...createData, description: e.target.value })}
              placeholder="Enter comprehensive operational specifications..."
              className="brutal-input text-sm text-black"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-black mt-2">
            <Button variant="outline" type="button" onClick={() => setIsCreateOpen(false)}>
              CANCEL
            </Button>
            <Button variant="yellow" type="submit" disabled={submitting}>
              {submitting ? 'SUBMITTING...' : 'SUBMIT REQUEST'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Update Request Status Modal with Visual Lifecycle Progression */}
      <Modal
        isOpen={isUpdateOpen}
        onClose={() => setIsUpdateOpen(false)}
        title={`MANAGE REQUEST #${selectedReq?.id}`}
        maxWidth="max-w-2xl"
      >
        {selectedReq && (
          <div className="flex flex-col gap-6">
            {/* Request Summary Box */}
            <div className="p-4 border-2 border-black bg-[#FFFDF5]">
              <div className="flex items-center justify-between pb-2 border-b-2 border-black mb-2">
                <span className="text-xs font-black uppercase text-neutral-500">REQUEST PROFILE</span>
                <Badge status={selectedReq.status} />
              </div>
              <h4 className="text-base font-black uppercase text-black font-heading mb-1">{selectedReq.title}</h4>
              <p className="text-xs font-semibold text-neutral-700">{selectedReq.description || 'No description provided.'}</p>
              <div className="mt-3 pt-2 border-t border-black grid grid-cols-2 gap-2 text-xs font-bold">
                <div>CUSTOMER: {selectedReq.customer?.name}</div>
                <div>SERVICE: {selectedReq.service?.name}</div>
              </div>
            </div>

            {/* Visual Lifecycle Progression Tracker */}
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-black block mb-2">
                LIFECYCLE PROGRESSION TRACKER
              </span>
              <div className="grid grid-cols-4 gap-1 border-2 border-black p-2 bg-neutral-100 text-center font-black text-[10px] uppercase">
                <div className={`p-2 border border-black ${selectedReq.status === 'PENDING' ? 'bg-[#FFD600] text-black brutal-shadow-sm' : 'bg-white text-neutral-400'}`}>
                  1. PENDING
                </div>
                <div className={`p-2 border border-black ${selectedReq.status === 'ASSIGNED' ? 'bg-[#0057FF] text-white brutal-shadow-sm' : 'bg-white text-neutral-400'}`}>
                  2. ASSIGNED
                </div>
                <div className={`p-2 border border-black ${selectedReq.status === 'IN_PROGRESS' ? 'bg-[#0057FF] text-white brutal-shadow-sm' : 'bg-white text-neutral-400'}`}>
                  3. IN PROGRESS
                </div>
                <div className={`p-2 border border-black ${selectedReq.status === 'COMPLETED' ? 'bg-[#B7FF00] text-black brutal-shadow-sm' : 'bg-white text-neutral-400'}`}>
                  4. COMPLETED
                </div>
              </div>
              {selectedReq.status === 'CANCELLED' && (
                <div className="mt-2 p-2 border-2 border-black bg-[#FF3B30] text-white font-bold text-center text-xs uppercase">
                  STATUS IS CANCELLED
                </div>
              )}
            </div>

            {/* Update Form */}
            <form onSubmit={handleUpdateSubmit} className="flex flex-col gap-4">
              {formError && (
                <div className="p-3 border-2 border-black bg-[#FF3B30] text-white text-xs font-bold uppercase">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="UPDATE STATUS"
                  id="update_status"
                  value={updateData.status}
                  onChange={(e) => setUpdateData({ ...updateData, status: e.target.value })}
                  options={[
                    { value: 'PENDING', label: 'PENDING' },
                    { value: 'ASSIGNED', label: 'ASSIGNED' },
                    { value: 'IN_PROGRESS', label: 'IN PROGRESS' },
                    { value: 'COMPLETED', label: 'COMPLETED' },
                    { value: 'CANCELLED', label: 'CANCELLED' },
                  ]}
                  required
                />

                <Select
                  label="UPDATE PRIORITY"
                  id="update_priority"
                  value={updateData.priority}
                  onChange={(e) => setUpdateData({ ...updateData, priority: e.target.value })}
                  options={[
                    { value: 'LOW', label: 'LOW' },
                    { value: 'MEDIUM', label: 'MEDIUM' },
                    { value: 'HIGH', label: 'HIGH' },
                    { value: 'URGENT', label: 'URGENT' },
                  ]}
                  required
                />
              </div>

              <Select
                label="ASSIGNED PERSONNEL"
                id="update_employee_id"
                value={updateData.employee_id}
                onChange={(e) => setUpdateData({ ...updateData, employee_id: e.target.value })}
                options={employees.map((e) => ({ value: String(e.id), label: `${e.name} (${e.department})` }))}
                placeholder="UNASSIGNED"
              />

              <Input
                label="TITLE"
                id="update_title"
                value={updateData.title}
                onChange={(e) => setUpdateData({ ...updateData, title: e.target.value })}
                required
              />

              <div className="flex justify-end gap-3 pt-4 border-t-2 border-black mt-2">
                <Button variant="outline" type="button" onClick={() => setIsUpdateOpen(false)}>
                  CANCEL
                </Button>
                <Button variant="yellow" type="submit" disabled={submitting}>
                  {submitting ? 'SAVING...' : 'SAVE CHANGES'}
                </Button>
              </div>
            </form>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE SERVICE REQUEST"
        message="Are you sure you want to permanently delete this service request from the database?"
        confirmText="DELETE REQUEST"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Requests;
