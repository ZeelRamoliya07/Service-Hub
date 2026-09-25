import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCustomer } from '../services/customers';
import { getRequests } from '../services/requests';
import { getAppointments } from '../services/appointments';
import Card from '../components/Card';
import Table from '../components/Table';
import Badge from '../components/Badge';
import Button from '../components/Button';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, ClipboardList, Plus } from 'lucide-react';

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [customer, setCustomer] = useState(null);
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const [custData, reqData, appData] = await Promise.all([
        getCustomer(id),
        getRequests({ customer_id: id }),
        getAppointments({ customer_id: id }),
      ]);
      setCustomer(custData);
      setRequests(reqData);
      setAppointments(appData);
    } catch (err) {
      console.error('Failed to load customer details:', err);
      setError('Customer not found or failed to fetch database profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) return <LoadingState message="FETCHING CUSTOMER PROFILE DATA..." />;
  if (error) return <ErrorState message={error} onRetry={fetchDetails} />;
  if (!customer) return null;

  const requestColumns = [
    {
      header: 'REQ ID',
      accessor: 'id',
      render: (row) => <span className="font-mono font-black text-xs">#{row.id}</span>,
    },
    {
      header: 'SERVICE TITLE',
      accessor: 'title',
      render: (row) => <span className="font-extrabold text-xs uppercase text-black">{row.title}</span>,
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
      header: 'CREATED',
      accessor: 'created_at',
      render: (row) => <span className="text-xs font-bold text-neutral-600">{new Date(row.created_at).toLocaleDateString()}</span>,
    },
  ];

  const appointmentColumns = [
    {
      header: 'DATE & TIME',
      accessor: 'appointment_date',
      render: (row) => (
        <span className="font-black text-xs text-black">
          {new Date(row.appointment_date).toLocaleString()}
        </span>
      ),
    },
    {
      header: 'SERVICE',
      accessor: 'service',
      render: (row) => <span className="font-bold text-xs">{row.service?.name}</span>,
    },
    {
      header: 'STATUS',
      accessor: 'status',
      render: (row) => <Badge status={row.status} />,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Top Action Bar */}
      <div>
        <Button variant="outline" size="sm" onClick={() => navigate('/customers')}>
          <ArrowLeft className="w-4 h-4 mr-1 inline-block" /> BACK TO CUSTOMERS
        </Button>
      </div>

      {/* Main Profile Info Header */}
      <div className="brutal-card bg-white p-6 border-3 border-black relative">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b-3 border-black">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-[#FFD600] border-3 border-black font-black text-2xl flex items-center justify-center font-heading">
              {customer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black font-heading uppercase tracking-tight text-black">
                {customer.name}
              </h2>
              <span className="text-xs font-bold text-neutral-500 uppercase">
                CUSTOMER ID #{customer.id} • REGISTERED {new Date(customer.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Contact Info Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-3 border-2 border-black bg-[#FFFDF5] flex items-center gap-3">
            <Mail className="w-5 h-5 text-black flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">EMAIL</span>
              <span className="text-xs font-bold text-black truncate block">{customer.email}</span>
            </div>
          </div>
          <div className="p-3 border-2 border-black bg-[#FFFDF5] flex items-center gap-3">
            <Phone className="w-5 h-5 text-black flex-shrink-0" />
            <div>
              <span className="text-[10px] font-black uppercase text-neutral-500 block">PHONE</span>
              <span className="text-xs font-bold text-black block">{customer.phone}</span>
            </div>
          </div>
          <div className="p-3 border-2 border-black bg-[#FFFDF5] flex items-center gap-3">
            <MapPin className="w-5 h-5 text-black flex-shrink-0" />
            <div className="truncate">
              <span className="text-[10px] font-black uppercase text-neutral-500 block">LOCATION</span>
              <span className="text-xs font-bold text-black truncate block">{customer.address || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Service Requests Section */}
      <Card
        title={`SERVICE REQUESTS (${requests.length})`}
        subtitle="HISTORY OF ALL SUBMITTED REQUESTS"
        action={
          <Button variant="yellow" size="sm" onClick={() => navigate('/requests')}>
            <Plus className="w-4 h-4 mr-1 inline-block" /> NEW REQUEST
          </Button>
        }
      >
        <Table
          columns={requestColumns}
          data={requests}
          onRowClick={(row) => navigate('/requests')}
          emptyMessage="NO SERVICE REQUESTS RECORDED FOR THIS CUSTOMER"
        />
      </Card>

      {/* Customer Appointments Section */}
      <Card
        title={`SCHEDULED APPOINTMENTS (${appointments.length})`}
        subtitle="CALENDAR APPOINTMENT HISTORY"
      >
        <Table
          columns={appointmentColumns}
          data={appointments}
          emptyMessage="NO APPOINTMENTS SCHEDULED FOR THIS CUSTOMER"
        />
      </Card>
    </div>
  );
};

export default CustomerDetails;
