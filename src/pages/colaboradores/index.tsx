// General
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';

// Interfaces
import { Usuario } from "@/interfaces/usuario";

// Services

import { usuarioServices } from "@/services/usuarioServices";

// Components
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/listagem";
import { toast, ToastContainer } from "react-toastify";
import CadastroUsuario from "@/components/custom/ModalCadastroUsuario/CadastroUsuario";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

// Styles
import 'react-toastify/dist/ReactToastify.css';

// import styles from '@/styles/Colaboradores.module.css'
// import CadastroUsuario from "@/components/CadastroUsuario";
import { getUsuario } from "@/services/authService";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import InputBusca from "@/components/custom/InputBusca/inputBusca";
import { NivelAcesso } from "@/interfaces/nivelAcesso";
import { Setor } from "@/interfaces/setor";
import { Jornada } from "@/interfaces/jornada";
import { addBusinessDays } from "date-fns";
import { noop } from "@tanstack/react-table";
// import styles from './Colaboradores.module.css';


interface FilterFields {
  usuario_cargo: string[],
  setor: string[],
  usuario_cargaHoraria: string[],
  usuarioTipoContratacao: string[],
  nivelAcesso: string[],
}

interface FilterLists {
  usuario_cargo: boolean[],
  setor: boolean[],
  usuario_cargaHoraria: boolean[],
  usuarioTipoContratacao: boolean[],
  nivelAcesso: boolean[],
}


