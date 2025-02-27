export function formatDateTime(fecha: string): string {
  // Crear objeto Date a partir del string
  const date = new Date(fecha);

  // Obtener los componentes de la fecha
  const año = date.getFullYear();
  const mes = String(date.getMonth() + 1).padStart(2, "0");
  const dia = String(date.getDate()).padStart(2, "0");
  const hora = String(date.getHours()).padStart(2, "0");
  const minutos = String(date.getMinutes()).padStart(2, "0");

  // Retornar el string formateado
  return `${año}-${mes}-${dia} ${hora}:${minutos}`;
}

export function formatDateTimeForInput(fecha: string) {
  return fecha.slice(0, 16);
}

export let currentDate = (): string => new Date().toISOString();
