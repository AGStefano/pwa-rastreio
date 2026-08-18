import OrderCard from "./OrderCard";

export default function OrderList({ pedidos }) {
  return (
    <div className="w-full">
      <p className="mb-4 text-sm text-white/50">
        Encontramos {pedidos.length} pedido{pedidos.length === 1 ? "" : "s"} para essa busca
      </p>
      <div className="flex flex-col gap-3">
        {pedidos.map((pedido) => (
          <OrderCard key={pedido.id} pedido={pedido} />
        ))}
      </div>
    </div>
  );
}
