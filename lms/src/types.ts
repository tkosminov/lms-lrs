export interface IScormItem {
  identifier: string;
  title: string;
  type: string;
  href: string;
  objective_ids: string[];
}

export interface IScormCourse {
  id: string;
  created_at: string;
  updated_at: string;
  hash_sum: string;
  identifier: string;
  title: string;
  items: IScormItem[];
}
