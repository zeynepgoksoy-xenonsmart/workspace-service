import { WorkspaceResponseDto } from '../workspace-response.dto';

/**
 * ListWorkspacesResponse DTO
 * Workspace listesi için gRPC response mesajı
 */
export class ListWorkspacesResponse {
  workspaces: WorkspaceResponseDto[];
  total: number;
}

