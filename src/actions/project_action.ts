import {ActionContext} from '../context/context';
import {ProjectsRequests} from '../github/projects_requests';
import {Projects} from '../github/types';
import {Logger} from '../logs/logger';
import {ActionBase, ActionResult} from './action_base';

export class ProjectAction extends ActionBase {
  constructor(context: ActionContext) {
    super(context, true);
    Logger.debug('ProjectAction constructor');
  }

  hasToRun(): boolean {
    return !(!this.context.inputs.project || !this.context.inputs.column);
  }

  async run(): Promise<ActionResult | undefined> {
    Logger.debug('ProjectAction run');
    if (this.hasToRun()) {
      try {
        // Get projects
        const projects = await this.getProjects();
        Logger.debugOject('Projects', projects);

        // Get matching projects
        const matchingProjects = projects.filter(
          p => p.name === this.context.inputs.project
        );
        Logger.debugOject('MatchingProjects', matchingProjects);

        // // Try & Run action on matching projects
        // for (const project of matchingProjects) {
        //   tryAndRunOnProject(context, project);
        // }
        return ActionResult.Success;
      } catch (error) {
        Logger.error(error);
        return ActionResult.Failed;
      }
    }
  }

  private async getProjects(): Promise<Projects> {
    const projects = [] as Projects;

    const orgProjects = await ProjectsRequests.getOrgProjects(this.context);
    for (const project of orgProjects) {
      projects.push(project);
    }

    const repoProjects = await ProjectsRequests.getRepoProjects(this.context);
    for (const project of repoProjects) {
      projects.push(project);
    }

    const userProjects = await ProjectsRequests.getUserProjects(this.context);
    for (const project of userProjects) {
      projects.push(project);
    }

    return projects;
  }

  // static async findMatchingCard(
  //   context: ActionContext,
  //   columns: Columns
  // ): Promise<Card | null> {
  //   for (const column of columns) {
  //     const colCards = await context.octokit.rest.projects.listCards({
  //       column_id: column.id
  //     });
  //     const matchingCard = colCards.data.find(
  //       card => card.content_url === context.content.issue?.url
  //     );
  //     if (matchingCard) {
  //       //debugLog(`MatchingCard ${JSON.stringify(matchingCard, null, '\t')}`);
  //       return matchingCard;
  //     }
  //   }
  //   return null;
  // }

  // async function tryAndRunOnProject(
  //   context: ActionContext,
  //   project: Project
  // ): Promise<void> {
  //   const columns = await context.octokit.rest.projects.listColumns({
  //     project_id: project.id
  //   });
  //   //debugLog(`Issue ${JSON.stringify(issue, null, '\t')}`);
  //   const matchingColumn = columns.data.find(
  //     column => column.name === context.inputs.column
  //   );

  //   if (matchingColumn) {
  //     debugLog(
  //       `Found matching project '${project.name}' [${project.id}] & column '${matchingColumn.name}' [${matchingColumn.id}]\n${project.html_url}`
  //     );

  //     const matchingCard = await findMatchingCard(context, columns.data);
  //     if (matchingCard) {
  //       debugLog(`Card existing in project`);
  //     } else {
  //       const test = await createCard(context, matchingColumn);
  //       debugLog(`TestResult ${JSON.stringify(test, null, '\t')}`);
  //     }
  //   }
  // }

  // export async function runProjectAction(
  //   context: ActionContext
  // ): Promise<void> {
  //   try {
  //     if (!context.inputs.project || !context.inputs.column) return;

  //     // Get projects
  //     const projects = await getProjects(context);

  //     // Get matching projects
  //     const matchingProjects = projects.filter(p => p.name === context.inputs.project);

  //     // Try & Run action on matching projects
  //     for (const project of matchingProjects) {
  //       tryAndRunOnProject(context, project);
  //     }
  //   } catch (error) {
  //     debugLog(`[Error/project.ts] ${error}`);
  //   }
  // }
}
