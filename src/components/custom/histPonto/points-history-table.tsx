import { useEffect, useState } from "react";
// import { ApiException } from '../../config/apiExceptions'

// Interfaces
import { Ponto } from "@/interfaces/marcacaoPonto";
import HistPontos from "@/interfaces/histPonto";
import { Usuario } from "@/interfaces/usuario";

// Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/custom/histPonto/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, PencilLine } from "lucide-react";
import ModalCriarSolicitacao from "../modalSolicitacao/modalEnvioSolicitacao";
import { faltaServices } from "@/services/faltaService";
import React from "react";
import Faltas from "@/interfaces/faltas";
import ModalCriarSolicitacaoFalta from "../modalSolicitacao/modalEnvioSolicitacaoFalta";

import styles from "./styles.module.css"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import TablePagination from "../TablePagination/TablePagination";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import HistPonto from "@/interfaces/histPonto";
import { Input } from "@/components/ui/input";

dayjs.extend(utc);
dayjs.extend(timezone);
//<FontAwesomeIcon icon="fa-regular fa-arrow-right-to-bracket" />

interface PointsHistoryTableProps {
  entries: HistPontos[] | null;
  onEdit: (entry: HistPontos) => void;
  userInfo: Usuario | null;
  className?: string;
  accessLevel: "USER" | "ADM"; // Recebe o AccessLevel para diferentes acessos
}

interface FilterLists {
  horasData: boolean[],
  pontos: boolean[],
  horasTrabalhadas: boolean[],
  horasExtras: boolean[],
  horasFaltantes: boolean[],
  horasNoturnas: boolean[],
}
interface FilterFields {
  horasData: string[],
  pontos: string[],
  horasTrabalhadas: string[],
  horasExtras: string[],
  horasFaltantes: string[],
  horasNoturnas: string[],
}

