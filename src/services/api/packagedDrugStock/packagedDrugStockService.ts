import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PackagedDrugStock from 'src/stores/models/packagedDrug/PackagedDrugStock';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const packagedDrugStock = useRepo(PackagedDrugStock);
const packagedDrugStockDexie = db[PackagedDrugStock.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      this.addMobile(params);
    } else {
      this.postWeb(params);
    }
  },
  get(offset: number) {
    if (isMobile && !isOnline) {
      this.getMobile();
    } else {
      this.getWeb(offset);
    }
  },
  async patch(uuid: string, params: string) {
    if (isMobile && !isOnline) {
      this.putMobile(params);
    } else {
      this.patchWeb(uuid, params);
    }
  },
  async delete(uuid: string) {
    if (isMobile && !isOnline) {
      return this.deleteMobile(uuid);
    } else {
      return this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('packagedDrugStock', params);
      packagedDrugStock.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('packagedDrugStock?offset=' + offset + '&max=100')
        .then((resp) => {
          packagedDrugStock.save(resp.data);
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
  async patchWeb(uuid: string, params: string) {
    try {
      const resp = await api().patch('packagedDrugStock/' + uuid, params);
      packagedDrugStock.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('packagedDrugStock/' + uuid);
      packagedDrugStock.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return packagedDrugStockDexie
      .add(JSON.parse(JSON.stringify(params)))
      .then(() => {
        packagedDrugStock.save(JSON.parse(JSON.stringify(params)));
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  putMobile(params: string) {
    return packagedDrugStockDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        packagedDrugStock.save(JSON.parse(params));
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  getMobile() {
    return packagedDrugStockDexie
      .toArray()
      .then((rows: any) => {
        packagedDrugStock.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return packagedDrugStockDexie
      .delete(paramsId)
      .then(() => {
        packagedDrugStock.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return packagedDrugStockDexie
      .bulkAdd(params)
      .then(() => {
        packagedDrugStock.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  async apiGetAll() {
    return await api().get('/packagedDrugStock?offset=' + 0 + '&max=' + 200);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return packagedDrugStock.getModel().$newInstance();
  },
  getAllFromStorage() {
    return packagedDrugStock.all();
  },
  deleteAllFromStorage() {
    packagedDrugStock.flush();
  },
};
