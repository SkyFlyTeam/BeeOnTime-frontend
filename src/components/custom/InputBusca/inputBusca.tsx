// components/SearchInput.tsx
import { Input } from "@/components/ui/input";
import React from "react";

import { FiSearch } from "react-icons/fi";

interface InputBuscaProps {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}

const InputBusca: React.FC<InputBuscaProps> = ({ value, onChange, placeholder = "Buscar..." }) => {
  return (
    <div className="relative">
      <FiSearch className="absolute top-3 left-3 text-gray-400"/>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="max-w-sm bg-white pl-8 text-base"
      />
    </div>
  );
};

export default InputBusca;
