/**
 * @author Lucas Ronchi <@lucas0headshot>
 * @description Formata uma string de data (YYYY-MM-DD ou formato ISO) para o padrão brasileiro (dd/MM/yyyy).
 * @since 27/11/2024
 */
const formatarData = (data: string | null): string => {
    if (!data) {
        return "N/A";
    }

    // Pega apenas a parte da data (antes do 'T') para evitar problemas de fuso horário.
    const datePart = data.split('T')[0];

    // Converte a string 'YYYY-MM-DD' em um array [YYYY, MM, DD].
    const [year, month, day] = datePart.split('-');

    // Retorna a data formatada como dd/MM/yyyy.
    return `${day}/${month}/${year}`;
};

export default formatarData;