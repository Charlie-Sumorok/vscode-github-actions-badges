import {
	TextDocument,
	Uri,
	WebviewView,
	WebviewViewProvider,
	window,
} from 'vscode';

import { Badge, Repo, getBadges } from './badges';
import { getCurrentRepo } from './currentRepo';

// #region styles
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
	background-color: var(--vscode-sideBar-background);
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
export const styles = [mainStyle, resetStyle];
// #endregion

export const showBadges = async (repo: Repo) => {
	const badges = await getBadges(repo);
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
			onkeyup="
				// Declare variables
				const input = document.getElementById('search');
				const text = input.value
				const filter = text.toUpperCase()
				const ul = document.getElementById('badges');
				const li = ul.getElementsByTagName('li');

				// Loop through all list items, and hide those who don't match the search query
				for (var i = 0; i < li.length; i++) {
					var a = li[i].getElementsByTagName('a')[0];
					var txtValue = a.getAttribute('title')
					if (txtValue.toUpperCase().indexOf(filter) > -1) {
						li[i].style.display = '';
					} else {
						li[i].style.display = 'none';
					}
				}
			"
			placeholder="Search for badges..."
		/>
		<ul id="badges">
			${badges
				.map(({ badge, workflow, name }: Badge) => {
					return `<li>
								<a href="${workflow}" title="${name}">
									<img src="${badge}" alt="${name}">
								</a>
								<br />
							</li>`;
				})
				.join('\n')}
		</ul>
	</body>
</html>`;
};

export class SidebarProvider implements WebviewViewProvider {
	_view?: WebviewView;
	_doc?: TextDocument;

	constructor(private readonly _extensionUri: Uri) {}

	public async resolveWebviewView(webviewView: WebviewView) {
		this._view = webviewView;

		webviewView.webview.options = {
			// Allow scripts in the webview
			enableScripts: true,

			localResourceRoots: [this._extensionUri],
		};

		webviewView.webview.html = await this.getWebviewContent();

		webviewView.webview.onDidReceiveMessage((data) => {
			switch (data.type) {
				case 'onInfo': {
					if (!data.value) {
						return;
					}
					window.showInformationMessage(data.value);
					break;
				}
				case 'onError': {
					if (!data.value) {
						return;
					}
					window.showErrorMessage(data.value);
					break;
				}
			}
		});
	}

	async getWebviewContent() {
		const currentRepo = await getCurrentRepo();

		const badgesHTML = showBadges(currentRepo);
		return badgesHTML;
	}
}
