import { useState } from 'react';
import RecordInfo from './ui/RecordInfo';
import RecordList from './ui/RecordList';
import RecordPlayer from './ui/RecordPlayer';

export type RecordData = {
  recordId: number;
  title: string;
  video: string;
  date: string;
};

export function RecordPage() {
  const [nowPlaying, setIsNowPlaying] = useState<RecordData>({ recordId: 0, title: '', video: '', date: '' });

  return (
    <div className="flex flex-row w-full h-full gap-10">
      <div className="flex flex-col flex-grow gap-4 h-full ml-8">
        <RecordPlayer video={nowPlaying.video} />
        <RecordInfo title={nowPlaying.title} />
      </div>
      <div className="h-full w-80 pr-5">
        <RecordList onClickList={setIsNowPlaying} />
      </div>
    </div>
  );
}
