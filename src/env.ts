const getEnvironmentVariable = (environmentVariable: string): string => {
    const unvalidatedEnvironmentVariable = process.env[environmentVariable];
    if (!unvalidatedEnvironmentVariable) {
      throw new Error(`Couldn't find environment variable: ${environmentVariable}`);
    } else {
      return unvalidatedEnvironmentVariable;
    }
  };
  
  export const config = {
    supabaseUrl: getEnvironmentVariable('NEXT_PUBLIC_SUPABASE_URL'),
    supabaseAnonKey: getEnvironmentVariable('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };