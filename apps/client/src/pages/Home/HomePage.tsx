import { Banner, LiveList } from './ui';

export function HomePage() {
  return (
    <div className="flex flex-col justify-start w-full min-h-[calc(100vh-74px)]">
      <Banner />
      <LiveList />
    </div>
  );
}
