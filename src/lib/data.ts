export type JobType = 'remoto' | 'híbrido' | 'presencial';
export type JobStatus = 'ativo' | 'inativo';

export interface Tag {
  id: string;
  name: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  description: string;
  requirements: string[];
  tags: Tag[];
  createdAt: string;
}

export const TAGS: Tag[] = [
  { id: '1', name: 'Jovem Aprendiz' },
  { id: '2', name: 'Sem Experiência' },
  { id: '3', name: 'Tecnologia' },
  { id: '4', name: 'Marketing' },
  { id: '5', name: 'Administração' },
  { id: '6', name: 'Design' },
];

export const MOCK_JOBS: Job[] = [
  {
    id: 'job-1',
    title: 'Jovem Aprendiz Administrativo',
    company: 'Tech Solutions Brasil',
    location: 'São Paulo, SP',
    type: 'híbrido',
    description: 'Procuramos um jovem talento para auxiliar nas rotinas administrativas, controle de planilhas e atendimento ao cliente. Ótima oportunidade de plano de carreira.',
    requirements: ['Ensino médio cursando ou completo', 'Conhecimento básico em Pacote Office', 'Boa comunicação'],
    tags: [TAGS[0], TAGS[1], TAGS[4]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'job-2',
    title: 'Estágio em Desenvolvimento Front-end',
    company: 'InovaWeb',
    location: 'Remoto',
    type: 'remoto',
    description: 'Aprenda e desenvolva aplicações web utilizando React e Next.js em um ambiente ágil e colaborativo.',
    requirements: ['Conhecimento em HTML, CSS e JavaScript', 'Vontade de aprender', 'Cursando nível superior em TI'],
    tags: [TAGS[1], TAGS[2]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
  {
    id: 'job-3',
    title: 'Auxiliar de Marketing Digital',
    company: 'Crescer Agência',
    location: 'Rio de Janeiro, RJ',
    type: 'presencial',
    description: 'Auxilie na criação de campanhas, monitoramento de métricas e agendamento de posts nas redes sociais.',
    requirements: ['Heavy user de redes sociais', 'Noções básicas de design', 'Criatividade'],
    tags: [TAGS[1], TAGS[3], TAGS[5]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'job-4',
    title: 'Suporte Técnico Jr.',
    company: 'HostCloud',
    location: 'Campinas, SP',
    type: 'híbrido',
    description: 'Atendimento a chamados de clientes e suporte a infraestrutura básica de TI.',
    requirements: ['Gostar de tecnologia', 'Boa digitação'],
    tags: [TAGS[2]],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(), // 3 days ago
  }
];

export const MOCK_USER = {
  id: 'user-1',
  name: 'Eduardo Estagiário',
  email: 'eduardo@exemplo.com',
  targetRole: 'Desenvolvimento Web',
  avatarUrl: null,
  savedJobs: ['job-2', 'job-1'],
  appliedJobs: [
    {
      id: 'app-1',
      jobId: 'job-3',
      status: 'Em análise',
      appliedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    }
  ]
};
