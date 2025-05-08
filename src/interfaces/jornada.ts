export interface Jornada {
    jornada_cod: number;
    jornada_horarioFlexivel: boolean;
    jornada_diasSemana: boolean[]; // DOM - SEG - TER - QUAR - QUIN - SEX - SAB
    jornada_horarioEntrada: string | Date; 
    jornada_horarioSaida: string | Date;
    jornada_horarioAlmoco: string | Date;
    usuario_cod: number;
  }
