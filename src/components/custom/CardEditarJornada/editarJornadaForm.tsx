// General
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Services
import { usuarioServices } from "@/services/usuarioServices";

// Interfaces
import { Usuario } from "@/interfaces/usuario";

// Components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast, ToastContainer } from "react-toastify";
import { Jornada } from "@/interfaces/jornada";
import { ToggleGroupItem } from "@/components/ui/toggle-group";
import { ToggleGroup } from "@radix-ui/react-toggle-group";




const formSchema = z.object({
    jornada_horarioFlexivel: z.string(),
    jornada_diasSemana: z.string().array(),
    jornada_horarioEntrada: z.string(),
    //        .regex(/^\d{2}:\d{2}:\d{2}$/, "O Horário de Entrada deve estar preenchido."),
    jornada_horarioSaida: z.string(),
    //        .regex(/^\d{2}:\d{2}:\d{2}$/, "O Horário de Saída deve estar preenchido."),
    jornada_horarioAlmoco: z.string(),
    //    .regex(/^\d{2}:\d{2}:\d{2}$/, "O Horário de Almoço deve estar preenchido."),
    usuario_cargaHoraria: z.string(),
});


interface EditarJornadaFormProps {
    usuarioInfo: Usuario;
    logadoInfo: {
        usuario_cod: number;
        setorCod: number;
        nivelAcesso_cod: number
    };
}

