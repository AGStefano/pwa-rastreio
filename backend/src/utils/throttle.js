function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Serializa chamadas respeitando um intervalo mínimo entre elas, garantindo um
// limite de requisições por minuto mesmo com chamadas concorrentes (mesmo token
// da Tiny é compartilhado entre a sincronização e chamadas ao vivo, como nota fiscal).
class Throttle {
  constructor(requestsPerMinute) {
    this.minIntervalMs = 60000 / requestsPerMinute;
    this.lastCallAt = 0;
    this.queue = Promise.resolve();
  }

  schedule(fn) {
    const run = this.queue.then(async () => {
      const wait = this.minIntervalMs - (Date.now() - this.lastCallAt);
      if (wait > 0) await sleep(wait);
      this.lastCallAt = Date.now();
      return fn();
    });
    // Garante que a fila continue mesmo se essa chamada específica falhar.
    this.queue = run.catch(() => {});
    return run;
  }
}

module.exports = { Throttle, sleep };
