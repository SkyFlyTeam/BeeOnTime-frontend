
'use client'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState } from "react";

export function EditarColaborador() {
  const [formData, setFormData] = useState({
    nome: "Maria Souza",
    cpf: "564.598.398-98",
    email: "maria.souza@email.com",
    dataNascimento: "2021-03-14",
    numeroRegistro: "5465655456456",
    tipoContrato: "CLT",
    dataContratacao: "2021-03-14",
    cargo: "Analista",
    nivelAcesso: "Administrador",
    setor: "Recursos Humanos"
  });

  const handleChange = (key: string, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  const handleSubmit = () => {
    // Lógica para salvar as alterações
  };

  return (
    <Card className="w-full bg-[#fafbfc] mx-auto">
      <CardHeader>
        <CardTitle>Informações Sarah Montuani</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        
        <div>
          <Label>Nome</Label>
          <Input value={formData.nome} onChange={(e) => handleChange("nome", e.target.value)} />
        </div>

        <div>
          <Label>CPF</Label>
          <Input value={formData.cpf} onChange={(e) => handleChange("cpf", e.target.value)} />
        </div>

        <div>
          <Label>Email</Label>
          <Input value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
        </div>

        <div>
          <Label>Data de Nascimento</Label>
          <Input type="date" value={formData.dataNascimento} onChange={(e) => handleChange("dataNascimento", e.target.value)} />
        </div>

        <div>
          <Label>Número de Registro</Label>
          <Input value={formData.numeroRegistro} onChange={(e) => handleChange("numeroRegistro", e.target.value)} />
        </div>

        <div>
          <Label>Tipo de Contrato</Label>
          <Select value={formData.tipoContrato} onValueChange={(value) => handleChange("tipoContrato", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CLT">CLT</SelectItem>
              <SelectItem value="PJ">PJ</SelectItem>
              <SelectItem value="Freelancer">Estagiário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Data de Contratação</Label>
          <Input type="date" value={formData.dataContratacao} onChange={(e) => handleChange("dataContratacao", e.target.value)} />
        </div>

        <div>
          <Label>Cargo</Label>
          <Input value={formData.cargo} onChange={(e) => handleChange("cargo", e.target.value)} />
        </div>

        <div>
          <Label>Nível de Acesso</Label>
          <Select value={formData.nivelAcesso} onValueChange={(value) => handleChange("nivelAcesso", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Administrador">Administrador</SelectItem>
              <SelectItem value="Usuário">Usuário</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Setor</Label>
          <Select value={formData.setor} onValueChange={(value) => handleChange("setor", value)}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
              <SelectItem value="Financeiro">Financeiro</SelectItem>
              <SelectItem value="Tecnologia">Tecnologia</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="col-span-full flex justify-end">
          <Button onClick={handleSubmit}>Salvar</Button>
        </div>

      </CardContent>
    </Card>
  );
}
