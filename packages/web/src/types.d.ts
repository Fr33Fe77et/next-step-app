// packages/web/src/types.d.ts
interface GapiAuth2Instance {
    getAuthInstance(): {
      signOut(): Promise<void>;
    };
  }
  
  interface Gapi {
    load(api: string, callback: () => void): void;
    client: any;
    auth2: GapiAuth2Instance;
  }
  
  declare global {
    interface Window {
      gapi: Gapi;
    }
  }
  
  export {};