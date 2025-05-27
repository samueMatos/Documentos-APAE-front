/**
 * @description Formata um CPF para o padrão brasileiro
 * @since 27/11/2024
 * @author Lucas Ronchi <@lucas0headshot>
 */
const formatarCPF = (cpf: string): string => {
    if (!cpf) throw new Error("CPF inválido");

    const cpfPattern = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
    if (cpfPattern.test(cpf)) {
        return cpf;
    }

    const cpfNumeros = cpf.replace(/\D/g, '');
    if (cpfNumeros.length !== 11) {
        throw new Error("CPF inválido");
    }
    return cpfNumeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

export default formatarCPF;