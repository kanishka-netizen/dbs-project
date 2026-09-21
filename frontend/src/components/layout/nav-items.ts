export type OwningTeam = 'team1' | 'team2' | 'team3';

export interface NavItem {
  to: string;
  label: string;
  description: string;
  owner: OwningTeam;
}

/** Site navigation — owned by Team 2 (TripleX). */
export const NAV_ITEMS: NavItem[] = [
  {
    to: '/visualizer',
    label: 'Visualizer',
    description: 'Analyse a schema and step through its decomposition',
    owner: 'team2',
  },
  {
    to: '/learn',
    label: 'Learn',
    description: 'Normal forms explained, with worked examples',
    owner: 'team1',
  },
  {
    to: '/assistant',
    label: 'Assistant',
    description: 'Normalise a schema automatically and export a report',
    owner: 'team3',
  },
  {
    to: '/help',
    label: 'Help',
    description: 'How to write a schema, and what the results mean',
    owner: 'team2',
  },
  {
    to: '/developed-by',
    label: 'Developed By',
    description: 'Meet the team behind the Database Normalization Assistant',
    owner: 'team2',
  },
];
