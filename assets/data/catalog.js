/* ============================================================
   catalog.js — the knowledge tree (groups → topics → lessons)
   Adding a new lesson = one entry in this file, no markup change.
   ============================================================ */

window.CATALOG = {
  groups: [
    {
      id: 'hld',
      name: 'High-Level Design',
      path: 'hld/',
      tagline: 'architecture at scale',
      accent: 'coral',
      topics: [
        {
          id: 'distributed-systems',
          name: 'Distributed Systems',
          tagline: 'Many machines, one illusion of a whole.',
          iconKey: 'graph-3',
          lessons: [
            {
              id: 'distributed-transactions',
              number: '01',
              title: 'Distributed Transactions',
              href: 'lessons/distributed-transactions/',
            },
          ],
        },
        {
          id: 'scalability-caching',
          name: 'Scalability & Caching',
          tagline: 'Serving more without falling over.',
          iconKey: 'bars',
          lessons: [],
        },
        {
          id: 'messaging-queues',
          name: 'Messaging & Queues',
          tagline: 'Decoupling services with events.',
          iconKey: 'queue',
          lessons: [],
        },
      ],
    },
    {
      id: 'lld',
      name: 'Low-Level Design',
      path: 'lld/',
      tagline: 'how the code is shaped',
      accent: 'violet',
      topics: [
        {
          id: 'oop-solid',
          name: 'OOP & SOLID',
          tagline: 'Objects, responsibilities, boundaries.',
          iconKey: 'nested-square',
          lessons: [],
        },
        {
          id: 'design-patterns',
          name: 'Design Patterns',
          tagline: 'Named solutions to recurring problems.',
          iconKey: 'nodes-4',
          lessons: [],
        },
        {
          id: 'api-design',
          name: 'API Design',
          tagline: 'Contracts that are hard to misuse.',
          iconKey: 'chevrons',
          lessons: [],
        },
      ],
    },
    {
      id: 'core',
      name: 'CS Fundamentals',
      path: 'core/',
      tagline: 'the ground floor',
      accent: 'blue',
      topics: [
        {
          id: 'databases',
          name: 'Databases',
          tagline: 'Indexes, isolation, the write path.',
          iconKey: 'stacked-rows',
          lessons: [],
        },
        {
          id: 'networking',
          name: 'Networking',
          tagline: 'Packets, handshakes, protocols.',
          iconKey: 'target',
          lessons: [],
        },
        {
          id: 'concurrency',
          name: 'Concurrency',
          tagline: 'Threads, locks, and races.',
          iconKey: 'bars-3',
          lessons: [],
        },
      ],
    },
  ],
};

/* Folder badge labels (uppercase) — derived from group id by default */
window.GROUP_LABEL = { hld: 'HLD', lld: 'LLD', core: 'CS' };
