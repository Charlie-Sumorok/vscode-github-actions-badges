import { ExtensionContext, commands, window, Disposable } from 'vscode';

import { showBadgePanel } from './badges';
import { getCurrentRepo } from './currentRepo';

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
	const { owner, name } = getCurrentRepo();
	const extensionCommands = [
		commands.registerCommand(
			'vscode-github-actions-badges.open-workflows',
			() => {
				// The code you place here will be executed every time your command is executed

				// Display a message box to the user
				window.showInformationMessage('Opening all workflows on GitHub.com');
			}
		),

		commands.registerCommand('vscode-github-actions-badges.show-badges', () => {
			window.showInformationMessage(`Showing Badges for ${owner}/${name}`);
			showBadgePanel();
		}),
	];

	extensionCommands.forEach((extensionCommand: Disposable) => {
		context.subscriptions.push(extensionCommand);
	});
}

// this method is called when your extension is deactivated
export function deactivate() {}
