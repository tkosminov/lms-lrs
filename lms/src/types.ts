export interface IItem {
  identifier: string;
  identifierref?: string;
  title: string;
  type?: string;
  href?: string;
  items?: IItem[];
  objective_ids?: string[];
}

export interface ICourse {
  id: string;
  created_at: string;
  updated_at: string;
  hash_sum: string;
  identifier: string;
  title: string;
  items: IItem[];
}
