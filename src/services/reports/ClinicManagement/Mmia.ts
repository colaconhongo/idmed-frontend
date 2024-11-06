/* eslint-disable */
import JsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { saveAs } from 'file-saver';
import * as ExcelJS from 'exceljs';
import { MOHIMAGELOG } from 'src/assets/imageBytes.ts';
import Report from 'src/services/api/report/ReportService';
import moment from 'moment';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import MmiaMobileService from 'src/services/api/report/mobile/MmiaMobileService';
import clinicService from 'src/services/api/clinicService/clinicService';
import DownloadFileMobile from 'src/utils/DownloadFileMobile';
import { fetchFontAsBase64 } from 'src/utils/ReportUtils';
import fontPath from 'src/assets/NotoSans-Regular.ttf';
const { isMobile, isOnline } = useSystemUtils();

//const fontPath = '/src/assets/NotoSans-Regular.ttf';
const logoTitle =
  'REPÚBLICA DE MOÇAMBIQUE \nMINISTÉRIO DA SAÚDE \nCENTRAL DE MEDICAMENTOS E ARTIGOS MÉDICOS';
const title = 'MMIA \n MAPA MENSAL DE INFORMAÇÃO ARV';
const reportName = 'MMIA';
const fileName = reportName.concat(
  '_' + moment(new Date()).format('DD-MM-YYYY')
);
const months = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export default {
  async downloadPDF(id, loading) {
    const fontBase64 = await fetchFontAsBase64(fontPath);
    const doc = new JsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
      // format: [225, 427],
      putOnlyUsedFonts: true,
      floatPrecision: 'smart', // or "smart", default is 16
    });
    doc.addFileToVFS('NotoSans-Regular.ttf', fontBase64.split(',')[1]);
    doc.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
    doc.setFont('NotoSans');
    doc.setFontSize(10);
    const image = new Image();
    image.src = 'data:image/png;base64,' + MOHIMAGELOG;

    doc.setProperties({
      title: fileName.concat('.pdf'),
    });
    /*
      Fill Table
    */
    const cols = [
      'FNM',
      'MEDICAMENTO',
      'Unidade',
      'Saldo Inicial',
      'Entradas',
      'Saídas',
      'Perdas e Ajustes',
      'Inventário',
      'Validade',
    ];

    const clinic = clinicService.currClinic();
    let mmiaReport = {};
    let mmiaData = [];
    let mmiaRegimenData = [];
    let mmiaStockData = [];
    if (isOnline.value) {
      mmiaReport = await Report.get('mmiaReport', id);
      if (mmiaReport.status === 204 || mmiaReport.data.length === 0) return 204;
      mmiaData = mmiaReport.data;
      mmiaStockData = mmiaData.mmiaStockSubReportItemList;
      mmiaRegimenData = mmiaData.mmiaRegimenSubReportList;
    } else {
      mmiaData = await MmiaMobileService.getDataLocalReportMmia(id);
      if (mmiaData === undefined || mmiaData.length === 0) return 204;
      mmiaStockData = await MmiaMobileService.getDataLocalReportStock(id);
      mmiaRegimenData = await MmiaMobileService.getDataLocalReportRegimen(id);
    }

    const stockdata = this.createArrayOfArrayRow(mmiaStockData);
    const regimendata = this.createRegimenArrayOfArrayRow(mmiaRegimenData);
    const miaTipoDoenteData = this.createMmiaTipoDoentesArrayRow(mmiaData);
    const miaFaixaEtariaData = this.createMmiaFaixaEtariaArrayRow(mmiaData);
    const miaProfilaxiaData = this.createMmiaProfilaxiaArrayRow(mmiaData);
    const miaRegimenTotalData = this.createRegimenTotalArrayRow(
      mmiaData,
      isOnline.value ? mmiaData.mmiaRegimenSubReportList : mmiaRegimenData,
      'PDF'
    );
    const miaLinesSumaryData = this.createLinesSumaryArrayRow(
      mmiaData,
      isOnline.value ? mmiaData.mmiaRegimenSubReportList : mmiaRegimenData,
      'PDF'
    );
    const miaLinesSumaryTotalData = this.createLinesSumaryTotalArrayRow(
      mmiaData,
      isOnline.value ? mmiaData.mmiaRegimenSubReportList : mmiaRegimenData,
      'PDF'
    );
    const mmiadsTypeData = this.createMmiaDispenseTypeDSArrayRow(mmiaData);
    const mmiadtTypeData = this.createMmiaDispenseTypeDTArrayRow(mmiaData);
    const mmiadbTypeData = this.createMmiaDispenseTypeDBArrayRow(mmiaData);
    const mmiadmTypeData = this.createMmiaDispenseTypeDMArrayRow(mmiaData);
    const mmiaAjusteData = this.createMmiaAjustePercentageArrayRow(mmiaData);
    const footer = this.createFotterTableRow();

    const month =
      months[
        new Date(
          isOnline.value ? mmiaData.endDate : mmiaStockData[0].endDate
        ).getMonth()
      ];

    const regimenCols = [
      'Código',
      'Regime Terapêutico',
      'Total doentes',
      'Farmácia Comunitária',
      'Doentes Referidos',
    ];

    const headData = [];
    const row1 = [];
    const row2 = [];
    const row3 = [];
    row1.push(image);
    row1.push({
      content:
        'REPÚBLICA DE MOÇAMBIQUE \nMINISTÉRIO DA SAÚDE \nCENTRAL DE MEDICAMENTOS E ARTIGOS MÉDICOS',
      styles: {
        font: 'NotoSans',
        halign: 'left',
        valign: 'middle',
        fontStyle: 'bold',
        textColor: 0,
      },
    });
    row1.push({
      content: 'MMIA \n MAPA MENSAL DE INFORMAÇÃO ARV',
      styles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontStyle: 'bold',
        textColor: 0,
      },
    });
    row1.push({
      content: 'Mês: ' + month,
      styles: {
        font: 'NotoSans',
        valign: 'middle',
        halign: 'center',
        fontStyle: 'bold',
        textColor: 0,
      },
    });

    row2.push({
      content: 'Unidade Sanitária: ' + clinic.clinicName,
      colSpan: 3,
      styles: {
        font: 'NotoSans',
        halign: 'left',
        fontStyle: 'bold',
        textColor: 0,
      },
    });

    row3.push({
      colSpan: 2,
      content: 'Distrito: ' + clinic.district.description,
      styles: {
        font: 'NotoSans',
        halign: 'left',
        fontStyle: 'bold',
        textColor: 0,
      },
    });
    row3.push({
      content: 'Província: ' + clinic.province.description,
      styles: {
        font: 'NotoSans',
        halign: 'left',
        fontStyle: 'bold',
        textColor: 0,
      },
    });
    row2.push({
      rowSpan: 2,
      content: 'Ano: ' + isOnline.value ? mmiaData.year : mmiaStockData[0].year,
      styles: {
        font: 'NotoSans',
        valign: 'middle',
        halign: 'center',
        fontStyle: 'bold',
        textColor: 0,
      },
    });

    headData.push(row1);
    headData.push(row2);
    headData.push(row3);

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 6,
        textColor: 0,
      },
      columnStyles: {
        0: { cellWidth: 14 },
      },
      styles: {
        maxCellHeight: 4,
      },
      body: headData,
      startY: 10,
    });

    doc.addImage(image, 'PNG', 16, 10, 10, 10);

    autoTable(doc, {
      theme: 'grid',
      styles: {
        maxCellHeight: 4,
      },
      bodyStyles: {
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        0: { cellWidth: 13 },
        1: { halign: 'left' },
        2: { cellWidth: 15 },
        3: { cellWidth: 15 },
        4: { cellWidth: 16 },
        5: { cellWidth: 13 },
        6: { cellWidth: 16 },
        7: { cellWidth: 17 },
        8: { cellWidth: 17 },
      },
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 8,
        fillColor: [75, 76, 77],
      },
      head: [cols],
      body: stockdata,
      startY: doc.lastAutoTable.finalY,
    });

    const firstTableHeigth = doc.lastAutoTable.finalY;

    autoTable(doc, {
      // Segunda tabela (Regime Terapêutico) Lado esquerdo
      theme: 'grid',
      bodyStyles: {
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        0: { cellWidth: 13 },
        2: { cellWidth: 15.1 },
        3: { cellWidth: 18 },
        4: { cellWidth: 21.2 },

      },
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
        fillColor: [75, 76, 77],
      },
      styles: {
        maxCellHeight: 4,
      },
      head: [regimenCols],
      body: regimendata,
      startY: firstTableHeigth + 1,
      margin: { right: 90.1 },
    });

    const secondTableHeigth = doc.lastAutoTable.finalY;

    autoTable(doc, {
      // Terceira tabela (Total)
      theme: 'grid',
      bodyStyles: {
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        1: { cellWidth: 15.1 },
        2: { cellWidth: 18 },
        3: { cellWidth: 21.2 },
      },
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
      },
      styles: {
        maxCellHeight: 4,
      },
      body: miaRegimenTotalData,
      startY: secondTableHeigth,
      margin: { right: 90.1 },
    });

    const thirdTableHeigth = doc.lastAutoTable.finalY;

    autoTable(doc, {
      // Quarta  tabela (Linhas Terapêuticas)
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        // 0: { fillColor: [240, 241, 242] },
        // 1: { cellWidth: 15 },
        // 2: { cellWidth: 18 },

        0: { fillColor: [240, 241, 242] },
        // 2: { cellWidth: 15.1 },
        // 3: { cellWidth: 18 },
        // 4: { cellWidth: 21.2 },
      },
      head: [
        [
          {
            content: 'Linhas Terapêuticas\n',
            colSpan: 4,
            styles: { halign: 'center', fillColor: [75, 76, 77] },
          },
        ],
      ],
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
      },
      styles: {
        maxCellHeight: 4,
      },
      body: miaLinesSumaryData,
      startY: thirdTableHeigth + 1,
      margin: { right: 90.1 },
    });

    const fourthTableHeigth = doc.lastAutoTable.finalY;

    autoTable(doc, {
      // Quinta tabela (Total Linhas)
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        // 1: { cellWidth: 15 },
        // 2: { cellWidth: 18 },
        1: { cellWidth: 15.1 },
        2: { cellWidth: 18 },
        3: { cellWidth: 21.2 },
      },
      headStyles: {
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
      },
      styles: {
        maxCellHeight: 4,
      },
      body: miaLinesSumaryTotalData,
      startY: fourthTableHeigth,
      margin: { right: 90.1 },
    });

    // Fim das colunas a esquerda

    autoTable(doc, {
      // Sexta tabela (Tipo de Doencas em TARV)
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        0: { halign: 'left', fillColor: [240, 241, 242] },
        1: { cellWidth: 30 },
      },
      head: [
        [
          {
            content: 'Tipo de doentes em \nTARV',
            colSpan: 2,
            styles: { halign: 'center', fillColor: [75, 76, 77] },
          },
        ],
      ],
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
      },
      styles: {
        maxCellHeight: 4,
      },
      body: miaTipoDoenteData,
      startY: firstTableHeigth + 1,
      margin: { left: 121.1 },
    });

    const sixthTableHeigth = doc.lastAutoTable.finalY;

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        0: { halign: 'left', fillColor: [240, 241, 242] },
        1: { cellWidth: 30 },
      },
      head: [
        [
          {
            content: 'Faixa Etária dos Pacientes \nTARV',
            colSpan: 2,
            styles: { halign: 'center', fillColor: [75, 76, 77] },
          },
        ],
      ],
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
      },
      styles: {
        maxCellHeight: 4,
      },
      body: miaFaixaEtariaData,
      startY: sixthTableHeigth + 1,
      margin: { left: 121.1 },
    });

    const seventhTableHeigth = doc.lastAutoTable.finalY;

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        0: { halign: 'left', fillColor: [240, 241, 242] },
        1: { cellWidth: 30 },
      },
      head: [
        [
          {
            content: 'Profilaxia \n',
            colSpan: 2,
            styles: { halign: 'center', fillColor: [75, 76, 77] },
          },
        ],
      ],
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
      },
      styles: {
        maxCellHeight: 2,
      },
      body: miaProfilaxiaData,
      startY: seventhTableHeigth + 1,
      margin: { left: 121.1 },
    });

    const eigthTableHeigth = doc.lastAutoTable.finalY;

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 6,
      },
      head: [
        [
          {
            content: 'Tipo de Dispensa\n',
            styles: { halign: 'center', fillColor: [75, 76, 77] },
          },
        ],
      ],
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
      },
      styles: {
        maxCellHeight: 4,
      },
      startY: eigthTableHeigth + 1,
      margin: { left: 121.1 },
    });

    const ninethTableHeigth = doc.lastAutoTable.finalY;
    const arrayAux = [['', 'DS', '', '', '', '']];
    for (let i = 0; i < mmiadsTypeData.length; i++) {
      if (i == 0) {
        mmiadsTypeData[i].push('');
        mmiadsTypeData[i].push('');
        mmiadsTypeData[i].push(mmiaAjusteData[0][0]);
        mmiadsTypeData[i].push(mmiaAjusteData[0][1]);
      }
      if (i == 1) {
        mmiadsTypeData[i].push('');
        mmiadsTypeData[i].push('');
        mmiadsTypeData[i].push('');
        mmiadsTypeData[i].push('');
      }
      if (i == 2) {
        mmiadsTypeData[i].push('DT');
        mmiadsTypeData[i].push('');
        mmiadsTypeData[i].push('');
        mmiadsTypeData[i].push('');
      }
      if (i == 3) {
        mmiadsTypeData[i].push(mmiadtTypeData[0][0]);
        mmiadsTypeData[i].push('DB');
        mmiadsTypeData[i].push('');
        mmiadsTypeData[i].push('');
      }
      if (i == 4) {
        mmiadsTypeData[i].push(mmiadtTypeData[1][0]);
        mmiadsTypeData[i].push(mmiadbTypeData[0][0]);
        mmiadsTypeData[i].push('DM');
        mmiadsTypeData[i].push('Total');
      }
      if (i == 5) {
        mmiadsTypeData[i].push(mmiadtTypeData[2][0]);
        mmiadsTypeData[i].push(mmiadbTypeData[1][0]);
        mmiadsTypeData[i].push(mmiadmTypeData[0][0]);
        mmiadsTypeData[i].push(mmiadmTypeData[0][1]);
      }
      if (i == 6) {
        mmiadsTypeData[i].push(mmiadtTypeData[3][0]);
        mmiadsTypeData[i].push(mmiadbTypeData[2][0]);
        mmiadsTypeData[i].push(mmiadmTypeData[1][0]);
        mmiadsTypeData[i].push(mmiadmTypeData[1][1]);
      }
      arrayAux.push(mmiadsTypeData[i]);
    }

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 6,
      },
      headStyles: {
        font: 'NotoSans',
        halign: 'center',
        valign: 'middle',
        fontSize: 6,
      },
      columnStyles: {
        0: { cellWidth: 12, halign: 'right', fillColor: [240, 241, 242] },
        1: { cellWidth: 10 },
      },
      styles: {
        maxCellHeight: 4,
      },
      body: arrayAux,
      startY: ninethTableHeigth,
      margin: { left: 121.1 },
      // Adiciona o hook para condicionalmente alterar a cor de preenchimento
      didParseCell: function (data) {
        if (
          data.row.section === 'body' &&
          data.column.index === 1 &&
          data.cell.raw === 'DS'
        ) {
          data.cell.styles.fillColor = [75, 76, 77];
          data.cell.styles.textColor = [255, 255, 255]; // Cor branca para o texto
        }
        if (
          data.row.section === 'body' &&
          data.column.index === 2 &&
          data.cell.raw === 'DT'
        ) {
          data.cell.styles.fillColor = [75, 76, 77];
          data.cell.styles.textColor = [255, 255, 255]; // Cor branca para o texto
        }
        if (
          data.row.section === 'body' &&
          data.column.index === 3 &&
          data.cell.raw === 'DB'
        ) {
          data.cell.styles.fillColor = [75, 76, 77];
          data.cell.styles.textColor = [255, 255, 255]; // Cor branca para o texto
        }
        if (
          data.row.section === 'body' &&
          data.column.index === 4 &&
          data.cell.raw === 'DM'
        ) {
          data.cell.styles.fillColor = [75, 76, 77];
          data.cell.styles.textColor = [255, 255, 255]; // Cor branca para o texto
        }
        if (
          data.row.section === 'body' &&
          data.column.index === 3 &&
          data.cell.raw === 'Ajuste'
        ) {
          data.cell.styles.fillColor = [75, 76, 77];
          data.cell.styles.textColor = [255, 255, 255]; // Cor branca para o texto
        }
        if (
          data.row.section === 'body' &&
          data.column.index === 5 &&
          data.cell.raw === 'Total'
        ) {
          data.cell.styles.fillColor = [75, 76, 77];
          data.cell.styles.textColor = [255, 255, 255]; // Cor branca para o texto
        }
      },
    });

    const tiposDispensaTableY = doc.lastAutoTable.finalY;

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'center',
        fontSize: 6,
      },
      columnStyles: {
        0: { halign: 'left' },
      },
      styles: {
        maxCellHeight: 2,
      },
      body: [['Observaçãoes:'], [' \n\n\n\n\n\n\n\n']],
      startY: tiposDispensaTableY + 1,
      margin: { left: 121.1 },
    });

    autoTable(doc, {
      theme: 'grid',
      bodyStyles: {
        font: 'NotoSans',
        halign: 'left',
        fontSize: 6,
      },
      columnStyles: {
        1: { cellWidth: 60 },
        2: { cellWidth: 55 },
      },
      styles: {
        maxCellHeight: 2,
      },
      body: footer,
      startY: doc.lastAutoTable.finalY + 2,
    });
    doc.setFontSize(7);
    doc.text(
      'Nota: Mapa de Preenchimento Obrigatório Mensal pela Farmácia da Unidade Sanitária \nVersão no 8 19 Nov 2019 DS TLD90 MDS e ARVs de nova geração',
      15,
      doc.lastAutoTable.finalY + 5
    );

    // Footer
    const str = 'Página ' + doc.internal.getNumberOfPages();

    doc.setFontSize(8);

    const pageSize = doc.internal.pageSize;
    const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight();
    doc.text(str, 15, pageHeight - 10);
    // params.value.loading.loading.hide()
    if (isOnline.value && !isMobile.value) {
      // return doc.save(fileName.concat('.pdf'));
      window.open(doc.output('bloburl'));
    } else {
      const pdfOutput = doc.output();
      DownloadFileMobile.downloadFile(fileName, '.pdf', pdfOutput, loading);
    }
  },
  async downloadExcel(id, loading) {
    const clinic = clinicService.currClinic();
    let mmiaReport = {};
    let mmiaData = [];
    let mmiaRegimenData = [];
    let mmiaStockData = [];
    if (isOnline.value) {
      mmiaReport = await Report.get('mmiaReport', id);
      if (mmiaReport.status === 204 || mmiaReport.data.length === 0) return 204;
      mmiaData = mmiaReport.data;
      mmiaStockData = mmiaData.mmiaStockSubReportItemList;
      mmiaRegimenData = mmiaData.mmiaRegimenSubReportList;
    } else {
      mmiaData = await MmiaMobileService.getDataLocalReportMmia(id);
      if (mmiaData === undefined || mmiaData.length === 0) return 204;
      mmiaStockData = await MmiaMobileService.getDataLocalReportStock(id);
      mmiaRegimenData = await MmiaMobileService.getDataLocalReportRegimen(id);
    }

    const stockdata = this.createArrayOfArrayRow(mmiaStockData);
    const regimendata = this.createRegimenArrayOfArrayRow(mmiaRegimenData);
    const miaTipoDoenteData = this.createMmiaTipoDoentesArrayRow(mmiaData);
    const miaFaixaEtariaData = this.createMmiaFaixaEtariaArrayRow(mmiaData);
    const miaProfilaxiaData = this.createMmiaProfilaxiaArrayRow(mmiaData);
    const miaRegimenTotalData = this.createRegimenTotalArrayRow( mmiaData, isOnline.value ? mmiaData.mmiaRegimenSubReportList : mmiaRegimenData, 'XLS');
    const miaLinesSumaryData = this.createLinesSumaryArrayRow( mmiaData,isOnline.value ? mmiaData.mmiaRegimenSubReportList : mmiaRegimenData,'XLS');
    const miaLinesSumaryTotalData = this.createLinesSumaryTotalArrayRow(mmiaData,isOnline.value ? mmiaData.mmiaRegimenSubReportList : mmiaRegimenData,'XLS');
    const mmiadsTypeData = this.createMmiaDispenseTypeDSArrayRow(mmiaData);
    const mmiadtTypeData = this.createMmiaDispenseTypeDTArrayRow(mmiaData);
    const mmiadbTypeData = this.createMmiaDispenseTypeDBArrayRow(mmiaData);
    const mmiadmTypeData = this.createMmiaDispenseTypeDMArrayRow(mmiaData);
    const mmiaAjusteData = this.createMmiaAjustePercentageArrayRow(mmiaData);
    const footer = this.createFotterTableRow();

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'CSAUDE';
    workbook.lastModifiedBy = 'CSAUDE';
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastPrinted = new Date();

    const worksheet = workbook.addWorksheet(reportName);
    const imageId = workbook.addImage({
      base64: 'data:image/png;base64,' + MOHIMAGELOG,
      extension: 'png',
    });
    // Get Cells
    const cellRepublica = worksheet.getCell('B1');
    const cellTitle = worksheet.getCell('C1');
    const cellPharm = worksheet.getCell('A8');
    const cellDistrict = worksheet.getCell('A9');
    const cellProvince = worksheet.getCell('C9');
    const cellPeriodo = worksheet.getCell('I1');
    const cellYear = worksheet.getCell('I8');
    // Get Rows
    const headerRow = worksheet.getRow(11);

    //Get Columns
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
    cellPeriodo.alignment =
      cellTitle.alignment =
      headerRow.alignment =
      cellYear.alignment =
        {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };

    cellPharm.alignment =
      cellRepublica.alignment =
      cellDistrict.alignment =
      cellProvince.alignment =
        {
          vertical: 'middle',
          horizontal: 'left',
          wrapText: false,
        };

    // Border Format
    cellYear.border =
      cellPeriodo.border =
      cellRepublica.border =
      cellTitle.border =
      cellPharm.border =
      cellDistrict.border =
      cellProvince.border =
        {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' },
        };

    // Assign Value to Cell
    cellRepublica.value = logoTitle;
    cellTitle.value = title;
    cellPeriodo.value = 'Mês: ' + months[new Date(mmiaData.endDate).getMonth()];
    cellYear.value = 'Ano: ' + mmiaData.year;
    cellPharm.value = 'Unidade Sanitária: ' + clinic.clinicName;
    cellDistrict.value = 'Distrito: ' + clinic.district.description;
    cellProvince.value = 'Província: ' + clinic.province.description;

    // merge a range of cells
    worksheet.mergeCells('A1:A7');
    worksheet.mergeCells('B1:B7');
    worksheet.mergeCells('C1:H7');
    worksheet.mergeCells('I1:I7');

    worksheet.mergeCells('A8:H8');
    worksheet.mergeCells('A9:B9');
    worksheet.mergeCells('C9:H9');
    worksheet.mergeCells('I8:I9');

    // add width size to Columns
    // add height size to Rows
    headerRow.height = 30;

    // add height size to Columns
    // add width size to Columns
    colA.width = 13;
    colB.width = 70;
    colC.width = 15;
    colD.width = 15;
    colE.width = 15;
    colF.width = 9;
    colG.width = 10;
    colH.width = 12;
    colI.width = 13;
    colJ.width = 14;

    // Add Style
    cellTitle.font =
      cellDistrict.font =
      cellProvince.font =
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
      ext: { width: 119, height: 98 },
    });

    // Cereate Table
    worksheet.addTable({
      name: reportName,
      ref: 'A10', // Inicia na celula A10
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'FNM', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'Medicamento', totalsRowFunction: 'none', filterButton: false },
        { name: 'Unidade', totalsRowFunction: 'none', filterButton: false },
        {
          name: 'Saldo Inicial',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Entradas',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Saídas',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Perdas e Ajustes',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Inventário',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Validade',
          totalsRowFunction: 'none',
          filterButton: false,
        },
      ],
      rows: stockdata,
    });

    const RegimenTableRef = Number(worksheet.lastRow.number) + 1;
    // Cereate Table
    worksheet.addTable({
      name: reportName,
      ref: 'A' + (Number(worksheet.lastRow.number) + 1),
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'Código', totalsRowLabel: 'Totals:', filterButton: false },
        {
          name: 'Regime Terapêutico',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Total doentes',
          totalsRowFunction: 'none',
          filterButton: false,
        },
        {
          name: 'Farmácia Comunitária',
          totalsRowFunction: 'none',
          filterButton: false,
        },
          {
              name: 'Doentes Referidos',
              totalsRowFunction: 'none',
              filterButton: false,
          }
      ],
      rows: regimendata,
    });

    worksheet.mergeCells( // Label "Total"
      'A' +
        (Number(worksheet.lastRow.number) + 1) +
        ':B' +
        (Number(worksheet.lastRow.number) + 1)
    );

    const cellRegimensTotal = worksheet.getCell(
      'B' + Number(worksheet.lastRow.number)
    );

    worksheet.addTable({
      name: reportName,
      ref: 'B' + Number(worksheet.lastRow.number),
      headerRow: false,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'Total', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'toatl1', totalsRowFunction: 'none', filterButton: false },
        { name: 'total2', totalsRowFunction: 'none', filterButton: false },
        { name: 'total3', totalsRowFunction: 'none', filterButton: false }
      ],
      rows: miaRegimenTotalData,
    });

    worksheet.mergeCells(
      'A' +
        (Number(worksheet.lastRow.number) + 1) +
        ':E' +
        (Number(worksheet.lastRow.number) + 1)
    );

    const cellLinesHeader = worksheet.getCell(
      'A' + Number(worksheet.lastRow.number)
    );

    cellLinesHeader.value = 'Linhas Terapêuticas';
    const linesTableRef = 'B' + (Number(worksheet.lastRow.number) + 1);
    worksheet.mergeCells(
      'A' +
        (Number(worksheet.lastRow.number) + 1) +
        ':B' +
        (Number(worksheet.lastRow.number) + 1)
    );
    worksheet.mergeCells(
      'A' +
        (Number(worksheet.lastRow.number) + 1) +
        ':B' +
        (Number(worksheet.lastRow.number) + 1)
    );
    worksheet.mergeCells(
      'A' +
        (Number(worksheet.lastRow.number) + 1) +
        ':B' +
        (Number(worksheet.lastRow.number) + 1)
    );
    worksheet.addTable({
      name: reportName,
      ref: linesTableRef,
      headerRow: false,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'Total', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'toatl1', totalsRowFunction: 'none', filterButton: false },
        { name: 'total2', totalsRowFunction: 'none', filterButton: false },
        { name: 'total3', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: miaLinesSumaryData,
    });
    worksheet.mergeCells(
      'A' +
        (Number(worksheet.lastRow.number) + 1) +
        ':B' +
        (Number(worksheet.lastRow.number) + 1)
    );
    const cellLinesTotal = worksheet.getCell(
      'B' + Number(worksheet.lastRow.number)
    );
    worksheet.addTable({
      name: reportName,
      ref: 'B' + Number(worksheet.lastRow.number),
      headerRow: false,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'Total', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'toatl1', totalsRowFunction: 'none', filterButton: false },
        { name: 'total2', totalsRowFunction: 'none', filterButton: false },
        { name: 'total3', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: miaLinesSumaryTotalData,
    });

    worksheet.mergeCells('F' + RegimenTableRef + ':I' + RegimenTableRef);
    worksheet.mergeCells(
      'F' + (RegimenTableRef + 1) + ':H' + (RegimenTableRef + 1)
    );
    worksheet.mergeCells(
      'F' + (RegimenTableRef + 2) + ':H' + (RegimenTableRef + 2)
    );
    worksheet.mergeCells(
      'F' + (RegimenTableRef + 3) + ':H' + (RegimenTableRef + 3)
    );
    worksheet.mergeCells(
      'F' + (RegimenTableRef + 4) + ':H' + (RegimenTableRef + 4)
    );
    worksheet.mergeCells(
      'F' + (RegimenTableRef + 5) + ':H' + (RegimenTableRef + 5)
    );

    const cellTipoDoenteHeader = worksheet.getCell('F' + RegimenTableRef);

    cellTipoDoenteHeader.value = 'Tipo de doentes em TARV';

    worksheet.addTable({
      name: reportName,
      ref: 'H' + (RegimenTableRef + 1),
      headerRow: false,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'desc', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'value', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: miaTipoDoenteData,
    });

    const refFaixaEtaria = RegimenTableRef + 6;

    const cellFaixaEtariaHeader = worksheet.getCell('F' + refFaixaEtaria);

    cellFaixaEtariaHeader.value = 'Faixa Etária dos Pacientes TARV';
    worksheet.mergeCells('F' + refFaixaEtaria + ':I' + refFaixaEtaria);
    worksheet.mergeCells(
      'F' + (refFaixaEtaria + 1) + ':H' + (refFaixaEtaria + 1)
    );
    worksheet.mergeCells(
      'F' + (refFaixaEtaria + 2) + ':H' + (refFaixaEtaria + 2)
    );
    worksheet.mergeCells(
      'F' + (refFaixaEtaria + 3) + ':H' + (refFaixaEtaria + 3)
    );
    worksheet.mergeCells(
      'F' + (refFaixaEtaria + 4) + ':H' + (refFaixaEtaria + 4)
    );

    worksheet.addTable({
      name: reportName,
      ref: 'H' + (refFaixaEtaria + 1),
      headerRow: false,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'desc', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'value', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: miaFaixaEtariaData,
    });

    const refProfilaxia = refFaixaEtaria + 5;
    const cellProfilaxiaHeader = worksheet.getCell('F' + refProfilaxia);
    cellFaixaEtariaHeader.value = 'Faixa Etária dos Pacientes TARV';
    worksheet.mergeCells('F' + refProfilaxia + ':I' + refProfilaxia);
    worksheet.mergeCells(
      'F' + (refProfilaxia + 1) + ':H' + (refProfilaxia + 1)
    );
    worksheet.mergeCells(
      'F' + (refProfilaxia + 2) + ':H' + (refProfilaxia + 2)
    );
    worksheet.mergeCells(
      'F' + (refProfilaxia + 3) + ':H' + (refProfilaxia + 3)
    );
    worksheet.mergeCells(
      'F' + (refProfilaxia + 4) + ':H' + (refProfilaxia + 4)
    );

    cellProfilaxiaHeader.value = 'Profilaxia';

    worksheet.addTable({
      name: reportName,
      ref: 'H' + (refProfilaxia + 1),
      headerRow: false,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'desc', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'value', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: miaProfilaxiaData,
    });

    const refDispenseType = refProfilaxia + 6;
    const cellDispenseTypeHeader = worksheet.getCell('E' + refDispenseType);
    cellDispenseTypeHeader.value = 'Tipo de Dispensa';
    worksheet.mergeCells('E' + refDispenseType + ':I' + refDispenseType);

    worksheet.addTable({
      name: reportName,
      ref: 'D' + (refDispenseType + 1),
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: '-', totalsRowLabel: 'Totals:', filterButton: false },
        { name: 'DS', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: mmiadsTypeData,
    });

    worksheet.addTable({
      name: reportName,
      ref: 'F' + (refDispenseType + 4),
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [{ name: 'DT', totalsRowFunction: 'none', filterButton: false }],
      rows: mmiadtTypeData,
    });

    worksheet.addTable({
      name: reportName,
      ref: 'G' + (refDispenseType + 5),
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [{ name: 'DB', totalsRowFunction: 'none', filterButton: false }],
      rows: mmiadbTypeData,
    });

    worksheet.addTable({
      name: reportName,
      ref: 'H' + (refDispenseType + 6),
      headerRow: true,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'DM', totalsRowFunction: 'none', filterButton: false },
        { name: 'Total', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: mmiadmTypeData,
    });

    worksheet.addTable({
      name: reportName,
      ref: 'H' + (refDispenseType + 2),
      headerRow: false,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'ajuste', totalsRowFunction: 'none', filterButton: false },
        { name: 'value', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: mmiaAjusteData,
    });
    const cellAjuste = worksheet.getCell('H' + (refDispenseType + 2));

    worksheet.mergeCells(
      'E' + (refDispenseType + 9) + ':I' + (refDispenseType + 9)
    );
    worksheet.mergeCells(
      'E' + (refDispenseType + 10) + ':I' + (refDispenseType + 10)
    );
    worksheet.mergeCells(
      'E' + (refDispenseType + 11) + ':I' + (refDispenseType + 11)
    );
    const obs = worksheet.getCell('E' + (refDispenseType + 9));
    obs.value = 'Observações:';
    obs.alignment = {
      horizontal: 'left',
    };
    worksheet.mergeCells(
      'A' +
        (Number(worksheet.lastRow.number) + 2) +
        ':B' +
        (Number(worksheet.lastRow.number) + 2)
    );
    worksheet.mergeCells(
      'C' +
        Number(worksheet.lastRow.number) +
        ':F' +
        Number(worksheet.lastRow.number)
    );
    worksheet.mergeCells(
      'G' +
        Number(worksheet.lastRow.number) +
        ':I' +
        Number(worksheet.lastRow.number)
    );

    worksheet.addTable({
      name: reportName,
      ref: 'B' + Number(worksheet.lastRow.number),
      headerRow: false,
      totalsRow: false,
      style: {
        showRowStripes: false,
      },
      columns: [
        { name: 'ajuste', totalsRowFunction: 'none', filterButton: false },
        { name: 'visto', totalsRowFunction: 'none', filterButton: false },
        { name: 'value', totalsRowFunction: 'none', filterButton: false },
      ],
      rows: footer,
    });

    worksheet.mergeCells(
      'A' +
        (Number(worksheet.lastRow.number) + 1) +
        ':I' +
        (Number(worksheet.lastRow.number) + 2)
    );

    const note = worksheet.getCell('A' + worksheet.lastRow.number);
    note.value =
      'Nota: Mapa de Preenchimento Obrigatório Mensal pela Farmácia da Unidade Sanitária \nVersão no 8 19 Nov 2019 DS TLD90 MDS e ARVs de nova geração';
    note.alignment = {
      horizontal: 'right',
    };
    // Headers style
    cellDispenseTypeHeader.alignment =
      cellLinesHeader.alignment =
      cellProfilaxiaHeader.alignment =
      cellFaixaEtariaHeader.alignment =
      cellTipoDoenteHeader.alignment =
        {
          vertical: 'middle',
          horizontal: 'center',
          wrapText: true,
        };
    cellRegimensTotal.alignment = cellLinesTotal.alignment = {
      horizontal: 'right',
      wrapText: true,
    };
    const cellDS = worksheet.getCell('E' + Number(refDispenseType + 1));
    const cellDt = worksheet.getCell('F' + Number(refDispenseType + 4));
    const cellDb = worksheet.getCell('G' + Number(refDispenseType + 5));
    const cellDM = worksheet.getCell('H' + Number(refDispenseType + 6));
    const cellDTotal = worksheet.getCell('I' + Number(refDispenseType + 6));

    cellRegimensTotal.fill = cellLinesTotal.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'dedfe0' },
      bgColor: { argb: 'dedfe0' },
    };

    cellDTotal.fill =
      cellDM.fill =
      cellDS.fill =
      cellDt.fill =
      cellDb.fill =
      cellAjuste.fill =
      cellDispenseTypeHeader.fill =
      cellLinesHeader.fill =
      cellProfilaxiaHeader.fill =
      cellFaixaEtariaHeader.fill =
      cellTipoDoenteHeader.fill =
        {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: '4b4c4d' },
          bgColor: { argb: '4b4c4d' },
        };

    cellDispenseTypeHeader.font =
      cellLinesHeader.font =
      cellProfilaxiaHeader.font =
      cellFaixaEtariaHeader.font =
      cellDTotal.font =
      cellDM.font =
      cellDS.font =
      cellDt.font =
      cellDb.font =
      cellAjuste.font =
      cellTipoDoenteHeader.font =
        {
          name: 'Arial',
          color: { argb: 'FFFFFFFF' },
          family: 2,
          size: 11,
          italic: false,
          bold: true,
        };
    // Format all data cells
    const lastRowNum =
      worksheet.lastRow.number !== undefined ? worksheet.lastRow.number : 0;
    const lastTableRowNum = lastRowNum;

    //Loop through all table's row
    for (let i = 10; i <= lastTableRowNum; i++) {
      const row = worksheet.getRow(i);

      //Now loop through every row's cell and finally set alignment
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
        if (i == 10 || i == RegimenTableRef) {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: '4b4c4d' },
            bgColor: { argb: '4b4c4d' },
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
    } else {
      const titleFile = 'Mmia.xlsx';
      DownloadFileMobile.downloadFile(titleFile, '.xlsx', blob, loading);
    }
  },

  createArrayOfArrayRow(rows) {
    const data = [];

    for (const row in rows) {
      const createRow = [];
      createRow.push(rows[row].fnmCode);
      createRow.push(rows[row].drugName);
      createRow.push(rows[row].unit + ' comp');
      createRow.push(
        rows[row].inventory -
          rows[row].initialEntrance +
          rows[row].outcomes -
          rows[row].lossesAdjustments
      );
      createRow.push(rows[row].initialEntrance);
      createRow.push(rows[row].outcomes);
      createRow.push(rows[row].lossesAdjustments);
      createRow.push(rows[row].inventory);
      if (isOnline.value) {
        createRow.push(moment(rows[row].expireDate).format('DD-MM-YYYY'));
      } else {
        createRow.push(rows[row].expireDate);
      }

      data.push(createRow);
    }

    return data;
  },
  createRegimenArrayOfArrayRow(rows) {
    const data = [];

    for (const row in rows) {
      const createRow = [];
      createRow.push(rows[row].code);
      createRow.push(rows[row].regimen);
      createRow.push(rows[row].totalPatients);
      createRow.push(rows[row].cumunitaryClinic);
      createRow.push(rows[row].totalReferidos);

      data.push(createRow);
    }

    return data;
  },
  createMmiaTipoDoentesArrayRow(rows) {
    const data = [];

    const createRow1 = [];
    const createRow2 = [];
    const createRow3 = [];
    const createRow4 = [];
    const createRow5 = [];
    if (isOnline.value && !isMobile.value) {
      createRow1.push('Novos');
      createRow1.push(rows.totalPacientesInicio);
      createRow2.push('Manutenção');
      createRow2.push(rows.totalPacientesManter);
      createRow3.push('Alteração');
      createRow3.push(rows.totalPacientesAlterar);
      createRow4.push('Trânsito');
      createRow4.push(rows.totalPacientesTransito);
      createRow5.push('Transferências');
      createRow5.push(rows.totalPacientesTransferidoDe);
    } else {
      createRow1.push('Novos');
      createRow1.push(rows[0].totalPacientesInicio);
      createRow2.push('Manutenção');
      createRow2.push(rows[0].totalPacientesManter);
      createRow3.push('Alteração');
      createRow3.push(rows[0].totalPacientesAlterar);
      createRow4.push('Trânsito');
      createRow4.push(rows[0].totalPacientesTransito);
      createRow5.push('Transferências');
      createRow5.push(rows[0].totalPacientesTransferidoDe);
    }
    data.push(createRow1);
    data.push(createRow2);
    data.push(createRow3);
    data.push(createRow4);
    data.push(createRow5);
    return data;
  },
  createMmiaFaixaEtariaArrayRow(rows) {
    const data = [];

    const createRow1 = [];
    const createRow2 = [];
    const createRow3 = [];
    const createRow4 = [];
    createRow1.push('Adultos');
    createRow2.push('Pediátricos 0 aos 4');
    createRow3.push('Pediátricos 5 aos 9');
    createRow4.push('Pediátricos 10 aos 14');
    if (isOnline.value && !isMobile.value) {
      createRow1.push(rows.totalPacientesAdulto);
      createRow2.push(rows.totalPacientes04);
      createRow3.push(rows.totalPacientes59);
      createRow4.push(rows.totalPacientes1014);
    } else {
      createRow1.push(rows[0].totalPacientesAdulto);
      createRow2.push(rows[0].totalPacientes04);
      createRow3.push(rows[0].totalPacientes59);
      createRow4.push(rows[0].totalPacientes1014);
    }
    data.push(createRow1);
    data.push(createRow2);
    data.push(createRow3);
    data.push(createRow4);

    return data;
  },
  createMmiaProfilaxiaArrayRow(rows) {
    const data = [];

    const createRow1 = [];
    const createRow2 = [];
    const createRow3 = [];
    const createRow4 = [];

    createRow1.push('PPE');
    createRow2.push('PrEP');
    createRow3.push('Crianças Expostas');
    createRow4.push('Total de pacientes em TARV na US');
    createRow4.push('Ver Resumo Mensal');

    if (isOnline.value && !isMobile.value) {
      createRow1.push(rows.totalPacientesPPE);
      createRow2.push(rows.totalPacientesPREP);
      createRow3.push(rows.totalpacientesCE);
    } else {
      createRow1.push(rows[0].totalPacientesPPE);
      createRow2.push(rows[0].totalPacientesPREP);
      createRow3.push(rows[0].totalpacientesCE);
    }

    data.push(createRow1);
    data.push(createRow2);
    data.push(createRow3);
    data.push(createRow4);

    return data;
  },
  createRegimenTotalArrayRow(generalRows, rows, fileType) {
    const data = [];
    let totalPatients = 0;
    let cumunitaryClinic = 0;
    let totalReferidos = 0;

    for (const row in rows) {
      totalPatients += rows[row].totalPatients;
      cumunitaryClinic += rows[row].cumunitaryClinic;
      totalReferidos += rows[row].totalReferidos;
    }
    const createRow = [];
    if (fileType == 'PDF') {
      createRow.push({
        content: 'Total',
        styles: { halign: 'right', fillColor: [204, 204, 204] },
      });
    } else {
      createRow.push('Total');
    }
    createRow.push(totalPatients);
    createRow.push(cumunitaryClinic);
    createRow.push(totalReferidos);

    data.push(createRow);

    return data;
  },
  createLinesSumaryArrayRow(generalRows, rows, fileType) {
    const data = [];
    let totallinha1Nr = 0;
    let totallinha2Nr = 0;
    let totallinha3Nr = 0;
    let totallinha1DC = 0;
    let totallinha2DC = 0;
    let totallinha3DC = 0;
    let totallinha1Ref = 0;
    let totallinha2Ref = 0;
    let totallinha3Ref = 0;

    for (const row in rows) {
      totallinha1Nr += rows[row].totalline1;
      totallinha1DC += rows[row].totaldcline1;
      totallinha1Ref += rows[row].totalrefline1;
      totallinha2Nr += rows[row].totalline2;
      totallinha2DC += rows[row].totaldcline2;
      totallinha2Ref += rows[row].totalrefline2;
      totallinha3Nr += rows[row].totalline3;
      totallinha3DC += rows[row].totaldcline3;
      totallinha3Ref += rows[row].totalrefline3;

    }
    const createRow1 = [];
    const createRow2 = [];
    const createRow3 = [];
    if (fileType == 'PDF') {
      createRow1.push({
        // colSpan: 1,
        content: '1as Linhas',
        styles: { halign: 'right' },
      });
    } else {
      createRow1.push('1as Linhas');
    }
    createRow1.push(totallinha1Nr);
    createRow1.push(totallinha1DC);
    createRow1.push(totallinha1Ref);

    if (fileType == 'PDF') {
      createRow2.push({
        content: '2as Linhas',
        styles: { halign: 'right' },
      });
    } else {
      createRow2.push('2as Linhas');
    }
    console.log(fileType)
    if (fileType == 'PDF') {
      createRow2.push({
        content: totallinha2Nr,
        styles: {cellWidth: 15.1},
      });
      createRow2.push({
        content: totallinha2DC,
        styles: {cellWidth: 18},
      });
      createRow2.push({
        content: totallinha2Ref,
        styles: {cellWidth: 21.2},
      });
    } else {
      createRow2.push(totallinha2Nr)
      createRow2.push(totallinha2DC)
      createRow2.push(totallinha2Ref)
    }

    if (fileType == 'PDF') {
      createRow3.push({
        // colSpan: 1,
        content: '3as Linhas',
        styles: { halign: 'right' },
      });
    } else {
      createRow3.push('3as Linhas');
    }
    createRow3.push(totallinha3Nr);
    createRow3.push(totallinha3DC);
    createRow3.push(totallinha3Ref);

    data.push(createRow1);
    data.push(createRow2);
    data.push(createRow3);

    return data;
  },
  createLinesSumaryTotalArrayRow(generalRows, rows, fileType) {
    const data = [];
    let totallinhaNr = 0;
    let totallinhaDC = 0;
    let totallinhaRefidos = 0;

    for (const row in rows) {
      totallinhaNr += rows[row].totalline1 + rows[row].totalline2 + rows[row].totalline3;
      totallinhaDC += rows[row].totaldcline1 + rows[row].totaldcline2 + rows[row].totaldcline3;
      totallinhaRefidos += rows[row].totalrefline1 + rows[row].totalrefline2 + rows[row].totalrefline3;
    }
    const createRow1 = [];
    if (fileType == 'PDF') {
      createRow1.push({
        // colSpan: 1,
        content: 'Total',
        styles: { halign: 'right', fillColor: [204, 204, 204] },
      });
    } else {
      createRow1.push('Total');
    }

    createRow1.push(totallinhaNr);
    createRow1.push(totallinhaDC);
    createRow1.push(totallinhaRefidos);

    data.push(createRow1);

    return data;
  },
  createMmiaDispenseTypeDSArrayRow(rows) {
    const data = [];

    const createRow2 = [];
    const createRow3 = [];
    const createRow4 = [];
    const createRow5 = [];
    const createRow6 = [];
    const createRow7 = [];
    const createRow8 = [];
    createRow2.push('Mês-5');
    createRow3.push('Mês-4');
    createRow4.push('Mês-3');
    createRow5.push('Mês-2');
    createRow6.push('Mês-1');
    createRow7.push('No Mês');
    createRow8.push('Total');
    if (isOnline.value && !isMobile.value) {
      createRow2.push(rows.dsM5);
      createRow3.push(rows.dsM4);
      createRow4.push(rows.dsM3);
      createRow5.push(rows.dsM2);
      createRow6.push(rows.dsM1);
      createRow7.push(rows.dsM0);
      createRow8.push(
        rows.dsM5 + rows.dsM4 + rows.dsM3 + rows.dsM2 + rows.dsM1 + rows.dsM0
      );
    } else {
      createRow2.push(rows[0].dsM5);
      createRow3.push(rows[0].dsM4);
      createRow4.push(rows[0].dsM3);
      createRow5.push(rows[0].dsM2);
      createRow6.push(rows[0].dsM1);
      createRow7.push(rows[0].dsM0);
      createRow8.push(
        rows[0].dsM5 +
          rows[0].dsM4 +
          rows[0].dsM3 +
          rows[0].dsM2 +
          rows[0].dsM1 +
          rows[0].dsM0
      );
    }

    data.push(createRow2);
    data.push(createRow3);
    data.push(createRow4);
    data.push(createRow5);
    data.push(createRow6);
    data.push(createRow7);
    data.push(createRow8);

    return data;
  },
  createMmiaDispenseTypeDTArrayRow(rows) {
    const data = [];

    const createRow5 = [];
    const createRow6 = [];
    const createRow7 = [];
    const createRow8 = [];
    if (isOnline.value && !isMobile.value) {
      createRow5.push(rows.dtM2);
      createRow6.push(rows.dtM1);
      createRow7.push(rows.dtM0);
      createRow8.push(rows.dtM2 + rows.dtM1 + rows.dtM0);
    } else {
      createRow5.push(rows[0].dtM2);
      createRow6.push(rows[0].dtM1);
      createRow7.push(rows[0].dtM0);
      createRow8.push(rows[0].dtM2 + rows[0].dtM1 + rows[0].dtM0);
    }

    data.push(createRow5);
    data.push(createRow6);
    data.push(createRow7);
    data.push(createRow8);

    return data;
  },
  createMmiaDispenseTypeDBArrayRow(rows) {
    const data = [];
    const createRow6 = [];
    const createRow7 = [];
    const createRow8 = [];
    if (isOnline.value && !isMobile.value) {
      createRow6.push(rows.dbM1);
      createRow7.push(rows.dbM0);
      createRow8.push(rows.dbM1 + rows.dbM0);
    } else {
      createRow6.push(rows[0].dbM1);
      createRow7.push(rows[0].dbM0);
      createRow8.push(rows[0].dbM1 + rows[0].dbM0);
    }

    data.push(createRow6);
    data.push(createRow7);
    data.push(createRow8);

    return data;
  },
  createMmiaDispenseTypeDMArrayRow(rows) {
    const data = [];

    const createRow5 = [];

    const createRow8 = [];
    if (isOnline.value && !isMobile.value) {
      createRow5.push(rows.dM);
      createRow5.push(rows.dM + rows.dsM0 + rows.dtM0 + rows.dbM0);
      createRow8.push(rows.dM);
      createRow8.push(
        rows.dM +
          rows.dtM2 +
          rows.dtM1 +
          rows.dtM0 +
          rows.dbM0 +
          rows.dbM1 +
          rows.dsM5 +
          rows.dsM4 +
          rows.dsM3 +
          rows.dsM2 +
          rows.dsM1 +
          rows.dsM0
      );
    } else {
      createRow5.push(rows[0].dM);
      createRow5.push(rows[0].dM + rows[0].dsM0 + rows[0].dtM0 + rows[0].dbM0);
      createRow8.push(rows[0].dM);
      createRow8.push(
        rows[0].dM +
          rows[0].dtM2 +
          rows[0].dtM1 +
          rows[0].dtM0 +
          rows[0].dbM0 +
          rows[0].dbM1 +
          rows[0].dsM5 +
          rows[0].dsM4 +
          rows[0].dsM3 +
          rows[0].dsM2 +
          rows[0].dsM1 +
          rows[0].dsM0
      );
    }

    data.push(createRow5);
    data.push(createRow8);

    return data;
  },
  createMmiaAjustePercentageArrayRow(rows) {
    const data = [];

    const createRow1 = [];

    createRow1.push('Ajuste');
    if (isOnline.value && !isMobile.value) {
      createRow1.push(
        Math.round(
          ((rows.dM +
            rows.dtM2 +
            rows.dtM1 +
            rows.dtM0 +
            rows.dbM0 +
            rows.dbM1 +
            rows.dsM5 +
            rows.dsM4 +
            rows.dsM3 +
            rows.dsM2 +
            rows.dsM1 +
            rows.dsM0) /
            (rows.dM + rows.dsM0 + rows.dtM0 + rows.dbM0)) *
            100
        ) + '%'
      );
    } else {
      createRow1.push(
        Math.round(
          ((rows[0].dM +
            rows[0].dtM2 +
            rows[0].dtM1 +
            rows[0].dtM0 +
            rows[0].dbM0 +
            rows[0].dbM1 +
            rows[0].dsM5 +
            rows[0].dsM4 +
            rows[0].dsM3 +
            rows[0].dsM2 +
            rows[0].dsM1 +
            rows[0].dsM0) /
            (rows[0].dM + rows[0].dsM0 + rows[0].dtM0 + rows[0].dbM0)) *
            100
        ) + '%'
      );
    }

    data.push(createRow1);

    return data;
  },
  createFotterTableRow() {
    const data = [];

    const createRow1 = [];

    createRow1.push('Elaborado por');
    createRow1.push('Visto:');
    createRow1.push(
      'Data de elaboração: ' + moment(new Date()).format('DD-MM-YYYY')
    );

    data.push(createRow1);

    return data;
  },
  getFormatDDMMYYYY(date) {
    return moment(date).format('DD-MM-YYYY');
  },
};
