import urls from '../../config/CTeQrCodeUrl.json';

const REGIAO_POR_UF: Record<string, 'SVRS' | 'SVSP' | 'MG' | 'MS' | 'MT' | 'PR'> = {
    AC: 'SVRS', AL: 'SVRS', AM: 'SVRS', BA: 'SVRS', CE: 'SVRS', DF: 'SVRS', ES: 'SVRS', GO: 'SVRS',
    MA: 'SVRS', PA: 'SVRS', PB: 'SVRS', PI: 'SVRS', RJ: 'SVRS', RN: 'SVRS', RO: 'SVRS', RS: 'SVRS',
    SC: 'SVRS', TO: 'SVRS', AP: 'SVSP', RR: 'SVSP', PE: 'SVSP', SP: 'SVSP',
    MG: 'MG', MS: 'MS', MT: 'MT', PR: 'PR',
};

export function montarUrlQrCodeCte(chave: string, tpAmb: number | string, tpEmis: number | string, uf: string): string {
    const ambiente = String(tpAmb);
    if (ambiente !== '1' && ambiente !== '2') {
        throw new Error('CTE_QRCODE_AMBIENTE_INVALIDO: tpAmb deve ser 1 ou 2');
    }
    if (String(tpEmis) !== '1') {
        throw new Error('CTE_QRCODE_TP_EMIS_NAO_IMPLEMENTADO: tpEmis ' + tpEmis);
    }
    if (!/^[0-9]{6}[0-9A-Z]{12}[0-9]{26}$/.test(chave)) {
        throw new Error('CTE_QRCODE_CHAVE_INVALIDA: chave deve conter 44 caracteres válidos');
    }

    const regiao = REGIAO_POR_UF[uf.toUpperCase()];
    if (!regiao) throw new Error('CTE_QRCODE_UF_NAO_SUPORTADA: ' + uf);
    const base = (urls as Record<string, string>)['CTe_' + regiao + '_' + (ambiente === '1' ? 'P' : 'H')];
    if (!base) throw new Error('CTE_QRCODE_URL_NAO_CONFIGURADA: ' + regiao + '/' + ambiente);
    const url = new URL(base);
    url.searchParams.set('chCTe', chave);
    url.searchParams.set('tpAmb', ambiente);
    return url.toString();
}

export function adicionarQrCodeCte(xmlAssinado: string, url: string): string {
    const assinatura = xmlAssinado.search(/<(?:[A-Za-z_][\w.-]*:)?Signature(?:\s|>)/);
    if (assinatura < 0) throw new Error('CTE_QRCODE_ASSINATURA_AUSENTE: XML assinado não contém Signature');
    const qr = url.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return xmlAssinado.slice(0, assinatura) + '<infCTeSupl><qrCodCTe>' + qr +
        '</qrCodCTe></infCTeSupl>' + xmlAssinado.slice(assinatura);
}
