export class WorkspaceResponseDto {
    id: string;
    name: string;
    ownerId: string;
    isDeleted: boolean;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
  }