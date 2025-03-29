"use client";

import * as React from "react";
import { PointsHistoryTable } from "@/components/custom/histPonto/points-history-table";
import { useState } from "react";

// Tipagem dos dados
interface PointEntry {
  date: string;
  pointsMorning: string;
  pointsAfternoon: string;
  normalHours: string;
  extraHours: string;
  missingHours: string;
  nightShift: string;
}

// Dados mockados
const mockEntries = [
  {
    date: "14/03/2025",
    pointsMorning: "08:00 - 12:00",
    pointsAfternoon: "13:00 - 17:00",
    normalHours: "8h",
    extraHours: "0h",
    missingHours: "0h",
    nightShift: "0h",
  },
  {
    date: "12/03/2025",
    pointsMorning: "12:00 - 14:00",
    pointsAfternoon: "15:00 - 23:00",
    normalHours: "8h",
    extraHours: "2h",
    missingHours: "0h",
    nightShift: "1h",
  },
  {
    date: "13/03/2025",
    pointsMorning: "08:00 - 12:00",
    pointsAfternoon: "13:00 - 20:00",
    normalHours: "8h",
    extraHours: "3h",
    missingHours: "0h",
    nightShift: "0h",
  },
  {
    date: "13/03/2025",
    pointsMorning: "09:00 - 12:00",
    pointsAfternoon: "13:00 - 17:00",
    normalHours: "8h",
    extraHours: "0h",
    missingHours: "1h",
    nightShift: "0h",
  },
];

export default function PointsHistoryPage() {
  //Simulando o diferente acesso
  const[accessLevel, setAccessLevel] = useState<"USER" | "ADM">("ADM")

  const handleEdit = (entry: PointEntry) => {
    // Lógica para editar a entrada (ex.: abrir um modal)
    console.log("Editar entrada:", entry);
  };

  return (
    <div className="flex flex-col  p-6 md:p-9">
      <h1 className="text-xl md:text-3xl font-semibold mb-4">
        {accessLevel === "USER" ? "Meus Pontos" : "Pontos"}
        </h1>
      <PointsHistoryTable 
      entries={mockEntries} 
      onEdit={handleEdit}
      accessLevel={accessLevel} />
    </div>
  );
}