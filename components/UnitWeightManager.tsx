"use client";

import { updateSubUnitWeightAction } from "@/app/actions/admin";
import { useState } from "react";
import { Scale, Check, Save } from "lucide-react";

interface Unit {
  id: string;
  identifier: string;
  fractionalWeight: number;
}

export function UnitWeightManager({ units }: { units: Unit[] }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempWeight, setTempWeight] = useState<string>("");

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {units.map((unit) => (
        <div key={unit.id} className="bg-black/20 border border-white/5 p-4 rounded-2xl flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">{unit.identifier}</span>
            <Scale className="w-3.5 h-3.5 text-primary/40" />
          </div>
          
          {editingId === unit.id ? (
            <form action={async (formData) => {
              await updateSubUnitWeightAction(formData);
              setEditingId(null);
            }} className="flex items-center gap-2">
              <input type="hidden" name="subUnitId" value={unit.id} />
              <input 
                name="fractionalWeight"
                type="text"
                value={tempWeight}
                onChange={(e) => setTempWeight(e.target.value)}
                autoFocus
                className="w-full bg-white/5 border border-primary/30 rounded-lg px-2 py-1 text-xs text-white focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button type="submit" className="bg-primary p-1.5 rounded-lg text-white">
                <Check className="w-3.5 h-3.5" />
              </button>
            </form>
          ) : (
            <div 
              onClick={() => {
                setEditingId(unit.id);
                setTempWeight(unit.fractionalWeight.toString());
              }}
              className="flex items-center justify-between cursor-pointer group"
            >
              <span className="text-lg font-mono font-bold text-primary italic">
                {unit.fractionalWeight.toFixed(6)}
              </span>
              <Save className="w-3 h-3 text-white/0 group-hover:text-white/20 transition-all" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