export default function EditarJornadaForm({ usuarioInfo, logadoInfo }: EditarJornadaFormProps) {
    if (
        (usuarioInfo.usuario_cod == logadoInfo.usuario_cod) ||
        (usuarioInfo.nivelAcesso.nivelAcesso_cod < logadoInfo.nivelAcesso_cod) ||
        (usuarioInfo.setor.setorCod != logadoInfo.setorCod && logadoInfo.nivelAcesso_cod != 0)
    )
        return;

    const [maxCarga, setMaxCarga] = useState<number>(24);
    const [horarioFlexivel, setHorarioFlexivel] = useState<boolean>(false);
    const [isSaving, setIsSaving] = useState<boolean>(false);

    const jornadasInfo = usuarioInfo.jornadas;
    const flex = jornadasInfo.jornada_horarioFlexivel;

    function isSaveDisabled() {
        return Object.keys(forms.formState.errors).length > 0;
    }

    function isFormsJornadaDefault() {
        const defaultValues = forms.control._defaultValues;
        const values = forms.control._formValues;

        const carga = defaultValues.usuario_cargaHoraria == values.usuario_cargaHoraria
        if (!carga)
            return false;


        if (!defaultValues)
            return false;

        const equals = !Object.keys(defaultValues).some((field) => {
            if (!field.includes("_horario") || field.includes("flex"))
                return false;

            if ((!defaultValues[field as keyof typeof defaultValues] &&
                values[field as keyof typeof defaultValues]) ||
                (defaultValues[field as keyof typeof defaultValues] &&
                    !values[field as keyof typeof defaultValues])
            ) {/* alert("one");*/ return true; }

            if(!defaultValues[field as keyof typeof defaultValues] &&
                    !values[field as keyof typeof defaultValues]
            ) { return false; }
            
                    
            if (defaultValues[field as keyof typeof defaultValues].length < 4 ||
                values[field as keyof typeof defaultValues].length < 4
            ) {/*alert("dois");*/ return true; }

            // alert(defaultValues[field as keyof typeof defaultValues].slice(0, 5) + "\n\n"+ values[field as keyof typeof defaultValues].slice(0, 5))

            if (defaultValues[field as keyof typeof defaultValues].slice(0, 5) !=
                values[field as keyof typeof defaultValues].slice(0, 5)
            ) {/*alert("três");*/ return true; }

            return false;
        })
        if (!equals)
            return false


        if (values.jornada_diasSemana.length != defaultValues.jornada_diasSemana.length)
            return false;

        return true;
    }

    async function wait(milliseconds: number) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }

    function showSucessToast() {
        toast.success("Jornada de " + usuarioInfo.usuario_nome + " atualizado com sucesso!", {
            position: "top-center",
        });
    };

    function diasSemanaToToggle(diasSemana: boolean[] | null): string[] {
        if (!diasSemana)
            return []

        let diasSemanaString: string[] = [];
        for (let i = 0; i < 7; i++)
            if (diasSemana[i])
                diasSemanaString.push("" + i);
        return diasSemanaString;
    }
    function ToggleToDiasSemana(toggleGroup: string[] | null): boolean[] {
        if (!toggleGroup)
            return []


        let diasSemana: boolean[] = [];
        for (let i = 0; i < 7; i++)
            diasSemana.push(false);
        toggleGroup.forEach((pos) => {
            diasSemana[parseInt(pos)] = true;
        });

        return diasSemana;
    }


    const forms = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            jornada_diasSemana: diasSemanaToToggle(jornadasInfo.jornada_diasSemana),
            jornada_horarioAlmoco: !flex && flex != null ? jornadasInfo.jornada_horarioAlmoco.toString() : "12:00:00",
            jornada_horarioEntrada: !flex && flex != null ? jornadasInfo.jornada_horarioEntrada.toString() : "08:00:00",
            jornada_horarioFlexivel: flex || flex == null ? "true" : "false",
            jornada_horarioSaida: !flex && flex != null ? jornadasInfo.jornada_horarioSaida.toString() : "17:00:00",
            usuario_cargaHoraria: usuarioInfo.usuario_cargaHoraria != null ? usuarioInfo.usuario_cargaHoraria.toString() : "0",
        }
    });

    useEffect(() => {


        const onMount = async () => {
            setHorarioFlexivel(usuarioInfo.jornadas.jornada_horarioFlexivel)
        };
        onMount();
    }, []); // Empty dependency array ensures the effect runs once after mount


    function onChange_horarioFlexivel(field: any) {
        setHorarioFlexivel(field.value === "true")
        return field.onChange;
    }


    function limitCargaHoraria(values: any) {
        const horaEntrada = values.jornada_horarioEntrada.split()
        const horaSaida = values.jornada_horarioSaida.split()

    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!isSaving)
            return;

        if (values.jornada_horarioEntrada > values.jornada_horarioSaida) {
            forms.setError("jornada_horarioSaida", { type: "406", message: "Horário inválido." })
            setIsSaving(false);
            return;
        }

        if (values.jornada_horarioEntrada > values.jornada_horarioAlmoco ||
            values.jornada_horarioSaida < values.jornada_horarioAlmoco
        ) {
            forms.setError("jornada_horarioAlmoco", { type: "406", message: "Horário inválido." })
            setIsSaving(false);
            return;
        }

        limitCargaHoraria(values);


        if (Object.keys(forms.formState.errors).length > 0) {
            setIsSaving(false);
            return;
        }
        const usuarioBase = Object.assign({}, usuarioInfo)
        usuarioBase.usuario_senha = "";
        //alert(JSON.stringify(usuarioBase))
        usuarioBase.usuario_cargaHoraria = parseInt(values.usuario_cargaHoraria);
        const novaJornada = Object.assign({}, usuarioInfo.jornadas)



        novaJornada.jornada_diasSemana = ToggleToDiasSemana(values.jornada_diasSemana);
        novaJornada.jornada_horarioAlmoco = values.jornada_horarioAlmoco;
        novaJornada.jornada_horarioEntrada = values.jornada_horarioEntrada;
        novaJornada.jornada_horarioSaida = values.jornada_horarioSaida;
        novaJornada.jornada_horarioFlexivel = values.jornada_horarioFlexivel === "true";

        usuarioBase.jornadas = novaJornada;

        usuarioBase.nivelAcesso_cod = usuarioBase.nivelAcesso.nivelAcesso_cod;
        usuarioBase.setorCod = usuarioBase.setor.setorCod;

        //alert(JSON.stringify(usuarioBase))




        const testU = usuarioServices.atualizarUsuario(usuarioBase);
        const testJ = usuarioServices.atualizarJornada(novaJornada);
        showSucessToast()
        // Temporary until a better solution is implemented
        await wait(4000);
        window.location.reload();
        //
        setIsSaving(false);
    }



    function onChange_horas(field: any) {

        return field.onChange;
    }

    function onChange_cargaHoraria(field: any) {
        const values = forms.control._formValues;
        const carga = parseInt(field.value);
        const entrada = values.jornada_horarioEntrada.split(":")
        const saida = values.jornada_horarioSaida.split(":")
        entrada.forEach((unit: any) => unit = parseInt(unit));
        saida.forEach((unit: any) => unit = parseInt(unit));



        return field.onChange;
    }

    function ToggleOnChange(field: any) {
        //alert(field.value)
        //field.values.sort()
        return field.onChange;
    }
    return (
        <>
            <Form {...forms}>
                <form onSubmit={forms.handleSubmit(onSubmit)}>
                    <div className="flex flex-row flex-wrap gap-6 text-base md:text-lg">
                        {/* Horário Flexível */}
                        <FormField
                            control={forms.control}
                            name="jornada_horarioFlexivel"
                            render={({ field }) => (
                                <FormItem className="space-y-3 mr-24 relative">
                                    <FormLabel className="text-base md:text-lg">Horas flexível?</FormLabel>
                                    <div className="ml-8 absolute top-3  inline">
                                        <FormControl>
                                            <RadioGroup
                                                onValueChange={onChange_horarioFlexivel(field)}
                                                defaultValue={field.value}
                                                className="flex flex-col space-y-1"
                                            >
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="true" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-base md:text-lg">
                                                        Sim
                                                    </FormLabel>
                                                </FormItem>
                                                <FormItem className="flex items-center space-x-3 space-y-0">
                                                    <FormControl>
                                                        <RadioGroupItem value="false" />
                                                    </FormControl>
                                                    <FormLabel className="font-normal text-base md:text-lg">
                                                        Não
                                                    </FormLabel>
                                                </FormItem>
                                            </RadioGroup>
                                        </FormControl>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        {!horarioFlexivel && (
                            <>
                                {/* Horario Entrada */}
                                < FormField
                                    control={forms.control}
                                    name="jornada_horarioEntrada"
                                    disabled={horarioFlexivel}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base md:text-lg">Entrada</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="border p-2 rounded-md bg-white text-base md:text-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Horario Almoco */}
                                <FormField
                                    control={forms.control}
                                    name="jornada_horarioAlmoco"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base md:text-lg">Horário Almoço</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="time"
                                                    className="border p-2 rounded-md bg-white text-base md:text-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                {/* Horario Saida */}
                                <FormField
                                    control={forms.control}
                                    name="jornada_horarioSaida"
                                    disabled={horarioFlexivel}
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-base md:text-lg">Saída</FormLabel>
                                            <FormControl>
                                                <Input type="time" className="border p-2 rounded-md bg-white text-base md:text-lg" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />


                            </>
                        )}



                        <FormField
                            control={forms.control}
                            name="usuario_cargaHoraria"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel  className="text-base md:text-lg">Carga Horária Diária</FormLabel>
                                    <FormControl>
                                        <Input type="number" className="border p-2 rounded-md bg-white w-32 text-base md:text-lg"  {...field} onChange={onChange_cargaHoraria(field)} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />


                        <FormField
                            control={forms.control}
                            name="jornada_diasSemana"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-base md:text-lg">Dias da Semana</FormLabel>
                                    <ToggleGroup
                                        type="multiple"
                                        value={field.value}
                                        defaultValue={[]}
                                        onValueChange={ToggleOnChange(field)}
                                        className="border pr-1 pl-1 rounded-md bg-white"
                                    >
                                        <ToggleGroupItem value="0" className="ml-1 mr-1 data-[state=on]:bg-yellow-400 data-[state=on]:text-[#42130F] text-base md:text-lg">
                                            Dom
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="1" className="mr-1 data-[state=on]:bg-yellow-400 data-[state=on]:text-[#42130F] text-base md:text-lg">
                                            Seg
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="2" className="mr-1 data-[state=on]:bg-yellow-400 data-[state=on]:text-[#42130F] text-base md:text-lg">
                                            Ter
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="3" className="mr-1 data-[state=on]:bg-yellow-400 data-[state=on]:text-[#42130F] text-base md:text-lg">
                                            Qua
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="4" className="mr-1 data-[state=on]:bg-yellow-400 data-[state=on]:text-[#42130F] text-base md:text-lg">
                                            Qui
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="5" className="mr-1 data-[state=on]:bg-yellow-400 data-[state=on]:text-[#42130F] text-base md:text-lg">
                                            Sex
                                        </ToggleGroupItem>
                                        <ToggleGroupItem value="6" className="mr-1 data-[state=on]:bg-yellow-400 data-[state=on]:text-[#42130F] text-base md:text-lg">
                                            Sab
                                        </ToggleGroupItem>
                                    </ToggleGroup>
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="flex justify-end mt-6">
                        <Button
                            onClick={(e) => setIsSaving(true)}
                            isSubmitButton={true}
                            className={"hover:bg-yellow-400 text-[#42130F] " +
                                (isSaveDisabled() ? "bg-[#CBD5E1] " : "bg-[#FFB503] ") +
                                (isFormsJornadaDefault() ? "invisible" : "visible")
                            }
                            disabled={isSaveDisabled()}
                        >
                            {isSaving ? "Salvar" : "Salvar"}
                        </Button>
                    </div>
                    <ToastContainer position="top-center" autoClose={3000} />
                </form>
            </Form>
        </>

    )
}