# github-project-auto

Triggers:
- all

Inputs:
- add-labels: "lbl1, lbl2..."
- remove-labels: "lbl3, lbl4..."
- repository: "RepositoryName"
- project: "ProjectBoardName"
- column: "ColumnOfProjectBoard"
- repo-token: Repo token

# For me => Deploy new version
- npm run all
- git commit
- git push
- npm run tags
- GitHub => Publish the drafts release