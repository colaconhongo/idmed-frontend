import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import Group from 'src/stores/models/group/Group';
import { useSwal } from 'src/composables/shared/dialog/dialog';
import { useSystemUtils } from 'src/composables/shared/systemUtils/systemUtils';
import db from '../../../stores/dexie';
import groupMemberService from '../groupMember/groupMemberService';
import { useLoading } from 'src/composables/shared/loading/loading';

const group = useRepo(Group);
const groupDexie = db[Group.entity];

const { isMobile, isOnline } = useSystemUtils();
const { alertSucess, alertError, alertInfo } = useSwal();
const { closeLoading } = useLoading();

export default {
  // Axios API call
  get(offset: number) {
    if (offset >= 0) {
      if (isOnline.value) {
        return api()
          .get('groupInfo?offset=' + offset + '&max=100')
          .then((resp) => {
            group.save(resp.data);
            closeLoading();
            offset = offset + 100;
            if (resp.data.length > 0) {
              this.get(offset);
            }
          });
      } else {
        return groupDexie.then((result) => {
          group.save(result);
          closeLoading();
        });
      }
    }
  },
  patch(id: number, params: string) {
    return api()
      .patch('group/' + id, params)
      .then((resp) => {
        group.save(resp.data);
      });
  },
  delete(id: number) {
    return api()
      .delete('group/' + id)
      .then(() => {
        group.destroy(id);
      });
  },
  async apiFetchById(id: string) {
    if (isOnline.value) {
      return await api()
        .get(`/groupInfo/${id}`)
        .then((resp) => {
          group.save(resp.data);
          return resp;
        });
    } else {
      return nSQL(Group.entity)
        .query('select')
        .where(['id', '=', id])
        .exec()
        .then((rows) => {
          group.save(rows);
        });
    }
  },
  // WEB
  async postWeb(params: string) {
    try {
      const resp = await api().post('/groupInfo', params);
      group.save(resp.data);
      return resp;
    } catch (error: any) {
      console.log(error);
    }
  },

  async apiSave(groupInfo: any) {
    let resp = null;
    if (isOnline.value) {
      resp = await api().post('/groupInfo', groupInfo);
      group.save(resp.data);
      return resp;
    } else {
      groupInfo.syncStatus = 'R';
      resp = await nSQL('groups').query('upsert', groupInfo).exec();
      console.log('criacaoGrupo' + groupInfo);
      group.save(groupInfo);
    }
    return resp;
  },

  async apiUpdate(groupInfo: any) {
    if (isOnline.value) {
      return await api()
        .patch('/groupInfo/' + groupInfo.id, groupInfo)
        .then((resp) => {
          group.save(resp.data);
          return resp.data;
        })
        .catch((error) => {
          const listErrors = [];
          if (error.request.response != null) {
            const arrayErrors = JSON.parse(error.request.response);
            if (arrayErrors.total == null) {
              listErrors.push(arrayErrors.message);
            } else {
              arrayErrors._embedded.errors.forEach((element) => {
                listErrors.push(element.message);
              });
            }
          }
          alertError('Ocorreu um erro inesperado nesta operação.');
        });
    } else {
      if (groupInfo.syncStatus !== 'R') groupInfo.syncStatus = 'U';
      const resp = await nSQL('groups').query('upsert', groupInfo).exec();
      console.log('edicaoGrupo' + groupInfo);
      group.save(groupInfo);
      return resp;
    }
  },
  /*
  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    if (!isOnline.value) {
      return nSQL('groups')
        .query('select')
        .exec()
        .then((result) => {
          console.log('groupsss' + result);
          console.log(groupMemberService.getAllFromStorage());
          group.save(result);
          console.log(groupMemberService.getAllFromStorage());
        });
    } else {
      return await api()
        .get(
          '/groupInfo/clinic/' + clinicId + '?offset=' + offset + '&max=' + max
        )
        .then((resp) => {
          console.log('groupsss555' + resp.data);
          group.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.apiGetAllByClinicId(clinicId, offset, max);
          }
        });
    }
  },
  */
  async apiValidateBeforeAdd(patientId: string, code: string) {
    return await api().get(
      `/groupInfo/validadePatient/${patientId}/${code}/${dispenseTypeCode}`
    );
  },
  async getLocalDbGroupsToSync() {
    return nSQL(Group.entity)
      .query('select')
      .where([['syncStatus', '=', 'R'], 'OR', ['syncStatus', '=', 'U']])
      .exec()
      .then((result) => {
        return result;
      });
  },
  getAllGroups() {
    return group
      .query()
      .with('groupType')
      .with('dispenseType')
      .with('service')
      .get();
  },

  getGroupById(groupId: string) {
    return group.withAllRecursive(3).where('id', groupId).first();
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return group.getModel().$newInstance();
  },
  getAllFromStorage() {
    return group.all();
  },
  deleteAllFromStorage() {
    group.flush();
  },
  getGroupWithsById(groupId: string) {
    return group
      .with('members', (query) => {
        query.withAllRecursive(1);
      })
      .with('service', (query) => {
        query.with('identifierType');
      })
      .with('groupType')
      .with('dispenseType')
      .with('clinic', (query) => {
        query.withAllRecursive(1);
      })
      .with('packHeaders', (query) => {
        query.withAllRecursive(1);
      })
      .where('id', groupId)
      .first();
  },

  getGroupByPatientAndService(patientid: string, serviceId: string) {
    return group
      .withAll()
      .with('groupType')
      .with('dispenseType')
      .where('endDate', null)
      .where('clinical_service_id', serviceId)
      .whereHas('members', (query) => {
        query.where('patient_id', patientid).where('endDate', null);
      })
      .orderBy('startDate', 'desc')
      .first();
  },
  deleteAllFromDexie() {
    groupDexie.clear();
  },
};
