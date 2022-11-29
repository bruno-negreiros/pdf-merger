const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const { PDFDocument } = require('pdf-lib')
const { join } = require('path')
const { readdir, writeFile } = require('fs/promises');
const { readFileSync } = require('fs');

let mainWindow
let pdfsFolder
let files

const createWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 200,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      enableRemoteModule: false,
      contextIsolation: true,
      sandbox: true
    },
    autoHideMenuBar: true
  })

  win.loadFile(join(__dirname, 'index.html'))

  return win;
}

app.whenReady().then(() => {
  mainWindow = createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('select-dirs', async (event, arg) => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory']
  })

  if (result.filePaths.length) {
    pdfsFolder = result.filePaths[0]
  
    const unfilteredFiles = await readdir(pdfsFolder)
  
    files = unfilteredFiles.filter((file) => file.slice(-4) === '.pdf')
  
    if (!files.length) {
      files = []
      pdfsFolder = ''
      event.sender.send('hide-files-list' )
      dialog.showMessageBox(mainWindow, { message: 'Nenhum arquivo pdf encontrado! '});
    } else  event.sender.send('show-files-list', files )
  }

})

ipcMain.on('merge-pdfs', async (event, arg) => {

  const mergedPdf = await PDFDocument.create()

  for (const file of files) {
    const pdfPath = join(pdfsFolder, file)
    const pdf = await PDFDocument.load(readFileSync(pdfPath))
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices())
    copiedPages.forEach((page) => mergedPdf.addPage(page))
  }

  const mergedPdfFile = await mergedPdf.save()
  await writeFile('merged-pdf.pdf', mergedPdfFile)

  const { dialog } = require('electron')

  dialog.showMessageBox(mainWindow, { message: 'Arquivos mergiados com sucesso! '});
})