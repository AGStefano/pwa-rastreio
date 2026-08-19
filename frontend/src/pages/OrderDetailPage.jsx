import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import SearchBar from "../components/SearchBar";
import OrderList from "../components/OrderList";
import StatusBadge from "../components/StatusBadge";
import InfoCard from "../components/InfoCard";
import TrackingTimeline from "../components/TrackingTimeline";
import PackageTrackingList from "../components/PackageTrackingList";
import DownloadInvoiceButton from "../components/DownloadInvoiceButton";
import { EmptyState, ErrorMessage, AvisoMessage } from "../components/Feedback";
import { LoadingSpinner, OrderDetailSkeleton } from "../components/LoadingSpinner";
import { IconLocation, IconTruck, IconCalendar } from "../components/Icons";
import { obterPedido, buscarPedidos, obterRastreio, ApiError } from "../api/pedidos";
import { useUltimaBusca } from "../hooks/useUltimaBusca";
import { formatarData, formatarEndereco } from "../utils/formatters";

// Rota única (/pedido/:query) que aceita tanto o id interno do pedido (usado
// quando já sabemos o id, ex: ao clicar num card de uma lista) quanto qualquer
// valor de busca livre — CPF, CNPJ, telefone, e-mail, número do pedido Tiny ou
// número do e-commerce. Tenta o id direto primeiro (mais rápido); se não bater,
// cai na busca livre e mostra o detalhe (1 resultado) ou a lista (vários).
export default function OrderDetailPage() {
  const { query } = useParams();
  const navigate = useNavigate();
  const { salvar } = useUltimaBusca();

  const [pedido, setPedido] = useState(null);
  const [resultados, setResultados] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  const [rastreioInfo, setRastreioInfo] = useState(null);
  const [rastreioCarregando, setRastreioCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    setErro(null);
    setPedido(null);
    setResultados(null);

    async function resolverPedido() {
      // Só faz sentido tentar como id interno se for só dígitos e couber num
      // INT4 (nossa PK) — CPF, telefone (11-14 dígitos) e e-mail nunca são um
      // id válido, então nem tenta e já vai direto pra busca livre.
      const pareceIdInterno = /^\d{1,9}$/.test(query);

      if (pareceIdInterno) {
        try {
          const direto = await obterPedido(query);
          if (ativo) setPedido(direto);
          return;
        } catch (err) {
          if (!(err instanceof ApiError) || (err.status !== 404 && err.status !== 400)) {
            if (ativo) setErro(err instanceof ApiError ? err.message : "Erro ao carregar o pedido.");
            return;
          }
        }
      }

      // :query não bateu com nenhum id interno — trata como busca livre.
      salvar(query);
      try {
        const lista = await buscarPedidos(query);
        if (!ativo) return;
        if (lista.length === 1) {
          const detalhe = await obterPedido(lista[0].id);
          if (ativo) setPedido(detalhe);
        } else {
          setResultados(lista);
        }
      } catch (err) {
        if (ativo) setErro(err instanceof ApiError ? err.message : "Ocorreu um erro inesperado. Tente novamente.");
      }
    }

    resolverPedido().finally(() => {
      if (ativo) setCarregando(false);
    });

    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  useEffect(() => {
    if (!pedido) return;
    setRastreioCarregando(true);
    obterRastreio(pedido.id)
      .then(setRastreioInfo)
      .catch(() => setRastreioInfo({ aviso: "Não foi possível obter o rastreio no momento." }))
      .finally(() => setRastreioCarregando(false));
  }, [pedido]);

  function handleBuscarOutro(novoValor) {
    navigate(`/pedido/${encodeURIComponent(novoValor)}`);
  }

  if (carregando) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-10">
        <OrderDetailSkeleton />
      </div>
    );
  }

  if (erro) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-10">
        <Link to="/" className="mb-6 inline-block text-sm text-white/50 hover:text-white">
          ← Voltar
        </Link>
        <ErrorMessage mensagem={erro} />
      </div>
    );
  }

  if (resultados) {
    return (
      <div className="mx-auto max-w-lg px-4 pb-24 pt-10">
        <Link to="/" className="mb-6 inline-block text-sm text-white/50 hover:text-white">
          ← Voltar para busca
        </Link>

        <SearchBar valorInicial={query} onBuscar={handleBuscarOutro} carregando={false} />

        <div className="mt-8">
          {resultados.length === 0 ? (
            <EmptyState
              titulo="Nenhum pedido encontrado"
              mensagem="Verifique o CPF, CNPJ, telefone, e-mail ou número do pedido e tente novamente."
            />
          ) : (
            <OrderList pedidos={resultados} />
          )}
        </div>
      </div>
    );
  }

  if (!pedido) return null;

  // Sem endereço de entrega salvo (pedido antigo, retirada, etc.) — mostra o de
  // cobrança como alternativa, deixando claro que é o de cobrança.
  const usandoEnderecoCobranca = !pedido.enderecoEntrega && Boolean(pedido.enderecoCobranca);
  const endereco = formatarEndereco(pedido.enderecoEntrega || pedido.enderecoCobranca);
  const trackingEvents = rastreioInfo?.rastreio?.events;
  const previsaoEntrega =
    rastreioInfo?.rastreio?.delivery_detail?.carrier_promissed_date ||
    rastreioInfo?.rastreio?.delivery_detail?.olist_promissed_date;
  // Pedido com vários pacotes: não há uma única transportadora/previsão no
  // nível do shipment, então junta o que dá pra saber de cada pacote.
  const nomesTransportadoras = rastreioInfo?.pacotes?.length
    ? [...new Set(rastreioInfo.pacotes.map((p) => p.carrierName).filter(Boolean))].join(", ")
    : null;
  const carrierName = rastreioInfo?.rastreio?.carrier_name || nomesTransportadoras;

  return (
    <div className="mx-auto max-w-lg px-4 pb-24 pt-10">
      <Link to="/" className="mb-6 inline-block text-sm text-white/50 hover:text-white">
        ← Voltar para busca
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Pedido #{pedido.numero}</h1>
          {pedido.numeroEcommerce && (
            <p className="mt-1 text-sm text-white/40">Nº na loja: {pedido.numeroEcommerce}</p>
          )}
        </div>
        <StatusBadge situacao={pedido.situacao} size="lg" />
      </div>

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <InfoCard icone={<IconTruck />} label="Transportadora" valor={carrierName} />
        <InfoCard
          icone={<IconCalendar />}
          label="Previsão de entrega"
          valor={previsaoEntrega ? formatarData(previsaoEntrega) : null}
          destaque
        />
        <InfoCard icone={<IconCalendar />} label="Data de despacho" valor={formatarData(pedido.dataEnvio)} />
      </div>

      {endereco && (
        <div className="mb-4 rounded-xl2 border border-bg-border bg-bg-card p-5">
          <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-wide text-white/40">
            <IconLocation />
            {usandoEnderecoCobranca ? "Endereço de cobrança" : "Endereço de entrega"}
          </div>
          <p className="text-sm text-white/90">{endereco.linha1}</p>
          {endereco.linha2 && <p className="text-sm text-white/70">{endereco.linha2}</p>}
          <p className="text-sm text-white/70">{endereco.linha3}</p>
          {endereco.cep && <p className="mt-1 text-xs text-white/40">CEP {endereco.cep}</p>}
        </div>
      )}

      <div className="mb-4 rounded-xl2 border border-bg-border bg-bg-card p-5">
        <h2 className="mb-4 font-display font-bold">Rastreio</h2>

        {!pedido.codigoRastreamento ? (
          <EmptyState
            titulo="Pedido em preparação"
            mensagem="Seu pedido está sendo preparado. O código de rastreio será disponibilizado em breve."
          />
        ) : rastreioCarregando ? (
          <LoadingSpinner label="Buscando informações de rastreio..." />
        ) : (
          <>
            {rastreioInfo?.aviso && <div className="mb-4"><AvisoMessage mensagem={rastreioInfo.aviso} /></div>}
            {rastreioInfo?.tipo === "pedido" ? (
              <PackageTrackingList pedidoId={pedido.id} pacotes={rastreioInfo.pacotes} />
            ) : (
              <TrackingTimeline eventos={trackingEvents} />
            )}
          </>
        )}
      </div>

      <DownloadInvoiceButton
        pedidoId={pedido.id}
        numeroPedido={pedido.numero}
        disponivel={Boolean(pedido.idNotaFiscal)}
      />
    </div>
  );
}
