import { nSQL } from 'nano-sql';
import ReportDatesParams from 'src/services/reports/ReportDatesParams';
import moment from 'moment';
import ArvDailyRegisterTempReport from 'src/stores/models/report/monitoring/ArvDailyRegisterTempReport';

// const activeInDrugStore = useRepo(ActiveInDrugStore);

export default {
  async getDataLocalDb(params: any) {
    const reportParams = ReportDatesParams.determineStartEndDate(params);
    console.log(reportParams);

    const [activePacks] = await Promise.all([
      packService.getAllPacksByStartDateAndEndDateFromDexie(
        reportParams.startDate,
        reportParams.endDate
      ),
    ]);

    for (const pack of activePacks) {
      const patient = pack.patientvisitDetails.patientVisit.patient;
      const episode = pack.patientvisitDetails.episode;
      const prescriptionDetails =
        pack.patientvisitDetails.prescription.prescriptionDetails;
      const identifier =
        pack.patientvisitDetails.episode.patientServiceIdentifier;
      const therapeuticLine =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].therapeuticLine
          : '';
      const therapeuticRegimen =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].therapeuticRegimen
          : '';
      const patientType =
        pack.patientvisitDetails.prescription.patientType === 'N/A'
          ? pack.patientvisitDetails.prescription.patientStatus
          : pack.patientvisitDetails.prescription.patientType;

      const dispenseType =
        prescriptionDetails.length > 0
          ? prescriptionDetails[0].dispenseType
          : '';

      if (identifier.service.id === reportParams.clinicalService) {
        const tptDailyRegisterReport = new ArvDailyRegisterTempReport();
        tptDailyRegisterReport.reportId = reportParams.id;
        tptDailyRegisterReport.year = reportParams.year;
        tptDailyRegisterReport.startDate = reportParams.startDate;
        tptDailyRegisterReport.endDate = reportParams.endDate;
        tptDailyRegisterReport.nid = identifier.value;
        tptDailyRegisterReport.patientName =
          patient.firstNames +
          ' ' +
          patient.middleNames +
          ' ' +
          patient.lastNames;
        tptDailyRegisterReport.patientType = patientType;
        tptDailyRegisterReport.startReason = episode.startStopReason.reason;
        const age = this.idadeCalculator(patient.dateOfBirth);
        tptDailyRegisterReport.ageGroup_0_4 =
          age >= 0 && age < 4 ? 'Sim' : 'Nao';
        tptDailyRegisterReport.ageGroup_5_9 =
          age >= 5 && age <= 9 ? 'Sim' : 'Nao';
        tptDailyRegisterReport.ageGroup_10_14 =
          age >= 10 && age <= 14 ? 'Sim' : 'Nao';
        tptDailyRegisterReport.ageGroup_Greater_than_15 =
          age >= 15 ? 'Sim' : 'Nao';
        tptDailyRegisterReport.pickUpDate = pack.pickupDate;
        tptDailyRegisterReport.nexPickUpDate = pack.nextPickUpDate;
        tptDailyRegisterReport.regime = therapeuticRegimen.description;
        tptDailyRegisterReport.dispensationType = dispenseType.description;
        tptDailyRegisterReport.therapeuticLine = therapeuticLine.description;
        tptDailyRegisterReport.clinic = pack.clinic.clinicName;
        tptDailyRegisterReport.prep =
          identifier.service.code === 'TPT' ? 'Sim' : '';
        tptDailyRegisterReport.ppe =
          identifier.service.code === 'PPE' ? 'Sim' : '';
        const drugQuantityTemps = [];
        for (const packagedDrug of pack.packagedDrugs) {
          const drugQuantityTemp = {};
          drugQuantityTemp.drugName = packagedDrug.drug.name;
          drugQuantityTemp.quantity = packagedDrug.quantitySupplied;
          console.log(drugQuantityTemp);
          drugQuantityTemps.push(drugQuantityTemp);
          console.log(tptDailyRegisterReport);
        }
        console.log(drugQuantityTemps);
        tptDailyRegisterReport.drugQuantityTemps = drugQuantityTemps;
        this.localDbAddOrUpdate(tptDailyRegisterReport);
      }
    }
  },

  localDbAddOrUpdate(targetCopy: any) {
    return nSQL().onConnected(() => {
      nSQL(ArvDailyRegisterTempReport.entity)
        .query('upsert', targetCopy)
        .exec();
    });
  },

  async localDbGetAllByReportId(reportId: any) {
    return nSQL(ArvDailyRegisterTempReport.entity)
      .query('select')
      .where(['reportId', '=', reportId])
      .exec()
      .then((result) => {
        if (result !== undefined) {
          return result;
        }
        return null;
      });
  },
  async getDataLocalReport(reportId: string) {
    return nSQL(ArvDailyRegisterTempReport.entity)
      .query('select')
      .where(['reportId', '=', reportId])
      .exec()
      .then((result) => {
        return result;
      });
  },
  idadeCalculator(birthDate: string) {
    if (moment(birthDate, 'YYYY/MM/DDDD').isValid()) {
      const utentBirthDate = moment(birthDate, 'YYYY/MM/DDDD');
      const todayDate = moment(new Date());
      const idade = todayDate.diff(utentBirthDate, 'years');
      console.log(idade);
      return idade;
    }
  },
};
