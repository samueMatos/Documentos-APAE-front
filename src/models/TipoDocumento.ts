export type UnidadeTempo = 'Dias' | 'Meses' | 'Anos';

export interface TipoDocumentoRequest {
    nome: string;
    validade: number;
    isAtivo: boolean;
    guardaPermanente: boolean;
    institucional: boolean;
    documentoAssinavel: boolean;
    podeGerarDocumento: boolean;
  }
  
export interface TipoDocumentoResponse {
    id: number;
    nome: string;
    usuarioRegistro: string | null;
    usuarioAlteracao: string | null;
    dataAlteracao: string | null; 
    dataRegistro: string | null; 
    validade: number;
    isAtivo: boolean;
    guardaPermanente: boolean;
    institucional: boolean;
    documentoAssinavel: boolean;
    podeGerarDocumento: boolean;
  }