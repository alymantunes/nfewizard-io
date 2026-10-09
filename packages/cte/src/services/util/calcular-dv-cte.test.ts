import { calcularDigitoVerificadorCte } from './calcular-dv-cte.js';

describe('calcularDigitoVerificadorCte', () => {
    it('mantém o DV de uma chave numérica', () => {
        expect(calcularDigitoVerificadorCte('5226100562175800016057001000000001112345678')).toBe(6);
    });

    it('calcula o DV usando ASCII menos 48 no CNPJ alfanumérico', () => {
        // Chave fictícia; DV calculado à mão pelo módulo 11 ponderado da NT Conjunta DF-e 2025.001.
        expect(calcularDigitoVerificadorCte('52261012ABC34501DE3557001000000001112345678')).toBe(0);
    });

    it('recusa comprimento e caracteres fora do alfabeto permitido', () => {
        expect(() => calcularDigitoVerificadorCte('123')).toThrow('Chave CT-e inválida');
        expect(() => calcularDigitoVerificadorCte('52261012abc34501DE3557001000000001112345678')).toThrow(
            'Chave CT-e inválida',
        );
    });
});
