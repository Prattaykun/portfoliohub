import { ImageResponse } from 'next/og';
import { fetchUserData } from '../../portfolio';

export const runtime = 'edge';

export const alt = 'Project Preview';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

async function getYoutubeThumbnail(url: string): Promise<string | null> {
  const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
  const videoId = videoIdMatch ? videoIdMatch[1] : null;

  if (!videoId) return null;

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_CLOUD_KEY;

  // If API key is available, try to get high res thumbnail via API
  if (apiKey) {
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`);
      if (res.ok) {
        const data = await res.json();
        const items = data.items;
        if (items && items.length > 0) {
           const thumbnails = items[0].snippet.thumbnails;
           // Prefer maxres, then standard, then high
           return thumbnails.maxres?.url || thumbnails.standard?.url || thumbnails.high?.url || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        }
      }
    } catch (e) {
      console.error('Error fetching YouTube thumbnail:', e);
    }
  }

  // Fallback to heuristic URL if API fails or no key
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default async function Image({ params }: { params: Promise<{ username: string; projectId: string }> }) {
  const { username, projectId } = await params;
  const { data } = await fetchUserData(username);

  const project = data?.projects?.projects.find(p => p.id === projectId);

  // 1. Try to find an explicit project image
  let imageUrl = project?.media.find(m => m.type === 'image')?.url;

  // 2. If no image, try to find a YouTube video and get its thumbnail
  if (!imageUrl) {
     const videoMedia = project?.media.find(m => m.type === 'video' && (m.url.includes('youtube') || m.url.includes('youtu.be')));
     if (videoMedia) {
        imageUrl = await getYoutubeThumbnail(videoMedia.url) || undefined;
     }
  }

  // 3. Fallback to user's profile photo if neither project image nor video thumbnail is found
  if (!imageUrl) {
      imageUrl = data?.profile?.photo_url;
  }

  const fullName = data?.profile?.full_name || username;
  const projectTitle = project?.title || 'Project';

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
        {/* Glow effect */}
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, rgba(0,0,0,0) 70%)',
            borderRadius: '50%',
            filter: 'blur(60px)',
          }}
        ></div>

        {/* Image/Thumbnail */}
        {imageUrl && (
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '40px', position: 'relative' }}>
             <img
               src={imageUrl}
               width="600"
               height="337"
               style={{
                 borderRadius: '16px',
                 objectFit: 'cover',
                 border: '4px solid #c084fc',
                 boxShadow: '0 0 30px rgba(192, 132, 252, 0.4)'
               }}
             />
          </div>
        )}

        {/* Project Title */}
        <div
          style={{
            fontSize: 50,
            fontWeight: 800,
            marginBottom: '16px',
            textAlign: 'center',
            background: 'linear-gradient(to right, #c084fc, #f472b6)',
            backgroundClip: 'text',
            color: 'transparent',
            display: 'flex',
            padding: '0 40px',
            lineHeight: 1.2,
            textShadow: '0 0 20px rgba(192, 132, 252, 0.3)'
          }}
        >
          {projectTitle}
        </div>

        {/* Full Name */}
        <div style={{
             fontSize: 28,
             color: '#94a3b8',
             display: 'flex',
             marginTop: '10px'
        }}>
          by {fullName}
        </div>

      </div>
    ),
    { ...size }
  );
}
