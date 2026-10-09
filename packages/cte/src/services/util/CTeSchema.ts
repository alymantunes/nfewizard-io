import { existsSync } from 'node:fs';
import path from 'node:path';
import libxmljs from 'libxmljs2';
import xsdAssembler from 'xsd-assembler';

const diretoriosSchema = [path.resolve(process.cwd(), 'resources/schemas'), path.resolve(process.cwd(), 'packages/cte/resources/schemas'), path.resolve(process.cwd(), 'node_modules/@nfewizard/cte/resources/schemas')];

export async function validarXmlCte(xml: string, nomeSchema = 'cte_v4.00.xsd'): Promise<void> {
    const basePath = diretoriosSchema.find((diretorio) => existsSync(path.join(diretorio, nomeSchema)));
    if (!basePath) throw new Error('CTE_SCHEMA_NAO_ENCONTRADO: ' + nomeSchema);

    try {
        const schemaPath = path.join(basePath, nomeSchema);
        const schemaCompleto = await xsdAssembler.assemble(schemaPath);
        const xmlDoc = libxmljs.parseXml(xml);
        const xsdDoc = libxmljs.parseXml(schemaCompleto, { baseUrl: basePath + '/' });
        if (!xmlDoc.validate(xsdDoc)) {
            const erros = (xmlDoc.validationErrors || []).map((erro: any) => String(erro.message ?? erro).trim());
            throw new Error('CTE_SCHEMA_INVALIDO: ' + (erros.join('; ') || 'XML inválido no XSD do CT-e'));
        }
    } catch (erro) {
        if (erro instanceof Error && erro.message.startsWith('CTE_SCHEMA_')) throw erro;
        throw new Error('CTE_SCHEMA_VALIDACAO_FALHOU: ' + (erro instanceof Error ? erro.message : String(erro)));
    }
}
