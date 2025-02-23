import Episode from 'src/stores/models/episode/Episode';

export function useEpisode() {
  function closed(episode: Episode) {
    return episode.code === 'FIM';
  }

  function isStartEpisode(episode: Episode) {
    if (episode.episodeType === null) return false;
    return episode.episodeType.code === 'INICIO';
  }

  function isCloseEpisode(episode: Episode) {
    if (episode.episodeType === null || episode.episodeType === undefined)
      return false;
    return episode.episodeType.code === 'FIM';
  }

  function isBackReferenceEpisode(episode: Episode) {
    if (
      episode.startStopReason === null ||
      episode.startStopReason === undefined
    )
      return false;
    return episode.startStopReason.code === 'VOLTOU_REFERENCIA';
  }

  function isDCReferenceEpisode(episode: Episode) {
    if (
      episode.startStopReason === null ||
      episode.startStopReason === undefined
    )
      return false;
    return episode.startStopReason.code === 'REFERIDO_DC';
  }

  function isReferenceEpisode(episode: Episode) {
    if (
      episode.startStopReason === null ||
      episode.startStopReason === undefined
    )
      return false;
    return episode.startStopReason.code === 'REFERIDO_PARA';
  }

  function isReferenceOrTransferenceEpisode(episode: Episode) {
    return episode !== null
      ? isDCReferenceEpisode(episode) ||
          isTranferenceEpisode(episode) ||
          isReferenceEpisode(episode)
      : false;
  }

  function isTranferenceEpisode(episode: Episode) {
    if (episode.startStopReason === null) return false;
    return episode.startStopReason.code === 'TRANSFERIDO_PARA';
  }

  function hasVisits(episode: Episode) {
    return episode.patientVisitDetails.length > 0;
  }

  function lastVisit(episode: Episode) {
    let lastVisit = '';
    episode.patientVisitDetails.forEach((visit: any) => {
      if (lastVisit === null || lastVisit === '') {
        lastVisit = visit;
      } else if (
        visit.patientVisit.visitDate > lastVisit.patientVisit.visitDate
      ) {
        lastVisit = visit;
      }
    });
    return lastVisit;
  }

  async function syncEpisode(episode: Episode) {
    if (episode.syncStatus === 'R') await episode.apiSave(episode);
    if (episode.syncStatus === 'U') await episode.apiUpdate(episode);
  }

  function checkIsReferedToRemove(episodes: []) {
    const episode = episodes[0];
    const startStopReasonList = [
      'REFERIDO_PARA',
      'REFERIDO_SECTOR_CLINICO',
      'REFERIDO_DC',
    ];
    return startStopReasonList.includes(episode.startStopReason.code);
  }

  function getClassName() {
    return 'episode';
  }

  return {
    closed,
    isStartEpisode,
    isCloseEpisode,
    isBackReferenceEpisode,
    isDCReferenceEpisode,
    isReferenceEpisode,
    isReferenceOrTransferenceEpisode,
    isTranferenceEpisode,
    hasVisits,
    lastVisit,
    syncEpisode,
    getClassName,
    checkIsReferedToRemove,
  };
}
