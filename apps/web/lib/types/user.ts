export interface Location {
  city?: string;
  region?: string;
  country?: string;
}

export interface PortfolioItem {
  _id: string;
  title: string;
  description?: string;
  url?: string;
  type: 'link' | 'upload';
  fileUrl?: string;
}

export interface UserProfile {
  _id: string;
  name: string;
  email?: string;
  role?: string;
  isActive?: boolean;
  bio?: string;
  avatar?: string;
  location?: Location;
  roles?: string[];
  customRole?: string;
  genreTags?: string[];
  portfolio?: PortfolioItem[];
  averageRating?: number;
}
