import { useRepo } from 'pinia-orm';
import { ClinicSector } from '../../../stores/models/clinic/ClinicHierarchy';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import clinicService from '../clinicService/clinicService';

const clinicSector = useRepo(ClinicSector);

const clinicSectorDexie = db[ClinicSector.entity];

const { closeLoading, showloading } = useLoading();
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
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile.value && !isOnline.value) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile.value && !isOnline.value) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteMobile(uuid);
    }
  },
  // WEB
  postWeb(params: string) {
    showloading();
    return api()
      .post('clinicSector', params)
      .then((resp) => {
        clinicSector.save(resp.data);
        closeLoading();
      });
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('clinicSector?offset=' + offset + '&max=100')
        .then((resp) => {
          clinicSector.save(resp.data);
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
    showloading();
    return api()
      .patch('clinicSector/' + uuid, params)
      .then((resp) => {
        clinicSector.save(resp.data);
        closeLoading();
      });
  },
  async deleteWeb(uuid: string) {
    return api()
      .delete('clinicSector/' + uuid)
      .then(() => {
        clinicSector.destroy(uuid);
      });
  },
  // Mobile
  addMobile(params: string) {
    showloading();
    return clinicSectorDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        clinicSector.save(params);
        // alertSucess('O Registo foi efectuado com sucesso');
        closeLoading();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    showloading();
    return clinicSectorDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        clinicSector.save(params);
        // alertSucess('O Registo foi efectuado com sucesso');
        closeLoading();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    showloading();
    return clinicSectorDexie
      .toArray()
      .then((rows: any) => {
        clinicSector.save(rows);
        closeLoading();
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return clinicSectorDexie
      .delete(paramsId)
      .then(() => {
        clinicSector.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return clinicSectorDexie
      .bulkPut(params)
      .then(() => {
        clinicSector.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return clinicSector.getModel().$newInstance();
  },

  /*Pinia Methods*/
  getAllClinicSectors() {
    // return clinicService.getAllClinicSectors()
    return clinicSector.withAll().get();
  },

  getClinicSectorsById(clinicSectorId: string) {
    return clinicSector.withAll().where('id', clinicSectorId).first();
  },

  getClinicSectorsByClinicId(clinicId: string) {
    return clinicSector.query().where('parentClinic_id', clinicId).get();
  },

  getClinicSectorsByFacilityTypeId(clinicId: string, facilityTypeId: string) {
    return clinicSector
      .query()
      .where('parentClinic_id', clinicId)
      .where('facilityTypeId', facilityTypeId)
      .get();
  },

  getClinicSectorsByIdAndFacilityTypeId(id: string, facilityTypeId: string) {
    return clinicSector
      .query()
      .where('id', id)
      .where('facilityTypeId', facilityTypeId)
      .get();
  },

  getActivebyClinicId(clinicId: string) {
    return clinicSector
      .query()
      .with('facilityType')
      .where((clinicSector) => {
        return clinicSector.active && clinicSector.parentClinic_id === clinicId;
      })
      .get();
  },
  getActiveUSClinicSectorByClinic(clinicId: string) {
    return clinicSector
      .withAllRecursive(1)
      .where('active', true)
      .where((sector) => {
        return sector.parentClinic_id === clinicId;
      })
      .whereHas('facilityType', (query) => {
        query.where('code', 'PARAGEM_UNICA').orWhere('code', 'NORMAL');
      })
      .orderBy('code', 'asc')
      .get();
  },
  getClinicSectorByCode(code: string) {
    return clinicSector.query().withAllRecursive(1).where('code', code).first();
  },
  getClinicSectorSlimByCode(code: string) {
    return clinicSector.query().where('code', code).first();
  },

  async getClinicSectorsDexie() {
    // const dexiDatabase1 = ClinicSector.entity;
    try {
      const clinicSectors = await clinicSectorDexie.toArray();

      /*
      const clinicSectors = await db[dexiTable]
        .where('code')
        .equalsIgnoreCase('TesteDex')
        .first();
        */
      clinicSector.save(clinicSectors);
      console.log(clinicSectors);
      // Fetch associated patients for each appointment
      /*
      const appointmentsWithPatients = await Promise.all(clinicSectors.map(async (clinicSector) => {
        const patient = await db.patients.get(appointment.patientId);
        return { ...appointment, patient };
        */
      return clinicSectors;
      // console.log('Appointments with patients:', appointmentsWithPatients);
    } catch (error) {
      console.error('Failed to get appointments:', error);
    }
  },
  // Dexie Block
  async getAllByIDsFromDexie(ids: []) {
    return await clinicSectorDexie.where('id').anyOfIgnoreCase(ids).toArray();
  },
};
