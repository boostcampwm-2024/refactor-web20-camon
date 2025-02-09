import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { Socket } from 'socket.io-client';
import * as mediasoupClient from 'mediasoup-client';
import { Transport } from 'mediasoup-client/lib/types';
import { ConnectTransportResponse, TransportInfo } from '@/shared/types/mediasoupTypes';
import { ENCODING_OPTIONS } from './encodingOptions';

export const getRoomId = (socket: Socket): Promise<string> =>
  new Promise(resolve => {
    socket.emit('createRoom', (response: { roomId: string }) => {
      resolve(response.roomId);
    });
  });

export const getRtpCapabilities = async (socket: Socket, roomId: string): Promise<RtpCapabilities> =>
  new Promise((resolve, reject) => {
    socket.emit('getRtpCapabilities', { roomId }, (response: { rtpCapabilities: RtpCapabilities }) => {
      if (response.rtpCapabilities) {
        resolve(response.rtpCapabilities);
      } else {
        reject(new Error('getRtpCapabilities Error: RTP Capabilities를 받아오지 못했습니다.'));
      }
    });
  });

export const createDevice = async (rtpCapabilities: RtpCapabilities) => {
  const newDevice = new mediasoupClient.Device();
  await newDevice.load({
    routerRtpCapabilities: rtpCapabilities,
  });
  return newDevice;
};

export const connectTransport = async (socket: Socket, device: mediasoupClient.Device, roomId: string) => {
  const transportInfo: TransportInfo = await new Promise(resolve => {
    socket.emit('createTransport', { roomId, isProducer: true }, (response: TransportInfo) => {
      resolve(response);
    });
  });

  const transport = device.createSendTransport({
    id: transportInfo.transportId,
    iceParameters: transportInfo.iceParameters,
    iceCandidates: transportInfo.iceCandidates,
    dtlsParameters: transportInfo.dtlsParameters,
  });

  transport.on('connect', async (parameters, callback) => {
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

  return { transport, transportInfo };
};

export const createProducer = async (
  socket: Socket,
  roomId: string,
  transport: Transport,
  transportInfo: TransportInfo,
  mediaStream: MediaStream,
) => {
  const handleProduce = (parameters: any, callback: any) => {
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
      },
    );
  };

  transport.on('produce', handleProduce);

  const producers = new Map();

  try {
    await Promise.all(
      mediaStream.getTracks().map(async track => {
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

        const producer = await transport.produce(producerConfig);
        producers.set(track.kind, producer);
      }),
    );

    return producers;
  } finally {
    transport.off('produce', handleProduce);
  }
};
