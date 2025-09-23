import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { SimpleSelect } from '../components/ui/simple-select';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Client, WorkOrder } from '../types';
import { toast } from 'sonner';
import { Save, Trash2, User } from 'lucide-react';
import Layout from '../components/Layout';

export default function OrderEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [workOrders, setWorkOrders] = useLocalStorage<WorkOrder[]>('telconova_work_orders', []);
  const [clients] = useLocalStorage<Client[]>('telconova_clients', []);
  
  const [order, setOrder] = useState<WorkOrder | null>(null);
  const [editData, setEditData] = useState({
    activity: '',
    priority: '',
    status: '',
    description: ''
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const foundOrder = workOrders.find(o => o.id === id);
    if (foundOrder) {
      setOrder(foundOrder);
      setEditData({
        activity: foundOrder.activity,
        priority: foundOrder.priority,
        status: foundOrder.status,
        description: ''
      });
    } else {
      toast.error('Orden no encontrada');
      navigate('/orders');
    }
  }, [id, workOrders, navigate]);

  const client = order ? clients.find(c => c.id === order.clientId) : null;
  const ownerUser = order?.ownerUserId ? 'Karolina Higuieta Marulanda' : null;

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

  const statusOptions = [
    { value: 'Abierta', label: 'Abierta' },
    { value: 'En progreso', label: 'En progreso' },
    { value: 'Cerrada', label: 'Cerrada' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    if (!order) return;

    if (!editData.description.trim()) {
      toast.error('Debe proporcionar una descripción del cambio');
      return;
    }

    const updatedOrders = workOrders.map(o => 
      o.id === order.id 
        ? { 
            ...o, 
            activity: editData.activity as 'Instalación' | 'Reparación' | 'Mantenimiento',
            priority: editData.priority as 'Alta' | 'Media' | 'Baja',
            status: editData.status as 'Abierta' | 'En progreso' | 'Cerrada',
            updatedAt: new Date()
          }
        : o
    );
    
    setWorkOrders(updatedOrders);
    toast.success('Orden actualizada exitosamente');
    navigate('/orders');
  };

  const handleDelete = () => {
    if (!order) return;

    const updatedOrders = workOrders.filter(o => o.id !== order.id);
    setWorkOrders(updatedOrders);
    toast.success('Orden eliminada exitosamente');
    navigate('/orders');
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('es-CO');
  };

  if (!order) {
    return (
      <Layout>
        <div className="container-telco py-8">
          <div className="text-center">
            <p>Cargando orden...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container-telco py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-telco-primary rounded-full flex items-center justify-center mr-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {user?.name}
              </h1>
              <p className="text-gray-600">{user?.role}</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">
            Editar Orden de Trabajo #{order.orderNumber}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Información Actual</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Actividad/Servicio</label>
                <p className="mt-1 text-gray-900">{order.activity}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Prioridad</label>
                <p className="mt-1 text-gray-900">{order.priority}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Estado</label>
                <p className="mt-1 text-gray-900">{order.status}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción Original</label>
                <p className="mt-1 text-gray-900">{order.description}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Fecha de Creación</label>
                <p className="mt-1 text-gray-600">{formatDate(order.createdAt)}</p>
              </div>
            </div>

            {/* Client Information */}
            {client && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold mb-2">Cliente</h4>
                <p><strong>Nombre:</strong> {client.name}</p>
                <p><strong>ID:</strong> {client.identification}</p>
                <p><strong>Teléfono:</strong> {client.phone}</p>
                <p><strong>Dirección:</strong> {client.address}</p>
              </div>
            )}
          </Card>

          {/* Edit Information */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Información a Editar</h3>
            
            <div className="space-y-4">
              <SimpleSelect
                label="Actividad/Servicio"
                name="activity"
                value={editData.activity}
                onChange={handleChange}
                options={activityOptions}
                required
              />
              
              <SimpleSelect
                label="Prioridad"
                name="priority"
                value={editData.priority}
                onChange={handleChange}
                options={priorityOptions}
                required
              />
              
              <SimpleSelect
                label="Estado"
                name="status"
                value={editData.status}
                onChange={handleChange}
                options={statusOptions}
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción del motivo del cambio
                  <span className="text-destructive ml-1">*</span>
                </label>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleChange}
                  className="form-input min-h-[100px] resize-y"
                  placeholder="Explique el motivo del cambio..."
                  required
                />
              </div>
            </div>

            {/* Owner Information */}
            {ownerUser && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">Propietaria de la Orden</h4>
                <p>{ownerUser}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Actions */}
        <Card className="mt-8 p-6">
          <div className="flex flex-wrap gap-4 justify-center">
            <Button
              onClick={handleSave}
              className="btn-telco-success px-8"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar cambios
            </Button>
            
            <Button
              onClick={() => setShowDeleteConfirm(true)}
              variant="destructive"
              className="px-8"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar orden
            </Button>
          </div>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6 max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Confirmar Eliminación</h3>
              <p className="text-gray-600 mb-6">
                ¿Está seguro de que desea eliminar la orden #{order.orderNumber}? 
                Esta acción no se puede deshacer.
              </p>
              <div className="flex space-x-4 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setShowDeleteConfirm(false)}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Eliminar
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}