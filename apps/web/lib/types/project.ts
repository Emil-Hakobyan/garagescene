export interface ProjectOwner {
  _id: string;
  name: string;
  avatar?: string;
  location?: {
    city?: string;
    region?: string;
    country?: string;
  };
}

export interface MediaSnippet {
  url: string;
  type: 'video' | 'image' | 'link';
}

export interface Project {
  _id: string;
  owner: string | ProjectOwner;
  title: string;
  teaser: string;
  fullDocument?: string;
  genre: string;
  stage: string;
  rolesNeeded?: string[];
  customRoleNeeded?: string;
  mediaSnippets?: MediaSnippet[];
  accessList?: string[];
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectFilters {
  genre?: string;
  stage?: string;
  roleNeeded?: string;
  city?: string;
}
