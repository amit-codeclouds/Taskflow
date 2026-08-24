// Matches RoleResponseDto
export interface ApiRole {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}
