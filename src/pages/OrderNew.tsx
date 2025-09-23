import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Input } from '../components/ui/input';
import { SimpleSelect } from '../components/ui/simple-select';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { validateWorkOrderForm } from '../utils/validators';
import { Client, WorkOrder } from '../types';
import { toast } from 'sonner';
import { FileText, Save } from 'lucide-react';
import Layout from '../components/Layout';

export default function OrderNew() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [clients] = useLocalStorage<Client[]>('telconova_clients', []);
  const [workOrders, setWorkOrders] = useLocalStorage<WorkOrder[]>('telconova_work_orders', []);
  
  const [formData, setFormData] = useState({
    activity: '',
    priority: '',
    clientId: '',
    description: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [orderNumber, setOrderNumber] = useState('');

  useEffect(() => {
    // Generate next order number
    const nextNumber = (workOrders.length + 1).toString().padStart(3, '0');
    setOrderNumber(nextNumber);
  }, [workOrders]);

  const selectedClient = clients.find(c => c.id === formData.clientId);

  const activityOptions = [
    { value: 'Instalación', label: 'Instalación' },
    { value: 'Reparación', label: 'Reparación' },
    { value: 'Mantenimiento', label: 'Mantenimiento' }
  ];

  const priorityOptions = [
    { value: 'Alta', label: 'Alta' },
    { value: 'Media', label: 'Media' },
    { value: 'Baja', label: 'Baja' }
  ];

  const clientOptions = clients.map(client => ({
    value: client.id,
    label: `${client.name} - ${client.identification}`
  }));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateWorkOrderForm(
      formData.activity,
      formData.priority,
      formData.clientId,
      formData.description
    );
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    const newWorkOrder: WorkOrder = {
      id: Date.now().toString(),
      orderNumber,
      clientId: formData.clientId,
      activity: formData.activity as 'Instalación' | 'Reparación' | 'Mantenimiento',
      priority: formData.priority as 'Alta' | 'Media' | 'Baja',
      status: 'Abierta',
      description: formData.description,
      responsibleUserId: user!.id,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    setWorkOrders([...workOrders, newWorkOrder]);
    toast.success(`Orden de trabajo #${orderNumber} creada exitosamente`);
    navigate('/orders');
  };

  return (
    <Layout>
      <div className="container-telco py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Crear Orden de Trabajo Nro. {orderNumber}
          </h1>
          <p className="text-gray-600">
            Responsable: <span className="font-semibold">{user?.name}</span>
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="p-8 bg-gray-50">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Activity and Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SimpleSelect
                  label="Actividad"
                  name="activity"
                  value={formData.activity}
                  onChange={handleChange}
                  options={activityOptions}
                  error={errors.activity}
                  required
                />
                
                <SimpleSelect
                  label="Prioridad"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  options={priorityOptions}
                  error={errors.priority}
                  required
                />
              </div>

              {/* Client Selection */}
              <SimpleSelect
                label="Cliente"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                options={clientOptions}
                error={errors.clientId}
                required
              />

              {/* Client Details Display */}
              {selectedClient && (
                <Card className="p-4 bg-white border-l-4 border-l-telco-success">
                  <h3 className="font-semibold mb-2">Datos del Cliente</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><strong>Nombre:</strong> {selectedClient.name}</p>
                      <p><strong>Identificación:</strong> {selectedClient.identification}</p>
                    </div>
                    <div>
                      <p><strong>Teléfono:</strong> {selectedClient.phone}</p>
                      <p><strong>Dirección:</strong> {selectedClient.address}</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Description */}
              <div className="form-field">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del soporte
                  <span className="text-destructive ml-1">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="form-input min-h-[120px] resize-y"
                  placeholder="Describa detalladamente el trabajo a realizar..."
                  required
                />
                {errors.description && (
                  <p className="form-error" role="alert">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4">
                <Button
                  type="submit"
                  className="btn-telco-success w-full md:w-auto px-8 py-3 text-lg"
                >
                  <FileText className="w-5 h-5 mr-2" />
                  Generar Orden
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </Layout>
  );
}