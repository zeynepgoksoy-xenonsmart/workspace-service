import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { WorkspacesService } from './workspaces.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspaceResponseDto } from './workspace-response.dto';
import {
  CreateWorkspaceRequest,
  CompensateWorkspaceRequest,
  GetWorkspaceRequest,
  GetWorkspacesByOwnerIdRequest,
  RestoreWorkspaceRequest,
  Empty,
} from './dto/grpc-requests.dto';
import { ListWorkspacesResponse } from './dto/list-workspaces-response.dto';
import { HealthCheckResponse } from './dto/health-check-response.dto';

@Controller('workspaces')
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  /**
   * CreateWorkspace
   * Workspace oluşturur (Saga adımı)
   */
  @GrpcMethod('WorkspaceService', 'CreateWorkspace')
  async createWorkspace(
    data: CreateWorkspaceRequest,
  ): Promise<WorkspaceResponseDto> {
    const createDto: CreateWorkspaceDto = {
      name: data.name,
      ownerId: data.ownerId,
      address: data.address,
      country: data.country,
    };
    return this.workspacesService.createWorkspace(createDto);
  }

  /**
   * CompensateWorkspace
   * Saga compensation endpoint'i
   * Account oluşturulurken hata olursa orchestrator bu metodu çağırır
   * Workspace'i soft delete yapar
   */
  @GrpcMethod('WorkspaceService', 'CompensateWorkspace')
  async compensateWorkspace(
    data: CompensateWorkspaceRequest,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.softDeleteWorkspace(data.workspaceId);
  }

  /**
   * RestoreWorkspace
   * Workspace restore (manuel recovery için)
   */
  @GrpcMethod('WorkspaceService', 'RestoreWorkspace')
  async restoreWorkspace(
    data: RestoreWorkspaceRequest,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.restoreWorkspace(data.workspaceId);
  }

  /**
   * GetWorkspace
   * ID'ye göre workspace getirir
   */
  @GrpcMethod('WorkspaceService', 'GetWorkspace')
  async getWorkspaceById(
    data: GetWorkspaceRequest,
  ): Promise<WorkspaceResponseDto> {
    return this.workspacesService.getWorkspaceById(data.workspaceId);
  }

  /**
   * GetWorkspacesByOwnerId
   * Owner ID'ye göre aktif workspace'leri listeler
   */
  @GrpcMethod('WorkspaceService', 'GetWorkspacesByOwnerId')
  async getWorkspacesByOwnerId(
    data: GetWorkspacesByOwnerIdRequest,
  ): Promise<ListWorkspacesResponse> {
    const workspaces =
      await this.workspacesService.getWorkspacesByOwnerId(data.ownerId);
    return {
      workspaces,
      total: workspaces.length,
    };
  }

  /**
   * GetAllWorkspacesByOwnerId
   * Owner ID'ye göre tüm workspace'leri listeler (deleted dahil)
   * Orchestrator verification için kullanılır
   */
  @GrpcMethod('WorkspaceService', 'GetAllWorkspacesByOwnerId')
  async getAllWorkspacesByOwnerId(
    data: GetWorkspacesByOwnerIdRequest,
  ): Promise<ListWorkspacesResponse> {
    const workspaces =
      await this.workspacesService.getAllWorkspacesByOwnerId(data.ownerId);
    return {
      workspaces,
      total: workspaces.length,
    };
  }

  /**
   * HealthCheck
   * Health check endpoint'i
   */
  @GrpcMethod('WorkspaceService', 'HealthCheck')
  healthCheck(_data?: Empty): HealthCheckResponse {
    return {
      status: 'ok',
      service: 'workspace-service',
    };
  }
}