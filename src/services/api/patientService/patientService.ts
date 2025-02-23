import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Patient from 'src/stores/models/patient/Patient';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import db from '../../../stores/dexie';
import { useSystemConfig } from 'src/composables/systemConfigs/SystemConfigs';
import clinicService from '../clinicService/clinicService';
import useNotify from 'src/composables/shared/notify/UseNotify';
import patientVisitService from '../patientVisit/patientVisitService';
import patientVisitDetailsService from '../patientVisitDetails/patientVisitDetailsService';
import episodeService from '../episode/episodeService';
import prescriptionService from '../prescription/prescriptionService';
import packService from '../pack/packService';
import patientServiceIdentifierService from '../patientServiceIdentifier/patientServiceIdentifierService';
import prescribedDrugService from '../prescribedDrug/prescribedDrugService';
import prescriptionDetailsService from '../prescriptionDetails/prescriptionDetailsService';
import packagedDrugService from '../packagedDrug/packagedDrugService';
import vitalSignsScreeningService from '../vitalSignsScreening/vitalSignsScreeningService';
import rAMScreeningService from '../rAMScreening/rAMScreeningService';
import tBScreeningService from '../tBScreening/tBScreeningService';
import adherenceScreeningService from '../adherenceScreening/adherenceScreeningService';
import pregnancyScreeningService from '../pregnancyScreening/pregnancyScreeningService';
import { Notify } from 'quasar';

