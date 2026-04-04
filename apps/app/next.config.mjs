import './src/env.mjs';

/** @type {import('next').NextConfig} */
const nextConfig = {
	turbopack: {},
	transpilePackages: ['@v1/supabase'],
	images: {
		remotePatterns: [],
	},
	experimental: {
		instrumentationHook: process.env.NODE_ENV === 'production',
	},
	redirects:
		process.env.NODE_ENV === 'production'
			? undefined
			: async () => {
					return [
						{
							source: '/_db',
							destination: 'http://localhost:54323',
							basePath: false,
							permanent: false,
						},
						{
							source: '/_email',
							destination: 'http://localhost:54324',
							basePath: false,
							permanent: false,
						},
					];
			  },
};

export default nextConfig;
