if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => {
        // Verifica atualizações a cada 30 segundos
        setInterval(() => reg.update(), 30000)
      })
  })
}
