import NanohealthInformationSystemService from 'src/services/Synchronization/HealthInformationSystem/NanohealthInformationSystemService';
import NanoInteroperabilityAttributeService from 'src/services/Synchronization/InteroperabilityAttribute/NanoInteroperabilityAttributeService';
import NanoInteroperabilityTypeService from 'src/services/Synchronization/InteroperabilityType/NanoInteroperabilityTypeService';
import NanoclinicSectorService from 'src/services/Synchronization/clinicSectorService/NanoclinicSectorService';
import NanoclinicalServiceAttributeService from 'src/services/Synchronization/clinicalServiceAttributeService/NanoclinicalServiceAttributeService';
import NanoclinicalServiceService from 'src/services/Synchronization/clinicalServiceService/NanoclinicalServiceService';
import NanodispenseModeService from 'src/services/Synchronization/dispenseMode/NanodispenseModeService';
import NanodispenseTypeService from 'src/services/Synchronization/dispenseType/NanodispenseTypeService';
import NanodistrictService from 'src/services/Synchronization/districtService/NanodistrictService';
import NanodoctorService from 'src/services/Synchronization/doctorService/NanodoctorService';
import NanodrugService from 'src/services/Synchronization/drugService/NanodrugService';
import NanodurationService from 'src/services/Synchronization/duration/NanodurationService';
import NanoepisodeTypeService from 'src/services/Synchronization/episodeType/NanoepisodeTypeService';
import NanofacilityTypeService from 'src/services/Synchronization/facilityTypeService/NanofacilityTypeService';
import NanoformService from 'src/services/Synchronization/formService/NanoformService';
import NanoidentifierTypeService from 'src/services/Synchronization/identifierTypeService/NanoidentifierTypeService';
import NanoPatientTransReferenceTypeService from 'src/services/Synchronization/patientTransReferenceServiceType/NanoPatientTransReferenceTypeService';
import NanoprovinceService from 'src/services/Synchronization/provinceService/NanoprovinceService';
import NanoprovincialServerService from 'src/services/Synchronization/provincialServerService/NanoprovincialServerService';
import NanospetialPrescriptionMotiveService from 'src/services/Synchronization/spetialPrescriptionMotive/NanospetialPrescriptionMotiveService';
import NanostartStopReasonService from 'src/services/Synchronization/startStopReasonService/NanostartStopReasonService';
import NanoStockCenterService from 'src/services/Synchronization/stockCenter/NanoStockCenterService';
import NanoStockOperationTypeService from 'src/services/Synchronization/stockOperationType/NanoStockOperationTypeService';
import NanotherapeuticLineService from 'src/services/Synchronization/therapeuticLineService/NanotherapeuticLineService';
import NanotherapeuticRegimenService from 'src/services/Synchronization/therapeuticRegimenService/NanotherapeuticRegimenService';
import NanoGroupTypeService from 'src/services/Synchronization/groupType/NanoGroupTypeService';
import episodeService from 'src/services/api/episode/episodeService';
import patientService from 'src/services/api/patientService/patientService';
import groupMemberPrescriptionService from 'src/services/api/GroupMemberPrescription/groupMemberPrescriptionService';
import adherenceScreeningService from 'src/services/api/adherenceScreening/adherenceScreeningService';
import appointmentService from 'src/services/api/appointment/appointmentService';
import groupService from 'src/services/api/group/groupService';
import groupMemberService from 'src/services/api/groupMember/groupMemberService';
import packService from 'src/services/api/pack/packService';
import packagedDrugService from 'src/services/api/packagedDrug/packagedDrugService';
import patientServiceIdentifierService from 'src/services/api/patientServiceIdentifier/patientServiceIdentifierService';
import patientVisitService from 'src/services/api/patientVisit/patientVisitService';
import patientVisitDetailsService from 'src/services/api/patientVisitDetails/patientVisitDetailsService';
import pregnancyScreeningService from 'src/services/api/pregnancyScreening/pregnancyScreeningService';
import prescribedDrugService from 'src/services/api/prescribedDrug/prescribedDrugService';
import prescriptionService from 'src/services/api/prescription/prescriptionService';
import prescriptionDetailsService from 'src/services/api/prescriptionDetails/prescriptionDetailsService';
import rAMScreeningService from 'src/services/api/rAMScreening/rAMScreeningService';
import tBScreeningService from 'src/services/api/tBScreening/tBScreeningService';
import vitalSignsScreeningService from 'src/services/api/vitalSignsScreening/vitalSignsScreeningService';
import clinicService from 'src/services/api/clinicService/clinicService';
import NanosystemConfigsService from 'src/services/Synchronization/systemConfigs/NanosystemConfigsService';
import StockService from 'src/services/api/stockService/StockService';
import StockEntranceService from 'src/services/api/stockEntranceService/StockEntranceService';
import NanoclinicService from 'src/services/Synchronization/clinicService/NanoclinicService';
import NanomenuService from 'src/services/Synchronization/menu/NanomenuService';
import StockDistributorService from 'src/services/api/stockDistributorService/StockDistributorService';
import StockDistributorBatchService from 'src/services/api/stockDistributorBatchService/StockDistributorBatchService';
import DrugDistributorService from 'src/services/api/drugDistributorService/DrugDistributorService';
// import { useLoading } from '../loading/loading';

