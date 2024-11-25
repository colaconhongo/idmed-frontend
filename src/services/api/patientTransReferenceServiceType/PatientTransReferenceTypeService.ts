import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientTransReferenceType from 'src/stores/models/transreference/PatientTransReferenceType';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const patientTransReferenceType = useRepo(PatientTransReferenceType);
const patientTransReferenceTypeDexie = PatientTransReferenceType.entity;

const { closeLoading, showloading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile.value && !isOnline.value) {
      this.addMobile(params);
    } else {
      this.postWeb(params);
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
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('patientTransReferenceType', params);
      patientTransReferenceType.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async getWeb(offset: number) {
    if (offset >= 0) {
      return await api()
        .get('patientTransReferenceType?offset=' + offset + '&max=100')
        .then((resp) => {
          patientTransReferenceType.save(resp.data);
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
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch(
        'patientTransReferenceType/' + uuid,
        params
      );
      patientTransReferenceType.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('patientTransReferenceType/' + uuid);
      patientTransReferenceType.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return db[patientTransReferenceTypeDexie]
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientTransReferenceType.save(JSON.parse(JSON.stringify(params)));
      });
  },
  putMobile(params: string) {
    return db[patientTransReferenceTypeDexie]
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        patientTransReferenceType.save(JSON.parse(params));
        // alertSucess('O Registo foi efectuado com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return db[patientTransReferenceTypeDexie]
      .toArray()
      .then((rows: any) => {
        patientTransReferenceType.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return db[patientTransReferenceTypeDexie]
      .delete(paramsId)
      .then(() => {
        patientTransReferenceType.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return db[patientTransReferenceTypeDexie]
      .bulkPut(params)
      .then(() => {
        patientTransReferenceType.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll(offset: number, max: number) {
    return await api().get(
      '/patientTransReferenceType?offset=' + offset + '&max=' + max
    );
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientTransReferenceType.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientTransReferenceType.all();
  },
  getOperationType(operationType: string) {
    return patientTransReferenceType.where('code', operationType).first();
  },
};
