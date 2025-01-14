import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { PlayIcon } from '@/shared/components/Icons';
import { RecordData } from '.';
import axiosInstance from '@/shared/services/axios';
import ErrorCharacter from '@/shared/components/ErrorCharacter';

type RecordListProps = {
  onClickList: (data: RecordData) => void;
};

function RecordList(props: RecordListProps) {
  const [recordList, setRecordList] = useState<RecordData[]>([]);
  const { attendanceId } = useParams<{ attendanceId: string }>();
  const [error, setError] = useState<string>('');

  const { onClickList } = props;

  useEffect(() => {
    axiosInstance.get(`/v1/records/${attendanceId}`).then(response => {
      if (response.data.success) setRecordList(response.data.data.records);
      else setError(response.data.message);
    });
  }, [attendanceId]);

  return (
    <div className="flex h-full w-full border border-border-default rounded p-5 overflow-hidden">
      {error ? (
        <div>
          <ErrorCharacter size={100} message="녹화 영상 목록 조회에 실패했습니다" />
        </div>
      ) : (
        <div className="h-full w-full overflow-y-auto">
          <div className="flex flex-col gap-6">
            {recordList.map((record: RecordData) => (
              <button
                key={record.recordId}
                type="button"
                className="flex flex-row w-full h-12 justify-center items-center rounded gap-3 overflow-hidden bg-surface-alt cursor-pointer"
                onClick={() =>
                  onClickList({
                    recordId: record.recordId,
                    title: record.title,
                    video: record.video,
                    date: record.date,
                  })
                }
              >
                <PlayIcon />
                <p className="w-4/5 text-text-default text-display-medium16 truncate">{record.title}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default RecordList;
