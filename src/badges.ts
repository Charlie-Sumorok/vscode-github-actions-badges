import { ViewColumn, Webview, window } from 'vscode';
import { Octokit } from '@octokit/core';
import { getCurrentRepo } from './currentRepo';
import { getNonce } from './getNonce';

interface Repo {
	owner: string;
	name: string;
}
interface Badge {
	badge: string;
	workflow: string;
	name: string;
}

const getBadges = async (repo: Repo) => {
	const octokit = new Octokit();
	const request = await octokit.request(
		'GET /repos/{owner}/{repo}/actions/workflows',
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
			name: workflow.name,
		};
	});
	return workflows;
};

const showBadges = (
	repo: Repo,
	badges: Badge[],
	styles: string[],
	webview: Webview,
	nonce: string
) => {
	return `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Github Actions Badges</title>
		${styles
			.map((style: string) => {
				return `<style>${style}</style>`;
			})
			.join('\n')}
		<style>
			#badges {
				list-style-type: none;
				padding: 0;
				margin: 0;
			}
		</style>
		<script nonce="${nonce}">
			const searchBadges = () => {
				// Declare variables
				var a, i, txtValue;
				var input = document.getElementById('search');
				var filter = input.value.toUpperCase();
				var ul = document.getElementById('badges');
				var li = ul.getElementsByTagName('li');

				// Loop through all list items, and hide those who don't match the search query
				for (i = 0; i < li.length; i++) {
					a = li[i].getElementsByTagName('a')[0];
					txtValue = a.children[0].dataset.alt;
					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						li[i].style.display = '';
					} else {
						li[i].style.display = 'none';
					}
				}
			}
		</script>
	</head>
	<body>
		<h1>
			<a href="https://github.com/${repo.owner}">
				${repo.owner}
			</a> / <a href="https://github.com/${repo.owner}/${repo.name}">
				${repo.name}
			</a>
		</h1>
		<input
			id="search"
			type="text"
			onkeydown="searchForBadges()"
			placeholder="Search for badges..."
		/>
		<ul id="badges">
			${badges
				.map(({ badge, workflow, name }: Badge) => {
					return `<li>
								<a href="${workflow}">
									<img src="${badge}" data-alt="${name}">
								</a>
								<br />
							</li>`;
				})
				.join('\n')}
		</ul>
	</body>
</html>`;
};

const mainStyle = `
:root {
	--container-paddding: 20px;
	--input-padding-vertical: 6px;
	--input-padding-horizontal: 4px;
	--input-margin-vertical: 4px;
	--input-margin-horizontal: 0;
}

body {
	padding: 0 var(--container-paddding);
	color: var(--vscode-foreground);
	font-size: var(--vscode-font-size);
	font-weight: var(--vscode-font-weight);
	font-family: var(--vscode-font-family);
	background-color: var(--vscode-editor-background);
}

ol,
ul {
	padding-left: var(--container-paddding);
}

body > *,
form > * {
	margin-block-start: var(--input-margin-vertical);
	margin-block-end: var(--input-margin-vertical);
}

*:focus {
	outline-color: var(--vscode-focusBorder) !important;
}

a {
	color: var(--vscode-textLink-foreground);
}

a:hover,
a:active {
	color: var(--vscode-textLink-activeForeground);
}

code {
	font-size: var(--vscode-editor-font-size);
	font-family: var(--vscode-editor-font-family);
}

button {
	border: none;
	padding: var(--input-padding-vertical) var(--input-padding-horizontal);
	width: 100%;
	text-align: center;
	outline: 1px solid transparent;
	outline-offset: 2px !important;
	color: var(--vscode-button-foreground);
	background: var(--vscode-button-background);
}

button:hover {
	cursor: pointer;
	background: var(--vscode-button-hoverBackground);
}

button:focus {
	outline-color: var(--vscode-focusBorder);
}

button.secondary {
	color: var(--vscode-button-secondaryForeground);
	background: var(--vscode-button-secondaryBackground);
}

button.secondary:hover {
	background: var(--vscode-button-secondaryHoverBackground);
}

input:not([type='checkbox']),
textarea {
	display: block;
	width: 100%;
	border: none;
	font-family: var(--vscode-font-family);
	padding: var(--input-padding-vertical) var(--input-padding-horizontal);
	color: var(--vscode-input-foreground);
	outline-color: var(--vscode-input-border);
	background-color: var(--vscode-input-background);
}

input::placeholder,
textarea::placeholder {
	color: var(--vscode-input-placeholderForeground);
}
`;

const resetStyle = `
html {
	box-sizing: border-box;
	font-size: 13px;
}

*,
*:before,
*:after {
	box-sizing: inherit;
	margin: 2px;
}

body,
h1,
h2,
h3,
h4,
h5,
h6,
p,
ol,
ul {
	margin: 0;
	padding: 0;
	font-weight: normal;
}

img {
	max-width: 100%;
	height: auto;
}
`;

const getWebviewContent = async (webview: Webview) => {
	const currentRepo = getCurrentRepo();
	const badges = await getBadges(currentRepo);
	const styles = [mainStyle, resetStyle];
	const nonce = getNonce();
	const badgesHTML = showBadges(currentRepo, badges, styles, webview, nonce);
	return badgesHTML;
};

export const showBadgePanel = async () => {
	const panel = window.createWebviewPanel(
		'worflowBadges',
		'Worflow Badges',
		{ viewColumn: ViewColumn.One },
		{}
	);
	panel.webview.html = await getWebviewContent(panel.webview);
};
