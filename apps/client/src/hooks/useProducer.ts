import { useEffect, useRef, useState } from 'react';
import { Transport, Device, Producer } from 'mediasoup-client/lib/types';
import { Socket } from 'socket.io-client';
import { ConnectTransportResponse, TransportInfo } from '@/types/mediasoupTypes';
import { checkDependencies } from '@/utils/utils';
import { ENCODING_OPTIONS } from '@/constants/videoOptions';

interface UseProducerProps {
  socket: Socket | null;
  // tracks: Tracks;
  // isStreamReady: boolean;
  mediaStream: MediaStream | null;
  isMediaStreamReady: boolean;
  roomId: string;
  device: Device | null;
  transportInfo: TransportInfo | null;
}

interface UseProducerReturn {
  transport: Transport | null;
  error: Error | null;
  producerId: string;
  producers: Map<string, Producer>;
}

export const useProducer = ({
  socket,
  mediaStream,
  isMediaStreamReady,
  roomId,
  device,
  transportInfo,
}: UseProducerProps): UseProducerReturn => {
  const transportRef = useRef<Transport | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [producerId, setProducerId] = useState<string>('');
  const [producers, setProducers] = useState<Map<string, Producer>>(new Map());

  useEffect(() => {
    if (!socket || !device || !roomId || !mediaStream || !isMediaStreamReady || !transportInfo) {
      return undefined;
    }

    const createTransport = async () => {
      if (!socket || !device || !roomId || !transportInfo) {
        const dependencyError = checkDependencies('createTransport', { socket, device, roomId, transportInfo });
        setError(dependencyError);
        return;
      }

      setError(null);

      const newTransport = device.createSendTransport({
        id: transportInfo.transportId,
        iceParameters: transportInfo.iceParameters,
        iceCandidates: transportInfo.iceCandidates,
        dtlsParameters: transportInfo.dtlsParameters,
      });

      transportRef.current = newTransport;

      transportRef.current.on('connect', async (parameters, callback) => {
        socket.emit(
          'connectTransport',
          {
            roomId,
            dtlsParameters: parameters.dtlsParameters,
            transportId: transportInfo.transportId,
          },
          (response: ConnectTransportResponse) => {
            if (response.connected) {
              callback();
            }
          },
        );
      });
    };

    const createProducer = async () => {
      if (!transportRef.current || !transportInfo || !socket || !mediaStream) {
        const dependencyError = checkDependencies('createProducer', {
          socket,
          mediaStream,
          transport: transportRef.current,
          transportInfo,
        });
        setError(dependencyError);
        return;
      }

      setError(null);

      transportRef.current!.on('produce', (parameters, callback) => {
        socket.emit(
          'createProducer',
          {
            roomId,
            transportId: transportInfo.transportId,
            kind: parameters.kind,
            rtpParameters: parameters.rtpParameters,
          },
          (response: { producerId: string }) => {
            callback({ id: response.producerId });
            setProducerId(response.producerId);
          },
        );
      });

      mediaStream.getTracks().forEach(track => {
        const producerConfig: Record<string, unknown> = {
          track,
          stopTracks: false,
        };

        if (track.kind === 'video') {
          producerConfig.encodings = ENCODING_OPTIONS;
          producerConfig.codecOptions = {
            videoGoogleStartBitrate: 1000,
          };
        }

        transportRef.current!.produce(producerConfig).then(producer => {
          setProducers(prev => new Map(prev).set(track.kind, producer));
        });
      });
    };

    createTransport()
      .then(() => createProducer())
      .catch(err => setError(err instanceof Error ? err : new Error('Producer initialization failed')));

    return () => {
      if (transportRef.current) {
        transportRef.current.close();
        transportRef.current = null;
      }
    };
  }, [socket, device, roomId, transportInfo, isMediaStreamReady, mediaStream]);

  return {
    transport: transportRef.current,
    error,
    producerId,
    producers,
  };
};
