import {GitHub} from '@actions/github/lib/utils';
import {Endpoints} from '@octokit/types';

export type Octokit = InstanceType<typeof GitHub>;
export type OrgProjects =
  Endpoints['GET /orgs/{org}/projects']['response']['data'];
export type RepoProjects =
  Endpoints['GET /repos/{owner}/{repo}/projects']['response']['data'];
export type UserProjects =
  Endpoints['GET /users/{username}/projects']['response']['data'];
export type Projects = UserProjects;
export type Project =
  Endpoints['GET /projects/{project_id}']['response']['data'];
export type Columns =
  Endpoints['GET /projects/{project_id}/columns']['response']['data'];
export type Column =
  Endpoints['GET /projects/columns/{column_id}']['response']['data'];
export type Cards =
  Endpoints['GET /projects/columns/{column_id}/cards']['response']['data'];
export type Card =
  Endpoints['GET /projects/columns/cards/{card_id}']['response']['data'];
export type CreatedCard =
  Endpoints['POST /projects/columns/{column_id}/cards']['response'];
export type Issue =
  Endpoints['GET /repos/{owner}/{repo}/issues/{issue_number}']['response']['data'];
