export interface ServiceState {
  init: boolean;
  loading: boolean;
  ready: boolean;
  error: null | string;
}
