import { PageContainer, PageHeader } from '../components/layout/PageContainer';
import akshitImg from '../assets/team/akshit.jpg';
import shreyanshImg from '../assets/team/shreyansh.jpg';
import swaminathanImg from '../assets/team/swaminathan.jpg';
import kanishkaImg from '../assets/team/kanishka.jpg';
import aryanImg from '../assets/team/aryan.jpg';

interface Member {
  name: string;
  regNo: string;
  team: string;
  responsibility: string;
  github: string;
  image: string;
  imagePosition?: string;
}

const MEMBERS: Member[] = [
  {
    name: 'Akshit Choudhary',
    regNo: '25BCE5592',
    team: 'TripleX',
    responsibility: 'BCNF, 5NF & BCNF Decomposition Visualizer',
    github: 'https://github.com/akshit066',
    image: akshitImg,
  },
  {
    name: 'Shreyansh Agarwal',
    regNo: '25BCE5553',
    team: 'TripleX',
    responsibility: 'BCNF, 5NF & BCNF Decomposition Visualizer',
    github: 'https://github.com/shreyansh7-sys',
    image: shreyanshImg,
  },
  {
    name: 'Aryan Shukla',
    regNo: '25BCE5569',
    team: 'TripleX',
    responsibility: 'BCNF, 5NF & BCNF Decomposition Visualizer',
    github: 'https://github.com/Aryan',
    image: aryanImg,
  },
  {
    name: 'Kanishka Shukla',
    regNo: '25BCE5822',
    team: 'Team 3',
    responsibility: 'Automatic Normalization Assistant',
    github: 'https://github.com/kanishka-netizen',
    image: kanishkaImg,
    imagePosition: 'center 42%',
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
          <article
            key={member.regNo}
            className="card-padded flex flex-col justify-between"
          >
            <div>
              <div className="mb-4 flex items-center gap-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="h-20 w-20 shrink-0 rounded-full object-cover ring-2 ring-purple-500/20 shadow-sm"
                  style={
                    member.imagePosition
                      ? { objectPosition: member.imagePosition }
                      : undefined
                  }
                />
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                    {member.name}
                  </h2>

                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    {member.regNo}
                  </p>

                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-400">
                    {member.team}
                  </p>
                </div>
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-400">
                {member.responsibility}
              </p>
            </div>

            <div className="mt-4">
              <a
                href={member.github}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 transition hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300"
              >
                GitHub ↗
              </a>
            </div>
          </article>
        ))}
      </div>

      <section className="card-padded mt-6 flex flex-col items-center text-center">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Guided by
        </p>

        <img
          src={swaminathanImg}
          alt="Swaminathan Annadurai"
          className="mt-4 h-24 w-24 rounded-full object-cover ring-4 ring-purple-500/20 shadow-md"
        />

        <h2 className="mt-3 text-xl font-bold text-slate-900 dark:text-white">
          Swaminathan Annadurai
        </h2>
      </section>
    </PageContainer>
  );
}
