import { validarXmlCte } from './CTeSchema.js';

describe('validarXmlCte', () => {
    it('carrega e aplica o XSD oficial do CT-e 4.00, recusando XML incompleto', async () => {
        await expect(validarXmlCte('<CTe xmlns="http://www.portalfiscal.inf.br/cte"/>')).rejects.toThrow(
            'CTE_SCHEMA_INVALIDO:',
        );
    });

    it('falha com erro nomeado se o schema pedido não existir', async () => {
        await expect(validarXmlCte('<x/>', 'ausente.xsd')).rejects.toThrow('CTE_SCHEMA_NAO_ENCONTRADO');
    });
});
