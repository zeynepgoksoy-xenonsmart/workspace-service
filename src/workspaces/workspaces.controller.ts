import {
    Controller,
    Get,
    Post,
    Delete,
    Param,
    Body,
    HttpCode,
    HttpStatus,
  } from '@nestjs/common';
  import { WorkspacesService } from './workspaces.service';
  import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { WorkspaceResponseDto } from './workspace-response.dto';
  
  @Controller('workspaces')
  export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}
  
    /**
     * Create workspace (Called by Orchestrator - Saga Step)
     * POST /workspaces
     */
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async createWorkspace(
      @Body() createWorkspaceDto: CreateWorkspaceDto,
    ): Promise<WorkspaceResponseDto> {
      return this.workspacesService.createWorkspace(createWorkspaceDto);
    }
  
    /**
     * Soft delete workspace (Called by Orchestrator - Saga Compensation)
     * DELETE /workspaces/:id/soft
     */
    @Delete(':id/soft')
    @HttpCode(HttpStatus.OK)
    async softDeleteWorkspace(
      @Param('id') id: string,
    ): Promise<WorkspaceResponseDto> {
      return this.workspacesService.softDeleteWorkspace(id);
    }
  
    /**
     * Restore workspace (Optional - for manual recovery)
     * POST /workspaces/:id/restore
     */
    @Post(':id/restore')
    @HttpCode(HttpStatus.OK)
    async restoreWorkspace(
      @Param('id') id: string,
    ): Promise<WorkspaceResponseDto> {
      return this.workspacesService.restoreWorkspace(id);
    }
  
    /**
     * Get workspace by ID
     * GET /workspaces/:id
     */
    @Get(':id')
    async getWorkspaceById(@Param('id') id: string): Promise<WorkspaceResponseDto> {
      return this.workspacesService.getWorkspaceById(id);
    }
  
    /**
     * Get all active workspaces for an account
     * GET /workspaces/account/:accountId
     */
    @Get('account/:accountId')
    async getWorkspacesByOwnerId(
      @Param('accountId') accountId: string,
    ): Promise<WorkspaceResponseDto[]> {
      return this.workspacesService.getWorkspacesByOwnerId(accountId);
    }
  
    /**
     * Get all workspaces (including deleted) for an account
     * GET /workspaces/account/:accountId/all
     * Used by orchestrator for verification
     */
    @Get('account/:accountId/all')
    async getAllWorkspacesByOwnerId(
      @Param('accountId') accountId: string,
    ): Promise<WorkspaceResponseDto[]> {
      return this.workspacesService.getAllWorkspacesByOwnerId(accountId);
    }
  
    /**
     * Health check endpoint for orchestrator
     * GET /workspaces/health
     */
    @Get('health')
    healthCheck(): { status: string; service: string } {
      return {
        status: 'ok',
        service: 'workspace-service',
      };
    }
  }