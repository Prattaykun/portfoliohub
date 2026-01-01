import { ImageResponse } from 'next/og';
import { fetchUserData } from './portfolio';

export const runtime = 'edge';

export const alt = 'Portfolio Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ username: string }> }) {
  const { username } = await params;
  const { data } = await fetchUserData(username);

  // Fallback to profile photo if available
  const profilePhoto = data?.profile?.photo_url;
  const fullName = data?.profile?.full_name || username;
  const roles = data?.about?.roles || ['Software Engineer', 'Developer'];
  const bio = data?.about?.bio || `Check out ${fullName}'s portfolio.`;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Glow effect behind profile */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '300px',
            height: '300px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            filter: 'blur(40px)',
          }}
        ></div>

        {/* Profile Photo */}
        {profilePhoto && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px', position: 'relative' }}>
             <img
               src={profilePhoto}
               width="180"
               height="180"
               style={{
                 borderRadius: '50%',
                 objectFit: 'cover',
                 border: '4px solid #c084fc',
                 boxShadow: '0 0 20px rgba(192, 132, 252, 0.5)'
               }}
             />
          </div>
        )}

        {/* Name */}
        <div
          style={{
            fontSize: 60,
            fontWeight: 800,
            marginBottom: '16px',
            textAlign: 'center',
            background: 'linear-gradient(to right, #c084fc, #f472b6)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'flex'
          }}
        >
          {fullName}
        </div>

        {/* Roles */}
        {roles.length > 0 && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
             {roles.slice(0, 3).map((role, i) => (
               <div key={i} style={{
                 fontSize: 24,
                 color: '#e2e8f0',
                 padding: '8px 20px',
                 background: 'rgba(255,255,255,0.1)',
                 borderRadius: '9999px',
                 border: '1px solid rgba(255,255,255,0.2)',
                 display: 'flex'
               }}>
                 {role}
               </div>
             ))}
          </div>
        )}

        {/* Bio Excerpt */}
        {bio && (
          <div style={{
            fontSize: 22,
            color: '#94a3b8',
            maxWidth: '800px',
            textAlign: 'center',
            lineHeight: 1.4,
            display: 'flex',
            padding: '0 20px',
          }}>
            {bio.length > 100 ? bio.substring(0, 100) + '...' : bio}
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
