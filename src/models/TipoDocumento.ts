export interface TipoDocumentoRequest {
    nome: string;
    validade: string; // Formato YYYY-MM-DD
  }
  
  export interface TipoDocumentoResponse {
    id: number;
    nome: string;
    usuarioRegistro: string | null;
    usuarioAlteracao: string | null;
    dataAlteracao: string | null; // Formato ISO 8601 (ex: "2025-06-21T22:30:00")
    dataRegistro: string | null; // Formato ISO 8601
    validade: string | null; // Formato YYYY-MM-DD
  }