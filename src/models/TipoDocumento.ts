export type UnidadeTempo = 'Dias' | 'Meses' | 'Anos';

export interface TipoDocumentoRequest {
    nome: string;
    validadeEmDias: number;
  }
  
export interface TipoDocumentoResponse {
    id: number;
    nome: string;
    usuarioRegistro: string | null;
    usuarioAlteracao: string | null;
    dataAlteracao: string | null; // Formato ISO 8601 (ex: "2025-06-21T22:30:00")
    dataRegistro: string | null; // Formato ISO 8601
    validade: number;
  }