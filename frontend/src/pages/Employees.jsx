import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../services/employees';
import Table from '../components/Table';
import Button from '../components/Button';
import Input from '../components/Input';
import Select from '../components/Select';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingState from '../components/LoadingState';
import EmptyState from '../components/EmptyState';
import { Search, Plus, Edit2, Trash2, UserCheck, ShieldCheck } from 'lucide-react';

const Employees = () => {
  const { isAdmin } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', department: '', position: '', employee_code: '', role: 'EMPLOYEE' });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirm Dialog
  const [deletingId, setDeletingId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchEmployeeList = async () => {
    setLoading(true);
    try {
      const data = await getEmployees(search, departmentFilter);
      setEmployees(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchEmployeeList();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, departmentFilter]);

  const handleOpenCreateModal = () => {
    setEditingEmployee(null);
    setFormData({ name: '', email: '', password: '', department: 'General Operations', position: 'Specialist', employee_code: '', role: 'EMPLOYEE' });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (emp) => {
    setEditingEmployee(emp);
    setFormData({
      name: emp.name,
      email: emp.email,
      password: '',
      department: emp.department,
      position: emp.position,
      employee_code: emp.employee_code,
      role: emp.role,
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, formData);
      } else {
        await createEmployee(formData);
      }
      setIsModalOpen(false);
      fetchEmployeeList();
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Failed to save employee profile.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setDeleteLoading(true);
    try {
      await deleteEmployee(deletingId);
      setDeletingId(null);
      fetchEmployeeList();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete employee profile.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const columns = [
    {
      header: 'CODE',
      accessor: 'employee_code',
      render: (row) => <span className="font-mono font-black text-xs bg-black text-white px-2 py-0.5">{row.employee_code}</span>,
    },
    {
      header: 'EMPLOYEE NAME',
      accessor: 'name',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#0057FF] text-white border-2 border-black font-black flex items-center justify-center text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <span className="font-extrabold uppercase text-sm text-black block">{row.name}</span>
            <span className="text-[10px] font-bold text-neutral-500">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'DEPARTMENT',
      accessor: 'department',
      render: (row) => <span className="font-bold text-xs uppercase text-neutral-800">{row.department}</span>,
    },
    {
      header: 'POSITION',
      accessor: 'position',
      render: (row) => <span className="font-semibold text-xs text-black">{row.position}</span>,
    },
    {
      header: 'SYSTEM ROLE',
      accessor: 'role',
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs font-black uppercase border-2 border-black ${row.role === 'ADMIN' ? 'bg-[#FF3B30] text-white' : 'bg-neutral-100 text-black'}`}>
          {row.role}
        </span>
      ),
    },
    {
      header: 'ACTIVE REQUESTS',
      accessor: 'active_requests_count',
      render: (row) => (
        <span className="px-2 py-0.5 border-2 border-black font-black text-xs bg-[#FFD600]">
          {row.active_requests_count} ASSIGNED
        </span>
      ),
    },
    {
      header: 'ACTIONS',
      accessor: 'actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {isAdmin && (
            <>
              <button
                onClick={() => handleOpenEditModal(row)}
                className="p-1.5 border-2 border-black bg-[#FFD600] hover:bg-yellow-400 font-bold"
                title="Edit Employee"
              >
                <Edit2 className="w-4 h-4 text-black" />
              </button>
              <button
                onClick={() => setDeletingId(row.id)}
                className="p-1.5 border-2 border-black bg-[#FF3B30] text-white hover:bg-red-700 font-bold"
                title="Delete Employee"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Controls Bar */}
      <div className="brutal-card p-5 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-3 text-neutral-500" />
            <input
              type="text"
              placeholder="SEARCH NAME, CODE, EMAIL..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="brutal-input pl-9 text-xs font-bold w-full uppercase"
            />
          </div>
        </div>

        {isAdmin && (
          <Button variant="yellow" onClick={handleOpenCreateModal}>
            <Plus className="w-4 h-4 mr-1 inline-block" /> REGISTER NEW EMPLOYEE
          </Button>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingState message="FETCHING PERSONNEL ROSTER..." />
      ) : employees.length === 0 ? (
        <EmptyState
          title="NO EMPLOYEES FOUND"
          message="No active employees found matching the search query."
          actionText={isAdmin ? 'REGISTER EMPLOYEE' : null}
          onAction={handleOpenCreateModal}
          icon={UserCheck}
        />
      ) : (
        <Table columns={columns} data={employees} />
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmployee ? 'UPDATE EMPLOYEE PROFILE' : 'REGISTER NEW EMPLOYEE'}
      >
        <form onSubmit={handleSaveEmployee} className="flex flex-col gap-4">
          {formError && (
            <div className="p-3 border-2 border-black bg-[#FF3B30] text-white text-xs font-bold uppercase">
              {formError}
            </div>
          )}

          <Input
            label="FULL NAME"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. David Miller"
            required
          />

          <Input
            label="EMAIL ADDRESS"
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="tech@servicehub.com"
            required
          />

          {!editingEmployee && (
            <Input
              label="INITIAL PASSWORD"
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••••••"
              required
            />
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="DEPARTMENT"
              id="department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Engineering & IT"
              required
            />

            <Input
              label="POSITION"
              id="position"
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              placeholder="Senior Developer"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="EMPLOYEE CODE (OPTIONAL)"
              id="employee_code"
              value={formData.employee_code}
              onChange={(e) => setFormData({ ...formData, employee_code: e.target.value })}
              placeholder="e.g. EMP-0005"
            />

            <Select
              label="SYSTEM ACCESS ROLE"
              id="role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'EMPLOYEE', label: 'EMPLOYEE' },
                { value: 'ADMIN', label: 'ADMINISTRATOR' },
              ]}
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t-2 border-black mt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              CANCEL
            </Button>
            <Button variant="yellow" type="submit" disabled={submitting}>
              {submitting ? 'SAVING...' : editingEmployee ? 'UPDATE EMPLOYEE' : 'REGISTER EMPLOYEE'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="DELETE EMPLOYEE PROFILE"
        message="Are you sure you want to permanently delete this employee account?"
        confirmText="DELETE PROFILE"
        loading={deleteLoading}
      />
    </div>
  );
};

export default Employees;
