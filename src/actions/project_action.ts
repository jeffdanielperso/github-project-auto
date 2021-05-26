import {ActionContext} from '../context/context';
import {ProjectsRequests} from '../github/projects_requests';
import {Card, Columns, Projects} from '../github/types';
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
    if (this.hasToRun()) {
      try {
        // Get projects
        const projects = await this.getProjects();

        // Get matching projects
        const matchingProjects = projects.filter(
          p => p.name === this.context.inputs.project
        );
        Logger.debugObject('MatchingProjects', matchingProjects);

        for (const project of matchingProjects) {
          const columns = await ProjectsRequests.getColumns(
            this.context,
            project.id
          );

          const matchingColumn = columns.find(
            column => column.name === this.context.inputs.column
          );

          if (matchingColumn) {
            Logger.debug(
              `Found matching project '${project.name}' [${project.id}] & column '${matchingColumn.name}' [${matchingColumn.id}]`
            );

            const matchingCard = await this.findCard(columns);
            if (matchingCard) {
              Logger.debugObject(`Found matching card:`, matchingCard);
            } else {
              Logger.debug(`No matching card => creation`);
              const card = await ProjectsRequests.createCard(
                this.context,
                matchingColumn.id,
                this.context.content.id,
                this.context.content.type
              );
              Logger.debugObject(`Card created`, card);
            }
          }
        }
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

  private async findCard(columns: Columns): Promise<Card | null> {
    for (const column of columns) {
      const cards = await ProjectsRequests.getCards(this.context, column);
      const matchingCard = cards.find(
        card => card.content_url === this.context.content.issue?.url
      );
      if (matchingCard) {
        return matchingCard;
      }
    }
    return null;
  }

  // static async findMatchingCard(
  //   context: ActionContext,
  //   columns: Columns
  // ): Promise<Card | null> {
  //
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
}
