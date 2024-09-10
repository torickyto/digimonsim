import getConfig from '../next.config';

const { publicRuntimeConfig } = getConfig();

const getEnvironmentVariable = (key: string): string => {
  const value = publicRuntimeConfig[key];
  if (!value) {
    throw new Error(`Couldn't find environment variable: ${key}`);
  }
  return value;
};

export const config = {
  supabaseUrl: getEnvironmentVariable('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: getEnvironmentVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
};