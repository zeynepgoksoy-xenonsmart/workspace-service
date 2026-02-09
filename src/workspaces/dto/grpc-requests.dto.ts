import { IsString, IsNotEmpty, IsUUID, IsOptional } from 'class-validator';

/**
 * CreateWorkspaceRequest DTO
 * Workspace oluşturma için gRPC request mesajı
 */
export class CreateWorkspaceRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  ownerId: string; // accountId from account-service

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  country?: string;
}

/**
 * CompensateWorkspaceRequest DTO
 * Saga compensation için gRPC request mesajı
 */
export class CompensateWorkspaceRequest {
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}

/**
 * GetWorkspaceRequest DTO
 * Workspace sorgulama için gRPC request mesajı
 */
export class GetWorkspaceRequest {
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}

/**
 * GetWorkspacesByOwnerIdRequest DTO
 * Owner ID'ye göre workspace listeleme için gRPC request mesajı
 */
export class GetWorkspacesByOwnerIdRequest {
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;
}

/**
 * RestoreWorkspaceRequest DTO
 * Workspace restore için gRPC request mesajı
 */
export class RestoreWorkspaceRequest {
  @IsString()
  @IsNotEmpty()
  workspaceId: string;
}

/**
 * Empty DTO
 * Boş request mesajı (HealthCheck için)
 */
export class Empty {}