// const { closeLoading, showloading } = useLoading();

export function useOffline() {
  async function loadClinicsDataFromBackEndToPinia() {
    await NanoclinicService.getFromBackEndToPinia(0);
    await NanosystemConfigsService.getFromBackEndToPinia(0);
    await NanomenuService.getFromBackEndToPinia(0);
    return true;
  }

  async function loadParamsDataFromBackEndToPinia() {
    await NanoclinicSectorService.getFromBackEndToPinia(0);
    await NanodrugService.getFromBackEndToPinia(0);
    await NanoclinicalServiceService.getFromBackEndToPinia(0);
    await NanoclinicalServiceAttributeService.getFromBackEndToPinia(0);
    await NanoidentifierTypeService.getFromBackEndToPinia(0);
    await NanoepisodeTypeService.getFromBackEndToPinia(0);
    await NanofacilityTypeService.getFromBackEndToPinia(0);
    await NanostartStopReasonService.getFromBackEndToPinia(0);
    await NanodurationService.getFromBackEndToPinia(0);
    await NanotherapeuticRegimenService.getFromBackEndToPinia(0);
    await NanotherapeuticLineService.getFromBackEndToPinia(0);
    await NanoformService.getFromBackEndToPinia(0);
    await NanodispenseTypeService.getFromBackEndToPinia(0);
    await NanoInteroperabilityTypeService.getFromBackEndToPinia(0);
    await NanoInteroperabilityAttributeService.getFromBackEndToPinia(0);
    await NanohealthInformationSystemService.getFromBackEndToPinia(0);
    await NanoPatientTransReferenceTypeService.getFromBackEndToPinia(0);
    await NanospetialPrescriptionMotiveService.getFromBackEndToPinia(0);
    await NanoprovincialServerService.getFromBackEndToPinia(0);
    await NanodoctorService.getFromBackEndToPinia(0);
    await NanodispenseModeService.getFromBackEndToPinia(0);
    await NanoprovinceService.getFromBackEndToPinia(0);
    await NanodistrictService.getFromBackEndToPinia(0);
    await NanoStockCenterService.getFromBackEndToPinia(0);
    await NanoStockOperationTypeService.getFromBackEndToPinia(0);
    await NanoGroupTypeService.getFromBackEndToPinia(0);

    return true;
  }

  async function saveParamsFromPiniaToDexie() {
    NanoclinicSectorService.getFromPiniaToDexie();
    NanodrugService.getFromPiniaToDexie();
    NanoclinicalServiceService.getFromPiniaToDexie();
    NanoclinicalServiceAttributeService.getFromPiniaToDexie();
    NanoidentifierTypeService.getFromPiniaToDexie();
    NanoepisodeTypeService.getFromPiniaToDexie();
    NanofacilityTypeService.getFromPiniaToDexie();
    NanostartStopReasonService.getFromPiniaToDexie();
    NanodurationService.getFromPiniaToDexie();
    NanotherapeuticRegimenService.getFromPiniaToDexie();
    NanotherapeuticLineService.getFromPiniaToDexie();
    NanoformService.getFromPiniaToDexie();
    NanodispenseTypeService.getFromPiniaToDexie();
    NanoInteroperabilityTypeService.getFromPiniaToDexie();
    NanoInteroperabilityAttributeService.getFromPiniaToDexie();
    NanohealthInformationSystemService.getFromPiniaToDexie();
    NanoPatientTransReferenceTypeService.getFromPiniaToDexie();
    NanospetialPrescriptionMotiveService.getFromPiniaToDexie();
    NanoprovincialServerService.getFromPiniaToDexie();
    NanodoctorService.getFromPiniaToDexie();
    NanodispenseModeService.getFromPiniaToDexie();
    NanoprovinceService.getFromPiniaToDexie();
    NanodistrictService.getFromPiniaToDexie();
    NanoStockCenterService.getFromPiniaToDexie();
    NanoStockOperationTypeService.getFromPiniaToDexie();
    NanoGroupTypeService.getFromPiniaToDexie();
    NanosystemConfigsService.getFromPiniaToDexie();
    NanomenuService.getFromPiniaToDexie();
    NanoclinicService.getFromPiniaToDexie();
    return true;
  }

  async function loadSettingParamsToOffline() {
    //  await NanoclinicSectorTypeService.getFromBackEnd(0);
    //  await NanoclinicSectorService.getFromBackEnd(0);
    //NanoclinicService.getFromBackEnd(0);
    NanoclinicSectorService.getFromBackEnd(0);
    NanodrugService.getFromBackEnd(0);
    NanoclinicalServiceService.getFromBackEnd(0);
    NanoclinicalServiceAttributeService.getFromBackEnd(0);
    NanoidentifierTypeService.getFromBackEnd(0);
    NanoepisodeTypeService.getFromBackEnd(0);
    NanofacilityTypeService.getFromBackEnd(0);
    NanostartStopReasonService.getFromBackEnd(0);
    NanoclinicalServiceAttributeService.getFromBackEnd(0);
    NanodurationService.getFromBackEnd(0);
    NanotherapeuticRegimenService.getFromBackEnd(0);
    NanotherapeuticLineService.getFromBackEnd(0);
    NanoformService.getFromBackEnd(0);
    NanodispenseTypeService.getFromBackEnd(0);
    NanoInteroperabilityTypeService.getFromBackEnd(0);
    NanoInteroperabilityAttributeService.getFromBackEnd(0);
    NanohealthInformationSystemService.getFromBackEnd(0);
    NanofacilityTypeService.getFromBackEnd(0);
    NanoPatientTransReferenceTypeService.getFromBackEnd(0);
    NanospetialPrescriptionMotiveService.getFromBackEnd(0);
    NanoprovincialServerService.getFromBackEnd(0);
    NanodoctorService.getFromBackEnd(0);
    NanodispenseModeService.getFromBackEnd(0);
    // NanogroupTypeService.getFromBackEnd(0);
    NanoprovinceService.getFromBackEnd(0);
    NanodistrictService.getFromBackEnd(0);
    NanoStockCenterService.getFromBackEnd(0);
    NanoStockOperationTypeService.getFromBackEnd(0);
    NanoGroupTypeService.getFromBackEnd(0);
    NanosystemConfigsService.getFromBackEnd(0);

    StockService.getFromBackEnd(0, clinicService.currClinic().id);
    StockEntranceService.getFromBackEnd(0, clinicService.currClinic().id);
  }

  async function loadPatientDataToOffline() {
    await patientService.doPatientsBySectorGet().then((resp) => {
      if (!resp) {
        patientService.addBulkMobile();
        patientServiceIdentifierService.addBulkMobile();
      }
    });

    await patientVisitDetailsService
      .doPatientVisitServiceBySectorGet()
      .then((resp) => {
        if (resp) {
          //  addBulkToMobile();
        }
      });

    await patientVisitService
      .getAllLast3VisitsWithScreeningByPatientIds()
      .then((resp) => {
        if (resp) {
          addBulkToMobile();
        }
      });
  }

  async function addBulkToMobile() {
    episodeService.addBulkMobile();
    patientVisitService.addBulkMobile();
    patientVisitDetailsService.addBulkMobile();
    prescriptionService.addBulkMobile();
    prescribedDrugService.addBulkMobile();
    prescriptionDetailsService.addBulkMobile();
    packService.addBulkMobile();
    packagedDrugService.addBulkMobile();
    vitalSignsScreeningService.addBulkMobile();
    rAMScreeningService.addBulkMobile();
    adherenceScreeningService.addBulkMobile();
    tBScreeningService.addBulkMobile();
    pregnancyScreeningService.addBulkMobile();
  }

  async function loadSettingParamsInOfflineMode() {
    //  await NanoclinicSectorTypeService.getFromBackEnd(0);
    //  await NanoclinicSectorService.getFromBackEnd(0);
    // clinicService.getMobile();
    // clinicSectorService.getMobile();
    // drugService.getMobile()
  }

  async function loadStockDistribuitionData() {
    StockDistributorBatchService.get(0);
    DrugDistributorService.get(0);
    StockDistributorService.get(0);
    StockService.getStockDistributorWeb(clinicService.currClinic().id, 0);
  }

  function deleteStorageInfo() {
    patientVisitDetailsService.deleteAllFromStorage();
    prescriptionDetailsService.deleteAllFromStorage();
    prescribedDrugService.deleteAllFromStorage();
    groupMemberPrescriptionService.deleteAllFromStorage();
    prescriptionService.deleteAllFromStorage();
    patientVisitService.deleteAllFromStorage();
    rAMScreeningService.deleteAllFromStorage();
    adherenceScreeningService.deleteAllFromStorage();
    pregnancyScreeningService.deleteAllFromStorage();
    tBScreeningService.deleteAllFromStorage();
    vitalSignsScreeningService.deleteAllFromStorage();
    episodeService.deleteAllFromStorage();
    packagedDrugService.deleteAllFromStorage();
    packService.deleteAllFromStorage();
    appointmentService.deleteAllFromStorage();
    groupMemberService.deleteAllFromStorage();
    groupService.deleteAllFromStorage();
    patientServiceIdentifierService.deleteAllFromStorage();
    patientServiceIdentifierService.deleteAllFromStorage();
    // reportsService.deleteAllFromStorage();
  }

  function deleteStorageWithoutPatientInfo() {
    patientVisitDetailsService.deleteAllFromStorage();
    prescriptionDetailsService.deleteAllFromStorage();
    prescribedDrugService.deleteAllFromStorage();
    groupMemberPrescriptionService.deleteAllFromStorage();
    prescriptionService.deleteAllFromStorage();
    patientVisitService.deleteAllFromStorage();
    rAMScreeningService.deleteAllFromStorage();
    adherenceScreeningService.deleteAllFromStorage();
    pregnancyScreeningService.deleteAllFromStorage();
    tBScreeningService.deleteAllFromStorage();
    vitalSignsScreeningService.deleteAllFromStorage();
    episodeService.deleteAllFromStorage();
    packagedDrugService.deleteAllFromStorage();
    packService.deleteAllFromStorage();
    appointmentService.deleteAllFromStorage();
    groupMemberService.deleteAllFromStorage();
    groupService.deleteAllFromStorage();
    patientServiceIdentifierService.deleteAllFromStorage();
    // reportsService.deleteAllFromStorage();
  }

  return {
    saveParamsFromPiniaToDexie,
    loadParamsDataFromBackEndToPinia,
    loadClinicsDataFromBackEndToPinia,
    loadSettingParamsToOffline,
    loadPatientDataToOffline,
    deleteStorageInfo,
    deleteStorageWithoutPatientInfo,
    loadSettingParamsInOfflineMode,
    loadStockDistribuitionData,
  };
}
