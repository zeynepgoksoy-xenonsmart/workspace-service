export class WorkspaceResponseDto {
  id: string;
  name: string;
  ownerId: string;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}