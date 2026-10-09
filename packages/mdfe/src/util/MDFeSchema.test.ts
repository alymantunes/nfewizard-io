import { validarXmlMdfe } from './MDFeSchema.js';

describe('validarXmlMdfe', () => {
  it('rejeita estrutura sem os campos obrigatórios do MDF-e 3.00b', async () => {
    await expect(validarXmlMdfe('<MDFe xmlns="http://www.portalfiscal.inf.br/mdfe"/>')).rejects.toThrow('MDFE_SCHEMA_INVALIDO');
  });
});
