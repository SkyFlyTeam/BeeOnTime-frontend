import { useState } from 'react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu'; // Ajustei o import para usar a mesma fonte que o Solicitacao
import { ChevronUp, ChevronDown, Calendar } from 'lucide-react';
import Modal from '../../../components/custom/modalSolicitacao/index';
import ModalDecisaoHoraExtra from '@/components/custom/modalSolicitacao/modalHoraExtra/modalHoraExtra';
import ModalAjustePonto from '@/components/custom/modalSolicitacao/modalAjustePonto';
import { IsModalFeriasOpen } from '../../../pages/solicitacao/testeModal'; // Ajuste o caminho conforme necessário
import SolicitacaoInterface from '../../../interfaces/Solicitacao';
import CalendarFerias from '../CalendarFerias/calendarFerias';
import ModalFerias from '../modalSolicitacao/modalFerias';

interface BotaoDropdownSolicitacaoProps {
  usuarioCod: number;
  usuarioCargo: string;
  isContratadoMaisDeUmAno: boolean;
  numeroSolicitacoesFeriasAbertas: number;
  handleSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => Promise<void>;
  onOpenModal: (tipo: string) => void; // <- NOVO
}

export default function BotaoDropdownSolicitacao({
  usuarioCod,
  usuarioCargo,
  isContratadoMaisDeUmAno,
  numeroSolicitacoesFeriasAbertas,
  handleSolicitacaoUpdate,
}: BotaoDropdownSolicitacaoProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalFeriasOpen, setIsModalFeriasOpen] = useState(false);
  const [isModalFolgaOpen, setIsModalFolgaOpen] = useState(false);
  const [isModalHoraExtraOpen, setIsModalHoraExtraOpen] = useState(false);
  const [isModalAjustePontoOpen, setIsModalAjustePontoOpen] = useState(false);
  const [isModalLicencaMedicaOpen, setIsModalLicencaMedicaOpen] = useState(false);

  const handleDropdownSelect = (tipo: string) => {
    setIsDropdownOpen(false); // Fecha o dropdown depois de selecionar
    switch (tipo) {
      case 'Férias':
        setIsModalFeriasOpen(true);
        break;
      case 'Folga':
        setIsModalFolgaOpen(true);
        break;
      case 'Hora extra':
        setIsModalHoraExtraOpen(true);
        break;
      case 'Ajuste de ponto':
        setIsModalAjustePontoOpen(true);
        break;
      case 'Licença médica':
        setIsModalLicencaMedicaOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className='flex gap-4 w-fit py-1 mb-4 '>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger
          className="flex items-center bg-yellow-500 text-black px-4 py-2 rounded-md mt-4 "
        >
          Nova solicitação
          {isDropdownOpen ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white border border-gray-200 mr-[3rem] w-full ">
            {['Férias', 'Folga', 'Hora extra', 'Ajuste de ponto', 'Licença médica'].map((tipo) => {
                const isFerias = tipo === 'Férias';
                const isDisabled = isFerias && (!isContratadoMaisDeUmAno || numeroSolicitacoesFeriasAbertas >= 30);

                return (
                <DropdownMenuItem
                    key={tipo}
                    onSelect={() => !isDisabled && handleDropdownSelect(tipo)}
                    className={`font-semibold cursor-pointer hover:!bg-[#FFF4D9] ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}
                >
                    {tipo}
                </DropdownMenuItem>
                );
            })}
            </DropdownMenuContent>
      </DropdownMenu>

    {/* Modais correspondentes a cada tipo de solicitação */}
    {isModalFeriasOpen && (
        <ModalFerias onClose={() => setIsModalFeriasOpen(false)}/>
    )}

     {/* E ir adicionando os outro Modais fora o exemplo de férias */}
    </div>
  );
}
