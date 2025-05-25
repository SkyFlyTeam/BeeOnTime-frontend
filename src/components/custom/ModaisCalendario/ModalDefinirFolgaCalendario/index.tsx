interface DefinirFolgaCalendarioProps {
    onClose: () => void;
    onClick: () => void;
    diaSelecionado: Date;
    usuarioCod: number
    bancoHoras: BancoHoras
}

import { useEffect, useState } from "react";
import { isWeekend } from "date-fns";
import { formatDateToYYYYMMDD } from "@/utils/functions/formatDateToYDMString";

// Interface
import { folgaService } from "@/services/folgaService";
import { BancoHoras } from "@/interfaces/bancoHoras";

// Components
import { toast, ToastContainer } from "react-toastify";
import { Button } from "@/components/ui/button";

// Styles
import stylesModal from "../style.module.css";

const ModalDefinirFolgaCalendario: React.FC<DefinirFolgaCalendarioProps> = ({
    onClose,
    onClick,
    diaSelecionado,
    usuarioCod,
    bancoHoras
}) => {

    const [mensagem, setMensagem] = useState<string>();

    const handleSave = async () => {
		try{
			if(!mensagem || diaSelecionado || usuarioCod ){ return }
			const dia_formatted = formatDateToYYYYMMDD(diaSelecionado);

			let mapped_folga = {
				"folgaDataPeriodo": [
					dia_formatted
				],
				"folgaObservacao": "Folga Geral",
				"folgaDiasUteis": isWeekend(diaSelecionado) ? 0 : 1, 
				"usuarioCod": {
						"usuario_cod": usuarioCod
				},
				"folgaTipo": {
						"tipoFolgaCod": 1
				}
			}

			await folgaService.cadastrarFolga(mapped_folga);
			onClose();
			showToast(true);
		}catch (err) {
			console.error("Erro ao salvar feriados.");
			showToast(false);
		}
    }

	const showToast = (success: boolean) => {
			success ? showSucessToast() : showErrorToast();
		}
	
	const showSucessToast = () => {
		toast.success("Folga salvo com sucesso!", {
			position: "top-center",
		});
	};

	const showErrorToast = () => {
		toast.error("Erro salvar Folga.", {
			position: "top-center",
		});
	};
    
    return (
        <>
        <div className={stylesModal.modal_container} onClick={onClick}>
            <div className={stylesModal.modal} onClick={(e) => e.stopPropagation()}>
                <div className="flex w-full items-center">
                    <h4 className={stylesModal.modalTitle}>Definir dia de folga</h4>
                </div>

                <span><b className="text-[#7C7A7B]">Colaborador:</b> Sarah Batagioti </span>
                <span><b className="text-[#7C7A7B]">Data selecionado:</b> {diaSelecionado.toLocaleDateString('pt-BR')}</span>
                <span><b className="text-[#7C7A7B]">Banco de horas:</b> {bancoHoras.bancoHorasSaldoAtual}</span>
                <div className="flex flex-col gap-0.5">
                  <label>Observação</label>
                    <input
                      type="text"
                      value={mensagem}
                      onChange={(e) => setMensagem(e.target.value)}
					  className="border-[2px] border-gray-[#7C7A7B] rounded-md p-1"
                    />
                </div>
                <Button
                    variant='warning'
                    onClick={handleSave}
                    size='sm'
                >
                    Enviar
                </Button>
            </div>
        </div>
		<ToastContainer position="top-center" autoClose={3000} />
        </>
    );
};

export default ModalDefinirFolgaCalendario;
