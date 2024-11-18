import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import clinicService from '../clinicService/clinicService';
import clinicalServiceService from '../clinicalServiceService/clinicalServiceService';
import identifierTypeService from '../identifierTypeService/identifierTypeService';
import { FeCompositeElement } from 'app/src-cordova/platforms/android/app/build/intermediates/assets/debug/mergeDebugAssets/www/assets/index.es.58f0f285';
import episodeService from '../episode/episodeService';

const patientServiceIdentifier = useRepo(PatientServiceIdentifier);
const patientServiceIdentifierDexie = db[PatientServiceIdentifier.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  post(params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile.value && !isOnline.value) {
      this.getMobile();
    } else {
      return this.getWeb(offset);
    }
  },
  patch(uid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      return this.putMobile(params);
    } else {
      return this.patchWeb(uid, params);
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
      .post('patientServiceIdentifier', params)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientServiceIdentifier?offset=' + offset + '&max=100')
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.getWeb(offset);
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  },
  patchWeb(uuid: string, params: string) {
    return api()
      .patch('patientServiceIdentifier/' + uuid, params)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },
  deleteWeb(uuid: string) {
    return api()
      .delete('patientServiceIdentifier/' + uuid)
      .then(() => {
        patientServiceIdentifier.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    return patientServiceIdentifierDexie
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientServiceIdentifier.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return patientServiceIdentifierDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientServiceIdentifier.save(JSON.parse(JSON.stringify(params)));
      });
  },
  async getMobile() {
    try {
      const rows = await patientServiceIdentifierDexie.toArray();
      patientServiceIdentifier.save(rows);
      return rows;
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteMobile(paramsId: string) {
    try {
      await patientServiceIdentifierDexie.delete(paramsId);
      patientServiceIdentifier.destroy(paramsId);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  addBulkMobile() {
    const patientServiceIdentifierFromPinia = this.getAllFromStorageForDexie();
    return patientServiceIdentifierDexie
      .bulkPut(patientServiceIdentifierFromPinia)
      .catch((error: any) => {
        console.log(error);
      });
  },
  async getAllMobileByPatientId(patientId: string) {
    const resp = await patientServiceIdentifierDexie
      .where('patient_id')
      .equalsIgnoreCase(patientId)
      .toArray();
    patientServiceIdentifier.save(resp);
    return resp;
  },
  async apiSave(identifier: any, isNew: boolean) {
    if (isNew) {
      return await this.post(identifier);
    } else {
      return await this.patch(identifier.id, identifier);
    }
  },

  async apiUpdate(identifier: any) {
    return await this.patch(identifier.id, identifier);
  },

  async apiFetchById(id: string) {
    return await api()
      .get(`/patientServiceIdentifier/${id}`)
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
        return resp;
      });
  },

  async apiFetchByNidValue(nidValue: string) {
    const replacedString = nidValue.replace(/\//g, '-');
    return await api()
      .get(`/patientServiceIdentifier/value/${replacedString}`)
      .then((resp) => {
        if (resp.data !== '') patientServiceIdentifier.save(resp.data);
        return resp.data;
      });
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api()
      .get(
        '/patientServiceIdentifier/clinic/' +
          clinicId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        patientServiceIdentifier.save(resp.data);
      });
  },

  async apiGetAllByPatientId(patientId: string, offset: number, max: number) {
    if (isMobile.value && !isOnline.value) {
      return patientServiceIdentifierDexie
        .where('patient_id')
        .equalsIgnoreCase(patientId)
        .then((row: any) => {
          patientServiceIdentifier.save(row);
          return row;
        });
    } else {
      return await api()
        .get(
          '/patientServiceIdentifier/patient/' +
            patientId +
            '?offset=' +
            offset +
            '&max=' +
            max
        )
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
        });
    }
  },
  async syncPatientServiceIdentifier(identifier: any) {
    if (identifier.syncStatus === 'R') await this.postWeb(identifier);
    if (identifier.syncStatus === 'U')
      await this.patchWeb(identifier.id, identifier);
  },
  async getLocalDbPatientServiceIdentifierToSync() {
    return patientServiceIdentifierDexie
      .where('syncStatus')
      .equalsIgnoreCase('R')
      .or('syncStatus')
      .equalsIgnoreCase('U')
      .toArray()
      .then((result: any) => {
        return result;
      });
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientServiceIdentifier.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientServiceIdentifier.all();
  },
  getAllFromStorageForDexie() {
    return patientServiceIdentifier
      .makeHidden([
        'identifierType',
        'service',
        'patient',
        'episodes',
        'clinic',
      ])
      .all();
  },
  deleteAllFromStorage() {
    patientServiceIdentifier.flush();
  },
  identifierCurr(id: string, serviceId: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .where('id', id)
      .where('service_id', serviceId)
      .first();
  },
  getAllEpisodesByIdentifierId(id: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query) => {
        query.whereHas('episodeType', (query) => {
          query.where('code', 'INICIO');
        });
      })
      .where('id', id)
      .get();
  },

  getAllIdentifierWithInicialEpisodeByPatient(patientId: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query) => {
        query.whereHas('episodeType', (query) => {
          query.where('code', 'INICIO');
        });
      })
      .where('patient_id', patientId)
      .get();
  },

  getAllIdentifierWithREferralEpisodeByPatient(patientId: string) {
    return patientServiceIdentifier
      .withAllRecursive(2)
      .whereHas('episodes', (query) => {
        query.whereHas('startStopReason', (query) => {
          query.where('code', 'REFERIDO_PARA').orWhere('code', 'REFERIDO_DC');
        });
      })
      .where('patient_id', patientId)
      .get();
  },

  curIdentifierById(id: string) {
    return patientServiceIdentifier.withAllRecursive(2).where('id', id).first();
  },
  localDbGetById(id: string) {
    return patientServiceIdentifierDexie
      .where('id')
      .equalsIgnoreCase(id)
      .first()
      .then((result: any) => {
        return result;
      });
  },

  async localDbGetByPatientId(patientId: string) {
    return patientServiceIdentifierDexie
      .where('patient_id')
      .equalsIgnoreCase(patientId)
      .toArray()
      .then((result: any) => {
        return result;
      });
  },
  getLatestIdentifierSlimByPatientId(patientId: string) {
    return patientServiceIdentifier
      .withAll()
      .where((patientService) => {
        return patientService.patient_id === patientId;
      })
      .orderBy('startDate', 'desc')
      .first();
  },

  getPreferredIdentifierByPatientId(patientId: string) {
    return patientServiceIdentifier
      .withAll()
      .where((patientService) => {
        console.log(patientService);
        return (
          patientService.patient_id === patientId &&
          patientService.prefered === true
        );
      })
      .orderBy('startDate', 'desc')
      .first();
  },

  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    const patientServiceIdentifiers = await patientServiceIdentifierDexie
      .where('id')
      .anyOfIgnoreCase(ids)
      .toArray();

    const identifierTypeIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier.identifier_type_id
    );

    const serviceIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) => patientServiceIdentifier.service_id
    );

    const clinicIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) => patientServiceIdentifier.clinic_id
    );

    const [identifierTypes, services, clinics] = await Promise.all([
      identifierTypeService.getAllByIDsFromDexie(identifierTypeIds),
      clinicalServiceService.getAllByIDsFromDexie(serviceIds),
      clinicService.getAllByIDsFromDexie(clinicIds),
    ]);

    patientServiceIdentifiers.map((patientServiceIdentifier: any) => {
      patientServiceIdentifier.clinic = clinics.find(
        (clinic: any) => clinic.id === patientServiceIdentifier.clinic_id
      );
      patientServiceIdentifier.identifierType = identifierTypes.find(
        (identifierType: any) =>
          identifierType.id === patientServiceIdentifier.identifier_type_id
      );
      patientServiceIdentifier.service = services.find(
        (service: any) => service.id === patientServiceIdentifier.service_id
      );
    });

    return patientServiceIdentifiers;
  },

  async getAllByPatientIDsFromDexie(id: string) {
    const patientServiceIdentifiers = await patientServiceIdentifierDexie
      .where('patient_id')
      .equalsIgnoreCase(id)
      .toArray();

    const identifierTypeIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier.identifier_type_id
    );

    const serviceIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) => patientServiceIdentifier.service_id
    );

    const clinicIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) => patientServiceIdentifier.clinic_id
    );

    const [identifierTypes, services, clinics] = await Promise.all([
      identifierTypeService.getAllByIDsFromDexie(identifierTypeIds),
      clinicalServiceService.getAllByIDsFromDexie(serviceIds),
      clinicService.getAllByIDsFromDexie(clinicIds),
    ]);

    patientServiceIdentifiers.map((patientServiceIdentifier: any) => {
      patientServiceIdentifier.clinic = clinics.find(
        (clinic: any) => clinic.id === patientServiceIdentifier.clinic_id
      );
      patientServiceIdentifier.identifierType = identifierTypes.find(
        (identifierType: any) =>
          identifierType.id === patientServiceIdentifier.identifier_type_id
      );
      patientServiceIdentifier.service = services.find(
        (service: any) => service.id === patientServiceIdentifier.service_id
      );
    });

    return patientServiceIdentifiers;
  },
  async getAllByPatientsIDsFromDexie(ids: []) {
    const patientServiceIdentifiers = await patientServiceIdentifierDexie
      .where('patient_id')
      .anyOfIgnoreCase(ids)
      .toArray();

    const identifierIds = patientServiceIdentifiers.map(
      (identifier: any) => identifier.id
    );

    const identifierTypeIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) =>
        patientServiceIdentifier.identifier_type_id
    );

    const serviceIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) => patientServiceIdentifier.service_id
    );

    const clinicIds = patientServiceIdentifiers.map(
      (patientServiceIdentifier: any) => patientServiceIdentifier.clinic_id
    );

    const [identifierTypes, services, clinics, episodeList] = await Promise.all(
      [
        identifierTypeService.getAllByIDsFromDexie(identifierTypeIds),
        clinicalServiceService.getAllByIDsFromDexie(serviceIds),
        clinicService.getAllByIDsFromDexie(clinicIds),
        episodeService.getAllByIdentifierIDsFromDexie(identifierIds),
      ]
    );

    patientServiceIdentifiers.map((patientServiceIdentifier: any) => {
      patientServiceIdentifier.clinic = clinics.find(
        (clinic: any) => clinic.id === patientServiceIdentifier.clinic_id
      );
      patientServiceIdentifier.identifierType = identifierTypes.find(
        (identifierType: any) =>
          identifierType.id === patientServiceIdentifier.identifier_type_id
      );
      patientServiceIdentifier.service = services.find(
        (service: any) => service.id === patientServiceIdentifier.service_id
      );
      patientServiceIdentifier.episodes = episodeList.filter(
        (episode: any) =>
          episode.patientServiceIdentifier_id === patientServiceIdentifier.id
      );
    });

    return patientServiceIdentifiers;
  },
};
