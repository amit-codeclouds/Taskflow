import type { Team } from './teams';

const SEED: Team[] = [
  {
    id: 'team_1',
    name: 'Taskflow Core',
    description: 'Engineering team building the core platform.',
    color: '#6155DD',
    members: [
      { id: 'u1', initials: 'AC', name: 'Arkabrata C.', email: 'arkabrata@codeclouds.com', title: 'Engineer',        role: 'admin',     isPending: false },
      { id: 'u2', initials: 'JD', name: 'John Doe',     email: 'john@codeclouds.com',      title: 'Product Manager', role: 'pm',        isPending: false },
      { id: 'u3', initials: 'MK', name: 'Maya Khan',    email: 'maya@codeclouds.com',      title: 'Designer',        role: 'developer', isPending: false },
    ],
  },
  {
    id: 'team_2',
    name: 'Design System',
    description: 'Maintains the shared UI component library.',
    color: '#32B173',
    members: [
      { id: 'u1', initials: 'AC', name: 'Arkabrata C.', email: 'arkabrata@codeclouds.com', title: 'Engineer', role: 'admin',     isPending: false },
      { id: 'u4', initials: 'SR', name: 'Sam Roy',      email: 'sam@codeclouds.com',       title: 'Engineer', role: 'developer', isPending: false },
    ],
  },
];

let _teams: Team[] = SEED.map(t => ({ ...t, members: [...t.members] }));

export const teamsStore = {
  getAll(): Team[]           { return [..._teams]; },
  getById(id: string)        { return _teams.find(t => t.id === id) ?? null; },
  add(team: Team)            { _teams = [..._teams, team]; },
  update(team: Team)         { _teams = _teams.map(t => (t.id === team.id ? team : t)); },
  remove(id: string)         { _teams = _teams.filter(t => t.id !== id); },
};
