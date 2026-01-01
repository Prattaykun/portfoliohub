import { ImageResponse } from 'next/og';
import { fetchUserData } from '../../portfolio';

export const runtime = 'edge';

export const alt = 'Project Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default async function Image({ params }: { params: Promise<{ username: string; projectId: string }> }) {
  const { username, projectId } = await params;
  const { data } = await fetchUserData(username);

  const project = data?.projects?.projects.find(p => p.id === projectId);

  if (!project) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 48,
            background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
          }}
        >
          Project Not Found
        </div>
      ),
      { ...size }
    );
  }

  let projectImage = project.media.find(m => m.type === 'image')?.url;

  // If no direct image, try to get a YouTube thumbnail
  if (!projectImage) {
    const video = project.media.find(m => m.type === 'video');
    if (video && video.url) {
      const videoId = getYouTubeVideoId(video.url);
      if (videoId) {
        projectImage = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    }
  }

  // Fallback to profile photo if still no image
  const profilePhoto = data?.profile?.photo_url;

  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '60px',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Accent */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            right: '-10%',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
          }}
        />

        <div style={{ display: 'flex', justifyContent: 'space-between', height: '100%', gap: '40px', zIndex: 10 }}>
          {/* Left side: Content */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center' }}>
             {/* Profile Info */}
             <div style={{ display: 'flex', alignItems: 'center', marginBottom: '30px' }}>
                {profilePhoto && (
                  <img
                    src={profilePhoto}
                    width="48"
                    height="48"
                    style={{ borderRadius: '50%', marginRight: '16px', objectFit: 'cover', border: '2px solid rgba(168, 85, 247, 0.5)' }}
                  />
                )}
                <div style={{ fontSize: 24, color: '#cbd5e1', fontWeight: 500 }}>{data?.profile?.full_name}</div>
             </div>

            <h1
              style={{
                fontSize: 64,
                fontWeight: 800,
                marginBottom: '16px',
                background: 'linear-gradient(to right, #c084fc, #f472b6)',
                backgroundClip: 'text',
                color: 'transparent',
                lineHeight: 1.1,
                display: 'flex'
              }}
            >
              {project.title}
            </h1>

            <div style={{ fontSize: 32, color: '#e2e8f0', marginBottom: '24px', fontWeight: 600 }}>
              {project.role}
            </div>

            <div style={{
              fontSize: 24,
              color: '#94a3b8',
              lineHeight: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              marginBottom: 'auto'
            }}>
              {project.overview.length > 180 ? project.overview.substring(0, 180) + '...' : project.overview}
            </div>

            {/* Tech Stack */}
            {project.techStack && project.techStack.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginTop: '30px' }}>
                {project.techStack.slice(0, 4).map((tech, i) => (
                  <div key={i} style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: 20,
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    {tech.name}
                  </div>
                ))}
                {project.techStack.length > 4 && (
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontSize: 20,
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    +{project.techStack.length - 4}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right side: Project Image */}
          {projectImage && (
             <div style={{ display: 'flex', width: '500px', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                   display: 'flex',
                   borderRadius: '24px',
                   overflow: 'hidden',
                   border: '1px solid rgba(168, 85, 247, 0.2)',
                   boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                   width: '100%',
                   position: 'relative',
                   background: '#1e293b'
                }}>
                  <img
                    src={projectImage}
                    style={{
                      width: '100%',
                      height: 'auto',
                      objectFit: 'cover',
                    }}
                  />
                </div>
             </div>
          )}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
