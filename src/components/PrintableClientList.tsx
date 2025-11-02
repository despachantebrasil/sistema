import React from 'react';
import type { Client } from '../types';

const PrintableClientList: React.FC<{ clients: Client[] }> = ({ clients }) => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Lista de Clientes</h1>
    <p className="text-sm text-gray-600 mb-4">Relatório gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
    <table className="w-full text-left printable-table">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="p-3 font-semibold">Nome / Razão Social</th>
          <th className="p-3 font-semibold">Tipo</th>
          <th className="p-3 font-semibold">Contato</th>
          <th className="p-3 font-semibold">CPF/CNPJ</th>
        </tr>
      </thead>
      <tbody>
        {clients.map(client => (
          <tr key={client.id} className="border-b">
            <td className="p-3">{client.name}</td>
            <td className="p-3">{client.client_type}</td>
            <td className="p-3">
              <div>{client.email}</div>
              <div className="text-sm">{client.phone}</div>
            </td>
            <td className="p-3">{client.cpf_cnpj}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default PrintableClientList;