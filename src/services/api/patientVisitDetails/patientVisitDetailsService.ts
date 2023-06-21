import { useRepo } from 'pinia-orm';
import api from '../apiService/apiService';
import PatientVisitDetails from 'src/stores/models/patientVisitDetails/PatientVisitDetails';
import { relativeTimeRounding } from 'moment';

const patientVisitDetails = useRepo(PatientVisitDetails);

export default {
  // Axios API call
  async post(params: string) {
    const resp = await api().post('patientVisitDetails', params);
    patientVisitDetails.save(resp.data);
  },
  get(offset: number) {
    if (offset >= 0) {
      return api()
        .get('patientVisitDetails?offset=' + offset + '&max=100')
        .then((resp) => {
          patientVisitDetails.save(resp.data);
          offset = offset + 100;
          if (resp.data.length > 0) {
            this.get(offset);
          }
        });
    }
  },
  async patch(id: number, params: string) {
    const resp = await api().patch('patientVisitDetails/' + id, params);
    patientVisitDetails.save(resp.data);
  },
  async delete(id: number) {
    await api().delete('patientVisitDetails/' + id);
    patientVisitDetails.destroy(id);
  },

  async apiFetchById(id: string) {
    return await api().get(`/patientVisitDetails/${id}`);
  },

  async apiSave(patientVisitDetail: any) {
    return await api().post('/patientVisitDetails', patientVisitDetail);
  },

  async apiDelete(patientVisitDetail: any) {
    return await api().delete(`/patientVisitDetails/${patientVisitDetail.id}`);
  },

  async apiGetAllByClinicId(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patientVisitDetails/clinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetAllLastOfClinic(clinicId: string, offset: number, max: number) {
    return await api().get(
      '/patientVisitDetails/AllLastOfClinic/' +
        clinicId +
        '?offset=' +
        offset +
        '&max=' +
        max
    );
  },

  async apiGetAllByEpisodeId(episodeId: string, offset: number, max: number) {
    return await api()
      .get(
        '/patientVisitDetails/episode/' +
          episodeId +
          '?offset=' +
          offset +
          '&max=' +
          max
      )
      .then((resp) => {
        patientVisitDetails.save(resp.data);
      });
  },

  async apiGetLastByEpisodeId(episodeId: string) {
    return await api().get(
      '/patientVisitDetails/getLastByEpisodeId/' + episodeId
    ).then((resp) => {
      patientVisitDetails.save(resp.data);
      return resp;
    })
  },

  async apiGetPatientVisitDetailsByPatientId(patientId: string) {
    return await api()
      .get('patientVisitDetails/patientId/' + patientId)
      .then((resp) => {
        patientVisitDetails.save(resp.data);
      });
  },

  async apiGetAllofPrecription(prescriptionId: string) {
    return await api().get(
      '/patientVisitDetails/getAllofPrecription/' + prescriptionId
    ).then((resp) => {
      patientVisitDetails.save(resp.data);
      return resp;
    });
  },

  // Local Storage Pinia
  newInstanceEntity() {
    return patientVisitDetails.getModel().$newInstance();
  },
  getAllFromStorage() {
    return patientVisitDetails.all();
  },
  
  getLastPatientVisitDetailFromPatientVisit(patientVisitId: string) {
    return patientVisitDetails
      .withAllRecursive(2)
      .has('prescription')
      .where('patient_visit_id', patientVisitId)
      .first();
  },

  getLastPatientVisitDetailsFromEpisode(episodeId: string) {
    return patientVisitDetails
      .withAllRecursive(1)
      .has('pack')
      .where('episode_id', episodeId)
      .whereHas('pack', (query) => {
        query.orderBy('pickupDate', 'desc');
        query.first();
      })
      .first();
  },

  getAllPatientVisitByPrescriptioId(prescriptionId: string) {
    return patientVisitDetails.where('prescription_id', prescriptionId).get();
  },
  getAllPatientVisitByPackId(packId: string) {
    return patientVisitDetails.where('pack_id', packId).get();
  },

  getPatientVisitDetailsByPackId(packId: string) {
    return patientVisitDetails.query().where('pack_id', packId).first()
  },

  getPatientVisitDetailsByPrescriptionId(prescriptionId: string) {
    return patientVisitDetails.query().withAll().where('prescription_id', prescriptionId).first()
  }
};
