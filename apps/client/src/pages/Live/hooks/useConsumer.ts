import { useEffect, useRef, useState } from 'react';
import { Transport, Device, MediaKind } from 'mediasoup-client/lib/types';
import { Socket } from 'socket.io-client';
import { checkDependencies } from '@/shared/lib/utils/utils';
import { ConnectTransportResponse, TransportInfo } from '@/shared/types/mediasoupTypes';

type UseConsumerProps = {
  socket: Socket | null;
  device: Device | null;
  roomId: string | undefined;
  transportInfo: TransportInfo | null;
  isConnected: boolean;
};

export type CreateConsumer = {
  consumerId: string;
  producerId: string;
  kind: MediaKind;
  rtpParameters: any;
};

export type CreateConsumerResponse = {
  consumers: CreateConsumer[];
};

export const useConsumer = ({ socket, device, roomId, transportInfo, isConnected }: UseConsumerProps) => {
  const transportRef = useRef<Transport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [mediastream, setMediastream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!socket || !isConnected || !roomId || !transportInfo || !device) {
      return undefined;
    }

    const connectTransport = async () => {
      if (!socket || !transportInfo || !device || !roomId) {
        const dependencyError = checkDependencies('connectTransport', { socket, transportInfo, device, roomId });
        setError(dependencyError);
        return;
      }

      setError(null);

      const newTransport = device.createRecvTransport({
        id: transportInfo.transportId,
        iceParameters: transportInfo.iceParameters,
        iceCandidates: transportInfo.iceCandidates,
        dtlsParameters: transportInfo.dtlsParameters,
      });

      transportRef.current = newTransport;

      transportRef.current.on('connect', async ({ dtlsParameters }, callback) => {
        const connectTransportResponse = await new Promise<ConnectTransportResponse>((resolve, reject) => {
          socket.emit(
            'connectTransport',
            {
              roomId,
              dtlsParameters,
              transportId: transportInfo.transportId,
            },
            (response: ConnectTransportResponse) => {
              if (response.connected) {
                resolve(response);
              } else {
                reject(new Error('Transport connection failed'));
              }
            },
          );
        });
        callback();
        return connectTransportResponse;
      });
    };

    const createConsumer = async () => {
      if (!transportRef.current || !socket || !transportInfo) {
        const dependencyError = checkDependencies('createConsumer', { socket, transportRef, transportInfo });
        setError(dependencyError);
        return;
      }

      setError(null);

      socket.emit(
        'createConsumer',
        {
          roomId,
          transportId: transportInfo.transportId,
        },
        async ({ consumers }: CreateConsumerResponse) => {
          const newMediastream = new MediaStream();
          await Promise.all(
            consumers.map(async consumerData => {
              const consumer = await transportRef.current!.consume({
                id: consumerData.consumerId,
                producerId: consumerData.producerId,
                rtpParameters: consumerData.rtpParameters,
                kind: consumerData.kind,
              });

              if (consumer.track.kind === 'video') {
                consumer.track.enabled = true;
              }
              newMediastream.addTrack(consumer.track);
              consumer.resume();
            }),
          );

          setMediastream(newMediastream);
        },
      );
    };

    connectTransport()
      .then(() => createConsumer())
      .then(() => setIsLoading(false))
      .catch(err => setError(err instanceof Error ? err : new Error('Consumer initialization failed')));

    return () => {
      if (transportRef.current) {
        transportRef.current.close();
        transportRef.current = null;
      }
      setMediastream(null);
    };
  }, [socket, isConnected, transportInfo, device, roomId]);

  return {
    transport: transportRef.current,
    mediastream,
    error,
    isLoading,
  };
};
