import { gunzipSync } from 'node:zlib';
import { MDFeWizard, MDFePayload } from './MDFeWizard.js';

const SOAP_AUTORIZADO = '<retEnviMDFe><cStat>100</cStat><xMotivo>Autorizado em simulação</xMotivo><protMDFe><infProt><nProt>123</nProt></infProt></protMDFe></retEnviMDFe>';
const SOAP_EVENTO = '<retEnvEvento><cStat>128</cStat><retEventoMDFe><infEvento><cStat>135</cStat><xMotivo>Evento registrado em simulação</xMotivo></infEvento></retEventoMDFe></retEnvEvento>';

jest.mock('@nfewizard/shared', () => ({
  Environment: class {
    async loadEnvironment() {
      return { axios: { post: jest.fn().mockImplementation((url: string) => Promise.resolve({ data: url.includes('MDFeRecepcaoEvento') ? SOAP_EVENTO : SOAP_AUTORIZADO })) } };
    }
    getConfig() { return { dfe: { UF: 'GO' } }; }
  },
  XmlBuilder: class {
    gerarXml() { return '<MDFe><infMDFe></infMDFe></MDFe>'; }
    assinarXML(xml: string) { return xml.replace('</MDFe>', '<Signature>ASSINATURA-DE-TESTE</Signature></MDFe>'); }
  }
}));

jest.mock('./util/MDFeSchema.js', () => ({
  validarXmlMdfe: jest.fn().mockResolvedValue(undefined)
}));

describe('MDFeWizard — simulação interna', () => {
  it('monta, assina com assinatura fictícia, compacta e interpreta resposta cStat 100 controlada', async () => {
    const wizard = new MDFeWizard();
    await wizard.MDFe_LoadEnvironment({ config: {} as any });
    const payload: MDFePayload = {
      infMDFe: {
        ide: { cUF: '35', dhEmi: '2026-10-09T12:00:00-03:00', serie: 1, nMDF: 1, tpAmb: 2, tpEmis: 1 },
        emit: { CNPJ: 'AB12CD34000195' }
      }
    };

    const resultado = await wizard.MDFe_Autorizacao(payload);
    const transporte = (wizard as any).axios;
    const [url, envelope, options] = transporte.post.mock.calls[0];
    const mensagem = envelope.match(/<mdfeDadosMsg>([^<]+)<\/mdfeDadosMsg>/)?.[1];
    const xmlEnviado = gunzipSync(Buffer.from(mensagem, 'base64')).toString('utf8');
    expect(url).toContain('mdfe-homologacao.svrs.rs.gov.br');
    expect(envelope).toContain('<MDFeRecepcaoSinc ');
    expect(options.headers['Content-Type']).toContain('application/soap+xml');
    expect(xmlEnviado).toContain('<infMDFeSupl>');
    expect(xmlEnviado).toContain('/mdfe/qrCode?');
    expect(resultado).toMatchObject({ success: true, cStat: '100', xMotivo: 'Autorizado em simulação', nProt: '123' });
  });

  it('transmite evento e preserva cStat 135 simulado', async () => {
    const wizard = new MDFeWizard();
    await wizard.MDFe_LoadEnvironment({ config: {} as any });
    const resultado = await wizard.MDFe_RecepcaoEvento({
      tpEvento: '110114',
      cOrgao: '35',
      tpAmb: 2,
      cnpj: 'AB12CD34000195',
      chave: '352610AB12CD34000195580010000000011000000001',
      dhEvento: '2026-10-09T12:00:00-03:00',
      xNome: 'Motorista de Teste',
      cpf: '12345678909'
    });
    expect(resultado).toMatchObject({ cStat: '135', xMotivo: 'Evento registrado em simulação' });
  });
});
