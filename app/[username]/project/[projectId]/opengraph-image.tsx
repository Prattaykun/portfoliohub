import { ImageResponse } from 'next/og';
import { fetchUserData } from '../../portfolio';

export const runtime = 'edge';

export const alt = 'Project Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ username: string; projectId: string }> }) {
  const { username, projectId } = await params;
  const { data } = await fetchUserData(username);

  const project = data?.projects?.projects.find(p => p.id === projectId);

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#1e293b',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: 48,
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ display: 'flex' }}>{project?.title || 'Project'}</div>
            <div style={{ display: 'flex', fontSize: 24, marginTop: 20 }}>{project?.role || 'Role'}</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
