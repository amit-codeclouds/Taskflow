// Matches PeopleListItemDto (only the fields the Task MFE needs)
export interface Person {
  id: string;
  name: string;
  email?: string;
  title?: string;
  avatarInitials?: string;
  avatarUrl?: string;
}

export interface PaginatedPeople {
  data: Person[];
  total: number;
  page: number;
  limit: number;
}
