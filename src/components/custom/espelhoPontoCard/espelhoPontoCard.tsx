import { FaRegFileAlt } from "react-icons/fa";
import { useState } from "react";

type Status = "pendente" | "assinado" | "indisponível";

interface EspelhoPontoCardProps {
  mesAno: string;
  status: Status;
  onClick?: () => void;
}

export default function EspelhoPontoCard({ mesAno, status, onClick }: EspelhoPontoCardProps) {
  const [hovered, setHovered] = useState(false);

  const statusInfo = {
    pendente: {
      label: "Assinatura pendente",
      color: "bg-gray-500",
    },
    assinado: {
      label: "Assinado",
      color: "bg-yellow-400",
    },
    indisponível: {
      label: "Indisponível",
      color: "bg-gray-400",
    },
  };

  const isClickable = status !== "indisponível";
  const { label, color } = statusInfo[status];

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative flex items-center justify-between w-64 h-20 px-6 py-4 rounded-xl bg-white shadow-md transition 
        ${isClickable ? "cursor-pointer hover:shadow-lg" : "cursor-not-allowed opacity-50"}`}
    >
      <div className="flex items-center gap-3 text-gray-800 font-medium">
        <FaRegFileAlt size={20} />
        <span className="text-base">{mesAno}</span>
      </div>

      {/* Status icon */}
      <div className="relative pl-12 pr-4">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
          <FaRegFileAlt size={14} className="text-white" />
        </div>

        {hovered && (
          <div className="absolute left-1/4 transform -translate-x-1/4 mt-2 z-10">
            <div
              className={`text-white text-sm px-3 py-1 rounded-md ${color} relative`}
            >
              {label}
              <div
                className={`absolute top-1 left-1/2 transform -translate-x-1/2 -translate-y-full w-2 h-2 rotate-45 ${color}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