const patient = useRepo(Patient);
const patientDexie = db[Patient.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();
const { isProvincialInstalation, isUserDCP } = useSystemConfig();
const { notifySuccess, notifyInfo } = useNotify();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    /*
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      return this.getWeb(offset);
    }
    */
    this.getMobile();
  },
  patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.patchWeb(uuid, params);
    }
  },
  delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    return api()
      .post('patient', params)
      .then((resp) => {
        patient.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patient?offset=' + offset + '&max=100')
        .then((resp) => {
          patient.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          } else {
            closeLoading();
          }
        })
        .catch((error) => {
          // alertError('Aconteceu um erro inesperado nesta operação.');
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('patient/' + uuid, params)
      .then((resp) => {
        patient.save(resp.data);
      });
  },

  updateUUID(params: string, base64: string) {
    return api()
      .patch(`patient/updateuuid/${base64}`, params)
      .then((resp) => {
        patient.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patient/' + uuid)
      .then((resp) => {
        patient.destroy(uuid);
      });
  },
  async mergePatients(patientToHoldId: string, patientToDeleteId: string) {
    return await api().post(
      `patient/mergeUnitePatients/${patientToHoldId}/${patientToDeleteId}`
    );
  },
  // Mobile
  addMobile(params: string) {
    return patientDexie.put(JSON.parse(JSON.stringify(params))).then(() => {
      patient.save(JSON.parse(JSON.stringify(params)));
      return params;
    });
  },
  putMobile(params: string) {
    return patientDexie.put(JSON.parse(JSON.stringify(params))).then(() => {
      patient.save(JSON.parse(JSON.stringify(params)));
      return params;
    });
  },
  async getMobile() {
    try {
      const rows = await patientDexie.toArray();
      patient.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    return patientDexie
      .delete(paramsId)
      .then(() => {
        patient.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  apiFetchById(id: string) {
    if (isMobile.value && !isOnline.value) {
      return patientDexie
        .where('id')
        .equalsIgnoreCase(id)
        .first()
        .then((rows: any) => {
          patient.save(rows);
          return rows;
        });
    } else {
      return api()
        .get(`/patient/${id}`)
        .then((resp) => {
          patient.save(resp.data);
          return resp;
        });
    }
  },

  async apiSearch(patienParam: any) {
    patient.flush();
    if (isMobile.value && !isOnline.value) {
      return this.getPatientByParams(patienParam)
        .then((rows) => {
          patient.save(rows);
        })
        .catch((error: any) => {
          console.log(error);
        });
    } else {
      try {
        const resp = await api().post('/patient/search', patienParam);
        patient.save(resp.data);
        closeLoading();
        return resp;
      } catch (error) {
        console.log(error);
        closeLoading();
        return null;
      }
    }
  },

  async apiSearchExist(patienParam: any) {
    try {
      const resp = await api().post('/patient/search', patienParam);
      closeLoading();
      return resp.data.length > 0;
    } catch (error) {
      console.log(error);
      closeLoading();
      return false;
    }
  },

  async apisearchByParam(searchParam: string, clinicId: string) {
    const replacedString = searchParam.replace(/\//g, '-');
    console.log(replacedString);
    return await api()
      .get(`/patient/searchByParam/${replacedString}/${clinicId}`)
      .then((resp) => {
        patient.save(resp.data);
        closeLoading();
        return resp;
      })
      .catch((error) => {
        closeLoading();
      });
  },

  async apiopenmrsProgramSearch(hisId: string, nid: string, Btoa: string) {
    return await api().get(
      '/patient/openmrsProgramSearch/' + hisId + '/' + nid + '/' + Btoa
    );
  },

  async apiSearchPatientOnOpenMRS(hisId: string, nid: string, Btoa: string) {
    return await api().get(
      '/patient/openmrsSearch/' + hisId + '/' + nid + '/' + Btoa
    );
  },

  async apiCheckOpenmRSisOn(hisId: string, Btoa: string) {
    return await api().get('/patient/openmrsSession/' + hisId + '/' + Btoa);
  },
  async countPatientSearchResult(patient: any) {
    return await api().post('/patient/countSearch/', patient);
  },

  async apiSave(patient: any, isNew: boolean) {
    if (isNew) {
      return this.post(patient);
    } else {
      return this.patch(patient.id, patient);
    }
  },

  async addBulkMobile() {
    const patientsFromPinia = this.getAllFromStorageToDexie();
    patientDexie.bulkPut(patientsFromPinia).catch((error: any) => {
      console.log(error);
    });
  },
  async apiUpdate(patient: any) {
    return await this.patch(patient.id, patient);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patient/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
    );
  },
  async apiGetPatientsByClinicSectorId(
    clinicSectorId: string,
    offset: number,
    max: number
  ) {
    return await api().get(
      '/patient/clinicSector/' +
        clinicSectorId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetAllPatientsIsAbandonmentForDCP(offset: number, max: number) {
    return await api().get(
      '/patient/ape/getAllPatientsIsAbandonment' +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },
  async doPatientsBySectorGet() {
    notifyInfo('Carregamento de Pacientes Iniciado');
    const clinicSectorUser = clinicService.currClinic();
    if (clinicSectorUser === null || clinicSectorUser === undefined) {
      alertError(
        'O Utilizador logado nao pertence a nenhum sector clinico , não terá informação carregada do Servidor'
      );
    }

    let resp;
    if (isUserDCP()) {
      resp = await this.fetchAllPatientsForDCP();
    } else {
      resp = await this.fetchAllPatientsByClinicSectorId(clinicSectorUser.id);
    }
    notifySuccess('Carregamento de Pacientes Terminado');
    return resp;
  },

  async fetchAllPatientsByClinicSectorId(clinicSectorId: any) {
    let offset = 0;
    const max = 100; // You can adjust this number based on your API's limits
    // const allPatients = [];
    let hasMorePatients = true;

    let percentage = 0;

    const notif = Notify.create({
      group: false, // required to be updatable
      timeout: 0, // we want to be in control when it gets dismissed
      spinner: true,
      message: 'Carregando dados de pacientes ...',
      caption: '1%',
      color: 'white',
      textColor: 'primary',
    });

    while (hasMorePatients) {
      percentage = Math.min(100, percentage + Math.floor(Math.random() * 22));
      const response = await this.apiGetPatientsByClinicSectorId(
        clinicSectorId,
        offset,
        max
      );
      const patients = response.data;
      if (patients.length > 0) {
        //  allPatients.push(...patients);
        patient.save(patients);
        notif({
          caption: `${percentage}%`,
        });
        offset += patients.length;
      } else {
        percentage = 100;
        hasMorePatients = false;
      }
    }
    percentage = 100;
    notif({
      icon: 'done', // we add an icon
      spinner: false, // we reset the spinner setting so the icon can be displayed
      message: 'Terminado!',
      timeout: 2500, // we will timeout it in 2.5s
      caption: `${percentage}%`,
    });
    return hasMorePatients;
  },

  async fetchAllPatientsForDCP() {
    let offset = 0;
    const max = 100; // You can adjust this number based on your API's limits
    // const allPatients = [];
    let hasMorePatients = true;

    while (hasMorePatients) {
      const response = await this.apiGetAllPatientsIsAbandonmentForDCP(
        offset,
        max
      );
      const patients = response.data;
      if (patients.length > 0) {
        patient.save(patients);
        // allPatients.push(...patients);
        offset += patients.length;
      } else {
        hasMorePatients = false;
      }
    }

    return hasMorePatients;
  },

  /*
  async doPatientsForAPIGetDCP() {
    const resp = await this.fetchAllPatientsForDCP();

    this.addBulkMobile(resp);
    notifySuccess('Carregamento de Pacientes Terminado');
    return resp;
  },
*/
  async apiSyncPatient(patient: any) {
    if (patient.syncStatus === 'R') await this.apiSave(patient, true);
    if (patient.syncStatus === 'U') await this.apiSave(patient, false);
  },
  async getLocalDbPatientsToSync() {
    return patientDexie
      .where('syncStatus')
      .equalsIgnoreCase('R')
      .or('syncStatus')
      .equalsIgnoreCase('U')
      .toArray()
      .then((result: []) => {
        return result;
      });
  },
  async syncPatient(patient: any) {
    if (patient.syncStatus === 'R') await this.postWeb(patient);
    if (patient.syncStatus === 'U') await this.patchWeb(patient.id, patient);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patient.getModel().$newInstance();
  },
  savePatientStorage(newPatient: any) {
    patient.save(newPatient);
  },
  getAllFromStorage() {
    return patient.all();
  },
  getAllFromStorageToDexie() {
    return patient.makeHidden(['hisSyncStatus']).all();
  },
  getPatientByID(id: string) {
    return patient.withAllRecursive(2).whereId(id).first();
  },
  async deleteAllExceptIdFromStorage(id: string) {
    patient
      .where((patient) => {
        return patient.id !== id;
      })
      .delete();
  },
  deleteAllFromStorage() {
    patient.flush();
  },
  deletePatientStorage(patientParam: any) {
    patient.destroy(patientParam.id);
  },
  getPatientSearchList() {
    return patient
      .query()
      .withAllRecursive(2)
      .orderBy('firstNames')
      .orderBy('identifiers.value', 'asc')
      .get();
  },
  getPatientByClinicId(clinicId: string) {
    return (
      patient
        .query()
        .has('identifiers')
        //  .has('patientVisits')
        .with('identifiers', (query) => {
          query
            .with('identifierType')
            .with('service', (query) => {
              query.withAllRecursive(1);
            })
            .with('clinic', (query) => {
              query.withAll();
            });
        })
        .with('province')
        .with('district')
        .with('clinic', (query) => {
          query.withAll();
        })
        .where((patients) => {
          return (
            patients.clinic_id === clinicId || patients.clinicId === clinicId
          );
        })
        .get()
    );
  },
  getPatienWithstByID(id: string) {
    // return patient.withAllRecursive(3).whereId(id).first();
    return patient
      .query()
      .has('identifiers')
      .with('identifiers', (query) => {
        query
          .with('identifierType')
          .with('service', (query) => {
            query.withAllRecursive(1);
          })
          .with('clinic', (query) => {
            query.withAllRecursive(1);
          })
          .with('episodes', (query) => {
            query
              .with('episodeType')
              .with('clinicSector')
              .with('startStopReason');
          });
      })
      .with('province')
      .with('district')
      .with('clinic', (query) => {
        query.withAllRecursive(1);
      })
      .where('id', id)
      .first();
  },
  async getPatientByParams(patientParam: any) {
    const results = await patientDexie
      .filter((patient: Patient) => {
        const firstNamesMatch = patient.firstNames.includes(
          patientParam.firstNames
        );
        const lastNamesMatch = patient.lastNames.includes(
          patientParam.lastNames
        );
        const identifierMatch = patient.identifiers.some((identifier) =>
          identifier.value.includes(patientParam.identifiers[0].value)
        );

        return firstNamesMatch || lastNamesMatch || identifierMatch;
      })
      .toArray();

    return results;
  },

  getById(id: string) {
    return patient
      .query()
      .where((patient) => {
        return patient.id === id;
      })
      .first();
  },

  async getPatientByIdMobile(id: string) {
    const patient = await patientDexie.where('id').equalsIgnoreCase(id).first();

    const [identifiers] = await Promise.all([
      patientServiceIdentifierService.getAllByPatientIDsFromDexie(patient.id),
    ]);

    patient.identifiers = identifiers;

    return patient;
  },

  async getAllPatientFromDexie() {
    return await patientDexie.toArray();
  },

  async getCountPatientFromDexie() {
    return await patientDexie.count();
  },

  async getPatientMobileWithAllByPatientId(patient: any) {
    const patientServices =
      await patientServiceIdentifierService.getAllMobileByPatientId(patient.id);

    const patientServicesIds = patientServices.map((pat: any) => pat.id);

    await episodeService.getAllMobileByPatientServiceIds(patientServicesIds);

    const patientVisits = await patientVisitService.apiGetAllByPatientId(
      patient.id
    );
    const ids = patientVisits.map((pat: any) => pat.id);

    const patientVisitDetails =
      await patientVisitDetailsService.getAllMobileByVisitId(ids);

    const prescriptionIds = patientVisitDetails.map(
      (pat: any) => pat.prescription_id
    );
    const packIds = patientVisitDetails.map((pat: any) => pat.pack_id);

    const prescriptions = await prescriptionService.getAllMobileByIds(
      prescriptionIds
    );
    const packs = await packService.getAllMobileByIds(packIds);

    ids.forEach((id: any) => {
      vitalSignsScreeningService.getVitalSignsScreeningByVisitIdMobile(id);
      rAMScreeningService.getRAMScreeningByVisitIdMobile(id);
      tBScreeningService.getTBScreeningsByVisitIdMobile(id);
      adherenceScreeningService.getAdherenceScreeningByVisitIdMobile(id);
      pregnancyScreeningService.getPregnancyScreeningsByVisitIdMobile(id);
    });

    prescriptions.forEach((prescription: any) => {
      prescribedDrugService.getLastByPrescriprionIdFromDexie(prescription.id);
      prescriptionDetailsService.getLastByPrescriprionIdFromDexie(
        prescription.id
      );
    });

    packs.forEach((pack: any) => {
      packagedDrugService.getAllByPackIdMobile(pack.id);
    });
  },

  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await patientDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },

  async getAllPatientstWithAllFromDexie() {
    const patients = await patientDexie.toArray();

    const patientIds = patients.map((patient: any) => patient.id);

    const [patientVisitList, identifiers] = await Promise.all([
      patientVisitService.getAllByPatientIDsFromDexie(patientIds),
      patientServiceIdentifierService.getAllByPatientsIDsFromDexie(patientIds),
    ]);

    patients.map((patient: any) => {
      patient.patientVisits = patientVisitList.filter(
        (patientVisit: any) => patientVisit.patient_id === patient.id
      );
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier.patient_id === patient.id
      );
    });

    return patients;
  },
  async getPatientWithAllFromDexie(id: string) {
    const patients = await patientDexie
      .where('id')
      .equalsIgnoreCase(id)
      .toArray();

    const patientIds = patients.map((patient: any) => patient.id);

    const [patientVisitList, identifiers] = await Promise.all([
      patientVisitService.getAllByPatientIDsFromDexie(patientIds),
      patientServiceIdentifierService.getAllByPatientsIDsFromDexie(patientIds),
    ]);

    patients.map((patient: any) => {
      patient.patientVisits = patientVisitList.filter(
        (patientVisit: any) => patientVisit.patient_id === patient.id
      );
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier.patient_id === patient.id
      );
    });
    return patients;
  },

  async getPatient3LastDataWithAllFromDexie(id: string) {
    const patients = await patientDexie
      .where('id')
      .equalsIgnoreCase(id)
      .toArray();

    const patientIds = patients.map((patient: any) => patient.id);

    const [patientVisitList, identifiers] = await Promise.all([
      patientVisitService.getAll3LastDataByPatientIDsFromDexie(patientIds),
      patientServiceIdentifierService.getAll3LastDataByPatientsIDsFromDexie(
        patientIds
      ),
    ]);

    patients.map((patient: any) => {
      patient.patientVisits = patientVisitList.filter(
        (patientVisit: any) => patientVisit.patient_id === patient.id
      );
      patient.identifiers = identifiers.filter(
        (identifier: any) => identifier.patient_id === patient.id
      );
    });
    console.log('Load parient data from dexie');
    patient.save(patients);
    console.log('Load parient data from Pinia');
    return patients;
  },
  deleteAllFromDexie() {
    patientDexie.clear();
  },
};
