import React from 'react';
import type { Vehicle } from '../types';

type VehicleWithOwnerName = Vehicle & { ownerName: string };

const PrintableVehicleList: React.FC<{ vehicles: VehicleWithOwnerName[] }> = ({ vehicles }) => (
  <div className="p-4">
    <h1 className="text-2xl font-bold mb-4">Lista de Veículos</h1>
    <p className="text-sm text-gray-600 mb-4">Relatório gerado em: {new Date().toLocaleDateString('pt-BR')}</p>
    <table className="w-full text-left printable-table">
      <thead>
        <tr className="border-b bg-gray-50">
          <th className="p-3 font-semibold">Placa</th>
          <th className="p-3 font-semibold">Veículo</th>
          <th className="p-3 font-semibold">Proprietário</th>
          <th className="p-3 font-semibold">RENAVAM</th>
        </tr>
      </thead>
      <tbody>
        {vehicles.map(vehicle => (
          <tr key={vehicle.id} className="border-b">
            <td className="p-3">{vehicle.plate}</td>
            <td className="p-3">
              <div>{vehicle.brand} {vehicle.model}</div>
              <div className="text-sm">{vehicle.color} ({vehicle.year_manufacture}/{vehicle.year_model})</div>
            </td>
            <td className="p-3">{vehicle.ownerName}</td>
            <td className="p-3">{vehicle.renavam}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default PrintableVehicleList;