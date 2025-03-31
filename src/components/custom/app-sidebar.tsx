import * as React from "react";
import { usePathname } from "next/navigation";
import { LayoutGrid, Users, FileText, Settings, Database, LifeBuoy, LucideIcon, AlertCircle, Bell, UserRound, Building, Calendar, Clock, Home, LogOut, MessageSquare, AlarmClockCheck } from "lucide-react";

import { RoleSwitcher} from "@/components/custom/role-switcher";
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
import { useEffect } from "react";

// Definir um tipo que aceita apenas os cargos válidos
type RoleKey = "Administrador" | "Gestor" | "Funcionário";

// Definição do tipo correto para os itens do menu
type SubNavItem = {
  title: string;
  url: string;
  icon: LucideIcon
};

type NavItem = {
  title: string; // Título da seção
  items: SubNavItem[]; // Itens dentro da seção
};

// Dados do menu com títulos de seções e páginas
const rolesData: Record<RoleKey, { navMain: NavItem[]; navSecondary: SubNavItem[] }> = {
  Administrador: {
    navMain: [
      {
        title: "ATIVIDADES",
        items: [
          { title: "Solicitações", url: "/solicitacoes", icon: MessageSquare },
          
        ],
      },
      {
        title: "GESTÃO DA EMPRESA",
        items: [
          { title: "Empresa", url: "/empresa", icon: Building },
          { title: "Colaboradores", url: "/", icon: Users },
        ],
      },
    ],
    navSecondary: [
      // { title: "Administrador", url: "/administrador", icon: UserRound },
      { title: "Sair", url: "/logout", icon: LogOut },
    ],
  },
  Gestor: {
    navMain: [
      {
        title: "ATIVIDADES",
        items: [
          { title: "Início", url: "/inicio", icon: Home },
          { title: "Solicitações", url: "/solicitacoes", icon: MessageSquare },
        ],
      },
      {
        title: "MARCAÇÕES",
        items: [
          {title: "Meus Pontos", url: "/meusPontos", icon: AlarmClockCheck}
        ]
      },
      {
        title: "GESTÃO DA EMPRESA",
        items: [
          { title: "Colaboradores", url: "/empresa", icon: Building },
        ],
      },
    ],
    navSecondary: [
      // { title: "Gestor", url: "/gestor", icon: UserRound },
      { title: "Sair", url: "/logout", icon: LogOut },
    ],
  },
  Funcionário: {
    navMain: [
      {
        title: "ATIVIDADES",
        items: [
          { title: "Início", url: "/inicio", icon: Home },
          { title: "Solicitações", url: "/solicitacoes", icon: MessageSquare },
        ],
      },
      {
        title: "MARCAÇÕES",
        items: [
          {title: "Meus Pontos", url: "/meusPontos", icon: AlarmClockCheck}
        ]
      }
    ],
    navSecondary: [
      // { title: "Funcionário", url: "/funcionario", icon: UserRound },
      { title: "Sair", url: "/logout", icon: LogOut },
    ],
  },
};

const roles: RoleKey[] = Object.keys(rolesData) as RoleKey[];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const {state, isMobile, openMobile} = useSidebar();
  const pathname = usePathname(); //consegue a url q ta
  const [selectedRole, setSelectedRole] = React.useState<RoleKey>("Administrador");  //Entrar como cargo padrão
  const [ enterpriseName , setEnterpriseName ] =  React.useState<String>("NectoSystems");

    useEffect(() => {
      getUser()
    }, [])
  
    const getUser = async() => {
      const user = await getUsuario();
      console.log (user);
      const usuario = user.data.nivelAcesso.nivelAcesso_cod;

      if (usuario === 0) {
        setSelectedRole("Administrador")
      } else if (usuario === 1) {
        setSelectedRole("Gestor")
      } else if (usuario === 2) {
        setSelectedRole("Funcionário")
      }
    }

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <div className="p-3">
          <h1 > {enterpriseName} </h1>
          {((!isMobile && state === "expanded") || (isMobile && openMobile)) && <SidebarTrigger />} {/* Exibe o botão dentro da sidebar quando expandida */}
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* Renderiza cada seção da sidebar com base no seu cargo */}
        {/* Renderiza a sidebar com base no cargo selecionado */}
        {rolesData[selectedRole].navMain.map((section: NavItem) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
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
                          className="flex items-center gap-2 px-4 py-2 rounded-lg transition"
                          style={isActive ? { backgroundColor: "#FFF4D9", color: "#FFB503" } : { color: "black" }}
                        >
                          {Icon && <Icon className="w-5 h-5" style={{ color: isActive ? "#FFB503" : "#6b7280" }} />}
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
        {/* Mantendo o botão de Sair sempre visível e adaptando o nome do cargo */}
        <div className="mt-auto">
          <NavSecondary items={rolesData[selectedRole].navSecondary} />
        </div>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

