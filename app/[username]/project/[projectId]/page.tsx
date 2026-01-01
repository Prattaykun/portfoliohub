import { Metadata, ResolvingMetadata } from 'next';
import { cache } from 'react';
import PortfolioPage from '../../page';
import { fetchUserData } from '../../portfolio';

// Cache the data fetch so it's not called twice (once for metadata, once for render)
const getCachedUserData = cache(async (username: string) => {
  return fetchUserData(username);
});

type Props = {
  params: Promise<{ username: string; projectId: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const { username, projectId } = await params;

  // fetch data
  const { data, error } = await getCachedUserData(username);

  if (!data || error) {
    return {
      title: 'Project Not Found',
    };
  }

  // find project
  const project = data.projects?.projects.find(p => p.id === projectId);

  if (!project) {
    return {
      title: 'Project Not Found',
    };
  }

  return {
    title: `${project.title} | ${data.profile.full_name}`,
    description: project.overview,
    openGraph: {
      title: project.title,
      description: project.overview,
      url: `https://portfoliohub-pi.vercel.app/${username}/project/${projectId}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: project.overview,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { username } = await params;
  const { data } = await getCachedUserData(username);

  // We pass initialData to PortfolioPage so it doesn't need to fetch on client
  return <PortfolioPage initialData={data} />;
}
