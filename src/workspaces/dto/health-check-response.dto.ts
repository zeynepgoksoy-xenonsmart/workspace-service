/**
 * HealthCheckResponse DTO
 * Health check için gRPC response mesajı
 */
export class HealthCheckResponse {
  status: string;
  service: string;
}

