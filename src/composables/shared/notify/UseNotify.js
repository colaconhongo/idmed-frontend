import { Notify } from 'quasar';
export default function useNotify() {
  const notifySuccess = (messageParam) => {
    Notify.create({
      icon: 'announcement',
      message: messageParam,
      type: 'positive',
      progress: true,
      timeout: 5000,
      position: 'top',
      color: 'positive',
      textColor: 'white',
      classes: 'glossy',
    });
  };

  const notifyError = (messageParam) => {
    Notify.create({
      icon: 'announcement',
      message: messageParam,
      type: 'negative',
      progress: true,
      timeout: 5000,
      position: 'top',
      color: 'negative',
      textColor: 'white',
      classes: 'glossy',
    });
  };

  const notifyInfo = (messageParam) => {
    Notify.create({
      icon: 'info',
      message: messageParam,
      type: 'info',
      progress: true,
      timeout: 5000,
      position: 'top',
      color: 'info',
      textColor: 'white',
      classes: 'glossy',
    });
  };

  return {
    notifySuccess,
    notifyError,
    notifyInfo,
  };
}
