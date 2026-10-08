import { request, POST } from '../api/apiClient';
import { toSnakeDeep } from '../api/backend';
import AlertType from '../models/notification/AlertType';

const ENDPOINT = 'api/v1/alert-types';

export const AlertTypeService = {
  // POST /api/v1/alert-types — { code, name, severity: INFO|WARNING|CRITICAL, channel?: DASHBOARD|EMAIL|PUSH }.
  // El listado (GET) ya lo consume useDashboardViewModel; no se duplica aquí.
  create: async ({ code, name, severity, channel }) => {
    const data = await request({
      method: POST,
      url: ENDPOINT,
      data: { code, name, severity, ...(channel ? { channel } : {}) },
      requiresAuth: false,
    });
    return AlertType.fromApi(toSnakeDeep(data));
  },
};
