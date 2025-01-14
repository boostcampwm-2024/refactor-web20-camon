import { useEffect, useState } from 'react';
import Attendance from './ui/Attendance';
import UserInfo from './ui/UserInfo';
import EditUserInfo from './ui/EditUserInfo';
import axiosInstance from '@/shared/api/axios';
import { Field } from '@/shared/types/liveTypes';
import ErrorCharacter from '@/shared/ui/ErrorCharacter';
import LoadingCharacter from '@/shared/ui/LoadingCharacter';

export type Contacts = {
  email: string;
  github: string;
  blog: string;
  linkedIn: string;
};

export type UserData = {
  id: number;
  camperId: string;
  name: string;
  field: Field;
  contacts: Contacts;
  profileImage: string;
};

export function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    axiosInstance
      .get('/v1/members/info')
      .then(response => {
        if (response.data.success) {
          setUserData(response.data.data);
        } else {
          setError(new Error(response.data.message));
        }
      })
      .catch(err => setError(err instanceof Error ? err : new Error(err)))
      .finally(() => setIsLoading(false));
  }, [isEditing]);

  useEffect(() => {
    if (!userData) return;
    if (!userData.camperId || !userData.name || !userData.field) {
      if (!isEditing) setIsEditing(true);
    }
  }, [userData, isEditing]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowLoading(false);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, []);

  const toggleEditing = () => {
    setIsEditing(prev => !prev);
  };

  if (showLoading && isLoading) {
    return (
      <div className="flex justify-center items-center">
        <LoadingCharacter size={200} />
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="flex justify-center items-center">
        <ErrorCharacter size={200} message={`${'프로필 조회 실패'}`} />
      </div>
    );
  }

  if (isEditing) {
    return <EditUserInfo userData={userData} toggleEditing={toggleEditing} />;
  }

  return (
    <>
      <UserInfo userData={userData} toggleEditing={toggleEditing} error={error} isLoading={isLoading} />
      <Attendance />
    </>
  );
}
