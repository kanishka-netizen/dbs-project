import { PageContainer, PageHeader } from '../components/layout/PageContainer';

const MEMBERS = [
  {
    name: 'Shreyansh Agarwal',
    regNo: '25BCE5553',
    team: 'TripleX',
    responsibility: 'BCNF, 5NF & BCNF Decomposition Visualizer',
    github: 'https://github.com/shreyansh7-sys',
  },
  {
    name: 'Aryan Shukla',
    regNo: '25BCE5569',
    team: 'TripleX',
    responsibility: 'BCNF, 5NF & BCNF Decomposition Visualizer',
    github: 'https://github.com/Aryan',
  },
  {
    name: 'Akshit Choudhary',
    regNo: '25BCE5592',
    team: 'TripleX',
    responsibility: 'BCNF, 5NF & BCNF Decomposition Visualizer',
    github: 'https://github.com/akshit066',
  },
  {
    name: 'Kanishka Shukla',
    regNo: '25BCE5822',
    team: 'Team 3',
    responsibility: 'Automatic Normalization Assistant',
    github: 'https://github.com/kanishka-netizen',
  },
];

export function DevelopedByPage() {
  return (
    <PageContainer>
      <PageHeader
        title="Developed By"
        subtitle="The team behind the Database Normalization Assistant."
      />

      <div className="grid gap-5 sm:grid-cols-2">
        {MEMBERS.map((member) => (
          <article key={member.regNo} className="card-padded">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-500/10 text-lg font-bold text-purple-600 dark:text-purple-400">
              {member.name.charAt(0)}
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {member.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {member.regNo}
            </p>

            <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
              {member.team}
            </p>

            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {member.responsibility}
            </p>
            <a
  href={member.github}
  target="_blank"
  rel="noopener noreferrer"
  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
>
  GitHub ↗
</a>
          </article>
        ))}
      </div>

      <section className="card-padded mt-6 text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Guided by
        </p>

        <h2 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
          Swaminathan Annadurai
        </h2>
      </section>
    </PageContainer>
  );
}