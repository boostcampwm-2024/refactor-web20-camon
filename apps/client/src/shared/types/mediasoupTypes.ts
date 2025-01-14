import { DtlsParameters, IceCandidate, IceParameters } from 'mediasoup-client/lib/types';

export type TransportInfo = {
  transportId: string;
  isProducer: boolean;
  iceParameters: IceParameters;
  iceCandidates: IceCandidate[];
  dtlsParameters: DtlsParameters;
};

export type ConnectTransportResponse = {
  connected: boolean;
  isProducer: boolean;
};

export type Tracks = {
  video: MediaStreamTrack | undefined;
  mediaAudio: MediaStreamTrack | undefined;
  screenAudio: MediaStreamTrack | undefined;
};
