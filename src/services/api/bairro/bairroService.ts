import { useRepo } from 'pinia-orm';
import Localidade from 'src/stores/models/Localidade/Localidade';
import api from '../apiService/apiService';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useLoading } from 'src/composables/shared/loading/loading';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';

const localidade = useRepo(Localidade);
const localidadeDexie = db[Localidade.entity];

const { closeLoading } = useLoading();
const { alertSucess, alertError } = useSwal();
const { isMobile, isOnline } = useSystemUtils();

export default {
  async post(params: string) {
    if (isMobile && !isOnline) {
      return this.addMobile(params);
    } else {
      return this.postWeb(params);
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
      this.deleteMobile(uuid);
    } else {
      this.deleteWeb(uuid);
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('localidade', params);
      localidade.save(resp.data);
      // alertSucess('O Registo foi efectuado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  getWeb(offset: number) {
    if (offset >= 0) {
      return api()
        .get('localidade?offset=' + offset + '&max=100')
        .then((resp) => {
          localidade.save(resp.data);
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
      const resp = await api().patch('localidade/' + uuid, params);
      localidade.save(resp.data);
      alertSucess('O Registo foi alterado com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  async deleteWeb(uuid: string) {
    try {
      const resp = await api().delete('localidade/' + uuid);
      localidade.destroy(uuid);
      alertSucess('O Registo foi removido com sucesso');
    } catch (error: any) {
      // alertError('Aconteceu um erro inesperado nesta operação.');
      console.log(error);
    }
  },
  // Mobile
  addMobile(params: string) {
    return localidadeDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        localidade.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  putMobile(params: string) {
    return localidadeDexie
      .put(JSON.parse(JSON.stringify(params)))
      .then(() => {
        localidade.save(JSON.parse(params));
      })
      .catch((error: any) => {
        console.log(error);
      });
  },
  getMobile() {
    return localidadeDexie
      .toArray()
      .then((rows: any) => {
        localidade.save(rows);
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  deleteMobile(paramsId: string) {
    return localidadeDexie
      .delete(paramsId)
      .then(() => {
        localidade.destroy(paramsId);
        alertSucess('O Registo foi removido com sucesso');
      })
      .catch((error: any) => {
        // alertError('Aconteceu um erro inesperado nesta operação.');
        console.log(error);
      });
  },
  addBulkMobile(params: any) {
    return localidadeDexie
      .bulkAdd(params)
      .then(() => {
        localidade.save(params);
      })
      .catch((error: any) => {
        console.log(error);
      });
  },

  async apiFetchById(uuid: string) {
    return await api().get(`/localidade/${uuid}`);
  },

  async apiGetAll(offset: number, max: number) {
    return this.get(offset);
  },

  // Pinia LocalBase
  getAllLocalidade() {
    return localidade.orderBy('code', 'asc').get();
  },

  getAllDistrictById(districtId: string) {
    return localidade
      .withAllRecursive(1)
      .where('district_id', districtId)
      .orderBy('code', 'asc')
      .get();
  },
  getAllPostoAdministrativoById(postoAdministrativoId: string) {
    return localidade
      .withAllRecursive(1)
      .where('postoAdministrativo_id', postoAdministrativoId)
      .orderBy('code', 'asc')
      .get();
  },
};
