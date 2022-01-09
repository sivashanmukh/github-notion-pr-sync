# Sample Integration: GitHub Issues to Notion

<img src="https://dev.notion.so/front-static/external/readme/images/github-notion-example@2x.png" alt="drawing" width="500"/>

## About the Integration

This Notion integration syncs GitHub Pull Requests for a specific repo to a Notion Database. This integration was built using this [database template](https://stone-tangelo-0ab.notion.site/2079f2070233462bbfcd29c2436a763c?v=f13a771566c9490581fb6fb770b229df) and [GitHub's Octokit Library](https://github.com/octokit). Changes made to pull requests in the Notion database will not be reflected in GitHub. For an example which allows you to take actions based on changes in a database [go here.](https://github.com/makenotion/notion-sdk-js/tree/main/examples/database-email-update)

## Setting up
1. Duplicate [this template](https://stone-tangelo-0ab.notion.site/2079f2070233462bbfcd29c2436a763c?v=f13a771566c9490581fb6fb770b229df) into your notion workspace:
2. You can create your Notion API key [here](https://www.notion.com/my-integrations).
3. Make sure you share the local copy of the template created in Step 1 with the integration created in Step 2
4. You can create your GitHub Personal Access token by following the guide [here](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token)
5. You can find the Notion database id of the page you have created using [these instructions](https://developers.notion.com/docs/working-with-databases#adding-pages-to-a-database)
6. Create an action yaml file with the following contents and with the corresponding values filled in and push it in `root_path/.github/workflows` folder of your repo

    ```
        name: Sync Github Prs to Notion
        
        on:
          issues:
            types: [opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled, locked, unlocked, milestoned, demilestoned]
          pull_request:
            types: [assigned, unassigned, labeled, unlabeled, opened, edited, closed, reopened, synchronize, converted_to_draft, ready_for_review, locked, unlocked, review_requested, review_request_removed, auto_merge_enabled, auto_merge_disabled]
        
        jobs:
          sync:
            runs-on: ubuntu-latest
            steps:
            - name: Sync Github PRs to Notion
              uses: sivashanmukh/github-notion-pr-sync@1.0.0
              with:
                notionKey: <generated in step 2>
                notionDatabaseId: <found in step 5>
                githubKey: <generated in step 4>
    ```

## Running Locally

### 1. Setup your local project

```zsh
# Clone this repository locally
git clone https://github.com/sivashanmukh/github-notion-pr-sync

# Install the dependencies
npm install
```

### 2. Set your environment variables in a `.env` file

```zsh
GITHUB_KEY=<your-github-personal-access-token>
NOTION_KEY=<your-notion-api-key>
NOTION_DATABASE_ID=<notion-database-id>
GITHUB_REPO_OWNER=<github-owner-username>
GITHUB_REPO_NAME=<github-repo-name>
```

You can create your Notion API key [here](https://www.notion.com/my-integrations).

You can create your GitHub Personal Access token by following the guide [here](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).

To create a Notion database that will work with this example, duplicate [this empty database template](https://stone-tangelo-0ab.notion.site/2079f2070233462bbfcd29c2436a763c?v=f13a771566c9490581fb6fb770b229df).

### 3. Run code

```zsh
node index.js
```
