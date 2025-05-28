import React, { use, useEffect, useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import NotificacaoInterface from "@/interfaces/notificacao";
import { notificacaoServices } from "@/services/notificacaoService";
import { ApiException } from "@/config/apiExceptions";
import { getUsuario } from "@/services/authService";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabType = "todas" | "não lidas" | "importantes";

export const NotificationModal: React.FC<NotificationModalProps> = ({ isOpen, onClose }) => {
  const { state } = useSidebar();
  const isExpanded = state === "expanded";
  const [activeTab, setActiveTab] = useState<TabType>("todas");
  const [notificacoes, setNotificacoes] = useState<NotificacaoInterface[]>([])
  const [userCod, setUserCod] = useState<number>()
  const [userCargo, setUserCargo] = useState<string>()
  const [setorNome, setSetorNome] = useState<string>();

  useEffect(() => {
      getUser()
    }, [])
  
  const getUser = async () => {
    try {
      const user = await getUsuario(); // Aqui você chama sua função de API
      console.log("Usuário retornado:", user);

      const usuario = user.data;

      setUserCod(usuario.usuario_cod);
      setUserCargo(usuario.usuario_cargo)

      if (usuario.setor && usuario.setor.setorNome) {
        setSetorNome(usuario.setor.setorNome);
      } else {
        console.warn("Setor ou setorNome não definido no usuário.");
      }

    } catch (error) {
      console.error("Erro ao buscar dados do usuário:", error);
    }
  };

  const fetchNotificacoes = async () => {
    try {
      const data = await notificacaoServices.getAllNotificacao();
      if (data instanceof ApiException) {
        console.error('Erro ao buscar notificações:', data.message);
        return;
      }
      setNotificacoes(data);
    } catch (error) {
      console.error('Erro inesperado:', error);
    }
  };

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchNotificacoes();
    }
  }, [isOpen]);


  
  // Fechar o modal com ESC
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  // Prevenir scroll do corpo quando modal está aberto em dispositivos móveis
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden", "md:overflow-auto");
    } else {
      document.body.classList.remove("overflow-hidden", "md:overflow-auto");
    }
    return () => {
      document.body.classList.remove("overflow-hidden", "md:overflow-auto");
    };
  }, [isOpen]);

  // Handler para mudança de tab
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };

  const notificacoesFiltradas = notificacoes.filter((n) => {
    const direcionadaAoSetor = n.alertaSetorDirecionado === setorNome || n.alertaSetorDirecionado === 'Todos';
    const direcionadaAoUsuario = n.alertaUserAlvo === userCod;

    const pertenceAoUsuario = direcionadaAoSetor || direcionadaAoUsuario;

    if (!pertenceAoUsuario) return false;

    if (activeTab === "todas") return true;
    if (activeTab === "não lidas") return n.alertaCod === 1;
    if (activeTab === "importantes") return n.alertaCod === 2 || n.alertaCod === 3 || n.alertaCod === 4;

    return true;
  });



  return (
    <>
      {/* Overlay em dispositivos móveis */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/30 z-[9998] md:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Modal */}
      <div
        className={`
          fixed top-0 h-full bg-white rounded shadow-lg transition-all duration-300 ease-in-out
          z-[9999]
          /* Largura para mobile */
          w-3/4 sm:w-96
          
          /* Largura maior para desktop */
          md:w-[400px] lg:w-[450px] xl:w-[500px]
          
          /* Posicionamento e comportamento móvel */
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          
          /* Posicionamento desktop: ajuste baseado na largura da sidebar */
          md:top-16
          md:h-[calc(100vh-250px)]
          md:rounded-r-lg md:border-r md:border-t md:border-b
          ${isExpanded 
            ? `md:left-64 ${isOpen ? "md:translate-x-4" : "md:translate-x-[-250%]"}` 
            : `md:left-16 ${isOpen ? "md:translate-x-4" : "md:translate-x-[-150%]"}`
          }
        `}
      >
        <div className="p-2 flex justify-between items-center border-b bg-gray-50">
          {/* Tabs de navegação */}
          <div className="flex space-x-4 w-full">
            <div 
              onClick={() => handleTabChange("todas")}
              className={`cursor-pointer pb-2 px-1 ${activeTab === "todas" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            >
              Todas
            </div>
            <div 
              onClick={() => handleTabChange("não lidas")}
              className={`cursor-pointer pb-2 px-1 ${activeTab === "não lidas" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            >
              Solicitações
            </div>
            <div 
              onClick={() => handleTabChange("importantes")}
              className={`cursor-pointer pb-2 px-1 ${activeTab === "importantes" ? "border-b-2 border-black font-medium" : "text-gray-500"}`}
            >
              Minhas pendências
            </div>
          </div>
          
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100"
          >
            Fechar
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto max-h-[calc(100%-64px)]">
          <div className="space-y-4">
            {notificacoes.length > 0 ? (
              notificacoesFiltradas.map((n) => (
                <div
                  key={n.alertaCod}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                >
                  <div className="flex justify-between items-start">
                    <p className="font-medium">{n.tipoAlerta.tipoAlertaNome ?? "Notificação"}</p>
                    <span className="text-xs text-gray-500">
                      {new Date(n.alertaDataCriacao ?? "").toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{n.alertaMensagem}</p>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  🔔
                </div>
                <p className="text-gray-600">Nenhuma notificação disponível</p>
              </div>
            )}
          
          {/* Se não houver notificações */}
          {/* 
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600">Nenhuma notificação disponível</p>
          </div>
          */}
        </div>
      </div>
    </div>
    </>
  );
};