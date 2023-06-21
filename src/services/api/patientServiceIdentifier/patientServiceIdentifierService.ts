import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientServiceIdentifier from 'src/stores/models/patientServiceIdentifier/PatientServiceIdentifier';

const patientServiceIdentifier = useRepo(PatientServiceIdentifier);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('patientServiceIdentifier', params);
    patientServiceIdentifier.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientServiceIdentifier?offset=' + offset + '&max=100')
        .then((resp) => {
          patientServiceIdentifier.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('patientServiceIdentifier/' + id, params);
    patientServiceIdentifier.save(resp.data);
    return resp;
  },
  async delete(id: number) {
    await api().delete('patientServiceIdentifier/' + id);
    patientServiceIdentifier.destroy(id);
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
    return await api().get(`/patientServiceIdentifier/${id}`);
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
  },
  async syncPatientServiceIdentifier(identifier: any) {
    if (identifier.syncStatus === 'R') await this.apiSave(identifier, true);
    if (identifier.syncStatus === 'U') await this.apiUpdate(identifier);
  },
  // Local Storage Pinia
  newInstanceEntity() {
    return patientServiceIdentifier.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientServiceIdentifier.all();
  },
  identifierCurr(id: string) {
    return patientServiceIdentifier.withAllRecursive(2).where('id', id).first();
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
};
