import { adicionarQrCodeCte, montarUrlQrCodeCte } from './CTeQrCode.js';

const chave = '52261012ABC34501DE35570010000000011123456787';

describe('QR Code CT-e', () => {
    it('usa a URL SVRS em homologação para GO e acrescenta os parâmetros exigidos', () => {
        expect(montarUrlQrCodeCte(chave, 2, 1, 'GO')).toBe(
            'https://dfe-portal.svrs.rs.gov.br/cte/qrCode?chCTe=' + chave + '&tpAmb=2',
        );
    });

    it('seleciona URL e ambiente de produção da SVSP para SP', () => {
        expect(montarUrlQrCodeCte(chave, 1, 1, 'SP')).toBe(
            'https://nfe.fazenda.sp.gov.br/CTeConsulta/qrCode?chCTe=' + chave + '&tpAmb=1',
        );
    });

    it('recusa contingência não implementada, ambiente inválido e UF sem URL', () => {
        expect(() => montarUrlQrCodeCte(chave, 2, 2, 'GO')).toThrow('CTE_QRCODE_TP_EMIS_NAO_IMPLEMENTADO');
        expect(() => montarUrlQrCodeCte(chave, 3, 1, 'GO')).toThrow('CTE_QRCODE_AMBIENTE_INVALIDO');
        expect(() => montarUrlQrCodeCte(chave, 2, 1, 'ZZ')).toThrow('CTE_QRCODE_UF_NAO_SUPORTADA');
    });

    it('insere infCTeSupl entre infCte e a assinatura sem alterar a área assinada', () => {
        const assinatura = '<Signature>assinatura-ficticia</Signature>';
        const xml = '<CTe><infCte Id="x">conteudo-assinado</infCte>' + assinatura + '</CTe>';
        const resultado = adicionarQrCodeCte(xml, 'https://example.test/qr?chCTe=' + chave + '&tpAmb=2');
        expect(resultado).toContain(
            '<infCTeSupl><qrCodCTe>https://example.test/qr?chCTe=' + chave + '&amp;tpAmb=2</qrCodCTe></infCTeSupl>' + assinatura,
        );
        expect(resultado.indexOf('conteudo-assinado')).toBeLessThan(resultado.indexOf('<infCTeSupl>'));
        expect(resultado.indexOf('<infCTeSupl>')).toBeLessThan(resultado.indexOf('<Signature>'));
    });
});
