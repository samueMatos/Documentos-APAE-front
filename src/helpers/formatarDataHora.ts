/**
 * @description Formata uma data e hora para o padrão BR (dd/MM/yyyy HH:mm).
 * @author Gemini
 */
const formatarDataHora = (data: string | null): string => {
    if (!data) {
        return "N/A";
    }
    return new Date(data).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default formatarDataHora;