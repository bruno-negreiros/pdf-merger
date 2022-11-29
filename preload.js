const { ipcRenderer } = require('electron')

window.addEventListener('message', evt => {
  if (evt.data.type === 'select-dirs') {
    ipcRenderer.send('select-dirs')
    ipcRenderer.on('show-files-list', (_event, files) => {
        const filesList = document.getElementById('files-list')
        const textArea = document.getElementById('files-review')
        const qtSelectedFiles = document.getElementById('qt-selected-files')
        textArea.innerText = files
        qtSelectedFiles.innerText = files.length
        filesList.style.visibility = 'visible'
    })
    ipcRenderer.on('hide-files-list', (_event) => {
      const filesList = document.getElementById('files-list')
      filesList.style.visibility = 'hidden'
    })
  } else if (evt.data.type === 'merge-pdfs') {
    ipcRenderer.send('merge-pdfs')
  }
})