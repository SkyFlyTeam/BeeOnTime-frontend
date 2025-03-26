"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Definimos explicitamente os cargos permitidos
type RoleKey = "Administrador" | "Gestor" | "Funcionário";

export function RoleSwitcher({
  roles,
  defaultRole,
  onRoleChange,
}: {
  roles: RoleKey[]; //  Agora `roles` aceita apenas `RoleKey`
  defaultRole: RoleKey; // O valor padrão precisa ser um `RoleKey`
  onRoleChange: (role: RoleKey) => void; // Garantimos que a função só recebe valores válidos
}) {
  const [selectedRole, setSelectedRole] = React.useState<RoleKey>(defaultRole);

  const handleRoleChange = (role: RoleKey) => {
    setSelectedRole(role); // Atualiza o estado local
    onRoleChange(role); // Chama a função externa para atualizar a sidebar
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Users className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none">
                <span className="font-medium">Cargo</span>
                <span className="">{selectedRole}</span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-auto" align="start">
            {roles.map((role) => (
              <DropdownMenuItem key={role} onSelect={() => handleRoleChange(role)}>
                {role} {role === selectedRole && <Check className="ml-auto" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
