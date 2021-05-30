import {ActionContext} from '../context/context';
import {ProjectsRequests} from '../github/projects_requests';
import {Card, Columns, Projects} from '../github/types';
import {Logger} from '../logs/logger';
import {ActionBase, ActionResult} from './action_base';

export class ProjectAction extends ActionBase {
  constructor(context: ActionContext) {
    super(context, true);
  }

  hasToRun(): boolean {
    return !(!this.context.inputs.project || !this.context.inputs.column);
  }

  async run(): Promise<ActionResult | undefined> {
    if (this.hasToRun()) {
      try {
        this.log('Started');

        // Get projects
        const projects = await this.getProjects();
        this.log(
          `Projects loaded: ${JSON.stringify(
            projects.map(m => m.name),
            null,
            '\n'
          )}`
        );

        // Get matching projects
        const matchingProjects = projects.filter(
          p => p.name === this.context.inputs.project
        );
        this.log(`Matching project(s): ${matchingProjects.length}`);

        // Try & Run the action for all matching Projects
        for (const project of matchingProjects) {
          // Get Columns of Project
          const columns = await ProjectsRequests.getColumns(
            this.context,
            project.id
          );

          // Look for matching Column
          const matchingColumn = columns.find(
            column => column.name === this.context.inputs.column
          );

          // Found matching Column
          if (matchingColumn) {
            this.log(
              `Project '${project.name}' - Found matching column '${matchingColumn.name}'`
            );

            // Look for matching Card
            const matchingCard = await this.findCard(columns);
            if (matchingCard) {
              // If card already exists => Move Card
              await ProjectsRequests.moveCard(
                this.context,
                matchingColumn.id,
                matchingCard.id,
                'bottom'
              );
            } else {
              // Else => Create Card
              await ProjectsRequests.createCard(
                this.context,
                matchingColumn.id,
                this.context.content.id,
                this.context.content.type
              );
            }
          } else {
            this.log(`Project '${project.name}' - No matching column`);
          }
        }

        this.log('Ended - Success');
        return ActionResult.Success;
      } catch (error) {
        Logger.error(error);
        this.log('Ended - Failed');
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
}
