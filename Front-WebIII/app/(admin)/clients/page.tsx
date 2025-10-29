'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientService, Client } from '@/lib/services/client.service';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { PaginationControls } from '@/components/ui/pagination-controls';

export default function ClientsPage() {
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { data: clients = [], isLoading } = useQuery<Client[]>({
    queryKey: ['clients'],
    queryFn: () => clientService.getAllClients(),
  });

  // Simular paginación en el frontend para clientes
  const ITEMS_PER_PAGE = 10;
  const startIndex = (page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedClients = clients.slice(startIndex, endIndex);
  const totalPages = Math.ceil(clients.length / ITEMS_PER_PAGE);

  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editData, setEditData] = useState<Partial<Client>>({});

  const updateClientMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients']});
      setEditingClient(null);
    },
  });

  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setEditData({
      firstName: client.firstName,
      email: client.email,
      phone: client.phone,
      address: client.address,
    });
  };

  const handleBlockToggle = (client: Client) => {
    updateClientMutation.mutate({
      id: client.id,
      data: { isActive: !client.isActive },
    });
  };

  const handleSaveEdit = () => {
    if (!editingClient) return;
    updateClientMutation.mutate({ id: editingClient.id, data: editData });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Clients</h1>
        <p className="text-slate-600">View all registered clients</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        </div>
      ) : (
        <div className="rounded-lg border bg-white">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Correo Electronico</TableHead>
                <TableHead>Nro Telefonico</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Registrado</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.firstName}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.phone || '-'}</TableCell>
                  <TableCell>{client.address || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        client.isActive
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {client.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell>
                    {client.createdAt
                      ? format(new Date(client.createdAt), 'MMM dd, yyyy')
                      : '-'}
                  </TableCell>
                  <TableCell className="flex gap-2">
                    <Button size="sm" onClick={() => handleEditClick(client)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant={client.isActive ? 'destructive' : 'secondary'}
                      onClick={() => handleBlockToggle(client)}
                    >
                      {client.isActive ? 'Block' : 'Unblock'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <PaginationControls
          pagination={{
            page,
            limit: ITEMS_PER_PAGE,
            total: clients.length,
            totalPages,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1,
          }}
          onPageChange={setPage}
          className="mt-6"
        />
      )}

      {/* Modal de edición */}
      <Dialog open={!!editingClient} onOpenChange={() => setEditingClient(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={editData.firstName || ''}
              onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
            />
            <Input
              placeholder="Email"
              value={editData.email || ''}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
            />
            <Input
              placeholder="Phone"
              value={editData.phone || ''}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
            />
            <Input
              placeholder="Address"
              value={editData.address || ''}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
            />
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditingClient(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
