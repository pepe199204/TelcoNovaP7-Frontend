import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { validateClientForm } from '../utils/validators';
import { Client } from '../types';
import { toast } from 'sonner';
import { Search, Save, UserPlus } from 'lucide-react';
import Layout from '../components/Layout';

export default function Clients() {
  const { user } = useAuth();
  const [clients, setClients] = useLocalStorage<Client[]>('telconova_clients', []);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchId, setSearchId] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    identification: '',
    phone: '',
    address: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleSearch = () => {
    if (!searchTerm && !searchId) {
      setSelectedClient(null);
      return;
    }

    const client = clients.find(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.identification.includes(searchId)
    );

    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        identification: client.identification,
        phone: client.phone,
        address: client.address
      });
      setIsEditing(true);
      toast.success('Cliente encontrado');
    } else {
      setSelectedClient(null);
      setIsEditing(false);
      setFormData({
        name: searchTerm,
        identification: searchId,
        phone: '',
        address: ''
      });
      toast.info('Cliente no encontrado. Puede crear uno nuevo.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateClientForm(
      formData.name,
      formData.identification,
      formData.phone,
      formData.address
    );
    
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});

    if (isEditing && selectedClient) {
      // Update existing client
      const updatedClients = clients.map(c => 
        c.id === selectedClient.id 
          ? { ...c, ...formData, updatedAt: new Date() }
          : c
      );
      setClients(updatedClients);
      toast.success('Cliente actualizado exitosamente');
    } else {
      // Create new client
      const newClient: Client = {
        id: Date.now().toString(),
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setClients([...clients, newClient]);
      toast.success('Cliente creado exitosamente');
    }

    // Reset form
    setFormData({
      name: '',
      identification: '',
      phone: '',
      address: ''
    });
    setSelectedClient(null);
    setIsEditing(false);
    setSearchTerm('');
    setSearchId('');
  };

  return (
    <Layout>
      <div className="container-telco py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Registro de Cliente
          </h1>
          <p className="text-gray-600">
            Registrado por: <span className="font-semibold">{user?.nombre}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Search className="w-5 h-5 mr-2" />
              Buscar Cliente
            </h2>
            
            <div className="space-y-4">
              <Input
                label="Buscar por nombre"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Nombre del cliente"
              />
              
              <Input
                label="Buscar por identificación"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Número de identificación"
              />
              
              <Button
                onClick={handleSearch}
                className="btn-telco-primary w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </Card>

          {/* Form Section */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <UserPlus className="w-5 h-5 mr-2" />
              {isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Nombre del cliente"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={errors.name}
                placeholder="Nombre completo"
                required
              />
              
              <Input
                label="Identificación"
                name="identification"
                value={formData.identification}
                onChange={handleChange}
                error={errors.identification}
                placeholder="Solo números"
                required
              />
              
              <Input
                label="Teléfono"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+57 300 123 4567"
                required
              />
              
              <Input
                label="Dirección"
                name="address"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                placeholder="Dirección completa"
                required
              />
              
              <Button
                type="submit"
                className="btn-telco-success w-full"
              >
                <Save className="w-4 h-4 mr-2" />
                Guardar cambios
              </Button>
            </form>
          </Card>
        </div>

        {/* Client List */}
        {clients.length > 0 && (
          <Card className="mt-8 p-6">
            <h2 className="text-xl font-semibold mb-4">Clientes Registrados ({clients.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <div key={client.id} className="p-4 border rounded-lg hover:bg-gray-50">
                  <h3 className="font-semibold text-gray-900">{client.name}</h3>
                  <p className="text-gray-600">ID: {client.identification}</p>
                  <p className="text-gray-600">{client.phone}</p>
                  <p className="text-gray-600 text-sm">{client.address}</p>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
}