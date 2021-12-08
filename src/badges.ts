import { Octokit } from '@octokit/core';

export interface Repo {
	owner: string;
	name: string;
}
export interface Badge {
	badge: string;
	workflow: string;
	name: string;
}

export const getBadges = async (repo: Repo) => {
	const octokit = new Octokit();
	const request = await octokit.request(
		'GET /repos/{owner}/{repo}/actions/workflows',
		{
			owner: repo.owner,
			repo: repo.name,
		}
	);
	const rawWorkflows = request.data;
	const workflows = await Promise.all(
		rawWorkflows.workflows.map(async (workflow) => {
			const workflowParts = {
				badge: workflow.badge_url.split('/'),
				html: workflow.html_url.split('/'),
			};
			const url = `${workflowParts.badge
				.filter((_, index) => {
					return index !== workflowParts.badge.length - 1;
				})
				.map((part) => {
					if (part === 'workflows') {
						return 'actions/workflows';
					} else {
						return part;
					}
				})
				.filter((_, index) => {
					return index < workflowParts.badge.length - 2;
				})
				.join('/')}/${
				workflowParts.html[workflowParts.html.length - 1]
			}`;
			return {
				badge: workflow.badge_url,
				workflow: url,
				name: workflow.name,
			};
		})
	);
	return workflows;
};
