import dynamic from 'next/dynamic';

const BuilderEditor = dynamic(
  () => import('@/modules/builder').then((mod) => mod.BuilderEditor),
  { ssr: false }
);

export default function BuilderPage() {
  return <BuilderEditor />;
}
