import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import saveAs from 'file-saver';
import * as ExcelJS from 'exceljs';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts';
import Report from 'src/services/api/report/ReportService';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import AbsentPatientMobileService from 'src/services/api/report/mobile/AbsentPatientMobileService';
import clinicService from 'src/services/api/clinicService/clinicService';
import DownloadFileMobile from 'src/utils/DownloadFileMobile';
import { fetchFontAsBase64 } from 'src/utils/ReportUtils';
import fontPath from 'src/assets/NotoSans-Regular.ttf';
const { isMobile, isOnline } = useSystemUtils();

const reportName = 'PacientesFaltosos';
const logoTitle =
  'REPÚBLICA DE MOÇAMBIQUE \n MINISTÉRIO DA SAÚDE \n SERVIÇO NACIONAL DE SAÚDE';
const title = "Relatório de Pacientes Faltosos ao \n Levantamento de ARV's";
const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);
// const fontPath = '/src/assets/NotoSans-Regular.ttf';
export default {
  async downloadPDF(id, fileType, params, loading) {
    console.log('PARAMMMS', params);
    const clinic = clinicService.currClinic();
    const fontBase64 = await fetchFontAsBase64(fontPath);
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
    const image = new Image();
    // image.src = '/src/assets/MoHLogo.png'
    image.src = 'data:image/png;base64,' + MOHIMAGELOG;
    const width = doc.internal.pageSize.getWidth();
    doc.setProperties({
      title: fileName.concat('.pdf'),
    });

    const headerReport = [
      [
        {
          content: 'Faltosos ao Levantamento de ARV´s',
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
          content:
            'Período: ' + params.startDateParam + ' à ' + params.endDateParam,
          colSpan: 1,
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
      ],
      [
        {
          content:
            'Distrito: ' +
            (params.district === null
              ? clinic.district.description
              : params.district.description),
          halign: 'center',
          valign: 'middle',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content:
            'Província: ' +
            (params.province === null
              ? clinic.province.description
              : params.province.description),
          halign: 'center',
          valign: 'left',
          fontStyle: 'bold',
          fontSize: '14',
        },
        {
          content: 'Ano: ' + params.year,
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
      'NID',
      'NOME',
      'Data que Faltou ao Levantamento de ARVs [0-59 dias faltoso] (d-m-a)',
      'Data em que Identificou o Abandono ao TARV [>59 dias faltoso] (d-m-a)',
      'Data em que Regressou à Unidade Sanitária',
      'Contacto',
    ];

    let data = '';
    let rowsAux = [];
    if (isOnline.value) {
      const rowsAux = await Report.printReportOther('absentPatientsReport', id);
      if (rowsAux.status === 204 || rowsAux.data.length === 0) return 204;
      data = this.createArrayOfArrayRow(rowsAux.data);
    } else {
      rowsAux = await AbsentPatientMobileService.localDbGetAllByReportId(id);
      if (rowsAux.length === 0) return 204;
      data = this.createArrayOfArrayRow(rowsAux);
    }

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
        0: { cellWidth: 40 },
        1: { cellWidth: 55 },
        2: { cellWidth: 55 },
        3: { cellWidth: 55 },
        4: { cellWidth: 40 },
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
    // params.value.loading.loading.hide()
    if (isOnline.value && !isMobile.value) {
      // return doc.save('PacientesFaltosos.pdf');
      window.open(doc.output('bloburl'));
    } else {
      const pdfOutput = doc.output();
      DownloadFileMobile.downloadFile(fileName, '.pdf', pdfOutput, loading);
    }
  },
  async downloadExcel(id, fileType, params, loading) {
    const clinic = clinicService.currClinic();
    let data = '';
    let rowsAux = [];
    let firstReg = {};
    if (isOnline.value) {
      const rowsAux = await Report.printReportOther('absentPatientsReport', id);
      if (rowsAux.status === 204 || rowsAux.data.length === 0) return 204;
      const firstReg = rowsAux.data[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
      data = this.createArrayOfArrayRow(rowsAux.data);
    } else {
      rowsAux = await AbsentPatientMobileService.localDbGetAllByReportId(id);
      if (rowsAux.length === 0) return 204;
      firstReg = rowsAux[0];
      params.startDateParam = Report.getFormatDDMMYYYY(firstReg.startDate);
      params.endDateParam = Report.getFormatDDMMYYYY(firstReg.endDate);
      data = this.createArrayOfArrayRow(rowsAux);
    }
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

    // // Get Cells
    const cellRepublica = worksheet.getCell('A8');
    const cellTitle = worksheet.getCell('A9');
    const cellPharm = worksheet.getCell('A11');
    const cellPharmParamValue = worksheet.getCell('B11');

    const cellStartDate = worksheet.getCell('E11');
    const cellEndDate = worksheet.getCell('E12');
    const cellStartDateParamValue = worksheet.getCell('F11');
    const cellEndDateParamValue = worksheet.getCell('F12');

    // // Get Rows
    const headerRow = worksheet.getRow(15);

    // Get Columns
    const colA = worksheet.getColumn('A');
    const colB = worksheet.getColumn('B');
    const colC = worksheet.getColumn('C');
    const colD = worksheet.getColumn('D');
    const colE = worksheet.getColumn('E');
    const colF = worksheet.getColumn('F');

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
      cellStartDate.alignment =
      cellEndDate.alignment =
        {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false,
        };

    // Border Format
    // cellRepublica.border =
    cellTitle.border =
      cellPharm.border =
      cellPharmParamValue.border =
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
    cellPharmParamValue.value = clinic?.clinicName;
    cellStartDateParamValue.value = params.startDateParam;
    cellEndDateParamValue.value = params.endDateParam;
    cellPharm.value = 'Unidade Sanitária';
    cellStartDate.value = 'Data Início';
    cellEndDate.value = 'Data Fim';

    // merge a range of cells
    worksheet.mergeCells('A1:A7');
    worksheet.mergeCells('A9:F10');
    worksheet.mergeCells('B11:D11');
    worksheet.mergeCells('A12:D12');
    headerRow.height = 30;

    // add height size to Columns
    // add width size to Columns
    colA.width = 25;
    colB.width = 30;
    colC.width = 25;
    colD.width = 25;
    colE.width = 25;
    colF.width = 20;

    // Add Style
    cellTitle.font =
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
        // { name: 'ORD', totalsRowLabel: 'none', filterButton: false },
        { name: 'NID', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'Nome', totalsRowFunction: 'none', filterButton: false },
        {
          name: 'Data que Faltou ao Levantamento de ARVs [0-59 dias faltoso] (d-m-a)',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Data em que Identificou o Abandono ao TARV [>59 dias faltoso] (d-m-a)',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Data em que Regressou à Unidade Sanitária',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Contacto',
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
    const fileTypePa =
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    const fileExtension = '.xlsx';

    const blob = new Blob([buffer], { type: fileTypePa });

    if (isOnline.value && !isMobile.value) {
      saveAs(blob, fileName + fileExtension);
    } else {
      const titleFile = 'PacientesFaltosos.xlsx';
      DownloadFileMobile.downloadFile(titleFile, '.xlsx', blob, loading);
    }
  },
  createArrayOfArrayRow(rows) {
    const data = [];

    for (const row in rows) {
      const createRow = [];
      createRow.push(rows[row].nid);
      createRow.push(rows[row].name);
      createRow.push(
        moment(new Date(rows[row].dateMissedPickUp)).format('DD-MM-YYYY')
      );
      const dataIdent = rows[row].dateIdentifiedAbandonment;
      createRow.push(
        dataIdent !== null && dataIdent !== ''
          ? moment(new Date(rows[row].dateIdentifiedAbandonment)).format(
              'DD-MM-YYYY'
            )
          : ''
      );
      createRow.push(
        rows[row].returnedPickUp !== null
          ? moment(new Date(rows[row].returnedPickUp)).format('DD-MM-YYYY')
          : ''
      );
      createRow.push(rows[row].contact);

      data.push(createRow);
    }

    return data;
  },
};
