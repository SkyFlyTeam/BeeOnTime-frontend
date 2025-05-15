import * as React from "react";
import { usePathname } from "next/navigation";
import { Users, Building, Home, LogOut, MessageSquare, AlarmClockCheck, UserRound, LucideIcon, MapPin, UserRoundCheckIcon, House, HouseIcon } from "lucide-react";
import { LiaBusinessTimeSolid } from "react-icons/lia";
import { IconType } from "react-icons";

// Components
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavSecondary } from "./nav-secondary";
import { getUsuario } from "@/services/authService";
import { useEffect, useState } from "react";
import { Usuario } from "@/interfaces/usuario";
import { empresaServices } from "@/services/empresaService";

// Tipos
type RoleKey = "Administrador" | "Gestor" | "Funcionário";

type SubNavItem = {
  title: string;
  url: string;
  icon: LucideIcon | IconType;
};

type NavItem = {
  title: string;
  items: SubNavItem[];
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { state, isMobile, openMobile } = useSidebar();
  const pathname = usePathname();
  const [selectedRole, setSelectedRole] = React.useState<RoleKey>("Administrador");
  const [enterpriseName, setEnterpriseName] = React.useState<string | undefined>(undefined);
  const [usuario, setUsuario] = useState<undefined | Usuario>(undefined);
  
  

  useEffect(() => {
    getUser();
  }, []);
  
  useEffect(() => {
    if (usuario?.empCod) {
      getEmpresaName(usuario.empCod);
    }
  }, [usuario]);
  
  const getUser = async () => {
    const user = await getUsuario();
    const data = user.data;
    setUsuario(data);
  
    const nivel = data.nivelAcesso.nivelAcesso_cod;
    if (nivel === 0) setSelectedRole("Administrador");
    else if (nivel === 1) setSelectedRole("Gestor");
    else if (nivel === 2) setSelectedRole("Funcionário");
  };
  
  const getEmpresaName = async (empCod: number) => {
    try {
      const empresa = await empresaServices.verificarEmpresaById(empCod);
      if (empresa) {
        setEnterpriseName(empresa.empNome);
      } else {
        console.warn("Nenhuma empresa encontrada.");
      }
    } catch (error) {
      console.error("Erro ao buscar nome da empresa:", error);
    }
  };

  const rolesData: Record<RoleKey, { navMain: NavItem[]; navSecondary: SubNavItem[] }> = {
    Administrador: {
      navMain: [
        {
          title: "ATIVIDADES",
          items: [
            { title: "Início", url: "/inicio", icon: House},
            { title: "Solicitações", url: "/solicitacao", icon: MessageSquare },
          ],
        },
        {
          title: "RELATÓRIOS",
          items: [
            { title: "Banco de Horas", url: "/bancoHoras", icon: LiaBusinessTimeSolid },
          ],
        },
        {
          title: "GESTÃO DA EMPRESA",
          items: [
            { title: "Empresa", url: "/empresa", icon: Building },
            { title: "Colaboradores", url: "/colaboradores", icon: Users },
          ],
        },
      ],
      navSecondary: [
        { title: usuario?.usuario_nome || "Usuário", url: "/administrador", icon: UserRound },
        { title: "Sair", url: "/logout", icon: LogOut },
      ],
    },
    Gestor: {
      navMain: [
        {
          title: "ATIVIDADES",
          items: [
            { title: "Início", url: "/inicio", icon: Home },
            { title: "Solicitações", url: "/solicitacao", icon: MessageSquare },
          ],
        },
        {
          title: "MARCAÇÕES",
          items: [
            { title: "Meus Pontos", url: "/historico-ponto", icon: AlarmClockCheck }
          ]
        },
        {
          title: "RELATÓRIOS",
          items: [
            { title: "Pontos Diários", url: "/pontosDiarios", icon: MapPin},
            { title: "Banco de Horas", url: "/bancoHoras", icon: LiaBusinessTimeSolid },
          ],
        },
        {
          title: "GESTÃO DA EMPRESA",
          items: [
            { title: "Colaboradores", url: "/colaboradores", icon: Building },          
          ],
        },
      ],
      navSecondary: [
        { title: usuario?.usuario_nome || "Usuário", url: "/gestor", icon: UserRound },
        { title: "Sair", url: "/logout", icon: LogOut },
      ],
    },
    Funcionário: {
      navMain: [
        {
          title: "ATIVIDADES",
          items: [
            { title: "Início", url: "/inicio", icon: Home },
            { title: "Solicitações", url: "/solicitacao", icon: MessageSquare },
          ],
        },
        {
          title: "MARCAÇÕES",
          items: [
            { title: "Meus Pontos", url: "/historico-ponto", icon: AlarmClockCheck },
            { title: "Banco de Horas", url: "/bancoHoras", icon: LiaBusinessTimeSolid }
          ]
        },
      ],
      navSecondary: [
        { title: usuario?.usuario_nome || "Usuário", url: "/funcionario", icon: UserRound },
        { title: "Sair", url: "/logout", icon: LogOut },
      ],
    },
  };

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-3">
          <h1 style={{ fontSize: '20px' }}>{enterpriseName}</h1>
          {((!isMobile && state === "expanded") || (isMobile && openMobile)) && <SidebarTrigger />}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {rolesData[selectedRole].navMain.map((section: NavItem) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel style={{ fontSize: '14px' }}>{section.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item: SubNavItem) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.url;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <a
                          href={item.url}
                          className="flex items-center gap-2 px-4 py-5 rounded-lg transition"
                          style={{
                            backgroundColor: isActive ? "#FFF4D9" : undefined,
                            color: isActive ? "#FFB503" : "black",
                            fontSize: "18px"
                          }}
                        >
                          <Icon className="!w-[1.5rem] !h-[1.5rem]" style={{ color: isActive ? "#FFB503" : "#6b7280" }} />
                          {item.title}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        <div className="mt-auto">
          <NavSecondary items={rolesData[selectedRole].navSecondary} />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
