// Remove qualquer caractere que não seja dígito (usado para CPF/CNPJ e telefone).
function apenasDigitos(valor) {
  if (!valor) return null;
  const limpo = String(valor).replace(/\D/g, "");
  return limpo || null;
}

module.exports = { apenasDigitos };
