// General
import { useEffect, useState } from 'react';
import axios from 'axios'

// Interfaces
import { Empresa, EmpresaAPI } from '@/interfaces/empresa';
import { Setor } from '@/interfaces/setor';
import { ApiException } from '@/config/apiExceptions';

// Services
import { empresaServices } from '@/services/empresaService';
import { setorServices } from '@/services/setorService';

// Components
import HoverInput from '../../components/custom/HoverInput/HoverInput';
import { ToastContainer, toast } from 'react-toastify';

// Styles
import styles from './GerenciarEmpresa.module.css';
import 'react-toastify/dist/ReactToastify.css'; 

// Icons
import { RiPencilFill } from 'react-icons/ri';
import { ApiUsuario } from '@/config/apiUsuario';


// Constantes
const initialEmpresa: Empresa = {
  emp_nome: '',
  emp_razaoSocial: '',
  emp_CNPJ: '',
  emp_CEP: '',
};

const EmpresaCamposTraducao: Record<keyof Empresa, string> = {
  emp_nome: 'Nome',
  emp_razaoSocial: 'Razão Social',
  emp_CNPJ: 'CNPJ',
  emp_CEP: 'CEP',
};

// Funções utilitárias
const maskCEP = (value: string): string => {
  const onlyNumbers = value.replace(/[^0-9]/g, '');
  return onlyNumbers.length <= 5 
    ? onlyNumbers 
    : `${onlyNumbers.slice(0, 5)}-${onlyNumbers.slice(5, 8)}`.substring(0, 9);
};

