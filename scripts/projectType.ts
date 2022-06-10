export type Project = {
  entry_id: number;
  project_name: string;
  adapter_code: number;
  fixture_type: string;
  owner_email: string;
  contacts: number;
  contacts_limit: number;
  warning_at: number;
  resets: number;
  temperature: number;
  modified_by: string;
  last_update: Date;
};

export type ProjectDictionary = {
  issue: string;
  project: Project;
};
