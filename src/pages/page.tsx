// src/pages/App.tsx
import CadastroForm from "../components/ui/CadastroForm";

export default function App() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Cadastro de Usuário</h1>
      <CadastroForm />
    </div>
  );
}