const maskCNPJ = (value: string): string => {
  const cleanedValue = value.replace(/[^0-9./-]/g, '');
  const onlyNumbers = cleanedValue.replace(/[^0-9]/g, '');

  if (onlyNumbers.length === 0) return '';
  if (onlyNumbers.length <= 2) return onlyNumbers;
  if (onlyNumbers.length <= 5) return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2)}`;
  if (onlyNumbers.length <= 8) return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5)}`;
  if (onlyNumbers.length <= 12) return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5, 8)}/${onlyNumbers.slice(8)}`;
  return `${onlyNumbers.slice(0, 2)}.${onlyNumbers.slice(2, 5)}.${onlyNumbers.slice(5, 8)}/${onlyNumbers.slice(8, 12)}-${onlyNumbers.slice(12, 14)}`;
};

const normalizeString = (str: string) => str.trim().toLowerCase();

interface SetorWithNew extends Setor {
  isNew?: boolean;
}

function GerenciarEmpresa() {
  // Estados
  const [empresa, setEmpresa] = useState<Empresa>(initialEmpresa);
  const [backupEmpresa, setBackupEmpresa] = useState<Empresa>(initialEmpresa);
  const [originalEmpresaAPI, setOriginalEmpresaAPI] = useState<EmpresaAPI | null>(null);
  const [setores, setSetores] = useState<SetorWithNew[]>([]);
  const [backupSetores, setBackupSetores] = useState<SetorWithNew[]>([]);
  const [setorErrors, setSetorErrors] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cepInfo, setCepInfo] = useState<string>('');
  const [cnpjError, setCnpjError] = useState<string>('');
  const [userEmpCod, setUserEmpCod] = useState<number | null>(null)

  useEffect(() => {
    async function fetchEmpCod() {
      const empCod = await getUsuarioEmp_cod();
      setUserEmpCod(empCod);
    }
  
    fetchEmpCod();
  },[]);

  async function getUsuarioEmp_cod(): Promise<number | null> {
    try {
      console.log("→ [getUsuarioEmp_cod] Iniciando chamada ao /auth/token...");
      const res = await axios.get<any>("/auth/token");
      console.log("✔ [getUsuarioEmp_cod] Token recebido:", res.data.token);
  
      const resData = await ApiUsuario.get<any>(`/usuario/${res.data.token}`);
      console.log("✔ [getUsuarioEmp_cod] Dados do usuário:", resData.data);
  
      const empCod = resData.data.empCod;
      console.log("✔ [getUsuarioEmp_cod] empCod extraído:", empCod);
  
      return Number(empCod);
    } catch (error) {
      console.error("✖ [getUsuarioEmp_cod] Erro ao obter empCod:", error);
      return null;
    }
  }

  // Carregamento inicial
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([loadEmpresaData(), loadSetorData()]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, [userEmpCod]);

  // Consulta de CEP
  useEffect(() => {
    const fetchCepInfo = async () => {
      const cepNumerico = empresa.emp_CEP.replace(/\D/g, '');
      if (cepNumerico.length !== 8) {
        setCepInfo('Digite um CEP válido com 8 dígitos');
        return;
      }

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
        const data = await response.json();
        setCepInfo(data.erro 
          ? 'CEP não encontrado' 
          : `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`);
      } catch (error) {
        console.error('Erro ao consultar o CEP:', error);
        setCepInfo('Erro ao consultar o CEP');
      }
    };
    fetchCepInfo();
  }, [empresa.emp_CEP]);

  // Funções auxiliares
  const loadEmpresaData = async () => {
    try {
      if (userEmpCod){
        const empresaData = await empresaServices.verificarEmpresaById(userEmpCod);

        const mappedEmpresa = {
          emp_nome: empresaData.empNome,
          emp_razaoSocial: empresaData.empRazaoSocial,
          emp_CNPJ: empresaData.empCnpj,
          emp_CEP: empresaData.empCep,
        };

        setEmpresa(mappedEmpresa);
        setBackupEmpresa(mappedEmpresa);
        setOriginalEmpresaAPI(empresaData);
      }
    } catch (error) {
      console.error('Error fetching empresa data:', error);
      setEmpresa(initialEmpresa);
    }
  };

  const loadSetorData = async () => {
    try {
      if(userEmpCod){
        const result = await setorServices.verificarSetoresPorEmpresa(userEmpCod);
        if (result instanceof ApiException) {
          throw new Error(result.message);
        }
        const mappedSetores = result.map((setor: Setor) => ({
          setorCod: setor.setorCod,
          setorNome: setor.setorNome,
        }));
        setSetores(mappedSetores);
        setBackupSetores(mappedSetores);
      }
    } catch (error) {
      console.error('Error fetching setores:', error);
      setSetores([]);
      setBackupSetores([]);
    }
  };

  const isDuplicateSetor = (nome: string, currentCod: number) => {
    return setores.some(
      (setor) => normalizeString(setor.setorNome) === normalizeString(nome) && 
      setor.setorCod !== currentCod
    );
  };

  // Handlers
  const handleInputChange = (key: keyof Empresa, value: string) => {
    const formattedValue = key === 'emp_CEP' 
      ? maskCEP(value) 
      : key === 'emp_CNPJ' 
        ? maskCNPJ(value) 
        : value;

    setEmpresa((prev) => ({ ...prev, [key]: formattedValue }));
    if (key === 'emp_CNPJ') setCnpjError('');
  };

  const handleSetorChange = (setorCod: number, newName: string) => {
    setSetores((prev) =>
      prev.map((setor) =>
        setor.setorCod === setorCod ? { ...setor, setorNome: newName } : setor
      )
    );

    if (isDuplicateSetor(newName, setorCod)) {
      setSetorErrors((prev) => ({
        ...prev,
        [setorCod]: `O setor "${newName}" já existe!`,
      }));
    } else {
      setSetorErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[setorCod];
        return newErrors;
      });
    }
  };

  const handleAddSetor = () => {
    const newSetor: SetorWithNew = {
      setorCod: Date.now(),
      setorNome: '',
      isNew: true,
    };
    setSetores((prev) => [...prev, newSetor]);
  };

  const hasChanges = (current: any, backup: any) => {
    return Object.keys(current).some((key) => 
      normalizeString(current[key]) !== normalizeString(backup[key])
    );
  };

  const hasEmpresaChanges = () => hasChanges(empresa, backupEmpresa);

  const hasSetoresChanges = () => {
    if (setores.length !== backupSetores.length) return true;
    return setores.some((setor, index) => 
      setor.isNew ? setor.setorNome.trim() !== '' : 
      normalizeString(setor.setorNome) !== normalizeString(backupSetores[index].setorNome)
    );
  };

  const handleSaveEmpresa = async () => {
    if (!originalEmpresaAPI) return;

    const cnpjNumerico = empresa.emp_CNPJ.replace(/\D/g, '');
    if (cnpjNumerico.length !== 14) {
      setCnpjError('Digite um CNPJ válido com 14 dígitos');
      return;
    }

    try {
      const result = await empresaServices.verificarEmpresa();
      if (result instanceof ApiException) {
        throw new Error(result.message);
      }
      if (result.some((emp: EmpresaAPI) => 
        emp.empCnpj === empresa.emp_CNPJ && emp.empCod !== originalEmpresaAPI.empCod
      )) {
        setCnpjError('Este CNPJ já está cadastrado para outra empresa');
        return;
      }

      const updatedEmpresa: EmpresaAPI = {
        ...originalEmpresaAPI,
        empNome: empresa.emp_nome,
        empRazaoSocial: empresa.emp_razaoSocial,
        empCnpj: empresa.emp_CNPJ,
        empCep: empresa.emp_CEP,
      };

      await empresaServices.atualizarEmpresa(updatedEmpresa);
      setBackupEmpresa({ ...empresa });
      setCnpjError('');
      toast.success('Informações da empresa atualizadas com sucesso!', {
        position: "top-right",
        autoClose: 3000,
      });
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      setCnpjError('Erro ao salvar a empresa');
      toast.error('Erro ao atualizar a empresa.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSaveSetores = async () => {
    try {
      if (Object.keys(setorErrors).length > 0) return;

      const newSetores = setores.filter(s => s.isNew && s.setorNome.trim() !== '');
      const changedSetores = setores.filter((s, i) => 
        !s.isNew && normalizeString(s.setorNome) !== normalizeString(backupSetores[i].setorNome)
      );

      if (newSetores.length > 0 && userEmpCod) {
        await setorServices.cadastrarSetor(newSetores.map(s => s.setorNome), userEmpCod);
        const result = await setorServices.getAllSetores();
        if (result instanceof ApiException) {
          throw new Error(result.message);
        }
        const mappedSetores = result.map((s: Setor) => ({
          setorCod: s.setorCod,
          setorNome: s.setorNome,
        }));
        setSetores(mappedSetores);
        setBackupSetores(mappedSetores);
        toast.success('Setor(es) adicionado(s) com sucesso!', {
          position: "top-right",
          autoClose: 3000,
        });
      }

      if (changedSetores.length > 0) {
        await Promise.all(
          changedSetores.map(s => setorServices.atualizarSetor({ setorCod: s.setorCod, setorNome: s.setorNome }))
        );
        setBackupSetores([...setores.filter(s => !s.isNew)]);
        toast.success('Setor(es) atualizado(s) com sucesso!', {
          position: "top-right",
          autoClose: 3000,
        });
      }
    } catch (error) {
      console.error('Erro ao salvar setores:', error);
      toast.error('Erro ao salvar os setores.', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  const handleSaveAll = async () => {
    if (hasEmpresaChanges()) await handleSaveEmpresa();
    if (hasSetoresChanges() && Object.keys(setorErrors).length === 0) await handleSaveSetores();
  };

  // Render
  if (isLoading) return <div>Loading...</div>;

  return (
    <main className={styles.mainContainer}>
      <h2 className={styles.title}>Gerenciar Empresa</h2>

      <div className={styles.empresaContainer}>
        {Object.entries(empresa).map(([key, value]) => (
          <div key={key} className={styles.empresaInput}>
            <label className={styles.inputLabel}>
              {EmpresaCamposTraducao[key as keyof Empresa]}
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(key as keyof Empresa, e.target.value)}
                maxLength={key === 'emp_CEP' ? 9 : key === 'emp_CNPJ' ? 18 : undefined}
                placeholder={
                  key === 'emp_CEP' ? '99999-999' :
                  key === 'emp_CNPJ' ? '99.999.999/9999-99' : undefined
                }
              />
              {key === 'emp_CEP' && <span className={styles.cepInfo}>{cepInfo}</span>}
              {key === 'emp_CNPJ' && cnpjError && <span className={styles.errorText}>{cnpjError}</span>}
            </label>
          </div>
        ))}
      </div>

      {hasEmpresaChanges() && (
        <div className={styles.buttonWrapper}>
          <button className={styles.saveButton} onClick={handleSaveEmpresa}>
            Salvar Empresa
          </button>
        </div>
      )}

      <h2 className={`${styles.subtitle} ${styles.setoresTitle}`}>Setores</h2>

      <div className={styles.setoresContainer}>
        {setores.length > 0 ? (
          setores.map((setor) => (
            <div key={setor.setorCod} className={styles.setorInputWrapper}>
              <HoverInput
                value={setor.setorNome}
                Icon={RiPencilFill}
                onChange={(newValue) => handleSetorChange(setor.setorCod, newValue)}
              />
              {setorErrors[setor.setorCod] && (
                <span className={styles.errorText}>{setorErrors[setor.setorCod]}</span>
              )}
            </div>
          ))
        ) : (
          <p>Não foi possível carregar os setores...</p>
        )}
      </div>

      {hasSetoresChanges() && (
        <div className={styles.buttonWrapper}>
          <button 
            className={styles.saveButton} 
            onClick={handleSaveAll}
            disabled={Object.keys(setorErrors).length > 0}
          >
            Salvar Alterações
          </button>
        </div>
      )}

      <button className={styles.addButton} onClick={handleAddSetor}>
        Adicionar
      </button>

      <ToastContainer />
    </main>
  );
}

export default GerenciarEmpresa;

