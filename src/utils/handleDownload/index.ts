export default function handleDownload(anexo: any, nomeAnexo: string) {
    
    let byteArray;
    
    if (typeof anexo === 'string') {
      const base64Data = anexo;
      const byteCharacters = atob(base64Data); 
      byteArray = new Uint8Array(byteCharacters.length);
  
      for (let i = 0; i < byteCharacters.length; i++) {
        byteArray[i] = byteCharacters.charCodeAt(i);
      }
    } else {
      byteArray = new Uint8Array(anexo);
    }
  
    const mimeType = nomeAnexo?.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
    const blob = new Blob([byteArray], { type: mimeType });
  
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement('a');
    link.href = url;
    link.download = nomeAnexo || 'anexo.pdf'; 
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); 
}