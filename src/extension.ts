import {
	ExtensionContext,
	commands,
	window,
	Disposable,
	env,
	Uri,
} from 'vscode';

import { getBadges, showBadgePanel } from './badges';
import { getCurrentRepo } from './currentRepo';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export async function activate(context: ExtensionContext) {
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log(
		'Congratulations, your extension "github-actions-badges" is now active!'
	);

	const currentRepo = getCurrentRepo();
	const badges = await getBadges(currentRepo);

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	const { owner, name } = getCurrentRepo();
	const extensionCommands = [
		commands.registerCommand(
			'vscode-github-actions-badges.open-workflow',
			async () => {
				const quickPickBadges = badges.map(({ workflow, name }) => {
					return {
						label: name,
						url: Uri.parse(workflow),
					};
				});
				const chosenWorkflow = await window.showQuickPick(quickPickBadges);
				if (chosenWorkflow) {
					window.showInformationMessage(
						`Opening workflow ${chosenWorkflow.label} on GitHub.com`
					);
					env.openExternal(chosenWorkflow.url);
				}
			}
		),
		commands.registerCommand(
			'vscode-github-actions-badges.open-workflows',
			() => {
				// The code you place here will be executed every time your command is executed

				// Display a message box to the user
				window.showInformationMessage('Opening all workflows on GitHub.com');
			}
		),

		commands.registerCommand(
			'vscode-github-actions-badges.show-all-badges',
			() => {
				window.showInformationMessage(`Showing Badges for ${owner}/${name}`);
				showBadgePanel(badges);
			}
		),
	];

	extensionCommands.forEach((extensionCommand: Disposable) => {
		context.subscriptions.push(extensionCommand);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