const PointsHistoryTable = React.forwardRef<HTMLDivElement, PointsHistoryTableProps>(
  ({ entries, onEdit, userInfo, className, accessLevel }, ref) => {
    if (!userInfo)
      return;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalAusenciaOpen, setIsModalAusenciaOpen] = useState(false);
    const [selectedPonto, setSelectedPonto] = useState<HistPontos | null>(null);
    const [selectedFalta, setSelectedFalta] = useState<Faltas | null>(null);
    const [faltas, setFaltas] = useState<{ [key: string]: boolean }>({}); // Store falta data for each entry

    const [dataMin, setDataMin] = useState<string>("");
    const [dataMax, setDataMax] = useState<string>("");

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Altere se quiser mais ou menos por página



    const [headersFiltered, setHeadersFiltered] = useState<boolean[]>([]);
    // Corta os dados para mostrar apenas os da página atual
    const [entriesFiltered, setEntriesFiltered] = useState<HistPonto[]>([]);
    const [paginatedEntries, setPaginatedEntries] = useState<HistPonto[]>([]);
    const [totalPages, setTotalPages] = useState<number>(0);


    const [filterList, setFilterList] = useState<FilterLists>({
      horasData: [],
      pontos: [],
      horasTrabalhadas: [],
      horasExtras: [],
      horasFaltantes: [],
      horasNoturnas: [],
    })
    const [fieldList, setFieldList] = useState<FilterFields>({
      horasData: [],
      pontos: [],
      horasTrabalhadas: [],
      horasExtras: [],
      horasFaltantes: [],
      horasNoturnas: [],
    });


    const fetchFaltas = async () => {
      try {
        const faltaData: { [key: string]: any } = {};  // Initialize an object to store the full Falta objects
        if (entries) {
          for (const entry of entries) {
            const falta = await faltaServices.getFaltabyUsuarioCodAndDate(userInfo!.usuario_cod, entry.horasData.toLocaleString());
            faltaData[entry.horasData.toLocaleString()] = falta || null;  // Store the full Falta object or null
          }
        }
        setFaltas(faltaData);  // Set the fetched falta data
      } catch (error) {
        console.error("Error fetching falta data:", error);
      }
    };

    const headers = [
      "DATA",
      "PONTOS",
      "HORAS NORMAIS",
      "HORAS EXTRAS",
      "HORAS FALTANTES",
      "ADICIONAL NOTURNO",
      ...(accessLevel === "USER" ? ["AÇÕES"] : []),
    ];

    const headersProps = [
      "horasData",
      "pontos",
      "horasTrabalhadas",
      "horasExtras",
      "horasFaltantes",
      "horasNoturnas",
      ...(accessLevel === "USER" ? ["_action"] : []),
    ];

    useEffect(() => {
      // Fetch faltas when the component mounts or entries change
      fetchFaltas();

      let bool: boolean[] = [];
      headersProps.forEach(() => bool.push(false));
      setHeadersFiltered(bool);


      if (!entries)
        return;

      setEntriesFiltered(entries)

      setTotalPages(Math.ceil(entriesFiltered.length / rowsPerPage));

      setPaginatedEntries(entries.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage));

      // Cria uma lista isolada de opções únicas
      let fields = Object.assign({}, {
        horasData: [],
        pontos: [],
        horasTrabalhadas: [],
        horasExtras: [],
        horasFaltantes: [],
        horasNoturnas: [],
      } as FilterFields)
      // Inicia população da lista, menos em "pontos"
      headersProps.forEach((key) => {
        if (key == "pontos")
          return;
        [...new Map(entries.map((histponto) => [histponto[key as keyof typeof histponto], histponto])).values()]
          .forEach((histponto) => fields[key as keyof typeof fields].push(histponto[key as keyof typeof histponto].toString()))
      })
      // Popula opções de "pontos" por ter estrutura única
      if (entries)
        [...new Map(entries.map((histponto) =>
          [
            histponto["pontos"].length > 0
              ? histponto["pontos"]
                .map(
                  (ponto: Ponto) => `${ponto.horarioPonto.toString().substring(0, 5)}`)
                .join(" - ")
              : "---", histponto]
        )).values()] // Monta um array com valores únicos
          .forEach((histponto) => fields["pontos"].push(
            histponto["pontos"].length > 0
              ? histponto["pontos"]
                .map((ponto: Ponto) => `${ponto.horarioPonto.toString().substring(0, 5)}`)
                .join(" - ")
              : "---"
          ))
      setFieldList(fields)
      setDataMin(fields.horasData[0].toString())
      setDataMax(fields.horasData[fields.horasData.length - 1].toString())
      // Aplica resultados da lista de opções

      // Cria uma lista isolada de booleana de acordo com a lista de opções anterior
      const filters: FilterLists = {
        horasData: [],
        pontos: [],
        horasTrabalhadas: [],
        horasExtras: [],
        horasFaltantes: [],
        horasNoturnas: [],
      }
      // Popula em "true" por estar listando todas as opções
      Object.keys(fields).forEach((field) =>
        fields[field as keyof typeof fields].forEach(() =>
          filters[field as keyof typeof filters].push(true)
        )
      )
      setFilterList(filters);
      // Aplica resultados da lista bool das opçções
    }, [entries]);



    const handleModalOpen = (entry: HistPontos) => {
      setSelectedPonto(entry);
      setIsModalOpen(true);
    };

    const handleModalClose = () => {
      setIsModalOpen(false);
      setSelectedPonto(null);
    };

    const handleModalAusenciaOpen = (entry: any) => {
      setSelectedFalta(entry);
      setIsModalAusenciaOpen(true);
    };

    const handleModalAusenciaClose = () => {
      setIsModalAusenciaOpen(false);
      setSelectedFalta(null);
    };



    // Função para calcular carga horária semanal e mensal
    const calculateCargaHoraria = (horasDiarias: number, diasTrabalhados: number) => {
      const horasSemana = horasDiarias * diasTrabalhados; // Total de horas na semana
      const horasMes = horasSemana * 4; // Aproximadamente 4 semanas por mês
      return { horasSemana, horasMes };
    };

    const jornadaFormatada = () => {
      if (userInfo.jornadas.jornada_horarioFlexivel)
        return "Horário flexível";

      const diasDaSemanaSiglas = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

      const diasTrabalhados = userInfo.jornadas.jornada_diasSemana
        .map((trabalha, index) => trabalha ? diasDaSemanaSiglas[index] : null)
        .filter((dia) => dia !== null);

      return `${diasTrabalhados.join(", ")} das ${userInfo.jornadas.jornada_horarioEntrada.toString().slice(0, 5)} até ${userInfo.jornadas.jornada_horarioSaida.toString().slice(0, 5)}`;
    };

    const { horasSemana, horasMes } = calculateCargaHoraria(userInfo.usuario_cargaHoraria!, userInfo.jornadas.jornada_diasSemana?.filter(dia => dia).length ?? 0);




    const checkField = (prop: string, histponto: any, filter: string) => {
      let word = "";
      switch (prop) { // Por existirem diferentes estruturas, aplica um filtro de acordo com o apresentado na tabela
        case "pontos":
          word =
            histponto["pontos"].length > 0
              ? histponto["pontos"]
                .map((ponto: Ponto) => `${ponto.horarioPonto.toString().substring(0, 5)}`)
                .join(" - ")
              : "---"
          break;
        default:
          word = histponto[prop as keyof typeof histponto].toString();
      }
      return word != filter;
    }

    const applyFilters = (newFilterList: FilterLists, newDataMin?: string, newDataMax?: string) => {
      let newEntriesFiltered = Object.assign([], entries)

      const min = newDataMin ? newDataMin : dataMin;
      const max = newDataMax ? newDataMax : dataMax;

      Object.keys(newFilterList).forEach((prop) => {
        const propIndex = prop as keyof typeof filterList

        if (prop == "horasData")
          newEntriesFiltered = newEntriesFiltered.filter((histponto: HistPonto) => { // horasData usa Input Date para filtrar
            return !(histponto.horasData.toString() < min ||
              histponto.horasData.toString() > max)
          }
          )
        else
          filterList[propIndex].forEach((checked, id) => {
            if (!checked) // Filtra de acordo com lista boolean
              newEntriesFiltered = newEntriesFiltered.filter((histponto) =>
                checkField(
                  prop,
                  histponto,
                  fieldList[propIndex][id].toString()
                ))
          })
      })

      setEntriesFiltered(newEntriesFiltered)
      setTotalPages(Math.ceil(newEntriesFiltered.length / rowsPerPage));
      setPaginatedEntries(newEntriesFiltered.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage));
    }

    const handleHeadersFilteredChange = (idx: number) => {
      let newHeadersFiltered = Object.assign([] as Boolean[], headersFiltered)
      newHeadersFiltered[idx] = !newHeadersFiltered[idx]

      setHeadersFiltered(newHeadersFiltered)

      // if (!newHeadersFiltered[idx])
      //   return;

      let newFilterList = Object.assign({}, filterList)

      const field = headersProps[idx] as keyof typeof newFilterList;
      newFilterList[field].forEach((bool, idx) =>
        newFilterList[field][idx] = true
      )

      setFilterList(newFilterList)


      if (newHeadersFiltered[0]) {
        applyFilters(newFilterList)
        return;
      }

      const min = fieldList.horasData[0].toString();
      const max = fieldList.horasData[fieldList.horasData.length - 1].toString() 
      setDataMin(min)
      setDataMax(max)
      applyFilters(newFilterList, min, max)
    }

    const handleFilterListChange = (fieldName: string, idz: number) => {
      let newFilterList = Object.assign({}, filterList)
      const field = fieldName as keyof typeof newFilterList;
      newFilterList[field][idz] = !filterList[field][idz]
      setFilterList(newFilterList)
      applyFilters(newFilterList)
    }

    const handleFilterDataMinChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLimit = event.target.value.toString();
      const min = (newLimit > dataMax) ? dataMax : newLimit;
      const max = undefined;
      setDataMin(min)

      applyFilters(filterList, min, max)
    }
    const handleFilterDataMaxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newLimit = event.target.value.toString();
      const min = undefined;
      const max = (newLimit < dataMin) ? dataMin : newLimit;
      setDataMax(max)

      applyFilters(filterList, min, max)
    }


    return (
      <div ref={ref} className={"p-6 shadow-xl rounded-xl bg-white"}>

        {/* Desktop - Tabela horizontal */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-3 md:py-2">
          <div className="flex flex-row items-center gap-2 md:gap-4">
            <h1 className="text-base md:text-lg font-bold">Jornada de Trabalho:</h1>
            <p className="text-base md:text-lg text-black">{jornadaFormatada()}</p>
          </div>
          <div className="flex flex-row items-center gap-2 md:gap-4">
            <h1 className="text-base md:text-lg font-bold">Carga horária:</h1>
            <p className="text-base md:text-lg text-black">{horasSemana}h/semana - {horasMes}h/mês</p>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="bg-white text-base">
                  Filtros <ChevronDown />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {headersProps
                  .map((header, idx) => (
                    <DropdownMenuCheckboxItem
                      key={idx}
                      className="capitalize"
                      checked={headersFiltered[idx]}
                      onCheckedChange={() => handleHeadersFilteredChange(idx)}
                    >
                      {headers[idx].replace(/([a-z])([A-Z])/g, '$1 $2')}
                      {/* {header.replace(/([a-z])([A-Z])/g, '$1 $2')} */}
                    </DropdownMenuCheckboxItem>
                  )
                  )
                }
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Filtros específicos */}
        <div className="flex items-center gap-4 justify-start">
          {headersFiltered
            .map((checked, idx) => {
              if (!checked)
                return null;

              const headerProp = headersProps[idx] as keyof typeof filterList
              if (headersProps[idx] != "horasData")
                return (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" className="bg-white text-base">
                        {headers[idx].replace(/([a-z])([A-Z])/g, '$1 $2')} <ChevronDown />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {filterList[headerProp]
                        .map((checked, idz) => (
                          <DropdownMenuCheckboxItem
                            key={idz}
                            className="capitalize"
                            checked={checked}
                            onCheckedChange={() => handleFilterListChange(headersProps[idx], idz)}
                          >
                            {fieldList[headerProp][idz]
                              .toString()
                              .replace(/([a-z])([A-Z])/g, '$1 $2')}
                          </DropdownMenuCheckboxItem>
                        ))
                      }
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              return (
                <div className="flex flex-row gap-4 flex-wrap">
                  <Input type="date" className="border p-2 rounded-md bg-white w-[10rem]" value={dataMin} onChange={handleFilterDataMinChange} />

                  <Input type="date" className="border p-2 rounded-md bg-white w-[10rem]" value={dataMax} onChange={handleFilterDataMaxChange} />
                </div>
              )
            }
            )}
        </div>

        <div className="overflow-x-auto hidden md:block py-4">
          <Table className="min-w-[900px] w-full">
            <TableHeader>
              <TableRow>
                {headers.map((header, idx) => (
                  <TableHead key={idx} className="border border-gray-200 text-center font-bold text-black text-base p-4">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map((entry, index) => (
                  <TableRow
                    key={index}
                    className={
                      (index + (currentPage - 1) * rowsPerPage) % 2 === 0
                        ? "bg-[#FFF8E1] hover:bg-orange-200"
                        : "bg-[#FFFFFF] hover:bg-orange-200"
                    }
                  >
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {dayjs(entry.horasData).tz("America/Sao_Paulo").format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      <div className="flex flex-col">
                        {entry.pontos.length > 0 ? (
                          <div>
                            {entry.pontos
                              .map((ponto: Ponto) => `${ponto.horarioPonto.toString().substring(0, 5)}`)
                              .join(" - ")}
                          </div>
                        ) : (
                          <div>---</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {entry.horasTrabalhadas.toFixed(0)}
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {entry.horasExtras.toFixed(0)}
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {entry.horasFaltantes.toFixed(0)}
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {entry.horasNoturnas.toFixed(0)}
                    </TableCell>
                    {accessLevel === "USER" && (
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                        {!faltas[entry.horasData.toLocaleString()] ? (
                          <div className={styles.relative}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="relative bg-[#FFC107] hover:bg-[#e0a800] text-white"
                              onClick={() => handleModalOpen(entry)}
                            >
                              <PencilLine className="h-4 w-4 text-[#42130F]" />
                              <span className={styles.tooltip_text}>Solicitar ajuste</span>
                            </Button>
                          </div>
                        ) : (
                          <div className={styles.relative}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="relative bg-[#FFC107] hover:bg-[#e0a800] text-white"
                              onClick={() => handleModalAusenciaOpen(faltas[entry.horasData.toLocaleString()])}
                            >
                              <PencilLine className="h-4 w-4 text-[#42130F]" />
                              <span className={styles.tooltip_text}>Justificar ausência</span>
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="h-24 text-center">
                    <div className="flex flex-col p-5 w-full justify-center items-center">
                      <img src="/images/sem_conteudo.svg" alt="Sem conteúdo" style={{ width: "30rem", height: "20rem" }} />
                      <p className="font-medium">Ops! Parece que não tem nada aqui!</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

        </div>

        {/* Mobile - Tabela transposta */}
        <div className="block md:hidden overflow-x-auto mt-4">
          <Table className="min-w-[700px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="border border-gray-200 text-center font-bold text-black  p-4">
                  DATA
                </TableHead>

                {paginatedEntries.map((entry, index) => (
                  <TableHead
                    key={index}
                    className={`border border-gray-200 text-center  text-black  p-4 ${(index + (currentPage - 1) * rowsPerPage) % 2 === 0
                      ? "bg-[#FFF8E1]"
                      : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {dayjs(entry.horasData).tz("America/Sao_Paulo").format("DD/MM/YYYY")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="">
                <TableCell className="border border-gray-200 text-center font-bold p-3 ">PONTOS:</TableCell>
                {paginatedEntries.map((entry, idx) => (
                  <TableCell
                    key={idx}
                    className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {entry.pontos.length > 0
                      ? entry.pontos.map((ponto: Ponto) => ponto.horarioPonto.toString().substring(0, 5)).join(" - ")
                      : "---"}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="">
                <TableCell className="border border-gray-200 text-center font-bold p-3 ">HORAS NORMAIS:</TableCell>
                {paginatedEntries.map((entry, idx) => (
                  <TableCell
                    key={idx}
                    className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {entry.horasTrabalhadas.toFixed(0)}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="">
                <TableCell className="border border-gray-200 text-center font-semibold p-3 ">HORAS EXTRAS:</TableCell>
                {paginatedEntries.map((entry, idx) => (
                  <TableCell
                    key={idx}
                    className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {entry.horasExtras.toFixed(0)}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="">
                <TableCell className="border border-gray-200 text-center font-semibold p-3 ">HORAS FALTANTES:</TableCell>
                {paginatedEntries.map((entry, idx) => (
                  <TableCell
                    key={idx}
                    className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {entry.horasFaltantes.toFixed(0)}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="">
                <TableCell className="border border-gray-200 text-center font-semibold p-3 ">ADICIONAL NOTURNO:</TableCell>
                {paginatedEntries.map((entry, idx) => (
                  <TableCell
                    key={idx}
                    className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {entry.horasNoturnas.toFixed(0)}
                  </TableCell>
                ))}
              </TableRow>

              {accessLevel === "USER" && (
                <TableRow className="">
                  <TableCell className="border border-gray-200 text-center font-bold p-3 ">AÇÕES:</TableCell>
                  {paginatedEntries.map((entry, idx) => (
                    <TableCell
                      key={idx}
                      className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                        } hover:bg-orange-200`}
                    >
                      {!faltas[entry.horasData.toLocaleString()] ? (
                        <div className={styles.relative}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative bg-[#FFC107] hover:bg-[#e0a800] text-white"
                            onClick={() => handleModalOpen(entry)}
                          >
                            <PencilLine className="h-4 w-4 text-[#42130F]" />
                            <span className={styles.tooltip_text}>Solicitar ajuste</span>
                          </Button>
                        </div>
                      ) : (
                        <div className={styles.relative}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative bg-[#FFC107] hover:bg-[#e0a800] text-white"
                            onClick={() => handleModalAusenciaOpen(faltas[entry.horasData.toLocaleString()])}
                          >
                            <PencilLine className="h-4 w-4 text-[#42130F]" />
                            <span className={styles.tooltip_text}>Justificar ausência</span>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>



        {/* Modal */}
        {
          isModalOpen && selectedPonto && (
            <ModalCriarSolicitacao
              isOpen={isModalOpen}
              onClose={handleModalClose}
              ponto={selectedPonto}
            />
          )
        }

        {
          isModalAusenciaOpen && selectedFalta && (
            <ModalCriarSolicitacaoFalta
              isOpen={isModalAusenciaOpen}
              onClose={handleModalAusenciaClose}
              falta={selectedFalta}
            />
          )
        }

        <div className="flex justify-end w-full mt-6">
          <div className="">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page: number) => setCurrentPage(page)}
              showPreviousNext
            />
          </div>
        </div>
      </div >

    );
  }
);

PointsHistoryTable.displayName = "PointsHistoryTable";

export { PointsHistoryTable };
