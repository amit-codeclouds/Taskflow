export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  label: string;
  labelColor: string;
  assignee: string;
  due: string;
}

export interface Column {
  id: string;
  statusId: string;
  title: string;
  color: string;
  count: number;
  tasks: Task[];
}

export interface Team {
  id: string;
  name: string;
  color: string;
}
