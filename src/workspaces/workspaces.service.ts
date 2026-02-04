import { Injectable } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspaceResponseDto } from './workspace-response.dto';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new workspace (Saga Step 1)
   * Idempotent: If workspace with same ownerId and name exists, return it
   */
  async createWorkspace(dto: CreateWorkspaceDto): Promise<WorkspaceResponseDto> {
    try {
      // Check if already exists (idempotency)
      const existing = await this.prisma.workspace.findFirst({
        where: {
          ownerId: dto.ownerId,
          name: dto.name,
          isDeleted: false,
        },
      });

      if (existing) {
        return this.toResponseDto(existing);
      }

      // Create new workspace
      const workspace = await this.prisma.workspace.create({
        data: {
          name: dto.name,
          ownerId: dto.ownerId,
        },
      });

      return this.toResponseDto(workspace);
    } catch (error) {
      throw new RpcException({
        code: 13, // INTERNAL
        message: 'Failed to create workspace',
        error: error.message,
      });
    }
  }

  /**
   * Soft delete workspace (Saga Compensation)
   * Used when account creation fails
   */
  async softDeleteWorkspace(workspaceId: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: 'Workspace not found',
      });
    }

    // Idempotent: if already deleted, return it
    if (workspace.isDeleted) {
      return this.toResponseDto(workspace);
    }

    const deleted = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return this.toResponseDto(deleted);
  }

  /**
   * Restore soft-deleted workspace (Optional: for rollback recovery)
   */
  async restoreWorkspace(workspaceId: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: 'Workspace not found',
      });
    }

    const restored = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return this.toResponseDto(restored);
  }

  /**
   * Get workspace by ID
   */
  async getWorkspaceById(workspaceId: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new RpcException({
        code: 5, // NOT_FOUND
        message: 'Workspace not found',
      });
    }

    return this.toResponseDto(workspace);
  }

  /**
   * Get all workspaces for an account
   */
  async getWorkspacesByOwnerId(ownerId: string): Promise<WorkspaceResponseDto[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        ownerId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workspaces.map(workspace => this.toResponseDto(workspace));
  }

  /**
   * Get all workspaces (including deleted) for an account
   * Used by orchestrator for verification
   */
  async getAllWorkspacesByOwnerId(ownerId: string): Promise<WorkspaceResponseDto[]> {
    const workspaces = await this.prisma.workspace.findMany({
      where: {
        ownerId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return workspaces.map(workspace => this.toResponseDto(workspace));
  }

  /**
   * Prisma model'den DTO'ya dönüştürme helper
   */
  private toResponseDto(workspace: any): WorkspaceResponseDto {
    return {
      id: workspace.id,
      name: workspace.name,
      ownerId: workspace.ownerId,
      isDeleted: workspace.isDeleted,
      deletedAt: workspace.deletedAt 
        ? (workspace.deletedAt instanceof Date 
            ? workspace.deletedAt.toISOString() 
            : new Date(workspace.deletedAt).toISOString())
        : null,
      createdAt: workspace.createdAt instanceof Date 
        ? workspace.createdAt.toISOString() 
        : new Date(workspace.createdAt).toISOString(),
      updatedAt: workspace.updatedAt instanceof Date 
        ? workspace.updatedAt.toISOString() 
        : new Date(workspace.updatedAt).toISOString(),
    };
  }
}