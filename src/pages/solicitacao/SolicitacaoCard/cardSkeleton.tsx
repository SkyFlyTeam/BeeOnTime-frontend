import { Skeleton } from '@/components/ui/skeleton'
import styles from './styles.module.css' // Reutiliza os estilos do card real (se quiser)

const SolicitacaoCardSkeleton = () => {
    return (
        <div>
            <div>
                <Skeleton className='h-3 w-20 rounded-full ' />
            </div>
            <div className={styles.card}>
                <div className={styles.card_content}>
                    <div className={styles.column_one}>
                        {/* Flag (tipo de solicitação) */}
                        <Skeleton className="h-6 w-20 rounded-md" />
                    </div>

                    <div className={styles.column_two}>
                        {/* Data da solicitação */}
                        <div className={styles.data_span}>
                            <Skeleton className="h-4 w-32 mb-2" />
                            <Skeleton className="h-4 w-24" />
                        </div>

                        {/* Status (ícone de aprovado/recusado) */}
                        <div className={styles.card_status}>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SolicitacaoCardSkeleton
