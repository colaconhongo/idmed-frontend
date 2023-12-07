import JsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import moment from 'moment'
import saveAs from 'file-saver'
import { MOHIMAGELOG } from '../../../assets/imageBytes.ts';
import * as ExcelJS from 'exceljs'
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';

const {  isMobile, isOnline } = useSystemUtils();

const reportName = 'HistoricoDeLevantamento'
const logoTitle =
'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE'
const title = 'HISTÓRICO DE LEVANTAMENTO'
const fileName = reportName.concat(
'_' + moment(new Date()).format('DD-MM-YYYY')
)

const img = new Image();
img.src = 'data:image/png;base64,' + MOHIMAGELOG;

export default {

  async downloadPDF (province, startDate, endDate, result, tipoPacient) {
    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default i
    })
    const firstObject = result[0]
    /*
      Fill Table
    */

      doc.setProperties({
        title: fileName.concat('.pdf'),
      });

    const headerReport = [
      [
        {
          content: 'HISTÓRICO DE LEVANTAMENTO',
          styles: { minCellHeight: 25, fontSize: 12, halign: 'center' },
          colSpan: 3,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
        },
      ],
      [
        {
          content: 'Unidade Sanitária: ' + firstObject.clinic,
          colSpan: 2,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Período: ' + startDate + ' à ' + endDate,
          colSpan: 1,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
      [
        {
          content: 'Distrito: ' + firstObject.district,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Província: ' + firstObject.province,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Ano: ' + firstObject.year,
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
    ];

    autoTable(doc, {
      //  margin: { top: 10 },
      bodyStyles: {
        halign: 'left',
        valign: 'middle',
        fontSize: 8,
      },
      headStyles: {
        halign: 'left',
        valign: 'middle',
      },
      theme: 'grid',
      body: headerReport,
    });

    doc.setFontSize(8);
    doc.text('República de Moçambique ', 16, 28);
    doc.text('Ministério da Saúde ', 20, 32);
    doc.text('Serviço Nacional de Saúde ', 16, 36);
    doc.addImage(img, 'png', 28, 15, 10, 10);

    const cols = [
      'ORD',
      'NID',
      'Nome',
      'Idade',
      'Contacto',
      tipoPacient === 'tarv' ? 'Tipo TARV' : 'Tipo Paciente',
      'Regime Terapêutica',
      'Tipo de Dispensa',
      'Modo de Dispensa',
      'Data Levant.',
      'Data Prox. Levant.'
    ];
    const rows = result
    const data = []
    let ord = 1

    for (const row in rows) {
      const createRow = []
      createRow.push(ord)
      createRow.push(rows[row].nid)
      createRow.push(rows[row].firstNames + ' ' + rows[row].middleNames + ' ' + rows[row].lastNames)
      createRow.push(rows[row].age)
      createRow.push(rows[row].cellphone)
      createRow.push(rows[row].tipoTarv)
      createRow.push(rows[row].therapeuticalRegimen)
      createRow.push(rows[row].dispenseType)
      createRow.push(rows[row].dispenseMode)
      createRow.push(moment(new Date(rows[row].pickUpDate)).format('DD-MM-YYYY'))
      createRow.push(moment(new Date(rows[row].nexPickUpDate)).format('DD-MM-YYYY'))

      data.push(createRow)
      ord += 1
    }
    ord = 0
    autoTable(doc, {
      bodyStyles: {
        halign: 'center',
        fontSize: 8,
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 15 },
        4: { cellWidth: 20 },
        5: { cellWidth: 25 },
        6: { cellWidth: 30 },
        7: { cellWidth: 30 },
        8: { cellWidth: 30 },
        9: { cellWidth: 20 },
      },
      didDrawPage: function (data) 
      {    
        const str = 'Página ' + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
        doc.text(str, data.settings.margin.right, pageHeight - 10);        
      },
      startY: doc.lastAutoTable.finalY,
      theme: 'grid',
      head: [cols],
      body: data
    })
    if(isOnline.value && !isMobile.value) {
      // return doc.save('HistoricoDeLevantamento.pdf')
      window.open(doc.output('bloburl'));
    } else {
      const pdfOutput = doc.output()
      this.downloadFile(fileName,'pdf',pdfOutput)
    }
  },
  async downloadExcel (province, startDate, endDate, result, tipoPacient) {
    const rows = result
    const data = this.createArrayOfArrayRow(rows)

    const workbook = new ExcelJS.Workbook()
    workbook.creator = 'FGH';
    workbook.lastModifiedBy = 'FGH';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();
    // Force workbook calculation on load
    // workbook.calcProperties.fullCalcOnLoad = true
    const worksheet = workbook.addWorksheet(reportName);
    const imageId = workbook.addImage({
      base64: 'data:image/pngbase64,' + MOHIMAGELOG,
      extension: 'png',
    });
 

    // Get Cells
    const cellRepublica = worksheet.getCell('A8')
    const cellTitle = worksheet.getCell('A9')
    const cellPharm = worksheet.getCell('A11')
    const cellDistrict = worksheet.getCell('A12')
    const cellProvince = worksheet.getCell('E12')
    const cellStartDate = worksheet.getCell('J11')
    const cellEndDate = worksheet.getCell('J12')
    const cellPharmParamValue = worksheet.getCell('B11')
    const cellDistrictParamValue = worksheet.getCell('B12')
    const cellProvinceParamValue = worksheet.getCell('F12')
    const cellStartDateParamValue = worksheet.getCell('K11')
    const cellEndDateParamValue = worksheet.getCell('K12')

    // Get Rows
    const headerRow = worksheet.getRow(15)

    // Get Columns
    const colA = worksheet.getColumn('A')
    const colB = worksheet.getColumn('B')
    const colC = worksheet.getColumn('C')
    const colD = worksheet.getColumn('D')
    const colE = worksheet.getColumn('E')
    const colF = worksheet.getColumn('F')
    const colG = worksheet.getColumn('G')
    const colH = worksheet.getColumn('H')
    const colI = worksheet.getColumn('I')
    const colJ = worksheet.getColumn('J')
    const colK = worksheet.getColumn('K')

    // Format Table Cells
    // Alignment Format
    cellRepublica.alignment =
      cellTitle.alignment =
      headerRow.alignment =
        {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        }

    cellPharm.alignment =
      cellDistrict.alignment =
      cellProvince.alignment =
      cellStartDate.alignment =
      cellEndDate.alignment =
        {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false
        }

    // Border Format
    cellRepublica.border =
      cellTitle.border =
      cellPharm.border =
      cellDistrictParamValue.border =
      cellDistrict.border =
      cellPharmParamValue.border =
      cellProvince.border =
      cellProvinceParamValue.border =
      cellStartDate.border =
      cellStartDateParamValue.border =
      cellEndDate.border =
      cellEndDateParamValue.border =
        {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }

    // Assign Value to Cell
    cellRepublica.value = logoTitle
    cellTitle.value = title
    cellPharmParamValue.value = result[0].clinic
    cellProvinceParamValue.value = province
    cellDistrictParamValue.value = result[0].district
    cellStartDateParamValue.value = startDate
    cellEndDateParamValue.value = endDate
    cellPharm.value = 'Unidade Sanitária'
    cellDistrict.value = 'Distrito'
    cellProvince.value = 'Província'
    cellStartDate.value = 'Data Início'
    cellEndDate.value = 'Data Fim'

    // merge a range of cells
    // worksheet.mergeCells('A1:A7')
    worksheet.mergeCells('A9:K10')
    worksheet.mergeCells('B11:I11')
    worksheet.mergeCells('B12:D12')
    worksheet.mergeCells('F12:I12')
    worksheet.mergeCells('A13:I13')

    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30

    // add height size to Columns
    // add width size to Columns
    colA.width = 20
    colB.width = 20
    colC.width = 30
    colD.width = 10
    colE.width = 15
    colF.width = 20
    colG.width = 20
    colH.width = 20
    colI.width = 20
    colJ.width = 20
    colK.width = 20

    // Add Style
    // cellTitle.font =
      cellDistrict.font =
      cellProvince.font =
      cellStartDate.font =
      cellEndDate.font =
      cellPharm.font =
        {
          name: 'Arial',
          family: 2,
          size: 11,
          italic: false,
          bold: true
        }

    // Add Image
    worksheet.addImage(imageId, {
      tl: { col: 0, row: 1 },
      ext: { width: 144, height: 98 },
    });

    // Cereate Table
    worksheet.addTable({
      name: reportName,
      ref: 'A14',
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false
      },
      columns: [
        { name: 'ORD', totalsRowLabel: 'none', filterButton: false },
        { name: 'NID', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'Nome', totalsRowFunction: 'none', filterButton: false },
        { name: 'Idade', totalsRowFunction: 'none', filterButton: false },
        {
          name: 'Contacto',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name:  tipoPacient === 'tarv' ? 'Tipo TARV' : 'Tipo Paciente',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'Regime Terapêutica',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'Tipo de Dispensa',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'Modo de Dispensa',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'DATA LEVANT.',
          totalsRowFunction: 'none',
          filterButton: false
        },
        {
          name: 'DATA PRÓX. LEVANT.',
          totalsRowFunction: 'none',
          filterButton: false
        }
      ],
      rows: data
    })

    // Format all data cells
    const lastRowNum =
      worksheet.lastRow.number !== undefined ? worksheet.lastRow.number : 0
    const lastTableRowNum = lastRowNum

    // Loop through all table's row
    for (let i = 14; i <= lastTableRowNum; i++) {
      const row = worksheet.getRow(i)

      // Now loop through every row's cell and finally set alignment
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        }
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true
        }
        if (i === 14) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1fa37b' },
            bgColor: { argb: '1fa37b' }
          }
          cell.font = {
            name: 'Arial',
            color: { argb: 'FFFFFFFF' },
            family: 2,
            size: 11,
            italic: false,
            bold: true
          }
        }
      })
    }

    const buffer = await workbook.xlsx.writeBuffer()
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    const fileExtension = '.xlsx'

    const blob = new Blob([buffer], { type: fileType })

    if (isOnline.value && !isMobile.value) {
      saveAs(blob, fileName + fileExtension)
    } else {

   const titleFile = 'HistoricoDeLevantamento.xlsx'
   console.log('result' + titleFile)
    saveBlob2File(titleFile, blob)
    function saveBlob2File (fileName, blob) {
       const folder = cordova.file.externalRootDirectory + 'Download'
      //  var folder = 'Download'
       window.resolveLocalFileSystemURL(folder, function (dirEntry) {
         createFile(dirEntry, fileName, blob)
        // $q.loading.hide()
       }, onErrorLoadFs)
     }
        function createFile (dirEntry, fileName, blob) {
       // Creates a new file
       dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
         writeFile(fileEntry, blob)
       }, onErrorCreateFile)
     }

     function writeFile (fileEntry, dataObj) {
       // Create a FileWriter object for our FileEntry
       fileEntry.createWriter(function (fileWriter) {
         fileWriter.onwriteend = function () {
           console.log('Successful file write...')
            openFile()
         }

         fileWriter.onerror = function (error) {
           console.log('Failed file write: ' + error)
         }
         fileWriter.write(dataObj)
       })
     }
     function onErrorLoadFs (error) {
       console.log(error)
     }

     function onErrorCreateFile (error) {
       console.log('errorr: ' + error.toString())
     }
   function openFile () {
       const strTitle = titleFile
         console.log('file system 44444: ' + strTitle)
        const folder = cordova.file.externalRootDirectory + 'Download/' + strTitle
          console.log('file system 2222: ' + folder)
          const documentURL = decodeURIComponent(folder)
   cordova.plugins.fileOpener2.open(
     documentURL,
       'application/vnd.ms-excel', {
           error: function (e) {
               console.log('file system open3333366: ' + e + documentURL)
           },
           success: function () {

           }
       })
   }
}

  },
  createArrayOfArrayRow (rows) {
    const data = []
    let ord = 1

    for (const row in rows) {
      const createRow = []
      createRow.push(ord)
      createRow.push(rows[row].nid)
      createRow.push(rows[row].firstNames + ' ' + rows[row].middleNames + ' ' + rows[row].lastNames)
      createRow.push(rows[row].age)
      createRow.push(rows[row].cellphone)
      createRow.push(rows[row].tipoTarv)
      createRow.push(rows[row].therapeuticalRegimen)
      createRow.push(rows[row].dispenseType)
      createRow.push(rows[row].dispenseMode)
      createRow.push(moment(new Date(rows[row].pickUpDate)).format('DD-MM-YYYY'))
      createRow.push(moment(new Date(rows[row].nexPickUpDate)).format('DD-MM-YYYY'))

      data.push(createRow)
      ord += 1
    }
    ord = 0
    rows = []

    return data
  },

  downloadFile(fileName , fileType, blop) {
   // console.log(blop)
   // var pdfOutput = blop.output()
  //  console.log(pdfOutput)
  //  if (typeof cordova !== 'undefined') {
     //   var blob = new Blob(materialEducativo.blop)
     //  const bytes = new Uint8Array(materialEducativo.blop)
    // var UTF8_STR = new Uint8Array(pdfOutput)
    //   var BINARY_ARR = UTF8_STR.buffer
       const titleFile = fileName + fileType
       console.log('result' + titleFile)
        saveBlob2File(titleFile, blop)
        function saveBlob2File (fileName, blob) {
           const folder = cordova.file.externalRootDirectory + 'Download'
          //  var folder = 'Download'
           window.resolveLocalFileSystemURL(folder, function (dirEntry) {
             createFile(dirEntry, fileName, blob)
            // $q.loading.hide()
           }, onErrorLoadFs)
         }
            function createFile (dirEntry, fileName, blob) {
           // Creates a new file
           dirEntry.getFile(fileName, { create: true, exclusive: false }, function (fileEntry) {
             writeFile(fileEntry, blob)
           }, onErrorCreateFile)
         }

         function writeFile (fileEntry, dataObj) {
           // Create a FileWriter object for our FileEntry
           fileEntry.createWriter(function (fileWriter) {
             fileWriter.onwriteend = function () {
               console.log('Successful file write...')
                openFile()
             }

             fileWriter.onerror = function (error) {
               console.log('Failed file write: ' + error)
             }
             fileWriter.write(dataObj)
           })
         }
         function onErrorLoadFs (error) {
           console.log(error)
         }

         function onErrorCreateFile (error) {
           console.log('errorr: ' + error.toString())
         }
       function openFile () {
           const strTitle = titleFile
             console.log('file system 44444: ' + strTitle)
            const folder = cordova.file.externalRootDirectory + 'Download/' + strTitle
              console.log('file system 2222: ' + folder)
              const documentURL = decodeURIComponent(folder)
       cordova.plugins.fileOpener2.open(
         documentURL,
           'application/pdf', {
               error: function (e) {
                   console.log('file system open3333366: ' + e + documentURL)
               },
               success: function () {

               }
           })
       }
    // }
  }
}
