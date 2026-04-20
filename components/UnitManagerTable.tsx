"use client";

import { useState, useTransition } from "react";
import { Trash2, Edit2, Check, X, Search, ChevronDown, ChevronUp } from "lucide-react";
import { deleteSubUnitsBulkAction, updateSubUnitIdentifierAction } from "@/app/actions/admin";
import { GlassCard } from "./GlassCard";

interface SubUnit {
  id: string;
  identifier: string;
  userId: string | null;
}

interface UnitManagerTableProps {
  initialUnits: SubUnit[];
}

export function UnitManagerTable({ initialUnits }: UnitManagerTableProps) {
  const [units, setUnits] = useState(initialUnits);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempIdentifier, setTempIdentifier] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filtragem
  const filteredUnits = units.filter(u => 
    u.identifier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredUnits.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredUnits.map(u => u.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Deseja realmente excluir ${selectedIds.length} unidades?`)) return;

    const formData = new FormData();
    formData.append("ids", JSON.stringify(selectedIds));

    startTransition(async () => {
      await deleteSubUnitsBulkAction(formData);
      setSelectedIds([]);
      // Atualismo localmente para feedback instantâneo
      setUnits(prev => prev.filter(u => !selectedIds.includes(u.id)));
    });
  };

  const startEditing = (unit: SubUnit) => {
    setEditingId(unit.id);
    setTempIdentifier(unit.identifier);
  };

  const saveEdit = async (id: string) => {
    if (!tempIdentifier.trim()) return;
    
    const formData = new FormData();
    formData.append("subUnitId", id);
    formData.append("identifier", tempIdentifier);

    startTransition(async () => {
      await updateSubUnitIdentifierAction(formData);
      setUnits(prev => prev.map(u => u.id === id ? { ...u, identifier: tempIdentifier } : u));
      setEditingId(null);
    });
  };

  return (
    <div className="space-y-4">
      {/* BARRA DE FERRAMENTAS */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-primary transition-colors" />
          <input 
            type="text" 
            placeholder="Buscar unidade..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
        </div>

        {selectedIds.length > 0 && (
          <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <span className="text-sm font-bold text-white/50">{selectedIds.length} selecionados</span>
            <button 
              onClick={handleDeleteSelected}
              disabled={isPending}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-lg shadow-red-500/20 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" /> Excluir Novos
            </button>
          </div>
        )}
      </div>

      {/* TABELA */}
      <GlassCard delay={0} className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/5 border-b border-white/5 select-none">
                <th className="px-6 py-4 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === filteredUnits.length && filteredUnits.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 font-mono">Identificador</th>
                <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/40 font-mono">Status</th>
                <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-white/40 font-mono">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredUnits.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/20 italic">
                    {searchTerm ? "Nenhuma unidade encontrada para esta busca." : "Nenhuma unidade cadastrada."}
                  </td>
                </tr>
              ) : (
                filteredUnits.map((unit) => (
                  <tr key={unit.id} className={`hover:bg-white/[0.02] transition-colors group ${selectedIds.includes(unit.id) ? 'bg-primary/5' : ''}`}>
                    <td className="px-6 py-4">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(unit.id)}
                        onChange={() => toggleSelect(unit.id)}
                        className="w-5 h-5 rounded border-white/10 bg-white/5 text-primary focus:ring-primary/50 cursor-pointer"
                      />
                    </td>
                    <td className="px-6 py-4">
                      {editingId === unit.id ? (
                        <div className="flex items-center gap-2 animate-in zoom-in-95 duration-200">
                          <input 
                            value={tempIdentifier}
                            onChange={(e) => setTempIdentifier(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && saveEdit(unit.id)}
                            autoFocus
                            className="bg-white/10 border border-primary/50 rounded px-2 py-1 text-white font-bold outline-none ring-2 ring-primary/20"
                          />
                          <button onClick={() => saveEdit(unit.id)} className="text-emerald-400 hover:text-emerald-300 p-1">
                            <Check className="w-4 h-4" />
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-red-400 hover:text-red-300 p-1">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div 
                          className="flex items-center gap-2 cursor-pointer group/item"
                          onClick={() => startEditing(unit)}
                        >
                          <span className="font-bold text-white group-hover:text-primary transition-colors">{unit.identifier}</span>
                          <Edit2 className="w-3 h-3 text-white/10 group-hover/item:text-primary transition-colors opacity-0 group-hover/item:opacity-100" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {unit.userId ? (
                        <span className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 w-fit">
                          <div className="w-1 h-1 rounded-full bg-emerald-400" /> OCUPADA
                        </span>
                      ) : (
                        <span className="text-[10px] text-white/20 font-bold bg-white/5 px-2 py-0.5 rounded-full border border-white/10 w-fit uppercase">VAZIA</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <button 
                            onClick={() => startEditing(unit)}
                            className="w-8 h-8 rounded-lg bg-white/5 text-white/20 hover:text-primary hover:bg-white/10 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                         >
                            <Edit2 className="w-4 h-4" />
                         </button>
                         <button 
                            onClick={async () => {
                              if (!confirm("Excluir esta unidade?")) return;
                              const fd = new FormData();
                              fd.append("ids", JSON.stringify([unit.id]));
                              await deleteSubUnitsBulkAction(fd);
                              setUnits(prev => prev.filter(u => u.id !== unit.id));
                            }}
                            className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}
