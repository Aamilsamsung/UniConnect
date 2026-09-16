export type AuthUser = {
  id: string;
  universityId: string;
  role: 'STUDENT' | 'MODERATOR' | 'UNIVERSITY_ADMIN' | 'SUPER_ADMIN';
};