export default function Colaboradores() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // Garante que seja um array vazio inicialmente
  const [usuariosFiltered, setUsuariosFiltered] = useState<Usuario[]>([]); // Garante que seja um array vazio inicialmente
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [thisUser, setThisUser] = useState<Usuario>();

  const [filterValue, setFilterValue] = React.useState<string>("");

  const [isOpen, setIsOpen] = useState(false);

  const [filterList, setFilterList] = useState<FilterLists>({
    usuario_cargo: [],
    setor: [],
    usuario_cargaHoraria: [],
    usuarioTipoContratacao: [],
    nivelAcesso: [],
  })
  const [fieldList, setFieldList] = useState<FilterFields>({
    usuario_cargo: [],
    setor: [],
    usuario_cargaHoraria: [],
    usuarioTipoContratacao: ["CLT", "Estágio"],
    nivelAcesso: ["Administrador", "Gestor", "Funcionário"],
  });


  const [fieldsFiltered, setFieldsFiltered] = useState<boolean[]>([]);
  const fieldsHeaders = ["Cargo", "Setor", "Carga Horária Diária", "Contrato", "Nível Acesso"]



  const [columnFiltered, setColumnFiltered] = useState<boolean[]>([]);
  const columnProps = ["usuario_nome", "usuario_cargo", "setor", "usuario_cargaHoraria", "usuarioTipoContratacao", "nivelAcesso"]
  const columnHeaders = ["Nome", "CARGO", "SETOR", "CARGA HORÁRIA DIÁRIA", "CONTRATO", "NÍVEL ACESSO", "AÇÕES"]


  const router = useRouter();

  const fetchUsuarios = async () => {
    try {
      let data = await usuarioServices.getAllUsuarios();
      const local = (await getUser()) as Usuario;
      setThisUser(local)

      if (local.nivelAcesso.nivelAcesso_cod == 2)
        return;


      if (Array.isArray(data) && local.nivelAcesso.nivelAcesso_cod == 1)
        data = data.filter((usuario) => usuario.setor.setorCod == local.setor.setorCod)


      if (Array.isArray(data))
        data = data.filter((usuario) => usuario.usuario_cod != local.usuario_cod)

      if (Array.isArray(data))
        data.forEach((usuario, index) =>
          Object.keys(usuario).forEach((key) => {
            if (!columnProps.includes(key) && key != "usuario_cod")
              delete data[index][key];
          })
        )

      const fields: FilterFields = {
        usuario_cargo: [],
        usuario_cargaHoraria: [],
        setor: [],
        usuarioTipoContratacao: fieldList.usuarioTipoContratacao,
        nivelAcesso: fieldList.nivelAcesso
      }
      if (Array.isArray(data))
        ["usuario_cargo", "usuario_cargaHoraria"].forEach((key) =>
          [...new Map(data.map((usuario) => [usuario[key], usuario])).values()]
            .forEach((usuario) => fields[key as keyof typeof fields].push(usuario[key] ? usuario[key].toString() : "")))

      if (Array.isArray(data))
        [...new Map(data.map((usuario) => [usuario["setor"]["setorNome"], usuario])).values()] // Monta um array com valores únicos
          .forEach((usuario) => fields["setor"].push(usuario["setor"]["setorNome"]))
      // Atribui o valor para um outro array


      setFieldList(fields);


      const filters: FilterLists = {
        usuario_cargo: [],
        usuario_cargaHoraria: [],
        setor: [],
        usuarioTipoContratacao: [],
        nivelAcesso: []
      }
      Object.keys(fields).forEach((field) =>
        fields[field as keyof typeof fields].forEach(() =>
          filters[field as keyof typeof filters].push(true)
        )
      )
      setFilterList(filters);

      setUsuariosFiltered(Array.isArray(data) ? data : []);
      setUsuarios(Array.isArray(data) ? data : []);  // Garantindo que o valor seja um array
    } catch (err) {
      setError("Erro ao carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  const getUser = async () => {
    const user = await getUsuario();
    console.log(user);
    return user.data;
  }


  const initFields = () => {
    let fieldsInit: boolean[] = []
    fieldsHeaders.forEach(() =>
      fieldsInit.push(false)
    )
    setFieldsFiltered(fieldsInit)
  }

  const initColumns = () => {
    let columnsInit: boolean[] = []
    columnHeaders.forEach(() =>
      columnsInit.push(true)
    )
    setColumnFiltered(columnsInit)
  }

  useEffect(() => {
    fetchUsuarios();

    initColumns();
    initFields();
  }, []);

  const showToast = (success: boolean) => {
    success ? showSucessToast() : showErrorToast();
  }

  const showSucessToast = () => {
    toast.success("Colaborador cadastrado com sucesso!", {
      position: "top-center",
    });
  };

  const showErrorToast = () => {
    toast.error("Erro ao cadastrar colaborador.", {
      position: "top-center",
    });
  };

  useEffect(() => {
    if (!isOpen) {
      fetchUsuarios();
    }
  }, [isOpen]);

  const handleViewUser = (usuarioId: number) => {
    console.log(`Ver detalhes do usuário com ID: ${usuarioId}`);
    router.push(`/historico-ponto/${usuarioId}`)
  };

  const SkeletonRow = () => (
    <div className="flex flex-row gap-7 mt-10">
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-72 h-10" />
      <Skeleton className="bg-gray-200 w-48 h-10" />
      <Skeleton className="bg-gray-200 w-32 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
    </div>
  );

  if (loading) {
    return (
      <div>
        <div className="container mx-auto px-4 flex justify-between">
          <h1 className="text-3xl font-bold text-left">Colaboradores</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#FFB503] text-black py-1 px-8 rounded-md hover:bg-[#FFCB50] transition-colors"
          >
            Adicionar
          </button>
        </div>
        <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">
          {/* <Skeleton className="h-[3rem] w-full rounded-xl mt-5" /> */}
          <div className="flex flex-row gap-7">
            <Skeleton className="bg-gray-200 w-24 h-10" />
            <Skeleton className="bg-gray-200 w-24 h-10" />
            <Skeleton className="bg-gray-200 w-24 h-10" />
            <Skeleton className="bg-gray-200 w-72 h-10" />
            <Skeleton className="bg-gray-200 w-48 h-10" />
            <Skeleton className="bg-gray-200 w-32 h-10" />
            <Skeleton className="bg-gray-200 w-24 h-10" />
          </div>
          {[...Array(5)].map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}


        </div>
      </div>

    );
  }

  const handleColumnFilterChange = (idx: number) => {
    let newColumnFilter = Object.assign([] as Boolean[], columnFiltered)
    newColumnFilter[idx] = !columnFiltered[idx]

    setColumnFiltered(newColumnFilter)
  }

  const handleFieldFilterChange = (idx: number) => {
    let newFieldsFilter = Object.assign([] as Boolean[], fieldsFiltered)
    newFieldsFilter[idx] = !fieldsFiltered[idx]

    setFieldsFiltered(newFieldsFilter)

    if (!newFieldsFilter[idx])
      return;

    let newFilterList = Object.assign({}, filterList)
    const field = columnProps[idx + 1] as keyof typeof newFilterList;
    newFilterList[field].forEach((bool, idx) =>
      newFilterList[field][idx] = true
    )

    setFilterList(newFilterList)
  }


  const checkField = (prop: string, usuario: any, filter: string) => {
    let word = "";
    switch (prop) {
      case "setor":
        word = (usuario as Usuario).setor.setorNome.toString();
        break;
      case "nivelAcesso":
        word = (usuario as Usuario).nivelAcesso.nivelAcesso_nome.toString();
        break;
      default:
        word = usuario[prop as keyof typeof usuario].toString();
    }
    return word != filter;
  }

  const applyFilter = (filterRaw: string) => {
    if (filterRaw == "")
      return usuarios

    const filter = filterRaw.toLowerCase();
    const filtered = usuarios.filter((usuario) => {
      if (!usuario)
        return true;

      return Object.keys(usuario).some((props) => {
        const propUsuario = props as keyof typeof usuario

        if (!columnProps.includes(props))
          return false

        if (props == "nivelAcesso")
          return (usuario[propUsuario] as NivelAcesso).nivelAcesso_nome
            .toLowerCase()
            .includes(filter)

        if (props == "setor" && thisUser?.setor.setorCod == 0)
          return (usuario[propUsuario] as Setor).setorNome
            .toLowerCase()
            .includes(filter)

        if ((usuario[propUsuario] as string).length < filter.length)
          return false;


        alert((usuario[propUsuario] as string)
          .toString()
          .toLowerCase()
          .includes(filter))
        return (usuario[propUsuario] as string)
          .toString()
          .toLowerCase()
          .includes(filter)
      })
    })
    
    return filtered;
  }

  const handleFilterListChange = (fieldName: string, idz: number) => {
    let newFilterList = Object.assign({}, filterList)
    const field = fieldName as keyof typeof newFilterList;
    newFilterList[field][idz] = !filterList[field][idz]
    setFilterList(newFilterList)

    let newUsuarioFiltered = applyFilter(filterValue)

    Object.keys(newFilterList).forEach((prop) => {
      filterList[prop as keyof typeof filterList].forEach((checked, id) => {
        if (!checked)
          newUsuarioFiltered = newUsuarioFiltered.filter((usuario) =>
            checkField(
              prop,
              usuario,
              fieldList[prop as keyof typeof fieldList][id].toString()
            )
          )
      })
    })

    setUsuariosFiltered(newUsuarioFiltered)
  }

  const handleBuscaFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(event.target.value);

    setUsuariosFiltered(applyFilter(event.target.value))
  };

  if (error) {
    return <div>{error}</div>;
  }

  if (!thisUser)
    return;
  return (
    <div>
      <div className="container mx-auto px-4 flex justify-between">
        <h1 className="text-3xl font-bold text-left">Colaboradores</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#FFB503] text-black py-1 px-8 rounded-md hover:bg-[#FFCB50] transition-colors"
        >
          Adicionar
        </button>
      </div>

      {isOpen && (
        <CadastroUsuario onClose={() => setIsOpen(false)} onSave={showToast} />
      )}


      {/* Busca e seleção de Filtros */}
      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg mt-5">
        <div className="overflow-x-auto">
          <div className="w-full flex justify-between items-center">
            <InputBusca
              value={filterValue}
              onChange={handleBuscaFilterChange}
              placeholder="Buscar..."
            />


            <div className="flex items-center gap-4 justify-between py-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white text-base">
                    Filtros <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {fieldsHeaders
                    .map((headers, idx) => !(headers.toLocaleLowerCase() == "setor" && thisUser.nivelAcesso.nivelAcesso_cod != 0) ?(
                      <DropdownMenuCheckboxItem
                        key={idx}
                        className="capitalize"
                        checked={fieldsFiltered[idx]}
                        onCheckedChange={() => handleFieldFilterChange(idx)}
                      >
                        {headers.replace(/([a-z])([A-Z])/g, '$1 $2')}
                      </DropdownMenuCheckboxItem>
                    ) : null)
                  }
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="bg-white text-base">
                    Colunas <ChevronDown />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {columnProps
                    .map((props, idx) => (!(props.toLocaleLowerCase() == "setor" && thisUser.nivelAcesso.nivelAcesso_cod != 0) ? (
                      <DropdownMenuCheckboxItem
                        key={idx}
                        className="capitalize"
                        checked={columnFiltered[idx]}
                        onCheckedChange={() => handleColumnFilterChange(idx)}
                      >
                        {columnHeaders[idx].replace(/([a-z])([A-Z])/g, '$1 $2')}
                      </DropdownMenuCheckboxItem>
                    ) : null)
                    )
                  }
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Filtros específicos */}
          <div className="flex items-center gap-4 justify-start py-4">
            {fieldsFiltered
              .map((checked, idx) => (
                checked ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white text-base">
                        {fieldsHeaders[idx]} <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {filterList[columnProps[idx + 1] as keyof typeof filterList]
                        .map((checked, idz) => (
                          <DropdownMenuCheckboxItem
                            key={idz}
                            className="capitalize"
                            checked={checked}
                            onCheckedChange={() => handleFilterListChange(columnProps[idx + 1], idz)}
                          >
                            {fieldList[columnProps[idx + 1] as keyof typeof filterList][idz].toString().replace(/([a-z])([A-Z])/g, '$1 $2')}
                          </DropdownMenuCheckboxItem>
                        )
                        )
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null
              ))}
          </div>


          {/* Desktop - Tabela horizontal */}
          <div className="hidden md:block">
            <Table className="min-w-[900px] w-full">
              <TableHeader>
                <TableRow>
                  {columnHeaders.map((header, idx) => {
                    if (columnFiltered[idx] && !(header.toLocaleLowerCase() == "setor" && thisUser.nivelAcesso.nivelAcesso_cod != 0))
                      return (
                        <TableHead
                          key={idx}
                          className="border border-gray-200 text-center font-bold text-black text-base p-4"
                        >
                          {header}
                        </TableHead>
                      )
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuariosFiltered.length > 0 ? (
                  usuariosFiltered.map((usuario, index) => (
                    <TableRow
                      key={index}
                      className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
                    >
                      {columnProps.map((header, idx) => {
                        if (columnFiltered[idx] && !(header.toLocaleLowerCase() == "setor" && thisUser.nivelAcesso.nivelAcesso_cod != 0))
                          return (
                            <TableCell key={idx} className="border border-gray-200 text-center text-black text-base p-3">
                              {
                                header == "nivelAcesso" ?
                                  usuario.nivelAcesso.nivelAcesso_nome
                                  : (
                                    header == "setor" ?
                                      usuario.setor.setorNome
                                      : usuario[header as keyof typeof usuario]?.toString()
                                  )
                              }
                            </TableCell>
                          )
                        return;
                      })}

                      <TableCell className="border-r border-gray-300 text-left justify-center flex">
                        <button
                          onClick={() => handleViewUser(usuario.usuario_cod)}
                          className={"bg-[#FFB503] rounded-md p-2 hover:bg-orange-600 " +
                            (usuario.usuario_cod == thisUser.usuario_cod ? "invisible" : "")
                          }
                          disabled={usuario.usuario_cod == thisUser.usuario_cod}
                        >
                          <FontAwesomeIcon icon={faEye} className="text-black-600" />
                        </button>
                      </TableCell>

                    </TableRow>
                  )
                  )) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Nenhum colaborador encontrado</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile - Tabela deitada com mesmo estilo */}
          <div className="block md:hidden overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse text-sm text-black">
              <tbody>
                {[
                  { label: "NOME", render: (usuario: Usuario) => usuario.usuario_nome },
                  { label: "CARGO", render: (usuario: Usuario) => usuario.usuario_cargo },
                  { label: "SETOR", render: (usuario: Usuario) => usuario.setor?.setorNome },
                  { label: "CARGA HORÁRIA DIÁRIA", render: (usuario: Usuario) => usuario.usuario_cargaHoraria },
                  { label: "CONTRATO", render: (usuario: Usuario) => usuario.usuarioTipoContratacao },
                  { label: "NÍVEL ACESSO", render: (usuario: Usuario) => usuario.nivelAcesso?.nivelAcesso_nome },
                  {
                    label: "AÇÕES", render: (usuario: Usuario) => (<button onClick={() => handleViewUser(usuario.usuario_cod)}
                      className="bg-[#FFB503] rounded-md p-2 hover:bg-orange-600">
                      <FontAwesomeIcon icon={faEye} className="text-black-600" />
                    </button>)
                  }
                ].map((row, idx) => !(thisUser.nivelAcesso.nivelAcesso_cod != 0 && row.label.toLocaleLowerCase() == "setor") ? (
                  <tr key={idx}>
                    <td className="border border-gray-200 p-3 font-semibold">{row.label}</td>
                    {usuariosFiltered.length > 0 ? (
                      usuariosFiltered.map((usuario, i) => ((usuario.usuario_cod !== thisUser?.usuario_cod && usuario.nivelAcesso.nivelAcesso_cod !== 0) ? (
                        <td
                          key={i}
                          className={`border border-gray-200 p-3 text-center text-base ${i % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
                          `}
                        >
                          {row.render(usuario)}
                        </td>
                      ) : null))
                    ) : (
                      <td colSpan={6} className="text-center">Nenhum colaborador encontrado</td>
                    )}
                  </tr>
                ) : null)}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
