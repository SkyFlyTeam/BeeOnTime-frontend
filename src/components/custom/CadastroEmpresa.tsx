// src/components/CadastroForm.tsx
"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { cadastrarEmpresa } from "@/services/empresaService";
import { cadastrarSetor } from "@/services/setorService";
import { z } from "zod";
import ModalEmpresa from "./ModalEmpresa";
import CadastroSetores from "./CadastroSetores";
import CadastroAdministradorForm from "./CadastroAdministrador";

export default function CadastroEmpresaForm() {
  const [isOpen, setIsOpen] = useState(false);
  const [modalAtual, setModalAtual] = useState(1)
  const [formData, setFormData] = useState({
    empNome: "",
    empRazaoSocial: "",
    empCnpj: "",
    empCep: "",
    empCidade: "",
    empEstado: "",
    empEndereco: "",
  });
  const [setoresData, setSetoresData] = useState<string[]>([]);
  const [adminData, setAdminData] = useState({
    admin_nome: "",
    admin_email: "",
    admin_setor: "",
    admin_tipoContrato: "",
    admin_cargo: "Administrador",
    admin_nvlAcesso: "Administrador"
  });
  const [setorInput, setSetorInput] = useState("");
  const [formErrors, setFormErrors] = useState<any>({});

  //useEffect dedicado a, toda vez que o modal for fechado, voltamos para primeira página, tudo isso sem perder os dados
  useEffect(() => {
    if (!isOpen) {
      setModalAtual(1);
    }
  }, [isOpen]);

  useEffect(() => {
    const fetchAddress = async () => {
      const cepNumerico = formData.empCep.replace("-", "");
      
      if (cepNumerico.length === 8) {
        try {
          const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
          const data = await response.json();
          
          if (!data.erro) {
            setFormData(prevFormData => ({
              ...prevFormData,
              empCidade: data.localidade,
              empEstado: data.uf,
              empEndereco: `${data.logradouro}, ${data.bairro}`
            }));
          }
        } catch (error) {
          console.error("Erro ao buscar CEP:", error);
        }
      }
    };
  
    fetchAddress();
  }, [formData.empCep]);
  


  // handleChangers para fazer com que os inputs funcionem tranquilamente
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "empCnpj") {
      const formattedValue = formatCNPJ(value);
      setFormData({ ...formData, [name]: formattedValue });
    } else if (name === "empCep") {
      const formattedValue = formatCEP(value);
      setFormData({ ...formData, [name]: formattedValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleChangeAdmin = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdminData({ ...adminData, [name]: value });
  };

  // Handles para Setor
  const handleSetorInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSetorInput(e.target.value);
  };

  const handleAddSetor = () => {
    if (setorInput.trim() === "") return;
    const updatedSetores = [...setoresData, setorInput];
    setSetoresData(updatedSetores);
    setSetorInput("");
  };

  const handleRemoveSetor = (indexToRemove: number) => {
    const updatedSetores = setoresData.filter((_, index) => index !== indexToRemove);
    setSetoresData(updatedSetores);
  };

  //Funções de máscara para CNPJ e CEP
  const formatCNPJ = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 14) {
      return digits
        .replace(/(\d{2})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1/$2")
        .replace(/(\d{4})(\d)/, "$1-$2");
    }
    return digits.slice(0, 14).replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  };

  const formatCEP = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 8) {
      return digits.replace(/(\d{5})(\d)/, "$1-$2");
    }
    return digits.slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2");
  };

  // Função final, que envia os dados para cada endpoint
  const handleSubmit = (formData: any, setoresData: any, adminData: any) => {
    cadastrarEmpresa(formData)
    cadastrarSetor(setoresData)
    }

  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="bg-blue-500 text-white p-2 rounded-md">
        Abrir Cadastro
      </button>

      {/* Primeiro Modal - Cadastro Empresa */}
      {modalAtual === 1 && (
        <ModalEmpresa isOpen={isOpen} onClose={() => setIsOpen(false)} title="Seja Bem Vindo!" etapaAtual={modalAtual}>
          <div style={{ width: "85%", margin: "0 auto" }}>
            <form className="flex flex-col gap-4">
              <div>
                <div className="flex-1" style={{ marginTop: "3%" }}>
                  <label htmlFor="empNome" className="mb-2">Nome</label>
                  <input
                    id="empNome"
                    type="text"
                    name="empNome"
                    value={formData.empNome}
                    onChange={handleChange}
                    
                    className="border p-2 rounded-md w-full"
                  />
                  {formErrors.empNome && <p className="text-red-500">{formErrors.empNome._errors[0]}</p>}
                </div>
                <div className="flex-1" style={{ marginTop: "3%" }}>
                  <label htmlFor="empRazaoSocial" className="mb-2">Razão Social</label>
                  <input
                    id="empRazaoSocial"
                    type="text"
                    name="empRazaoSocial"
                    value={formData.empRazaoSocial}
                    onChange={handleChange}
                    
                    className="border p-2 rounded-md w-full"
                  />
                  {formErrors.empRazaoSocial && <p className="text-red-500">{formErrors.empRazaoSocial._errors[0]}</p>}
                </div>
              </div>
              <div>
                <div className="flex-1">
                  <label htmlFor="empCnpj" className="mb-2">CNPJ</label>
                  <input
                    id="empCnpj"
                    type="text"
                    name="empCnpj"
                    value={formData.empCnpj}
                    onChange={handleChange}
                    
                    maxLength={18}
                    className="border p-2 rounded-md w-full"
                  />
                  {formErrors.empCnpj && <p className="text-red-500">{formErrors.empCnpj._errors[0]}</p>}
                </div>
                <div className="flex-1" style={{ marginTop: "3%" }}>
                  <label htmlFor="empCep" className="mb-2">CEP do Endereço</label>
                  <input
                    id="empCep"
                    type="text"
                    name="empCep"
                    value={formData.empCep}
                    onChange={handleChange}
                    
                    className="border p-2 rounded-md w-full"
                  />
                  {formErrors.empCep && <p className="text-red-500">{formErrors.empCep._errors[0]}</p>}
                </div>
              </div>

              {formData.empCidade && formData.empEstado && formData.empEndereco && (
                <div className="endereco-label">
                  {`${formData.empEndereco}, ${formData.empCidade} - ${formData.empEstado}`}
                </div>
              )}

              <button
                type="submit"
                className="text-black p-2 rounded-md"
                style={{ backgroundColor: "#FFB503" }}
                onClick={() => setModalAtual(2)}
              >
                Próximo
              </button>
            </form>
          </div>
        </ModalEmpresa>
      )}

      {/* Segundo Modal - Cadastro Setores */}
      {modalAtual === 2 && (
        <ModalEmpresa
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="Seja Bem Vindo!"
          etapaAtual={modalAtual}
        >
          <div
            style={{
              display: 'grid',
              gridTemplateRows: '1fr auto',
              minHeight: '40vh',
              gap: '1rem', // Adjusts the space between the content and the button
            }}
          >
            {/* Conteúdo superior */}
            <div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label htmlFor="setorInput" className="mb-2">
                    Nome do Setor:
                  </label>
                  <input
                    id="setorInput"
                    type="text"
                    value={setorInput}
                    onChange={handleSetorInputChange}
                    placeholder="Digite o nome do setor"
                    className="border p-2 rounded-md w-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddSetor}
                  style={{
                    backgroundColor: '#FFB503',
                    color: 'black',
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: '23px',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: 'large',
                  }}
                >
                  +
                </button>
              </div>
              <div>
                {setoresData.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-2">
                      {setoresData.map((setor, index) => (
                        <div
                          key={index}
                          style={{
                            position: 'relative',
                            display: 'inline-block',
                          }}
                        >
                          <span
                            style={{
                              border: '1px solid #bbbbbb',
                              borderRadius: '5px',
                              padding: '5px 10px',
                              display: 'inline-block',
                            }}
                          >
                            {setor}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveSetor(index)}
                            style={{
                              position: 'absolute',
                              top: '-8px',
                              right: '-8px',
                              backgroundColor: '#D61818',
                              color: 'white',
                              width: '20px',
                              height: '20px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: '12px',
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botão na parte inferior */}
            <button
              type="button"
              className="text-black p-2 rounded-md"
              onClick={() => setModalAtual(3)}
              style={{
                backgroundColor: '#FFB503',
                width: '100%', // Ensures the button spans the full width of its container
              }}
            >
              Próximo
            </button>
          </div>
        </ModalEmpresa>
      )}


      {modalAtual === 3 && (
        <ModalEmpresa
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Seja Bem Vindo!"
        etapaAtual={modalAtual}
      >
        <div style={{ width: "85%", margin: "0 auto" }}>
          <form
            onSubmit={() => handleSubmit(formData, setoresData, adminData)}
            className="flex flex-col gap-4"
          >
            <div className="flex-1">
              <label htmlFor="admin_nome" className="mb-2">Nome do Administrador</label>
              <input
                id="admin_nome"
                type="text"
                name="admin_nome"
                value={adminData.admin_nome}
                onChange={handleChangeAdmin}
                className="border p-2 rounded-md w-full"
              />
              {/* {formErrors.admin_nome && <p className="text-red-500">{formErrors.admin_nome._errors[0]}</p>} */}
            </div>
      
            <div className="flex-1">
              <label htmlFor="admin_email" className="mb-2">Email</label>
              <input
                id="admin_email"
                type="email"
                name="admin_email"
                value={adminData.admin_email}
                onChange={handleChangeAdmin}
                
                className="border p-2 rounded-md w-full"
              />
              {/* {formErrors.admin_email && <p className="text-red-500">{formErrors.admin_email._errors[0]}</p>} */}
            </div>
      
            <div className="flex-1">
              <label htmlFor="admin_cargo" className="mb-2">Setor</label>
              <input
                id="admin_cargo"
                type="text"
                name="admin_cargo"
                value="Administrador"
                onChange={handleChangeAdmin}
                
                readOnly
                className="border p-2 rounded-md w-full"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
              />
              {/* {formErrors.admin_setor && <p className="text-red-500">{formErrors.admin_setor._errors[0]}</p>} */}
            </div>
      
            <div className="flex-1">
              <label htmlFor="admin_setor" className="mb-2">Setor</label>
              <select
                id="admin_setor"
                name="admin_setor"
                value={adminData.admin_setor}
                onChange={handleChangeAdmin}
                className="border p-2 rounded-md w-full"
              >
                <option value="" disabled>Selecione um setor</option>
                {setoresData.map((setor, index) => (
                  <option key={index} value={setor}>
                    {setor}
                  </option>
                ))}
              </select>
              {/* {formErrors.admin_setor && <p className="text-red-500">{formErrors.admin_setor._errors[0]}</p>} */}
            </div>

      
            {/* Campos lado a lado */}
            <div
              style={{
                display: "flex",
                gap: "20px", // Espaçamento entre os campos
              }}
            >
              <div style={{ flex: 1 }}>
                <label htmlFor="admin_tipoContrato" className="mb-2">Tipo de Contrato</label>
                <select
                  id="admin_tipoContrato"
                  name="admin_tipoContrato"
                  value={adminData.admin_tipoContrato}
                  onChange={handleChangeAdmin}
                  className="border p-2 rounded-md w-full"
                >
                  <option value="" disabled>Selecione</option>
                  <option value="CLT">CLT</option>
                  <option value="PJ">PJ</option>
                </select>
                {/* {formErrors.admin_tipoContrato && (
                  <p className="text-red-500">{formErrors.admin_tipoContrato._errors[0]}</p>
                )} */}
              </div>
      
              <div style={{ flex: 1 }}>
                <label htmlFor="admin_nvlAcesso" className="mb-2">Nível de Acesso</label>
                <input
                  id="admin_nvlAcesso"
                  type="text"
                  name="admin_nvlAcesso"
                  value="Administrador"
                  onChange={handleChangeAdmin}
                  
                  readOnly
                  className="border p-2 rounded-md w-full"
                />
                {/* {formErrors.admin_nvlAcesso && (
                  <p className="text-red-500">{formErrors.admin_nvlAcesso._errors[0]}</p>
                )} */}
              </div>
            </div>
      
            <button
              type="submit"
              className="text-black p-2 rounded-md"
              style={{ backgroundColor: "#FFB503" }}
            >
              Próximo
            </button>
          </form>
        </div>
      </ModalEmpresa>
      )}
    </div>
  );
}