import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import saveAs from 'file-saver';
import { MOHIMAGELOG } from 'src/assets/imageBytes.js';
import * as ExcelJS from 'exceljs';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import clinicService from 'src/services/api/clinicService/clinicService';
import DownloadFileMobile from 'src/utils/DownloadFileMobile';
import { fetchFontAsBase64 } from 'src/utils/ReportUtils';
import fontPath from 'src/assets/NotoSans-Regular.ttf';
const { isMobile, isOnline } = useSystemUtils();
const reportName = 'PacientesEsperadosNumDia';
const logoTitle =
  'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE';
const title = 'Relatório de Pacientes Esperados Num Dia';
const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);
// const fontPath = '/src/assets/NotoSans-Regular.ttf';

export default {
  async downloadPDF(province, startDate, endDate, result, loading) {
    const fontBase64 = await fetchFontAsBase64(fontPath);
    const clinic = clinicService.currClinic();
    const doc = new JsPDF({
      orientation: 'l',
      unit: 'mm',
      format: 'a4',
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default is 16
    });
    doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64.split(',')[1]);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');
    const firstObject = result[0];
    // const totalPagesExp = '{total_pages_count_string}'

    doc.setProperties({
      title: fileName.concat('.pdf'),
    });

    const image = new Image();
    // image.src = '/src/assets/MoHLogo.png'
    image.src = 'data:image/png;base64,' + MOHIMAGELOG;

    const headerReport = [
      [
        {
          content: 'Lista de Pacientes Esperados num Dia',
          styles: { minCellHeight: 25, fontSize: 16, halign: 'center' },
          colSpan: 3,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
        },
      ],
      [
        {
          content: 'Unidade Sanitária: ' + clinic.clinicName,
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
          content: 'Província: ' + province,
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
      bodyStyles: {
        font: 'NotoSans',
        halign: 'left',
        valign: 'middle',
        fontSize: 8,
      },
      headStyles: {
        font: 'NotoSans',
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
    doc.addImage(image, 'png', 28, 15, 10, 10);

    const cols = [
      'ORD',
      'NID',
      'Nome',
      'Data do Próximo Levantamento',
      'Regime Terapêutico',
      'Tipo de Dispensa',
      'Sector Clinico',
    ];

    const rows = result;
    const data = [];
    let ord = 1;

    for (const row in rows) {
      const createRow = [];
      createRow.push(ord);
      createRow.push(rows[row].nid);
      createRow.push(
        rows[row].firstNames +
          ' ' +
          rows[row].middleNames +
          ' ' +
          rows[row].lastNames
      );
      createRow.push(
        moment(new Date(rows[row].nextPickUpDate)).format('DD-MM-YYYY')
      );
      createRow.push(rows[row].therapeuticRegimen);
      createRow.push(rows[row].dispenseType);
      //  createRow.push(rows[row].clinic);
      createRow.push(rows[row].clinicSectorName);

      data.push(createRow);
      ord += 1;
    }
    ord = 0;
    autoTable(doc, {
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 8,
      },
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 8,
      },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 40 },
        2: { cellWidth: 60 },
        3: { cellWidth: 30 },
        4: { cellWidth: 50 },
        5: { cellWidth: 35 },
        6: { cellWidth: 35 },
        7: { cellWidth: 25 },
      },
      didDrawPage: function (data) {
        const str = 'Página ' + doc.internal.getNumberOfPages();
        doc.setFontSize(8);
        // jsPDF 1.4+ uses getWidth, <1.4 uses .width
        const pageSize = doc.internal.pageSize;
        const pageHeight = pageSize.height
          ? pageSize.height
          : pageSize.getHeight();
        doc.text(str, data.settings.margin.right, pageHeight - 10);
      },
      startY: doc.lastAutoTable.finalY,
      theme: 'grid',
      head: [cols],
      body: data,
    });

    if (isOnline.value && !isMobile.value) {
      // return doc.save('PacientesActivos.pdf')
      window.open(doc.output('bloburl'));
      loading.value = false;
    } else {
      const pdfOutput = doc.output();
      DownloadFileMobile.downloadFile(fileName, '.pdf', pdfOutput, loading);
    }
  },
  async downloadExcel(province, startDate, endDate, result, loading) {
    const clinic = clinicService.currClinic();
    const rows = result;
    const data = this.createArrayOfArrayRow(rows);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'FGH';
    workbook.lastModifiedBy = 'FGH';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet(reportName);
    const imageId = workbook.addImage({
      base64: 'data:image/png;base64,' + MOHIMAGELOG,
      extension: 'png',
    });

    // Get Cells
    const cellRepublica = worksheet.getCell('A8');
    const cellTitle = worksheet.getCell('A9');
    const cellPharm = worksheet.getCell('A11');
    const cellDistrict = worksheet.getCell('A12');
    const cellProvince = worksheet.getCell('D12');
    const cellStartDate = worksheet.getCell('I11');
    const cellEndDate = worksheet.getCell('I12');
    const cellPharmParamValue = worksheet.getCell('B11');
    const cellDistrictParamValue = worksheet.getCell('B12');
    const cellProvinceParamValue = worksheet.getCell('E12');
    const cellStartDateParamValue = worksheet.getCell('J11');
    const cellEndDateParamValue = worksheet.getCell('J12');

    // Get Rows
    const headerRow = worksheet.getRow(15);

    // Get Columns
    const colA = worksheet.getColumn('A');
    const colB = worksheet.getColumn('B');
    const colC = worksheet.getColumn('C');
    const colD = worksheet.getColumn('D');
    const colE = worksheet.getColumn('E');
    const colF = worksheet.getColumn('F');
    const colG = worksheet.getColumn('G');
    const colH = worksheet.getColumn('H');
    const colI = worksheet.getColumn('I');
    const colJ = worksheet.getColumn('J');

    // Format Table Cells
    // Alignment Format
    cellRepublica.alignment =
      cellTitle.alignment =
      headerRow.alignment =
        {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };

    cellPharm.alignment =
      cellDistrict.alignment =
      cellProvince.alignment =
      cellStartDate.alignment =
      cellEndDate.alignment =
        {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false,
        };

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
          right: { style: 'thin' },
        };

    // Assign Value to Cell
    cellRepublica.value = logoTitle;
    cellTitle.value = title;
    cellPharmParamValue.value = result[0].clinic;
    cellProvinceParamValue.value = province;
    cellDistrictParamValue.value = result[0].district;
    cellStartDateParamValue.value = startDate;
    cellEndDateParamValue.value = endDate;
    cellPharm.value = 'Unidade Sanitária';
    cellDistrict.value = 'Distrito';
    cellProvince.value = 'Província';
    cellStartDate.value = 'Data Início';
    cellEndDate.value = 'Data Fim';

    // merge a range of cells
    // worksheet.mergeCells('A1:A7')
    worksheet.mergeCells('A9:J10');
    worksheet.mergeCells('B11:H11');
    worksheet.mergeCells('B12:C12');
    worksheet.mergeCells('E12:H12');
    worksheet.mergeCells('A13:I13');

    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30;

    // add height size to Columns
    // add width size to Columns
    colA.width = 20;
    colB.width = 20;
    colC.width = 30;
    colD.width = 15;
    colE.width = 20;
    colF.width = 15;
    colG.width = 15;
    colH.width = 15;
    colI.width = 15;
    colJ.width = 20;

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
          bold: true,
        };

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
        showRowStripes: false,
      },

      columns: [
        { name: 'ORD', totalsRowLabel: 'none', filterButton: false },
        { name: 'NID', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'Nome', totalsRowFunction: 'none', filterButton: false },
        { name: 'Data do Próximo Levantamento', totalsRowLabel: 'none' },
        {
          name: 'Regime Terapêutico',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Tipo de Dispensa',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Nome da Unidade Sanitária',
          totalsRowFunction: 'none',
          filterButton: false,
        },
      ],
      rows: data,
    });

    // Format all data cells
    const lastRowNum =
      worksheet.lastRow.number !== undefined ? worksheet.lastRow.number : 0;
    const lastTableRowNum = lastRowNum;

    // Loop through all table's row
    for (let i = 14; i <= lastTableRowNum; i++) {
      const row = worksheet.getRow(i);

      // Now loop through every row's cell and finally set alignment
      row.eachCell({ includeEmpty: true }, (cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };
        cell.alignment = {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
        if (i === 14) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '1fa37b' },
            bgColor: { argb: '1fa37b' },
          };
          cell.font = {
            name: 'Arial',
            color: { argb: 'FFFFFFFF' },
            family: 2,
            size: 11,
            italic: false,
            bold: true,
          };
        }
      });
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const fileType =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';

    const blob = new Blob([buffer], { type: fileType });

    if (isOnline.value && !isMobile.value) {
      saveAs(blob, fileName + fileExtension);
      loading.value = false;
    } else {
      const titleFile = 'PacientesEsperadosNoDia.xlsx';
      // console.log('result' + titleFile);
      DownloadFileMobile.downloadFile(titleFile, '.xlsx', blob, loading);
    }
  },
  createArrayOfArrayRow(rows) {
    const data = [];
    let ord = 1;

    for (const row in rows) {
      const createRow = [];
      createRow.push(ord);
      createRow.push(rows[row].nid);
      createRow.push(
        rows[row].firstNames +
          ' ' +
          rows[row].middleNames +
          ' ' +
          rows[row].lastNames
      );
      createRow.push(
        moment(new Date(rows[row].nextPickUpDate)).format('DD-MM-YYYY')
      );
      createRow.push(rows[row].therapeuticRegimen);
      createRow.push(rows[row].dispenseType);
      createRow.push(rows[row].clinicSectorName);
      data.push(createRow);
      ord += 1;
    }
    ord = 0;
    rows = [];

    return data;
  },
};
