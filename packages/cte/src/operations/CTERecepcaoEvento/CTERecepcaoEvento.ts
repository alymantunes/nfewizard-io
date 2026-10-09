import { CTeCancelamento, CTeCartaCorrecao, CTeRecepcaoEventoResultado } from '@nfewizard/types/cte';
import { CTERecepcaoEventoService } from '../../services/CTERecepcaoEvento/CTERecepcaoEventoService.js';

export class CTERecepcaoEvento {
    constructor(private readonly service: CTERecepcaoEventoService) {}
    cancelar(evento: CTeCancelamento): Promise<CTeRecepcaoEventoResultado> {
        return this.service.cancelar(evento);
    }
    cartaCorrecao(evento: CTeCartaCorrecao): Promise<CTeRecepcaoEventoResultado> {
        return this.service.cartaCorrecao(evento);
    }
}

