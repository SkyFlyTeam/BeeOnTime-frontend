import { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { ChevronUp, ChevronDown } from 'lucide-react';
import SolicitacaoInterface from '../../../interfaces/Solicitacao';

interface BotaoDropdownSolicitacaoProps {
  usuarioCod: number;
  usuarioCargo: string;
  handleSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => Promise<void>;
  onOpenModal: (tipo: string) => void; // <- NOVO
}

export default function BotaoDropdownSolicitacao({
  usuarioCod,
  usuarioCargo,
  handleSolicitacaoUpdate,
  onOpenModal,
}: BotaoDropdownSolicitacaoProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleDropdownSelect = (tipo: string) => {
    setIsDropdownOpen(false);
    onOpenModal(tipo); // <- Chama quem controla o Modal
  };

  return (
    <div className='flex gap-4 w-fit py-1  '>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="flex items-center bg-[#FFB503] text-black px-4 py-3 rounded-md outline-none">
          Nova solicitação
          {isDropdownOpen ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border border-gray-200 mr-[3rem] w-full">
          {['Hora extra', 'Ausência médica'].map((tipo) => (
            <DropdownMenuItem
              key={tipo}
              onSelect={() => handleDropdownSelect(tipo)}
              className="font-medium cursor-pointer hover:!bg-[#FFF4D9]"
            >
              {tipo}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
