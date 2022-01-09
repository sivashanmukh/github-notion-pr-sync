const { Octokit } = require("octokit");
const core = require("@actions/core");
const githubKey = core.getInput("githubKey")
// const githubKey = process.env.GITHUB_KEY
const octokit = new Octokit({ auth: githubKey });

const { Client } = require("@notionhq/client");
const notionKey = core.getInput("notionKey");
// const notionKey = process.env.NOTION_KEY
const notionDatabaseId = core.getInput("notionDatabaseId");
// const notionDatabaseId = process.env.NOTION_DATABASE_ID
const notion = new Client({ auth: notionKey });
const databaseId = notionDatabaseId;

const github = require("@actions/github");

async function getPRFromGithub(pull_number, owner, repo) {
  const { data: pullRequest } = await octokit.rest.pulls.get({
    owner,
    repo,
    pull_number,
  });
  return pullRequest;
}

async function createPRInNotionDatabase(pr) {
  notion.pages
    .create({
      parent: { database_id: databaseId },
      properties: getPropertiesFromPr(pr),
    })
    .then((result) => console.log(result))
    .catch((error) => {
      console.log(error);
      console.log(pr);
    });
}

async function updatePRInNotionDatabase(pr, page_id) {
  notion.pages
    .update({
      page_id,
      properties: getPropertiesFromPr(pr),
    })
    .then((result) => console.log(result))
    .catch((error) => {
      console.log("Debug Start");
      console.log(error);
      console.log(pr);
    });
}

async function getPrsFromNotionDatabase(pr_number, repo) {
  const pages = [];
  let cursor = undefined;
  while (true) {
    const { results, next_cursor } = await notion.databases.query({
      database_id: databaseId,
      filter: {
        and: [
          {
            property: "Pr Number",
            number: {
              equals: pr_number,
            },
          },
          {
            property: "Repository",
            select: {
              equals: repo,
            },
          },
        ],
      },
    });
    pages.push(...results);
    if (!next_cursor) {
      break;
    }
    cursor = next_cursor;
  }
  console.log(`${pages.length} prs successfully fetched.`);
  return pages.map((page) => {
    return {
      pageId: page.id,
      prNumber: page.properties["Pr Number"].number,
    };
  });
}

function getPropertiesFromPr(pr) {
  let notionProperties = {};

  notionProperties = {
    Title: {
      title: [{ type: "text", text: { content: pr.title } }],
    },
    "Pr Number": {
      number: pr.number,
    },
    State: {
      select: { name: pr.state },
    },
    Url: {
      url: pr.html_url,
    },
    "Created at": {
      date: { start: pr.created_at },
    },
    "Updated at": {
      date: { start: pr.updated_at },
    },
    Base: {
      rich_text: [{ type: "text", text: { content: pr.base.label } }],
    },
    Head: {
      rich_text: [{ type: "text", text: { content: pr.head.label } }],
    },
    "Is draft": {
      checkbox: pr.draft,
    },
    Author: {
      select: { name: pr.user.login },
    },
    Repository: {
      select: { name: process.env.GITHUB_REPOSITORY.split("/")[1] },
    },
  };

  if (pr.closed_at) {
    notionProperties["Closed at"] = { date: { start: pr.closed_at } };
  }
  if (pr.merged_at) {
    notionProperties["Merged at"] = { date: { start: pr.merged_at } };
  }
  if (pr.labels && pr.labels.length > 0) {
    notionProperties["Labels"] = {
      multi_select: pr.labels.map((l) => {
        return { name: l.name };
      }),
    };
  }
  if (pr.reviewers && pr.reviewers.length > 0) {
    notionProperties["Reviewers"] = {
      multi_select: pr.reviewers.map((r) => {
        return { name: r.login };
      }),
    };
  }
  return notionProperties;
}

async function main() {
  pr_number = github.context.payload.number;
  repo = process.env.GITHUB_REPOSITORY.split("/")[1];
  owner = process.env.GITHUB_REPOSITORY.split("/")[0];
  pr = await getPRFromGithub(pr_number, owner, repo);
  pages = await getPrsFromNotionDatabase(pr_number, repo);
  switch (pages.length) {
    case 0:
      createPRInNotionDatabase(pr);
      break;
    case 1:
      updatePRInNotionDatabase(pr, pages[0].pageId);
      break;
    default:
      throw (
        "Unexpected number of prs in notion db for the filters pr: " +
        pr_number +
        ", repo: " +
        repo +
        ", owner: " +
        owner
      );
  }
}

main().catch((error) => {
  console.log(JSON.stringify(error));
  console.log(JSON.stringify(github));
});
