document.getElementById('dirs').addEventListener('click', () => {
  window.postMessage({
    type: 'select-dirs'
  })
})

document.getElementById('merge-pdfs-button').addEventListener('click', () => {
  window.postMessage({
    type: 'merge-pdfs'
  })
})