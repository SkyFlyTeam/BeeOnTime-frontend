import { useEffect, useState } from 'react';
import styles from './CadastroEmpresa.module.css';
import { RiPencilFill } from 'react-icons/ri';
import HoverInput from '../../components/custom/HoverInput/HoverInput';
import { verificarEmpresa, atualizarEmpresa } from '../../services/empresaService';
import { verificarSetores, atualizarSetor, cadastrarSetor } from '../../services/setorService';

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

function GerenciarEmpresa() {
  const [empresa, setEmpresa] = useState<Empresa>(initialEmpresa);
  const [backupEmpresa, setBackupEmpresa] = useState<Empresa>(initialEmpresa);
  const [originalEmpresaAPI, setOriginalEmpresaAPI] = useState<EmpresaAPI | null>(null); // Store original API data
  const [setores, setSetores] = useState<Setor[]>([]);
  const [backupSetores, setBackupSetores] = useState<Setor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEmpresaData = async () => {
      try {
        const data: EmpresaAPI[] = await verificarEmpresa();
        console.log('Fetched empresa data:', data);
        const empresaData = {
          emp_nome: data[0].empNome,
          emp_razaoSocial: data[0].empRazaoSocial,
          emp_CNPJ: data[0].empCnpj,
          emp_CEP: data[0].empCep,
        };
        setEmpresa(empresaData);
        setBackupEmpresa(empresaData);
        setOriginalEmpresaAPI(data[0]); // Store the full original API object
      } catch (error) {
        console.error('Error fetching empresa data:', error);
        setEmpresa(initialEmpresa);
      }
    };

    const loadSetorData = async () => {
      try {
        const data: SetorAPI[] = await verificarSetores();
        console.log('Fetched setores data:', data);
        const mappedSetores = data.map((setor) => ({
          setor_cod: setor.setorCod,
          setor_nome: setor.setorNome,
        }));
        setSetores(mappedSetores);
        setBackupSetores(mappedSetores);
      } catch (error) {
        console.log('Error fetching setores:', error);
        setSetores([]);
        setBackupSetores([]);
      }
    };

    const loadData = async () => {
      setIsLoading(true);
      await Promise.all([loadEmpresaData(), loadSetorData()]);
      setIsLoading(false);
    };

    loadData();
  }, []);

  const handleInputChange = (key: keyof Empresa, value: string) => {
    setEmpresa((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSetorChange = (setorCod: number, newName: string) => {
    setSetores((prev) =>
      prev.map((setor) =>
        setor.setor_cod === setorCod ? { ...setor, setor_nome: newName } : setor
      )
    );
  };

  const handleAddSetor = () => {
    const newSetor: Setor = {
      setor_cod: Date.now(),
      setor_nome: '',
      isNew: true,
    };
    setSetores((prev) => [...prev, newSetor]);
  };

  const hasEmpresaChanges = () => {
    const keys = Object.keys(empresa) as (keyof Empresa)[];
    for (const key of keys) {
      const empresaValue = empresa[key];
      const backupValue = backupEmpresa[key];
      const normalizedEmpresa = typeof empresaValue === 'string' ? empresaValue.trim() : empresaValue;
      const normalizedBackup = typeof backupValue === 'string' ? backupValue.trim() : backupValue;
      if (normalizedEmpresa !== normalizedBackup) {
        console.log(`Difference found in ${key}: ${normalizedEmpresa} !== ${normalizedBackup}`);
        return true;
      }
    }
    return false;
  };

  const hasSetoresChanges = () => {
    if (setores.length !== backupSetores.length) return true;
    return setores.some((setor, index) => {
      const backupSetor = backupSetores[index];
      if (setor.isNew) {
        console.log(`New setor detected: ${setor.setor_nome}`);
        return setor.setor_nome.trim() !== '';
      }
      const hasChange = setor.setor_nome.trim() !== backupSetor.setor_nome.trim();
      if (hasChange) {
        console.log(`Difference found in setor ${setor.setor_cod}: ${setor.setor_nome} !== ${backupSetor.setor_nome}`);
      }
      return hasChange;
    });
  };

  const handleSaveEmpresa = async () => {
    if (!originalEmpresaAPI) {
      console.error('No original empresa data available to save.');
      return;
    }

    // Map Empresa to EmpresaAPI, preserving original fields
    const updatedEmpresaAPI: EmpresaAPI = {
      ...originalEmpresaAPI,
      empNome: empresa.emp_nome,
      empRazaoSocial: empresa.emp_razaoSocial,
      empCnpj: empresa.emp_CNPJ,
      empCep: empresa.emp_CEP,
    };

    try {
      const status = await atualizarEmpresa(updatedEmpresaAPI);
      console.log('Empresa atualizada com status:', status);
      setBackupEmpresa({ ...empresa }); // Update backup only on success
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
    }
  };

  const handleSaveSetores = async () => {
    try {
      const newSetores = setores.filter((setor) => setor.isNew && setor.setor_nome.trim() !== '');
      const changedSetores = setores.filter((setor, index) => {
        const backupSetor = backupSetores[index];
        return !setor.isNew && setor.setor_nome.trim() !== backupSetor?.setor_nome.trim();
      });

      if (newSetores.length > 0) {
        const newSetorNames = newSetores.map((setor) => setor.setor_nome);
        const statuses = await cadastrarSetor(newSetorNames);
        console.log('Novos setores cadastrados com status:', statuses);

        const updatedSetores: SetorAPI[] = await verificarSetores();
        const mappedSetores = updatedSetores.map((setor) => ({
          setor_cod: setor.setorCod,
          setor_nome: setor.setorNome,
        }));
        setSetores(mappedSetores);
        setBackupSetores(mappedSetores);
      }

      if (changedSetores.length > 0) {
        const updatePromises = changedSetores.map((setor) =>
          atualizarSetor({ setor_cod: setor.setor_cod, setor_nome: setor.setor_nome })
        );
        const statuses = await Promise.all(updatePromises);
        console.log('Setores atualizados com status:', statuses);
        setBackupSetores([...setores.filter((s) => !s.isNew)]);
      }

      if (newSetores.length === 0 && changedSetores.length === 0) {
        console.log('Nenhuma alteração nos setores para salvar.');
      }
    } catch (error) {
      console.error('Erro ao salvar alterações dos setores:', error);
    }
  };

  const handleSaveAll = async () => {
    if (hasEmpresaChanges()) await handleSaveEmpresa();
    if (hasSetoresChanges()) await handleSaveSetores();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log('Current setores:', setores);

  return (
    <main className={styles.mainContainer}>
      <h2 className={styles.title}>Gerenciar Empresa</h2>

      <h2 className={styles.subtitle}>Informações da Empresa</h2>

      <div className={styles.empresaContainer}>
        {Object.entries(empresa).map(([key, value]) => (
          <div key={key} className={styles.empresaInput}>
            <label className={styles.inputLabel}>
              {EmpresaCamposTraducao[key as keyof Empresa]}
              <input
                type="text"
                value={value}
                onChange={(e) => handleInputChange(key as keyof Empresa, e.target.value)}
              />
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
            <HoverInput
              key={setor.setor_cod}
              value={setor.setor_nome}
              Icon={RiPencilFill}
              onChange={(newValue) => handleSetorChange(setor.setor_cod, newValue)}
            />
          ))
        ) : (
          <p>Não foi possível carregar os setores...</p>
        )}
      </div>

      {(hasSetoresChanges()) && (
        <div className={styles.buttonWrapper}>
          <button className={styles.saveButton} onClick={handleSaveAll}>
            Salvar Alterações
          </button>
        </div>
      )}

      <button className={styles.addButton} onClick={handleAddSetor}>
        Adicionar
      </button>
    </main>
  );
}

export default GerenciarEmpresa;