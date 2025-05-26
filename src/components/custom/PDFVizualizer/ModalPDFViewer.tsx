"use client";
import { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { espelhoPontoService } from "@/services/espelhoPontoService";
import { ApiException } from "@/config/apiExceptions";
import { PiMagnifyingGlassPlusBold } from "react-icons/pi";
import { PiMagnifyingGlassMinusBold } from "react-icons/pi";

interface ModalPDFViewerProps {
  isOpen: boolean;
  onClose: () => void;
  usuarioCod: number;
  espelhoPontoCod: number;
  mes: string;
  usuarioNome: string;
  isEspelhoPontoAssinado: boolean;
  geracaoData: string,
  isUser: boolean,
}

export default function ModalPDFViewer({
  isOpen,
  onClose,
  usuarioCod,
  espelhoPontoCod,
  mes,
  usuarioNome,
  isEspelhoPontoAssinado,
  geracaoData,
  isUser,
}: ModalPDFViewerProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  useEffect(() => {
    const fetchPDF = async () => {
      const result = await espelhoPontoService.generateEspelhoPontoPDF(usuarioCod, espelhoPontoCod);
      if (!(result instanceof ApiException)) {
        const url = URL.createObjectURL(result);
        setPdfUrl(url);
      }
    };

    if (isOpen) {
      fetchPDF();
    }

    return () => {
      setPdfUrl(null);
      setZoom(1);
    };
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black bg-opacity-50" />
      <Dialog.Panel className="relative bg-white rounded-lg w-full max-w-5xl p-6 shadow-lg z-50 h-full max-h-[90vh] overflow-hidden flex flex-col">
        <h2 className="text-xl font-semibold mb-4">Espelho de Ponto - {usuarioNome} | {mes}</h2>

        {/* Zoom Controls */}
        <div className="flex justify-end gap-2 mb-3">
          <button onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))} className="px-3 py-1 bg-[#FFB503] rounded hover:bg-gray-300 text-[#42130F]"><PiMagnifyingGlassMinusBold /></button>
          <button onClick={() => setZoom((z) => Math.min(2, z + 0.1))} className="px-3 py-1 bg-[#FFB503] rounded hover:bg-gray-300 text-[#42130F]"><PiMagnifyingGlassPlusBold /></button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 h-[70vh] overflow-auto border rounded bg-gray-100 flex justify-center items-center">
          {pdfUrl ? (
            <iframe
              src={pdfUrl}
              title="PDF Viewer"
              style={{ transform: `scale(${zoom})`, transformOrigin: "top center", width: "100%", height: "100%" }}
            />
          ) : (
            <p>Carregando Espelho de ponto...</p>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`espelho-ponto-${espelhoPontoCod}.pdf`}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
            >
              Baixar arquivo
            </a>
          )}
          {!isEspelhoPontoAssinado && isUser && (
          <button
            onClick={async () => {await espelhoPontoService.updatedEspelhoPonto({
                espelhoPontoCod: espelhoPontoCod,
                espelhoPontoDataAssinatura: new Date().toUTCString(),
                espelhoPontoMes: mes,
                espelhoPontoUrl: '',
                espelhoPontoDataGeracao: geracaoData,
                espelhoPontoAssinado: true,
                usuarioCod: usuarioCod
            }); window.location.reload();}} // Substituir pela lógica real
            className="px-4 py-2 bg-green-100 text-green-700 rounded hover:bg-green-200"
          >
            Assinar
          </button>
          )}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
