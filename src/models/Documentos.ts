
interface AlunoSimplificado {
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
    aluno?: AlunoSimplificado;       
    tipoDocumento?: TipoDocumentoSimplificado;
    tipoConteudo?: string;             
    documento?: string;  
             
}