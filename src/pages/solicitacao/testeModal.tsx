export function IsModalFeriasOpen({
    isOpen,
    onClose,
  }: {
    isOpen: boolean;
    onClose: () => void;
  }) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-md">
          <h2 className="text-xl font-bold mb-4">Solicitar Férias</h2>
          <p>Este é um modal de teste para Férias!</p>
          <button
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
            onClick={onClose}
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }