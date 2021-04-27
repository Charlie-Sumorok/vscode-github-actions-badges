import {
	ExtensionContext,
	commands,
	window,
	Disposable,
	env,
	Uri,
} from 'vscode';

import { getBadges } from './badges';
import { getCurrentRepo } from './currentRepo';
import { SidebarProvider } from './sidebar';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(
		'Congratulations, your extension "github-actions-badges" is now active!'
	);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const extensionCommands = [
		window.registerWebviewViewProvider(
			'vscode-github-actions-badges-sidebar',
			new SidebarProvider(context.extensionUri)
		),

		commands.registerCommand(
			'vscode-github-actions-badges.show-badges-preview',
			async () => {
				const { owner, name } = getCurrentRepo();
				window.showInformationMessage(`Showing Badges for ${owner}/${name}`);
				await commands.executeCommand(
					'vscode-github-actions-badges-sidebar.focus'
				);
			}
		),

		commands.registerCommand(
			'vscode-github-actions-badges.close-badges-preview',
			async () => {
				const { owner, name } = getCurrentRepo();
				window.showInformationMessage(`Closing Badges for ${owner}/${name}`);
				await commands.executeCommand('workbench.action.closeSidebar');
			}
		),

		commands.registerCommand(
			'vscode-github-actions-badges.reload-badges-preview',
			async () => {
				const { owner, name } = getCurrentRepo();
				window.showInformationMessage(`Reloading Badges for ${owner}/${name}`);
				const sidebarCommands = [
					'vscode-github-actions-badges.close-badges-preview',
					'vscode-github-actions-badges.show-badges-preview',
				];
				sidebarCommands.forEach(async (sidebarCommand: string) => {
					await commands.executeCommand(sidebarCommand);
				});
			}
		),

		commands.registerCommand(
			'vscode-github-actions-badges.open-workflow',
			async () => {
				const currentRepo = getCurrentRepo();
				const badges = await getBadges(currentRepo);
				const quickPickBadges = badges.map(({ workflow, name }) => {
					return {
						label: name,
						url: Uri.parse(workflow),
					};
				});
				const chosenWorkflow = await window.showQuickPick(quickPickBadges);
				if (chosenWorkflow) {
					window.showInformationMessage(
						`Opening workflow '${chosenWorkflow.label}' on GitHub.com`
					);
					env.openExternal(chosenWorkflow.url);
				}
			}
		),
		commands.registerCommand(
			'vscode-github-actions-badges.open-workflows',
			() => {
				const { owner, name } = getCurrentRepo();
				const url = Uri.parse(`https://github.com/${owner}/${name}/actions`);
				// The code you place here will be executed every time your command is executed

				// Display a message box to the user
				window.showInformationMessage('Opening all workflows on GitHub.com');
				env.openExternal(url);
			}
		),
	];

	extensionCommands.forEach((extensionCommand: Disposable) => {
		context.subscriptions.push(extensionCommand);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
