import { ViewColumn, window } from 'vscode';
import { Octokit } from '@octokit/core';
import { getCurrentRepo } from './currentRepo';

interface Repo {
	owner: string;
	name: string;
}
interface Badge {
	badge: string;
	workflow: string;
}

const getBadges = async (repo: Repo) => {
	const octokit = new Octokit();
	const request = await octokit.request(
		`GET /repos/{owner}/{repo}/actions/workflows`,
		{
			owner: repo.owner,
			repo: repo.name,
		}
	);
	const rawWorkflows = request.data;
	const workflows = rawWorkflows.workflows.map((workflow) => {
		const workflowParts = workflow.badge_url.split('/');
		return {
			badge: workflow.badge_url,
			workflow: workflowParts
				.filter((_, index) => {
					return index !== workflowParts.length - 1;
				})
				.join('/'),
		};
	});
	return workflows;
};

const showBadges = (repo: Repo, badges: Badge[]) => {
	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Github Actions Badges</title>
	</head>
	<body>
		<h1>
			<a href="https://github.com/${repo.owner}">
				${repo.owner}
			</a>/<a href="https://github.com/${repo.owner}/${repo.name}">
				${repo.name}
			</a>
		</h1>
	${badges
		.map(({ badge, workflow }: Badge) => {
			return `<a href="${workflow}">
			<img src="${badge}">
		</a>
		<br />`;
		})
		.join('\n')}
	</body>
</html>`;
};

const getWebviewContent = async () => {
	const currentRepo = getCurrentRepo();
	const badges = await getBadges(currentRepo);
	return showBadges(currentRepo, badges);
};

export async function showBadgePanel() {
	const panel = window.createWebviewPanel(
		'worflowBadges',
		'Worflow Badges',
		{ viewColumn: ViewColumn.One },
		{}
	);
	panel.webview.html = await getWebviewContent();
}
