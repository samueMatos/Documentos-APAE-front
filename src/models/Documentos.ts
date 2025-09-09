
interface PessoaSimplificada {
    id: number;
    nome: string;
}

interface TipoDocumentoSimplificado {
    id: number;
    nome: string;
}


export interface Documento {
    id: number;
    titulo: string;                  
    dataUpload: string;
    dataDocumento?: string;              
    aluno?: PessoaSimplificada;
    pessoa?: PessoaSimplificada;
    tipoDocumento?: TipoDocumentoSimplificado;
    tipoConteudo?: string;             
    documento?: string;  
             
}