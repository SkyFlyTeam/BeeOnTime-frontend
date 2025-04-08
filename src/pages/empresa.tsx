import { useEffect, useState } from 'react';
import styles from '../styles/GerenciarEmpresa.module.css';
import { RiPencilFill } from 'react-icons/ri';
import HoverInput from '../components/custom/HoverInput/HoverInput';
import { verificarEmpresa, atualizarEmpresa } from '../services/empresaService';
import { verificarSetores, atualizarSetor, cadastrarSetor } from '../services/setorService';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importe o CSS do react-toastify

// Interfaces
interface EmpresaAPI {
  empCod: number;
  empNome: string;
  empCnpj: string;
  empRazaoSocial: string;
  empCep: string;
  empCidade: string;
  empEstado: string;
  empEndereco: string;
}

interface Empresa {
  emp_nome: string;
  emp_razaoSocial: string;
  emp_CNPJ: string;
  emp_CEP: string;
}

interface SetorAPI {
  setorCod: number;
  setorNome: string;
}

interface Setor {
  setor_cod: number;
  setor_nome: string;
  isNew?: boolean;
}

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

function GerenciarEmpresa() {
  // Estados
  const [empresa, setEmpresa] = useState<Empresa>(initialEmpresa);
  const [backupEmpresa, setBackupEmpresa] = useState<Empresa>(initialEmpresa);
  const [originalEmpresaAPI, setOriginalEmpresaAPI] = useState<EmpresaAPI | null>(null);
  const [setores, setSetores] = useState<Setor[]>([]);
  const [backupSetores, setBackupSetores] = useState<Setor[]>([]);
  const [setorErrors, setSetorErrors] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [cepInfo, setCepInfo] = useState<string>('');
  const [cnpjError, setCnpjError] = useState<string>('');

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
  }, []);

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
      const [empresaData] = await verificarEmpresa();
      const mappedEmpresa = {
        emp_nome: empresaData.empNome,
        emp_razaoSocial: empresaData.empRazaoSocial,
        emp_CNPJ: empresaData.empCnpj,
        emp_CEP: empresaData.empCep,
      };
      setEmpresa(mappedEmpresa);
      setBackupEmpresa(mappedEmpresa);
      setOriginalEmpresaAPI(empresaData);
    } catch (error) {
      console.error('Error fetching empresa data:', error);
      setEmpresa(initialEmpresa);
    }
  };

  const loadSetorData = async () => {
    try {
      const data = await verificarSetores();
      const mappedSetores = data.map((setor) => ({
        setor_cod: setor.setorCod,
        setor_nome: setor.setorNome,
      }));
      setSetores(mappedSetores);
      setBackupSetores(mappedSetores);
    } catch (error) {
      console.error('Error fetching setores:', error);
      setSetores([]);
      setBackupSetores([]);
    }
  };

  const isDuplicateSetor = (nome: string, currentCod: number) => {
    return setores.some(
      (setor) => normalizeString(setor.setor_nome) === normalizeString(nome) && 
      setor.setor_cod !== currentCod
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
        setor.setor_cod === setorCod ? { ...setor, setor_nome: newName } : setor
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
    const newSetor: Setor = {
      setor_cod: Date.now(),
      setor_nome: '',
      isNew: true,
    };
    setSetores((prev) => [...prev, newSetor]);
  };

  const hasChanges = (current: any, backup: any) => {
    return Object.keys(current).some((key) => 
      current[key] !== backup[key]
    );
  };

  const hasEmpresaChanges = () => hasChanges(empresa, backupEmpresa);

  const hasSetoresChanges = () => {
    if (setores.length !== backupSetores.length) return true;
    return setores.some((setor, index) => 
      setor.isNew ? setor.setor_nome.trim() !== '' : 
      normalizeString(setor.setor_nome) !== normalizeString(backupSetores[index].setor_nome)
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
      const empresasExistentes = await verificarEmpresa();
      if (empresasExistentes.some(emp => 
        emp.empCnpj === empresa.emp_CNPJ && emp.empCod !== originalEmpresaAPI.empCod
      )) {
        setCnpjError('Este CNPJ já está cadastrado para outra empresa');
        return;
      }
  
      // Buscar dados do CEP na API ViaCEP
      const cepNumerico = empresa.emp_CEP.replace(/\D/g, '');
      const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
      const cepData = await response.json();
  
      if (cepData.erro) {
        setCepInfo('CEP não encontrado');
        toast.error('CEP não encontrado. Endereço não atualizado.', {
          position: "top-right",
          autoClose: 3000,
        });
        return;
      }
  
      const updatedEmpresa: EmpresaAPI = {
        ...originalEmpresaAPI,
        empNome: empresa.emp_nome,
        empRazaoSocial: empresa.emp_razaoSocial,
        empCnpj: empresa.emp_CNPJ,
        empCep: empresa.emp_CEP,
        empEndereco: cepData.logradouro || '',
        empCidade: cepData.localidade || '',
        empEstado: cepData.uf || '',
      };
  
      await atualizarEmpresa(updatedEmpresa);
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

      const newSetores = setores.filter(s => s.isNew && s.setor_nome.trim() !== '');
      const changedSetores = setores.filter((s, i) => 
        !s.isNew && normalizeString(s.setor_nome) !== normalizeString(backupSetores[i].setor_nome)
      );

      if (newSetores.length > 0) {
        await cadastrarSetor(newSetores.map(s => s.setor_nome));
        const updatedSetores = await verificarSetores();
        const mappedSetores = updatedSetores.map(s => ({
          setor_cod: s.setorCod,
          setor_nome: s.setorNome,
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
          changedSetores.map(s => atualizarSetor({ setor_cod: s.setor_cod, setor_nome: s.setor_nome }))
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
            <div key={setor.setor_cod} className={styles.setorInputWrapper}>
              <HoverInput
                value={setor.setor_nome}
                Icon={RiPencilFill}
                onChange={(newValue) => handleSetorChange(setor.setor_cod, newValue)}
              />
              {setorErrors[setor.setor_cod] && (
                <span className={styles.errorText}>{setorErrors[setor.setor_cod]}</span>
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