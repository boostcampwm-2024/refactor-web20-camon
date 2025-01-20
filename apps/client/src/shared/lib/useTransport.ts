import * as mediasoupClient from 'mediasoup-client';
import { useEffect, useState, useRef } from 'react';
import { RtpCapabilities } from 'mediasoup-client/lib/RtpParameters';
import { Device } from 'mediasoup-client/lib/types';
import { Socket } from 'socket.io-client';
import { checkDependencies } from '@/shared/lib/utils';
import { TransportInfo } from '@/shared/types/mediasoupTypes';

type UseTransportProps = {
  socket: Socket | null;
  roomId: string | undefined;
  isProducer: boolean;
};

export const useTransport = ({ socket, roomId, isProducer = false }: UseTransportProps) => {
  const [transportInfo, setTransportInfo] = useState<TransportInfo | null>(null);
  const [transportError, setTransportError] = useState<Error | null>(null);
  const deviceRef = useRef<Device | null>(null);

  useEffect(() => {
    if (!socket || !roomId) {
      return undefined;
    }

    const getRtpCapabilities = async () => {
      if (!socket || !roomId) {
        const dependencyError = checkDependencies('getRtpCapabilities', { socket, roomId });
        setTransportError(dependencyError);
        return undefined;
      }

      const rtpCapabilities: RtpCapabilities = await new Promise((resolve, reject) => {
        socket.emit('getRtpCapabilities', { roomId }, (response: { rtpCapabilities: RtpCapabilities }) => {
          if (response.rtpCapabilities) {
            resolve(response.rtpCapabilities);
          } else {
            reject(new Error('getRtpCapabilities Error: RTP Capabilities를 받아오지 못했습니다.'));
          }
        });
      });
      return rtpCapabilities;
    };

    const createDevice = async (rtpCapabilities: RtpCapabilities) => {
      if (!rtpCapabilities) {
        setTransportError(new Error('createDevice Error: RTP Capabilities가 없습니다.'));
        return undefined;
      }

      const newDevice = new mediasoupClient.Device();
      await newDevice.load({
        routerRtpCapabilities: rtpCapabilities,
      });
      return newDevice;
    };

    const createTransport = async (device: Device) => {
      if (!socket || !device || !roomId) {
        const dependencyError = checkDependencies('createTransport', { socket, device, roomId });
        setTransportError(dependencyError);
        return;
      }

      socket.emit('createTransport', { roomId, isProducer }, (response: TransportInfo) => {
        setTransportInfo(response);
      });
    };

    const initializeTransport = async () => {
      if (!socket || !roomId) return;

      const rtpCapabilities = await getRtpCapabilities();
      if (!rtpCapabilities) return;

      const newDevice = await createDevice(rtpCapabilities);
      if (!newDevice) return;
      deviceRef.current = newDevice;

      await createTransport(newDevice);
    };

    initializeTransport();

    return () => {
      if (deviceRef.current) {
        deviceRef.current = null;
      }
      setTransportInfo(null);
      setTransportError(null);
    };
  }, [socket, roomId, isProducer]);

  return {
    transportInfo,
    device: deviceRef.current,
    transportError,
  };
};
