// Utilitários de data no formato usado pela API do Tiny ERP: "dd/mm/yyyy" ou "dd/mm/yyyy hh:mm:ss".

function parseTinyDate(valor) {
  if (!valor || typeof valor !== "string") return null;
  const match = valor
    .trim()
    .match(/^(\d{2})\/(\d{2})\/(\d{4})(?:\s+(\d{2}):(\d{2}):(\d{2}))?$/);
  if (!match) return null;

  const [, dia, mes, ano, hora = "00", minuto = "00", segundo = "00"] = match;
  const data = new Date(
    Number(ano),
    Number(mes) - 1,
    Number(dia),
    Number(hora),
    Number(minuto),
    Number(segundo)
  );
  return Number.isNaN(data.getTime()) ? null : data;
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

// Formata uma data JS no formato exigido pelo parâmetro dataAtualizacao do Tiny.
function formatTinyDateTime(data) {
  return (
    `${pad2(data.getDate())}/${pad2(data.getMonth() + 1)}/${data.getFullYear()} ` +
    `${pad2(data.getHours())}:${pad2(data.getMinutes())}:${pad2(data.getSeconds())}`
  );
}

function subtractMinutes(data, minutos) {
  return new Date(data.getTime() - minutos * 60000);
}

module.exports = { parseTinyDate, formatTinyDateTime, subtractMinutes };
