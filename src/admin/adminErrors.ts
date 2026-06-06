import { ApiError } from '@/services/apiClient';

type AdminErrorMessageOptions = {
  unauthorized?: string;
};

export function adminErrorMessage(error: unknown, fallback: string, options: AdminErrorMessageOptions = {}) {
  if (!(error instanceof ApiError)) return fallback;

  if (error.status === 401) {
    return options.unauthorized ?? 'Tu sesión expiró. Vuelve a iniciar sesión para continuar.';
  }

  if (error.status === 403) {
    return 'No tienes permisos para realizar esta acción.';
  }

  if (error.status === 400) {
    return 'Revisa los campos del formulario e inténtalo de nuevo.';
  }

  if (error.status === 404) {
    return 'El recurso solicitado ya no existe o fue eliminado.';
  }

  if (error.status === 409) {
    return 'No fue posible completar la acción porque la información cambió. Actualiza la página e inténtalo de nuevo.';
  }

  if (error.status >= 500) {
    return 'El servidor no pudo completar la solicitud. Inténtalo de nuevo en unos minutos.';
  }

  if (error.status === 429) {
    return 'Se hicieron demasiados intentos. Espera unos minutos antes de continuar.';
  }

  return error.message || fallback;
}
