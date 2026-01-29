import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
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
        return existing;
      }

      // Create new workspace
      const workspace = await this.prisma.workspace.create({
        data: {
          name: dto.name,
          ownerId: dto.ownerId,
        },
      });

      return workspace;
    } catch (error) {
      throw new ConflictException('Failed to create workspace');
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
      throw new NotFoundException('Workspace not found');
    }

    // Idempotent: if already deleted, return it
    if (workspace.isDeleted) {
      return workspace;
    }

    const deleted = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return deleted;
  }

  /**
   * Restore soft-deleted workspace (Optional: for rollback recovery)
   */
  async restoreWorkspace(workspaceId: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    const restored = await this.prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return restored;
  }

  /**
   * Get workspace by ID
   */
  async getWorkspaceById(workspaceId: string): Promise<WorkspaceResponseDto> {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    return workspace;
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

    return workspaces;
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

    return workspaces;
  }
}