/*
 * This file is part of NFeWizard-io.
 * Licensed under the GNU General Public License v3.0 or later.
 */

/** Calcula o DV módulo 11 da chave de acesso CT-e, aceitando o CNPJ alfanumérico. */
export function calcularDigitoVerificadorCte(sequencia: string): number {
    if (sequencia.length !== 43 || !/^[0-9A-Z]{43}$/.test(sequencia)) {
        throw new Error('Chave CT-e inválida para cálculo do dígito verificador');
    }

    const pesos = [2, 3, 4, 5, 6, 7, 8, 9];
    let soma = 0;
    let indicePeso = 0;
    for (let indice = sequencia.length - 1; indice >= 0; indice--) {
        soma += (sequencia.charCodeAt(indice) - 48) * pesos[indicePeso];
        indicePeso = (indicePeso + 1) % pesos.length;
    }

    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
}
